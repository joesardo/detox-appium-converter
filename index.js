const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const util = require('util');

// Promisified version of fs.readFile and fs.writeFile for async operations
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

class TestConverter {
    constructor(repositoryPath) {
        this.repositoryPath = repositoryPath;
        this.git = simpleGit();
    }

    // Method to clone a repository (if URL is provided)
    async cloneRepo() {
        try {
            await this.git.clone(this.repositoryPath, path.join(__dirname, 'temp-repo'));
            console.log('Repository cloned to temp-repo');
        } catch (error) {
            console.error('Failed to clone repository:', error);
        }
    }

    // Method to read all test files from the repo directory
    async readTestFiles(directory = 'temp-repo') {
        try {
            const files = await this._getAllFiles(path.join(__dirname, directory));
            return files.filter(file => file.endsWith('.js')); // Filter only JS files
        } catch (error) {
            console.error('Failed to read test files:', error);
            return [];
        }
    }

    // Recursively get all files in a directory
    async _getAllFiles(dirPath, arrayOfFiles = []) {
        const files = await fs.promises.readdir(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = await fs.promises.stat(filePath);
            if (stat.isDirectory()) {
                await this._getAllFiles(filePath, arrayOfFiles); // Recurse into subdirectory
            } else {
                arrayOfFiles.push(filePath);
            }
        }
        return arrayOfFiles;
    }

    // Convert Detox code to Appium
    detoxToAppium(detoxCode) {
        // Convert Detox's expect(element()).toBeVisible() to Appium's driver.element().isDisplayed()
        detoxCode = detoxCode.replace(/expect\(element\(\)\)\.toBeVisible\(\);/g, "await driver.element().isDisplayed();");

        // Convert Detox's actions (tap, typeText) to Appium equivalent methods
        detoxCode = detoxCode.replace(/await element\(\)\.tap\(\);/g, "await driver.element().click();");
        detoxCode = detoxCode.replace(/await element\(\)\.typeText\('([^']+)'\);/g, "await driver.element().sendKeys('$1');");

        // Convert Detox's assertions to Appium's assertions
        detoxCode = detoxCode.replace(/expect\(element\(\)\)\.toBeVisible\(\);/g, "await driver.element().isDisplayed();");
        detoxCode = detoxCode.replace(/expect\(element\(\)\)\.toBeEnabled\(\);/g, "await driver.element().isEnabled();");

        // Convert Detox's beforeAll and afterAll to Appium's before and after
        detoxCode = detoxCode.replace(/beforeAll\(.*\);/g, "before(async () => { await driver.init(); });");
        detoxCode = detoxCode.replace(/afterAll\(.*\);/g, "after(async () => { await driver.quit(); });");

        return detoxCode;
    }

    // Convert Appium code to Detox
    appiumToDetox(appiumCode) {
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

    // Process each file to convert based on its content
    async processFiles() {
        const files = await this.readTestFiles();
        for (const file of files) {
            const fileContent = await readFile(file, 'utf8');
            let convertedContent;
            if (fileContent.includes('expect(element()')) {
                // Assume Detox code
                console.log(`Converting Detox code in ${file}`);
                convertedContent = this.detoxToAppium(fileContent);
            } else {
                // Assume Appium code
                console.log(`Converting Appium code in ${file}`);
                convertedContent = this.appiumToDetox(fileContent);
            }
            // Write the converted content back to the file
            await writeFile(file, convertedContent, 'utf8');
        }
    }
}

module.exports = TestConverter;