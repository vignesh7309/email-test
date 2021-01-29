const puppeteer = require("puppeteer");
const sgMail = require('@sendgrid/mail');
const fs = require("fs");
require('dotenv').config({path: 'local.env'});
const html = "<div style='width:100%;text-align: center; color: #002060;border-bottom: 1pt solid #eeeeee;'><font size='3px'><h1>Please see attached today's Cage Fleet report from Octopus</h1></font> <img style=\"text-align: left;margin-right:10px;margin-left:10px;\" width=\"110px\" src=\"https://octopus.vt-iot.com/vt_logo_transparent.png\"/><p> </p></div>";


// async Function used to generate PDF from a web page and Send the PDF via Sendgrid Email
async function GenerateReport () {
  "use strict";
  try{
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // hitting the web page using Auth0 domain , client id and redirect url
    await page.goto(
      `https://${process.env.DOMAIN}/authorize?client_id=${process.env.CLIENT_ID}&response_type=token&redirect_uri=${process.env.REDIRECT_URI}`,
      { waitUntil: "networkidle2" }
      );
    console.log('Waiting for page to load.');
    await page.waitForSelector('input[name="email"]', {
      visible: true,
      timeout: 5000
    });
    
    console.log('Entering email address...');
    await page.type('input[name="email"]', process.env.EMAIL, {delay: 50});

    console.log('Entering password...');
    await page.type('input[name="password"]', process.env.PASSWORD, {delay: 50});

    console.log('Submit form.');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    console.log('Waiting to be redirected to the client.');
    await page.evaluate(() => window.location.href);
    
    // use screen media
    await page.emulateMedia('screen'); 
    
    // path of the generated pdf
    await page.pdf({path: 'sendgrid/Daily-Asset-Status-Report.pdf', printBackground: true,
    margin : {
            top: '40px',
            right: '9px',
            bottom: '40px',
            left: '9px'
        }});
    await browser.close();
  
    // using SendGrid to send the mail 
    sgMail.setApiKey('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');
    const pathToAttachment = `sendgrid/Daily-Asset-Status-Report.pdf`;
    const attachment = fs.readFileSync(pathToAttachment).toString("base64");
    const msg = {
      to: [process.env.RECIPIENT],
      from: 'VT Reporting <reports@vt-iot.com>',
      subject: 'Daily Asset Status Report (Do not reply)',
      text: '  ',
      html: html,
      attachments: [
        {
          content: attachment,
          filename: "Daily-Asset-Status-Report.pdf",
          type: "application/pdf",
          disposition: "attachment"
        }
      ]
    };
    sgMail.sendMultiple(msg)
    console.log("mail sent successfully");
  }
  // send error here
  catch(err) {
    console.log("Failed to convert URL to PDF ("+err.name+" - "+err.message+")");
    console.log(err);
  }
}

GenerateReport();