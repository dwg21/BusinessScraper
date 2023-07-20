const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const Knwl = require('knwl.js');

const CanddiEmail = 'Tim@canddi.com';

//imports for custom plugins made for knwl
const UKPhoneNumbersPlugin = require('./UKPhoneNumbersPlugin'); // Replace with the correct path to your plugin file
const UKAddresses = require('./UKAddressesPlugin'); // Replace with the correct path to your plugin file


// Function to fetch the HTML content of a given website
async function fetchCompanyWebsite(url) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url);
    const htmlContent = await page.content();
    await browser.close();
    return htmlContent;
}


// Function to scrape data from the HTML content
function scrapeDataFromHTML(html) {
    const $ = cheerio.load(html);
    const extractedText = $('body').text();

  // Initialize Knwl.js with extracted text
    const knwlInstance = new Knwl('english');
    knwlInstance.init(extractedText);

  // Extract emails using Knwl.js
    let extractedEmails = knwlInstance.get('emails').map((email) => email.address);
    extractedEmails = extractedEmails.filter((value, index, self) => self.indexOf(value) === index);
    
    // Extract numbers using custom plugin
    knwlInstance.register('uknumbers', UKPhoneNumbersPlugin);
    const extractedPhoneNumbers = knwlInstance.get('uknumbers').map((number) => number.phone);

    // Extract addresses using custom plugin
    knwlInstance.register('ukAddresses', UKAddresses);
    const extractedAddresses = knwlInstance.get('ukAddresses').map((address) => address.address);


    return { extractedEmails, extractedPhoneNumbers, extractedAddresses };
}



async function scrapeCompanyInfo(email) {
    try {
    const domain = email.split('@')[1];
    const websiteUrl = `https://${domain}`;

    const html = await fetchCompanyWebsite(websiteUrl);
    const { extractedEmails, extractedPhoneNumbers, extractedAddresses } = scrapeDataFromHTML(html);

    console.log('Extracted Emails:', extractedEmails);
    console.log('Extracted Phone Numbers:', extractedPhoneNumbers);
    console.log('Extracted Addresses:', extractedAddresses);

} catch (err) {
    console.error('There was an error fetching the website:', err);
}
}


//Change variable here to test different emails
//scrapeCompanyInfo('hello@mrwardrobe.co.uk');
scrapeCompanyInfo(CanddiEmail)
//scrapeCompanyInfo('hello@mh-partnership.co.uk');
// scrapeCompanyInfo('20info@pmwcom.co.uk')


module.exports = {
    scrapeDataFromHTML,
    fetchCompanyWebsite,
};


