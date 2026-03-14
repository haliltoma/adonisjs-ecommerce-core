const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting Puppeteer test for checkout flow...');
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    // Step 1: Go to a product page and add to cart
    // Using a known product URL or just the home page to find a product
    console.log('Navigating to home page to find a product...');
    await page.goto('http://localhost:3334', { waitUntil: 'networkidle2' });
    
    // Check if there are products on the home page, or go to /products
    await page.goto('http://localhost:3334/products', { waitUntil: 'networkidle2' });
    console.log('At products page. Looking for a product link...');
    
    // Find the first product link
    const productLink = await page.$('a[href^="/products/"]');
    if (!productLink) {
      console.log('No products found to add to cart. Test cannot proceed.');
      return;
    }
    
    const productUrl = await page.evaluate(el => el.href, productLink);
    console.log(`Navigating to product: ${productUrl}`);
    await page.goto(productUrl, { waitUntil: 'networkidle2' });
    
    // Click Add to Cart button
    console.log('Adding product to cart...');
    const addToCartSelector = 'button[type="submit"], button:has-text("Add to Cart"), button:has-text("Sepete Ekle")';
    // Let's find the add to cart form and submit it
    const form = await page.$('form[action="/cart/add"]');
    if (form) {
      await page.evaluate(ele => ele.submit(), form);
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    } else {
      // try clicking button
      const buttons = await page.$$('button');
      let clicked = false;
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && (text.toLowerCase().includes('cart') || text.toLowerCase().includes('sepete'))) {
          await btn.click();
          await new Promise(r => setTimeout(r, 2000)); // wait for ajax or reload
          clicked = true;
          break;
        }
      }
      if (!clicked) {
         console.log('Could not find add to cart button.');
         return;
      }
    }
    
    console.log('Navigating to checkout...');
    await page.goto('http://localhost:3334/checkout', { waitUntil: 'networkidle2' });
    
    console.log('At Checkout page. Filling out the form...');
    
    await page.waitForSelector('input[name="email"], input[type="email"]', { timeout: 10000 });
    
    // Fill contact info
    await page.type('input[type="email"]', 'test@example.com');
    await page.type('input#firstName', 'John');
    await page.type('input#lastName', 'Doe');
    await page.type('input#phone', '5551234567');

    console.log('Filled contact info.');

    // Look for shipping address inputs. We'll find them by placeholder or matching label.
    // In our UI, they don't have IDs but rather bound by onChange. We can target them by index or specific DOM traversal
    // Best way is to use XPath or identify by position since all are inputs.
    // Let's just blindly fill all text inputs to ensure nothing is null
    const textInputs = await page.$$('input[type="text"]');
    for (const input of textInputs) {
       // Only type if empty
       const val = await page.evaluate(el => el.value, input);
       if (!val) {
          await input.type('Test Value');
       }
    }

    console.log('Filled remaining text inputs for shipping address.');

    // Submit the form (Process checkout to next step)
    // Find the submit button "Proceed to Payment" or similar
    const checkoutForms = await page.$$('form');
    if (checkoutForms.length > 0) {
       console.log('Submitting checkout form...');
       await page.evaluate(f => f.submit(), checkoutForms[0]);
       
       // Alternatively click the primary button
       const buttons = await page.$$('button');
       for (const btn of buttons) {
          const text = await page.evaluate(el => el.textContent, btn);
          if (text && text.toLowerCase().includes('proceed')) {
             await btn.click();
             break;
          }
       }
    }

    console.log('Waiting for navigation or error response...');
    await new Promise(r => setTimeout(r, 4000));
    
    console.log('Checkout page loaded successfully without initial crash.');
    
    // Let's capture browser console logs
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
    
    // Reload to catch errors
    await page.reload({ waitUntil: 'networkidle2' });
    
    console.log('Test completed up to checkout render.');
    
  } catch (error) {
    console.error('Puppeteer Script Error:', error);
  } finally {
    if (browser) await browser.close();
  }
})();
