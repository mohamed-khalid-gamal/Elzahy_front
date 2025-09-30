const puppeteer = require('puppeteer');

(async () => {
  const targetUrl = 'http://localhost:4200';
  const blockedDomain = 'via.placeholder.com';
  const timeoutMs = 45000;

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  const requests = [];
  page.on('request', (req) => {
    requests.push(req.url());
  });

  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: timeoutMs });
    // Allow late-loading images to fire
    await page.waitForTimeout(3000);

    const offenders = requests.filter((u) => u.includes(blockedDomain));

    if (offenders.length === 0) {
      console.log('✅ PASS: No requests made to via.placeholder.com');
    } else {
      console.log('❌ FAIL: Detected requests to via.placeholder.com');
      offenders.forEach((u) => console.log(' - ' + u));
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Error running check:', err.message);
    console.log('\nTip: Ensure the dev server is running on http://localhost:4200');
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
