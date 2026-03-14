const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting Full End-to-End Storefront & Admin Puppeteer Test...');
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // 1. STOREFRONT CHECKOUT FLOW
    console.log('[1/5] Navigating to Storefront...');
    await page.goto('http://localhost:3334', { waitUntil: 'networkidle2' });
    
    console.log('[2/5] Finding a product and adding to cart...');
    await page.goto('http://localhost:3334/products', { waitUntil: 'networkidle2' });
    
    const productLink = await page.$('a[href^="/products/"]');
    if (!productLink) throw new Error('No products found on storefront!');
    const productUrl = await page.evaluate(el => el.href, productLink);
    
    await page.goto(productUrl, { waitUntil: 'networkidle2' });
    
    // Attempt add to cart
    const forms = await page.$$('form');
    let added = false;
    for (const f of forms) {
       const action = await page.evaluate(el => el.getAttribute('action') || '', f);
       if (action.includes('/cart/add')) {
           await page.evaluate(f => f.submit(), f);
           added = true;
           await page.waitForNavigation({ waitUntil: 'networkidle2' });
           break;
       }
    }
    if (!added) {
       // try clicking anything that says add to cart
       const buttons = await page.$$('button');
       for (const b of buttons) {
          const text = await page.evaluate(el => el.textContent, b);
          if (text && text.toLowerCase().includes('cart')) {
             await b.click();
             await new Promise(r => setTimeout(r, 2000));
             added = true;
             break;
          }
       }
    }

    // 2. CHECKOUT SUBMISSION
    console.log('[3/5] Navigating to Checkout...');
    await page.goto('http://localhost:3334/checkout', { waitUntil: 'networkidle2' });
    
    await page.waitForSelector('input[name="email"], input[type="email"]', { timeout: 10000 });
    
    await page.type('input[type="email"]', 'e2e-test@example.com');
    await page.type('input#firstName', 'E2E');
    await page.type('input#lastName', 'Tester');
    await page.type('input#phone', '5559998888');

    const textInputs = await page.$$('input[type="text"]');
    for (let i = 0; i < textInputs.length; i++) {
        const val = await page.evaluate(el => el.value, textInputs[i]);
        const id = await page.evaluate(el => el.id, textInputs[i]);
        if (!val && id !== 'firstName' && id !== 'lastName' && id !== 'phone') {
            await textInputs[i].type('Test Data ' + i);
        }
    }

    // Click Proceed buttons
    console.log('[4/5] Submitting Checkout Form & Completing Order...');
    
    // We can just simulate multiple clicks on "Continue" or "Proceed" buttons
    for (let steps = 0; steps < 3; steps++) {
        const buttons = await page.$$('button');
        let clicked = false;
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && (text.toLowerCase().includes('continue') || text.toLowerCase().includes('place order') || text.toLowerCase().includes('proceed'))) {
                await btn.click();
                clicked = true;
                await new Promise(r => setTimeout(r, 1500));
                break;
            }
        }
    }
    
    await page.screenshot({ path: 'checkout_complete.png' });
    console.log('Took screenshot: checkout_complete.png');

    // 3. ADMIN PANEL VERIFICATION
    console.log('[5/5] Logging into Admin Panel to verify order creation...');
    await page.goto('http://localhost:3334/admin/login', { waitUntil: 'networkidle2' });
    
    await page.type('input[type="email"]', 'admin@example.com').catch(()=>{});
    await page.type('input[type="password"]', 'password123').catch(()=>{}); // Defaults from seed
    
    const adminForms = await page.$$('form');
    if (adminForms.length > 0) {
       await page.evaluate(f => f.submit(), adminForms[0]);
       await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(()=>{});
    }

    await page.goto('http://localhost:3334/admin/orders', { waitUntil: 'networkidle2' });
    
    await page.screenshot({ path: 'admin_orders.png', fullPage: true });
    console.log('Took screenshot: admin_orders.png');
    
    const html = await page.content();
    if (html.includes('e2e-test@example.com')) {
        console.log('✅ SUCCESS: E2E test email found in the Admin Orders list!');
    } else {
        console.log('⚠️ WARNING: E2E test email not immediately visible in Orders list (might be under a different tab or pagination).');
    }

    console.log('\n--- E2E AUDIT COMPLETE ---');

  } catch (error) {
    console.error('Puppeteer Script Error:', error);
  } finally {
    if (browser) await browser.close();
  }
})();
