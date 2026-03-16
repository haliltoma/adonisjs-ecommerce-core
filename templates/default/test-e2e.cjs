const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    console.log('Navigating to homepage...');
    await page.goto('http://127.0.0.1:3334', { waitUntil: 'networkidle2' });
    console.log('Homepage loaded. Title:', await page.title());
    
    // Screenshot to verify page is rendering
    await page.screenshot({ path: '/home/laserkopf/.gemini/antigravity/brain/35a06031-bcf9-4d7e-a2bb-80f454ac0bf2/homepage_fixed.png' });
    console.log('✅ Homepage screenshot saved');

    // Attempt to navigate to a product if exists
    const productsRes = await fetch('http://127.0.0.1:3334/api/products').catch(() => null);
    if (productsRes && productsRes.ok) {
       console.log('Products API OK');
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
