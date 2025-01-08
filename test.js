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

function processFiles(directoryPath) {
  const files = getFilesInDirectory(directoryPath);
  for (const file of files) {
      const fileContent = fs.readFileSync(file, 'utf8');
      console.log(fileContent);
      
      // Process Detox -> Appium
      console.log(`Converting Detox code in ${file}`);
      const convertedContent = detoxToAppium(fileContent);
      console.log(convertedContent);
      
      // Write the converted content back to the file
      fs.writeFileSync(file, convertedContent, 'utf8');
  }
}

// Convert Detox code to Appium
function detoxToAppium(detoxCode) {
  const appiumCode = detoxCode
    .replace(/element\(by\.id\(['"]([^'"]+)['"]\)\)/g, "driver.$('#$1')")
    .replace(/element\(by\.(label|text|type)\(['"]([^'"]+)['"]\)\)/g, "driver.$('~$2')")
    .replace(/\.typeText\(['"]([^'"]+)['"]\)/g, ".setValue('$1')")

    // Log the conversion process for debugging
    console.log('Converted Appium Code:\n', appiumCode);
    
    return appiumCode;
}

// Convert Appium code to Detox
function appiumToDetox(appiumCode) {
  // Convert Appium's driver.element().click() to Detox's element().tap()
  appiumCode = appiumCode.replace(/await driver\.element\(\)\.click\(\);/g, "await element().tap();");

  // Convert Appium's driver.element().sendKeys() to Detox's element().typeText()
  appiumCode = appiumCode.replace(/await driver\.element\(\)\.sendKeys\('([^']+)'\);/g, "await element().typeText('$1');");

  // Convert Appium's assertions to Detox's expect() assertions
  appiumCode = appiumCode.replace(/await driver\.element\(\)\.isDisplayed\(\);/g, "expect(element()).toBeVisible();");
  appiumCode = appiumCode.replace(/await driver\.element\(\)\.isEnabled\(\);/g, "expect(element()).toBeEnabled();");

  // Convert Appium's before and after to Detox's beforeAll and afterAll
  appiumCode = appiumCode.replace(/before\(.*\);/g, "beforeAll(async () => { await device.launchApp(); });");
  appiumCode = appiumCode.replace(/after\(.*\);/g, "afterAll(async () => { await device.terminateApp(); });");

  return appiumCode;
}

// Example usage
const directoryPath = './e2e';
const files = processFiles(directoryPath);
console.log(files);