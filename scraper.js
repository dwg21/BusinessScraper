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

// Function to address detail from text
// function extractAddressInfo(text) {
//   // Regular expression for UK postcodes
//     const ukPostcodeRegex = /\b(?:[A-Z]{1,2}[0-9R][0-9A-Z]? ?[0-9][ABD-HJLNP-UW-Z]{2})\b/gi;
//     let extractedPostcodes = text.match(ukPostcodeRegex) || [];
//     extractedPostcodes = extractedPostcodes.filter((value, index, self) => self.indexOf(value) === index);
    


//   // Regex expression for the lines of addresses
//     const addressRegex = /\b\d+\s+\w+(?:\s+\w+)*\s+(?:street|road|avenue|lane|drive|court|house)\b/gi;
//     let extractedStreetNames = text.match(addressRegex) || [];

//     // Filter out potential postcode from the addresses
//     extractedStreetNames = extractedStreetNames.filter((address) => !ukPostcodeRegex.test(address));

//     // Clean up addresses (remove extra whitespace and newlines)
//     extractedStreetNames = extractedStreetNames.map((address) => address.replace(/\s+/g, ' ').trim());

//     //Remove duplicates
//     extractedStreetNames = extractedStreetNames.filter((value, index, self) => self.indexOf(value) === index);




//     return {
//     extractedPostcodes, extractedStreetNames,
//     };
// }

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
    
    knwlInstance.register('uknumbers', UKPhoneNumbersPlugin);
    const extractedPhoneNumbers = knwlInstance.get('uknumbers').map((number) => number.phone);



  // Extract addresses using the previously defined function
    // const extractedAddresses = extractAddressInfo(extractedText);
    knwlInstance.register('ukAddresses', UKAddresses);
    const extractedAddresses = knwlInstance.get('ukAddresses').map((address) => address.address);

//   // Regular expression to match phone numbers in various formats
//     const phoneRegex = /(?:(?:\+?\d{1,3}[-.\s()]*?)?\d{3,}[-.\s()]*\d{3,}[-.\s()]*\d{1,9}\b)(?![.\d])/g;

//   // Extract phone numbers using regex
//     const rawPhones = extractedText.match(phoneRegex) || [];
//     const extractedPhoneNumbers = rawPhones
//     .map((phone) => phone.replace(/\D/g, '')) // Remove non-digit characters
//     .filter((phone, index, self) => self.indexOf(phone) === index) // Filter out duplicates
//     .filter((phone) => phone.length >= 11 && phone.length <= 12); // Filter out numbers with less than 11 or more than 12 digits


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
scrapeCompanyInfo('hello@mrwardrobe.co.uk');
scrapeCompanyInfo(CanddiEmail)
scrapeCompanyInfo('hello@mh-partnership.co.uk');
// scrapeCompanyInfo('20info@pmwcom.co.uk')


module.exports = {
    scrapeDataFromHTML,
    fetchCompanyWebsite,
};


