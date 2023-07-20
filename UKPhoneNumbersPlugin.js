
function UKPhoneNumbersPlugin(knwlInstance) {
  this.languages = {
    english: true,
  };

    //only matches valid uk numbers 
    const phoneRegex = /^(?!00)(((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4}))(\s?\#(\d{4}|\d{3}))?$/;


  this.calls = function () {
    const words = knwlInstance.words.get('words');
    // console.log(words)
    // console.dir(words, {'maxArrayLength': null})
    const resultsArray = [];


    for (let i = 0; i < words.length; i++) {
      let potentialNumber = '';
      
      const cleanedWord = words[i].replace(/[^+\d]/g, '');
      // console.log(words[i])
      // Check if the word starts with '+' or is a '0xx'
      if (cleanedWord[0] === '+' || words[i][1] === '+' || cleanedWord[0] === '0') {
        const combinations = [cleanedWord]; // Store the current word in the combinations array
        let j = 1;
        while (j < 4 && i + j < words.length + 1) {
          
          const cleanedNextWord = words[i + j].replace(/[^+\d]/g, '');
          combinations.push(cleanedNextWord); // Add the cleaned next word to the combinations array
          const possibleNumber = combinations.join('').replace(/\s/g, ''); // Join the combinations and remove spaces
          // console.log('pn',possibleNumber)
          if (phoneRegex.test(possibleNumber)) {
            potentialNumber = possibleNumber;
          }
          j++;
        }
      }

      // If a valid potentialNumber is found, add it to the resultsArray
      if (potentialNumber !== '') {
        resultsArray.push({
          phone: potentialNumber,
          foundPosition: i,
          preview: knwlInstance.tasks.preview(i),
        });
      }
    }

    return resultsArray;
  };
}


module.exports = UKPhoneNumbersPlugin;


