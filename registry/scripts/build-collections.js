const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { brunoToOpenCollection } = require('@opencollection/converters');

const COLLECTIONS_DIR = path.join(__dirname, '..', 'collections');
const OUTPUT_DIR = path.join(__dirname, '..', 'dist');

/**
 * Ensures a directory exists, creating it if necessary
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Process a single collection version
 */
function processCollectionVersion(collectionName, versionName) {
  console.log(`\nProcessing: ${collectionName} - ${versionName}`);
  
  const sourceDir = path.join(COLLECTIONS_DIR, collectionName, versionName);
  const outputDir = path.join(OUTPUT_DIR, collectionName, versionName);
  
  if (!fs.existsSync(sourceDir)) {
    console.warn(`  Warning: Version path not found: ${sourceDir}`);
    return false;
  }
  
  // Ensure output directory exists
  ensureDirectoryExists(outputDir);
  
  // Step 1: Pack the Bruno collection using @usebruno/cli-next
  const tempBrunoFile = path.join(outputDir, 'bruno-collection.json');
  const outputOcFile = path.join(outputDir, 'opencollection.json');
  
  console.log(`  → Packing Bruno collection...`);
  
  try {
    // Run the pack command
    execSync(
      `npx @usebruno/cli-next@2.13.2-oc2 pack -s "${sourceDir}" -o "${tempBrunoFile}"`,
      { 
        stdio: 'pipe',
        encoding: 'utf8'
      }
    );
    console.log(`  ✓ Packed to bruno-collection.json`);
  } catch (error) {
    console.error(`  ✗ Error packing collection:`, error.message);
    if (error.stderr) {
      console.error(`  ${error.stderr}`);
    }
    return false;
  }
  
  // Step 2: Convert Bruno JSON to OpenCollection format
  console.log(`  → Converting to OpenCollection format...`);
  
  try {
    // Read the packed Bruno collection
    const brunoCollection = JSON.parse(fs.readFileSync(tempBrunoFile, 'utf8'));
    
    // Convert to OpenCollection format
    const openCollection = brunoToOpenCollection(brunoCollection);
    
    // Write the OpenCollection JSON
    fs.writeFileSync(outputOcFile, JSON.stringify(openCollection, null, 2), 'utf8');
    console.log(`  ✓ Converted to opencollection.json`);
    
    // Remove the temporary Bruno collection file
    fs.unlinkSync(tempBrunoFile);
    
    return true;
  } catch (error) {
    console.error(`  ✗ Error converting to OpenCollection:`, error.message);
    console.error(error.stack);
    return false;
  }
}

/**
 * Main build function
 */
function buildCollections() {
  console.log('Starting collection build process...\n');
  
  // Check if collections directory exists
  if (!fs.existsSync(COLLECTIONS_DIR)) {
    console.error('Error: collections directory not found. Run fetch-collections.js first.');
    process.exit(1);
  }
  
  // Create output directory
  ensureDirectoryExists(OUTPUT_DIR);
  
  let successCount = 0;
  let failureCount = 0;
  
  // Read all collection names from the collections directory
  const collectionNames = fs.readdirSync(COLLECTIONS_DIR).filter(item => {
    const itemPath = path.join(COLLECTIONS_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  console.log(`Found ${collectionNames.length} collections\n`);
  
  // Process each collection
  collectionNames.forEach(collectionName => {
    const collectionPath = path.join(COLLECTIONS_DIR, collectionName);
    
    // Read all version names for this collection
    const versionNames = fs.readdirSync(collectionPath).filter(item => {
      const itemPath = path.join(collectionPath, item);
      return fs.statSync(itemPath).isDirectory();
    });
    
    // Process each version
    versionNames.forEach(versionName => {
      try {
        const success = processCollectionVersion(collectionName, versionName);
        
        if (success) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        console.error(`  ✗ Error processing ${collectionName}-${versionName}:`, error.message);
        console.error(error.stack);
        failureCount++;
      }
    });
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Build complete!');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failureCount}`);
  console.log('='.repeat(60));
}

// Run the build
if (require.main === module) {
  buildCollections();
}

module.exports = { buildCollections };

