const fs = require('fs');
const path = require('path');

function getFilesInDirectory(directoryPath, fileArray = []) {
    // Read all items in the directory
    const items = fs.readdirSync(directoryPath);

    for (const item of items) {
        const fullPath = path.join(directoryPath, item);
        const stats = fs.statSync(fullPath);

        // If the item is a directory, recursively get files
        if (stats.isDirectory()) {
            getFilesInDirectory(fullPath, fileArray);
        } else {
            // If it's a file, add it to the array
            fileArray.push(fullPath);
        }
    }

    return fileArray;
}

function processFiles(directoryPath, conversionType) {
  const files = getFilesInDirectory(directoryPath);
  for (const file of files) {
      const fileContent = fs.readFileSync(file, 'utf8');
      console.log(fileContent);
      
      if (conversionType === 'appium') {
        // Process Detox -> Appium
        console.log(`Converting Detox code in ${file}`);
        const convertedContent = detoxToAppium(fileContent);
        console.log(convertedContent);
        fs.writeFileSync(file, convertedContent, 'utf8');
      } else if (conversionType === 'detox') {
        // Process Appium -> Detox
        console.log(`Converting Appium code in ${file}`);
        const convertedContent = appiumToDetox(fileContent);
        console.log(convertedContent);
        fs.writeFileSync(file, convertedContent, 'utf8');
      } else {
        console.warn('Please enter in either appium or detox as a parameter for processFiles().');
      }
  }
}

// Convert Detox code to Appium
function detoxToAppium(detoxCode) {
  const appiumCode = detoxCode
    .replace(/element\(by\.id\(['"]([^'"]+)['"]\)\)/g, "driver.$('#$1')")
    .replace(/element\(by\.(label|text|type)\(['"]([^'"]+)['"]\)\)/g, "driver.$('~$2')")
    .replace(/\.typeText\(['"]([^'"]+)['"]\)/g, ".setValue('$1')")
    .replace(/\.replaceText\(['"]([^'"]+)['"]\)/g, ".setValue('$1')")
    .replace(/\.clearText\(\)/g, ".setValue('')")
    .replace(/\.tap\(\)/g, ".click()")
    .replace(/\.toBeVisible\(\)/g, ".isDisplayed()")
    .replace(/\.toExist\(\)/g, ".findElements(By.id('$1'))")
    .replace(/\.toBeFocused\(\)/g, ".getAttribute('focused') === 'true'")
    .replace(/\.toHaveText\(\s*['"]([^'"]+)['"]\s*\)/g, ".getText() === '$1'")
    .replace(/\.toHaveLabel\(\s*['"]([^'"]+)['"]\s*\)/g, ".getAttribute('label') === '$1'")
    .replace(/\.toHaveId\(\s*['"]([^'"]+)['"]\s*\)/g, ".getAttribute('id') === '$1'")
    .replace(/\.toHaveValue\(\s*['"]([^'"]+)['"]\s*\)/g, ".getAttribute('value') === '$1'")
    .replace(/\.toHaveToggleValue\(\s*['"]([^'"]+)['"]\s*\)/g, ".getAttribute('checked') === 'true'");
    
    return appiumCode;
}

// Convert Appium code to Detox
function appiumToDetox(appiumCode) {
  const detoxCode = appiumCode
    .replace(/driver\.\$('#([^']+)')/g, "element(by.id('$1'))")
    .replace(/driver\.\$('~([^']+)')/g, "element(by.label('$1'))")
    .replace(/\.setValue\(['"]([^'"]+)['"]\)/g, ".typeText('$1')")
    .replace(/\.setValue\(\s*\)/g, ".clearText()")
    .replace(/\.click\(\)/g, ".tap()")
    .replace(/\.isDisplayed\(\)/g, ".toBeVisible()")
    .replace(/\.findElements\(By\.id\(['"]([^'"]+)['"]\)\)/g, ".toExist()")
    .replace(/\.getAttribute\('focused'\)\s*===\s*'true'/g, ".toBeFocused()")
    .replace(/\.getText\(\)\s*===\s*['"]([^'"]+)['"]/g, ".toHaveText('$1')")
    .replace(/\.getAttribute\('label'\)\s*===\s*['"]([^'"]+)['"]/g, ".toHaveLabel('$1')")
    .replace(/\.getAttribute\('id'\)\s*===\s*['"]([^'"]+)['"]/g, ".toHaveId('$1')")
    .replace(/\.getAttribute\('value'\)\s*===\s*['"]([^'"]+)['"]/g, ".toHaveValue('$1')")
    .replace(/\.getAttribute\('checked'\)\s*===\s*'true'/g, ".toHaveToggleValue('true')");
  
  return detoxCode;
}

// Example usage
const directoryPath = './e2e';
const files = processFiles(directoryPath, 'appium');
