const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Capture all network requests
  const requests = [];
  page.on('request', (req) => {
    if (req.url().includes('/account/login') && req.method() === 'POST') {
      requests.push({
        url: req.url(),
        method: req.method(),
        headers: req.headers(),
        postData: req.postData(),
      });
    }
  });

  // Capture responses
  const responses = [];
  page.on('response', (res) => {
    if (res.url().includes('/account/login') && res.request().method() === 'POST') {
      responses.push({
        url: res.url(),
        status: res.status(),
        headers: res.headers(),
      });
    }
  });

  // Capture console errors
  const consoleMessages = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    }
  });

  // Navigate to login page
  console.log('1. Navigating to login page...');
  await page.goto('http://localhost:3334/account/login', { waitUntil: 'networkidle2', timeout: 30000 });
  console.log('   Page title:', await page.title());

  // Check cookies before submission
  const cookies = await page.cookies();
  const xsrfCookie = cookies.find(c => c.name === 'XSRF-TOKEN');
  console.log('   XSRF-TOKEN cookie:', xsrfCookie ? 'FOUND (value: ' + xsrfCookie.value.substring(0, 30) + '...)' : 'NOT FOUND');
  console.log('   XSRF-TOKEN httpOnly:', xsrfCookie ? xsrfCookie.httpOnly : 'N/A');

  // Check meta tag
  const csrfMeta = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : null;
  });
  console.log('   csrf-token meta:', csrfMeta ? csrfMeta.substring(0, 30) + '...' : 'NOT FOUND');

  // Check if document.cookie can read XSRF-TOKEN
  const documentCookie = await page.evaluate(() => document.cookie);
  const hasXsrf = documentCookie.includes('XSRF-TOKEN');
  console.log('   document.cookie has XSRF-TOKEN:', hasXsrf);

  // Fill in login form
  console.log('\n2. Filling login form...');
  await page.waitForSelector('#email', { timeout: 5000 });
  await page.type('#email', 'john.doe@example.com');
  await page.type('#password', 'password123');

  // Submit form and wait for navigation
  console.log('3. Submitting form...');
  const [response] = await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(e => null),
    page.click('button[type="submit"]'),
  ]);

  // Wait a moment for any async operations
  await new Promise(r => setTimeout(r, 2000));

  // Check results
  console.log('\n=== Results ===');
  console.log('Current URL:', page.url());
  console.log('Page title:', await page.title());

  // Check POST request headers
  if (requests.length > 0) {
    const req = requests[0];
    console.log('\nPOST Request:');
    console.log('  URL:', req.url);
    console.log('  x-csrf-token:', req.headers['x-csrf-token'] || 'NOT SET');
    console.log('  x-xsrf-token:', req.headers['x-xsrf-token'] || 'NOT SET');
    console.log('  x-inertia:', req.headers['x-inertia'] || 'NOT SET');
    console.log('  content-type:', req.headers['content-type'] || 'NOT SET');
    console.log('  cookie present:', req.headers['cookie'] ? 'YES' : 'NO');
    console.log('  Post data:', req.postData ? req.postData.substring(0, 200) : 'none');
  } else {
    console.log('\nNo POST requests captured!');
  }

  // Check POST response
  if (responses.length > 0) {
    const res = responses[0];
    console.log('\nPOST Response:');
    console.log('  Status:', res.status);
    console.log('  Location:', res.headers['location'] || 'N/A');
    console.log('  x-inertia:', res.headers['x-inertia'] || 'N/A');
  }

  // Check for any flash messages or errors on the resulting page
  const flashData = await page.evaluate(() => {
    // Check Inertia page props
    const el = document.getElementById('app');
    if (el && el.dataset.page) {
      try {
        const pageData = JSON.parse(el.dataset.page);
        return { flash: pageData.props?.flash, customer: pageData.props?.customer, component: pageData.component };
      } catch(e) {}
    }
    return null;
  });
  console.log('\nPage data:', JSON.stringify(flashData, null, 2));

  // Console messages
  if (consoleMessages.length > 0) {
    console.log('\nConsole messages:');
    consoleMessages.forEach(m => console.log('  [' + m.type + ']', m.text.substring(0, 200)));
  }

  await browser.close();
})();
