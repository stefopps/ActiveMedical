const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });

  const context = await browser.newContext({
    viewport: { width: 1600, height: 1200 }
  });

  const page = await context.newPage();

  // OPEN SITE
  await page.goto('https://app.ccscases.com/', {
    waitUntil: 'networkidle'
  });

  console.log('You already said you are logged in.');
  console.log('Waiting 5 seconds before starting...');
  await page.waitForTimeout(5000);

  console.log('Log in in the opened browser, then tell me you are done.');
  console.log('The script is waiting here until I press Enter in this terminal.');
  await new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.once('data', resolve);
  });

  // CREATE OUTPUT FOLDER
  const outputDir = path.join(__dirname, 'ccs_screenshots');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // GET ALL CASE ROWS
  const rows = await page.locator('tr, .case-row, [role="row"]').all();

  console.log(`Found ${rows.length} rows`);

  for (let i = 0; i < rows.length; i++) {
    try {
      const row = rows[i];

      console.log(`Opening case ${i + 1}`);

      // OPEN 3 DOT MENU
      const menuButton = row.locator('button').last();

      await menuButton.click();

      await page.waitForTimeout(1000);

      // CLICK VIEW GRADES
      const viewGrades = page.locator('text=View Grades');

      await viewGrades.click();

      // WAIT FOR PAGE LOAD
      await page.waitForLoadState('networkidle');

      await page.waitForTimeout(3000);

      // SCREENSHOT FULL PAGE
      const fileName = `case_${i + 1}.png`;

      await page.screenshot({
        path: path.join(outputDir, fileName),
        fullPage: true
      });

      console.log(`Saved ${fileName}`);

      // GO BACK
      await page.goBack({
        waitUntil: 'networkidle'
      });

      await page.waitForTimeout(2000);

    } catch (err) {
      console.log(`Error on case ${i + 1}:`, err.message);

      try {
        await page.goBack({
          waitUntil: 'networkidle'
        });
      } catch {}
    }
  }

  console.log('DONE');

})();
