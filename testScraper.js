const fs = require('fs');
const { promisify } = require('util');
const appendFileAsync = promisify(fs.appendFile);

const { scrapeDataFromHTML } = require('./scraper.js'); 
const {fetchCompanyWebsite} = require('./scraper.js'); 

const emailAddresses = [
    "20info@metropolitan-bar.com",
    "20info@meyouandus.co.uk",
    "20info@mezeellesmere.co.uk",
    "20info@mh-partnership.co.uk",
    "20info@midna.co.uk",
    "20info@mkbuilders.co.uk",
    "20info@monarchsupplies.com",
    "20info@mountain-water.co.uk",
    "20info@mrwardrobe.co.uk",
    "20info@mulkerns.com",
    "20info@musicincountrychurches.org.uk",
    "20info@myhomepersonaltrainer.co.uk",
    "20info@naturalbirthingcompany.co.uk",
    "20info@newhaweli.co.uk",
    "20info@noellaltd.co.uk",
    "20info@northdevonaccounts.co.uk",
    "20info@northlondonyogacentre.com",
    "20info@originalwoodenwindows.co.uk",
    "20info@oscr.org.uk",
    "20info@oxfordshirelep.com",
    "20info@panelshaper.co.uk",
    "20info@parkwoodchiropractic.co.uk",
    "20info@pdkltd.co.uk",
    "20info@peonylaneinteriors.co.uk",
    "20info@pianowand.com",
    "20info@pillbadmintonclub.org.uk",
    "20info@pmwcom.co.uk",
    "tim@canddi.com",
];

const logFileName = 'scraping_results.txt';

async function testScraping() {
    try {
        for (const email of emailAddresses) {
        try {
            const domain = email.split('@')[1];
            const websiteUrl = `https://${domain}`;

            const html = await fetchCompanyWebsite(websiteUrl);
            const { extractedEmails, extractedPhoneNumbers, extractedAddresses } = await scrapeDataFromHTML(html);
            

          // Log results to the console
            console.log('Email Address:', email);
            console.log('Extracted Emails:', extractedEmails);
            console.log('Extracted Phone Numbers:', extractedPhoneNumbers);
            console.log('Extracted Addresses:', extractedAddresses);

          // Save results to the log file
    const logData = `
    Email Address: ${email}
    Extracted Emails: ${extractedEmails}
    Extracted Phone Numbers: ${extractedPhoneNumbers}
    Extracted Addresses: ${extractedAddresses}
    ------------------------`;
        await appendFileAsync(logFileName, logData);
        } catch (err) {
            console.error(`Error occurred for email: ${email}\nError Message: ${err.message}\nStack Trace: ${err.stack}\n------------------------`);
            const errorData = `Error occurred for email: ${email}\nError Message: ${err.message}\nStack Trace: ${err.stack}\n------------------------`;
            await appendFileAsync(logFileName, errorData);
        }
        }
    } catch (err) {
        console.error('Oops! There was an error:', err);
    }
    }

testScraping();
