const Knwl = require('knwl.js');
const fs = require('fs');

// Function to extract UK addresses from the given data (text)
function extractUKAddresses(data) {
  // Split the data into lines to process each line separately
  const lines = data.split('\n');
  
  // Regular expression to match UK addresses
  const addressRegex = /(?:\b\d{1,5}\s+\w+(?:\s+\w+)*\b\s*,?\s*)+(?:street|road|avenue|lane|drive|court|house|crescent|boulevard|close|place|square|terrace|way)\b/gi;
  
  const addresses = [];

  // Iterate through each line and check for matches with the address regex
  for (const line of lines) {
    const matches = line.match(addressRegex);
    if (matches && matches.length > 0) {
      // Push each matched address to the addresses array after trimming whitespace
      for (const match of matches) {
        addresses.push(match.trim());
      }
    }
  }

  return addresses;
}

// Constructor function for the UKAddressesPlugin
function UKAddressesPlugin(knwlInstance) {
  this.languages = {
    english: true,
  };

  // Regular expression for the first half (outward code) of a UK postcode
  const ukOutwardCodeRegex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?$/i;
  // Regular expression for a full valid UK postcode
  const ukPostcodeRegex = /(GIR 0AA)|((([ABCDEFGHIJKLMNOPRSTUWYZ][0-9][0-9]?|[ABCDEFGHIJKLMNOPRSTUWYZ][ABCDEFGHKLMNOPQRSTUVWXY][0-9][0-9]?|[ABCDEFGHIJKLMNOPRSTUWYZ][0-9][ABCDEFGHJKSTUW]|[ABCDEFGHIJKLMNOPRSTUWYZ][ABCDEFGHKLMNOPQRSTUVWXY][0-9][ABEHMNPRVWXY])) ?[0-9][ABD-HJLNP-UW-Z]{2})/gi;

  // Format a six-character postcode string with a space in the middle
  function formatPostcodeWithGap(postcode) {
    const part1 = postcode.slice(0, 3).toUpperCase();
    const part2 = postcode.slice(3).toUpperCase();
    return `${part1} ${part2}`;
  }

  // Main function to extract UK addresses and postcodes from the text using Knwl.js
  this.calls = function () {
    // Get all words extracted by Knwl.js
    const words = knwlInstance.words.get('words');
    const resultsArray = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i].toUpperCase();

      // Skip words longer than 6 characters, as they can't be postcodes
      if (word.length > 6) {
        continue; // Skip this word and move to the next one
      }

      // Check if the word is already a valid full postcode
      if (ukPostcodeRegex.test(formatPostcodeWithGap(word))) {
        // If it's a valid postcode, extract the surrounding text and address line
        const surroundingText = knwlInstance.tasks.preview(i);
        const addressLine = extractUKAddresses(surroundingText);

        // Push the result object to the resultsArray
        resultsArray.push({
          address: `${addressLine}, ${word}`,
          foundPosition: i,
          preview: knwlInstance.tasks.preview(i),
        });

        // Move to the next word
        continue;
      }

      // Check if the word matches the first half (outward code) of a UK postcode
      if (ukOutwardCodeRegex.test(word)) {
        const outwardCode = word;
        const nextWord = words[i + 1];

        // Check if the next word is a valid inward code (digit followed by letters)
        if (nextWord && /^[0-9][ABD-HJLNP-UW-Z]{2}$/i.test(nextWord)) {
          const fullPostcode = outwardCode + ' ' + nextWord;

          // Check if the full postcode is valid
          if (ukPostcodeRegex.test(fullPostcode)) {
            // If it's a valid postcode, extract the surrounding text and address line
            const surroundingText = knwlInstance.tasks.preview(i);
            const addressLine = extractUKAddresses(surroundingText);

            // Push the result object to the resultsArray
            resultsArray.push({
              address: `${addressLine}, ${fullPostcode}`,
              foundPosition: i,
              preview: knwlInstance.tasks.preview(i),
            });
          }
        }
      }
    }

    return resultsArray;
  };
}

module.exports = UKAddressesPlugin;
