# Example Usage

const TestConverter = require('test-converter');

// Initialize with the repository path (local path or GitHub URL)
const converter = new TestConverter('path_to_your_repo_or_github_url');

// Clone the repository (if it's a URL)
async function convertTests() {
    await converter.cloneRepo();  // Clone repository (if needed)
    await converter.processFiles();  // Process and convert all files
}

convertTests();