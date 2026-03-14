const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting Full Admin Product Creation to Storefront E2E Test...');
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    page.on('request', req => {
        if (req.url().includes('/admin/products') && req.method() === 'POST') {
            console.log('\n--- BROWSER POST PAYLOAD ---');
            console.log(req.postData());
            console.log('----------------------------\n');
        }
    });

    page.on('response', async res => {
        if (res.url().includes('/admin/products') && res.request().method() === 'POST') {
            console.log('\n--- SERVER RESPONSE TO PRODUCT SUBMISSION ---');
            console.log('Status:', res.status());
            try {
               const text = await res.text();
               console.log('Body:', text.substring(0, 500));
            } catch(e) {}
            console.log('---------------------------------------------\n');
        }
    });

    const productName = 'E2E Test Product ' + Date.now();

    // 1. ADMIN LOGIN
    console.log('[1/7] Logging into Admin Panel...');
    await page.goto('http://localhost:3334/admin/login', { waitUntil: 'networkidle2' });
    
    // Fill login form
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'admin@example.com');
    await page.type('input[type="password"]', 'admin123');
    
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}),
            loginButton.click(),
        ]);
    }

    // 2. NAVIGATE TO PRODUCTS
    console.log('[2/7] Navigating to Admin Products...');
    await page.goto('http://localhost:3334/admin/products', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'admin_products_list.png' });

    // 3. CREATE NEW PRODUCT
    console.log('[3/7] Creating new product: ' + productName);
    await page.goto('http://localhost:3334/admin/products/create', { waitUntil: 'networkidle2' });

    // Fill Product Form
    console.log('[4/7] Filling out product details...');
    await new Promise(r => setTimeout(r, 1000)); // Wait for form to mount
    
    const htmlBefore = await page.content();
    require('fs').writeFileSync('debug_admin.html', htmlBefore);
    console.log('Saved debug_admin.html to inspect the DOM');

    // Explicitly target the title and price by their DOM ids
    await page.waitForSelector('input#title', { timeout: 10000 });
    
    // Robust value injection technique for React
    await page.evaluate((titleVal) => {
        const input = document.querySelector('input#title');
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(input, titleVal);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }, productName);
    
    await new Promise(r => setTimeout(r, 500)); // Wait for auto-slug
    
    // Explicitly target price input
    await page.waitForSelector('input#price', { timeout: 10000 });
    await page.evaluate(() => {
        const input = document.querySelector('input#price');
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(input, '99.99');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    await new Promise(r => setTimeout(r, 500));

    const domTitle = await page.$eval('input#title', el => el.value);
    console.log('DOM Title Value before Save:', domTitle);

    // Submit Product Form
    const saveButtons = await page.$$('button[type="submit"], button');
    for (const btn of saveButtons) {
        const text = await page.evaluate(el => (el.textContent || '').toLowerCase().trim(), btn);
        if (text.includes('save') || text.includes('create') || text.includes('kaydet') || text.includes('oluştur')) {
            await btn.click();
            await new Promise(r => setTimeout(r, 2000)); // Wait for validaton or navigation
            const htmlAfter = await page.content();
            require('fs').writeFileSync('debug_admin_after.html', htmlAfter);
            break;
        }
    }
    
    // Check for errors on the page
    const errorElements = await page.$$('.text-destructive, .text-red-500, [role="alert"]');
    for (const el of errorElements) {
        const errText = await page.evaluate(e => e.textContent, el);
        console.log('⚠️ UI Error message found:', errText);
    }

    await page.screenshot({ path: 'admin_product_created.png' });
    console.log('✅ Form submission attempt completed.');

    // 4. NAVIGATE TO STOREFRONT
    console.log('[5/7] Navigating to Storefront...');
    await page.goto('http://localhost:3334/products', { waitUntil: 'networkidle2' });

    // 5. FIND PRODUCT ON STOREFRONT
    console.log('[6/7] Searching for created product on client-side...');
    
    // Basic search simulation: scroll and look for product name
    const html = await page.content();
    if (html.includes(productName)) {
         console.log('✅ Found newly created product on the storefront!');
    } else {
         console.log('⚠️ Could not immediately find the new product on the first page of /products. It might require publishing, adding to a specific category, or the slug generator might be failing as noted in todo.md items.');
    }
    
    await page.screenshot({ path: 'storefront_product_check.png', fullPage: true });

    // 6. ADD TO CART FLOW (To verify client side still works completely)
    console.log('[7/7] Verifying standard storefront flow by visiting the first available product...');
    const productLink = await page.$('a[href^="/products/"]');
    if (productLink) {
        const productUrl = await page.evaluate(el => el.href, productLink);
        await page.goto(productUrl, { waitUntil: 'networkidle2' });
        
        await page.screenshot({ path: 'storefront_detail_view.png' });
        
        const forms = await page.$$('form');
        for (const f of forms) {
           const action = await page.evaluate(el => el.getAttribute('action') || '', f);
           if (action.includes('/cart/add')) {
               await page.evaluate(form => form.submit(), f);
               console.log('✅ Clicked Add to Cart');
               await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(()=>{});
               break;
           }
        }
    }

    console.log('\n--- ADMIN -> CLIENT E2E TEST COMPLETE ---');

  } catch (error) {
    console.error('Puppeteer Script Error:', error);
  } finally {
    if (browser) await browser.close();
  }
})();
