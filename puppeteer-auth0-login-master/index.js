
(async () => {
  "use strict";
  const puppeteer = require("puppeteer");
  try{
    const browser = await puppeteer.launch();

  const page = await browser.newPage();
  await page.goto(
    `https://devlogin.octopus.vt-iot.com/authorize?client_id=twxPB7C9sq9mBcfsfpzYLwN3L2k0ObGr&response_type=token&redirect_uri=https://dev.octopus.vt-iot.com/`,
    { waitUntil: "networkidle2" }
  );

  console.log('Waiting for page to load.');
  await page.waitForSelector('input[name="email"]', {
    visible: true,
    timeout: 5000
  });

  console.log('Entering email address...');
  await page.type('input[name="email"]', 'vignesh.ramesh@vt-iot.com', {delay: 50});

  console.log('Entering password...');
  await page.type('input[name="password"]', 'Saibaba7309@', {delay: 50});

  console.log('Submit form.');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  console.log('Waiting to be redirected to the client.');
  const clientUrl = await page.evaluate(() => window.location.href);
  /*if (clientUrl.indexOf(`${env.redirectUri}/#access_token=`) !== 0) {
    throw new Error("Login failed. Current url:" + clientUrl);
  } else {
    console.log('Login success:', clientUrl);
  }*/
  await page.pdf({path: 'sendgrid/html-page.pdf', format: 'A4'});
  await browser.close();
  sendmail();
}
catch(err) {
  console.log("Failed to convert URL to PDF ("+err.name+" - "+err.message+")");
  console.log(err);
  }
})();


async function sendmail(){
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey('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');
  
  const fs = require("fs");
  
  pathToAttachment = `sendgrid/html-page.pdf`;
  attachment = fs.readFileSync(pathToAttachment).toString("base64");
  
  const msg = {
    to: 'vignesh.ramesh@vt-iot.com',
    from: 'noreply@vt-iot.com',
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    attachments: [
      {
        content: attachment,
        filename: "html-page.pdf",
        type: "application/pdf",
        disposition: "attachment"
      }
    ]
  };
  
  sgMail.send(msg).catch(err => {
    console.log(err);
  });
  }
