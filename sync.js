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
    .replace(/expect\(element\(by\.id\(['"]([^'"]+)['"]\)\)\.toBeVisible\(\)/g, "expect(await driver.$('#$1').isDisplayed()).to.be.true")
    .replace(/expect\(element\(by\.(label|text|type)\(['"]([^'"]+)['"]\)\)\.toBeVisible\(\)/g, "expect(await driver.$('~$2').isDisplayed()).to.be.true")
    .replace(/expect\(element\(by\.id\(['"]([^'"]+)['"]\)\)\.toExist\(\)/g, "expect(await driver.$('#$1').isDisplayed()).to.be.true")
    .replace(/expect\(element\(by\.(label|text|type)\(['"]([^'"]+)['"]\)\)\.toExist\(\)/g, "expect(await driver.$('~$2').isDisplayed()).to.be.true")
    .replace(/expect\(element\(by\.id\(['"]([^'"]+)['"]\)\)\.toHaveText\(\s*['"]([^'"]+)['"]\s*\)/g, "expect(await driver.$('#$1').getText()).to.equal('$2')")
    .replace(/expect\(element\(by\.(label|text|type)\(['"]([^'"]+)['"]\)\)\.toHaveText\(\s*['"]([^'"]+)['"]\s*\)/g, "expect(await driver.$('~$2').getText()).to.equal('$3')")
    .replace(/waitFor\(element\(by\.id\(['"]([^'"]+)['"]\)\)\.toBeVisible\(\)/g, "await driver.$('#$1').waitUntilDisplayed()")
    .replace(/waitFor\(element\(by\.(label|text|type)\(['"]([^'"]+)['"]\)\)\.toBeVisible\(\)/g, "await driver.$('~$2').waitUntilDisplayed()")
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
    .replace(/expect\(await driver\.\$\(\'\~([^\'\)]+)\'\)\.isDisplayed\(\)\.to\.be\.true\)/g, "expect(element(by.text('$1'))).toBeVisible()")
    .replace(/expect\(await driver\.\$\(\'\#([^\'\)]+)\'\)\.isDisplayed\(\)\.to\.be\.true\)/g, "expect(element(by.id('$1'))).toBeVisible()")
    .replace(/expect\(await driver\.\$\(\'\~([^\'\)]+)\'\)\.isDisplayed\(\)\.to\.be\.true\)/g, "expect(element(by.label('$1'))).toExist()")
    .replace(/expect\(await driver\.\$\(\'\#([^\'\)]+)\'\)\.isDisplayed\(\)\.to\.be\.true\)/g, "expect(element(by.id('$1'))).toExist()")
    .replace(/expect\(await driver\.\$\(\'\#([^\'\)]+)\'\)\.getText\(\)\.to\.equal\(['"]([^'"]+)['"]\)/g, "expect(element(by.id('$1'))).toHaveText('$2')")
    .replace(/expect\(await driver\.\$\(\'\~([^\'\)]+)\'\)\.getText\(\)\.to\.equal\(['"]([^'"]+)['"]\)/g, "expect(element(by.label('$1'))).toHaveText('$2')")
    .replace(/await driver\.\$\(\'\#([^\'\)]+)\'\)\.waitUntilDisplayed\(\)/g, "waitFor(element(by.id('$1'))).toBeVisible()")
    .replace(/await driver\.\$\(\'\~([^\'\)]+)\'\)\.waitUntilDisplayed\(\)/g, "waitFor(element(by.label('$1'))).toBeVisible()")
    .replace(/driver\.\$\(\'\#([^\'\)]+)\'\)/g, "element(by.id('$1'))")
    .replace(/driver\.\$\(\'\~([^\'\)]+)\'\)/g, "element(by.text('$1'))")
    .replace(/\.setValue\(['"]([^'"]+)['"]\)/g, ".typeText('$1')")
    .replace(/\.setValue\(['"]([^'"]+)['"]\)/g, ".replaceText('$1')")
    .replace(/\.setValue\(\s*''\s*\)/g, ".clearText()")
    .replace(/\.click\(\)/g, ".tap()")
    .replace(/\.isDisplayed\(\)/g, ".toBeVisible()")
    .replace(/\.findElements\(By\.id\(['"]([^'"]+)['"]\)\)/g, ".toExist()")
    .replace(/\.getAttribute\('focused'\) === 'true'/g, ".toBeFocused()")
    .replace(/\.getText\(\) === ['"]([^'"]+)['"]/g, ".toHaveText('$1')")
    .replace(/\.getAttribute\('label'\) === ['"]([^'"]+)['"]/g, ".toHaveLabel('$1')")
    .replace(/\.getAttribute\('id'\) === ['"]([^'"]+)['"]/g, ".toHaveId('$1')")
    .replace(/\.getAttribute\('value'\) === ['"]([^'"]+)['"]/g, ".toHaveValue('$1')")
    .replace(/\.getAttribute\('checked'\) === 'true'/g, ".toHaveToggleValue('true')");

  return detoxCode;
}

// Example usage
const directoryPath = './e2e';
const files = processFiles(directoryPath, 'appium');
