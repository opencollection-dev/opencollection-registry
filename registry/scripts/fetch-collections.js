const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const dotenv = require('dotenv');
const { execSync } = require('child_process');

dotenv.config();

// Configuration
const REGISTRY_FILE = path.join(__dirname, '..', 'registry.yml');
const COLLECTIONS_DIR = path.join(__dirname, '..', 'collections');

/**
 * Delete the collections directory if it exists
 */
function cleanCollectionsDir() {
  if (fs.existsSync(COLLECTIONS_DIR)) {
    console.log(`🗑️  Deleting existing collections directory: ${COLLECTIONS_DIR}`);
    fs.rmSync(COLLECTIONS_DIR, { recursive: true, force: true });
    console.log(`✅ Cleaned up collections directory\n`);
  }
}

/**
 * Ensure the collections directory exists
 */
function ensureCollectionsDir() {
  if (!fs.existsSync(COLLECTIONS_DIR)) {
    fs.mkdirSync(COLLECTIONS_DIR, { recursive: true });
    console.log(`Created collections directory: ${COLLECTIONS_DIR}\n`);
  }
}

/**
 * Clone a git repository to a specific location
 */
function cloneRepo(collectionName, versionName, url) {
  const collectionDir = path.join(COLLECTIONS_DIR, collectionName);
  const versionDir = path.join(collectionDir, versionName);
  
  try {
    // Ensure collection directory exists
    if (!fs.existsSync(collectionDir)) {
      fs.mkdirSync(collectionDir, { recursive: true });
    }
    
    console.log(`📦 Cloning ${collectionName}/${versionName}`);
    execSync(`git clone ${url} "${versionDir}"`, { stdio: 'inherit' });
    console.log(`✅ Cloned: ${collectionName}/${versionName}\n`);
  } catch (error) {
    console.error(`❌ Error cloning ${collectionName}/${versionName}:`, error.message);
  }
}

/**
 * Main function to fetch all collections
 */
async function fetchCollections() {
  try {
    console.log('🚀 Starting collection fetch...\n');
    
    // Read and parse registry.yml
    const registryContent = fs.readFileSync(REGISTRY_FILE, 'utf8');
    const registry = yaml.load(registryContent);
    
    if (!registry.collections || registry.collections.length === 0) {
      console.log('No collections found in registry.yml');
      return;
    }
    
    console.log(`Found ${registry.collections.length} collections in registry\n`);
    
    // Clean and recreate collections directory
    cleanCollectionsDir();
    ensureCollectionsDir();
    
    // Clone each collection with all its versions
    for (const collection of registry.collections) {
      const { name, versions } = collection;
      
      if (!versions || versions.length === 0) {
        console.warn(`⚠️  No versions found for ${name}, skipping...\n`);
        continue;
      }
      
      console.log(`📚 Processing collection: ${name} (${versions.length} version${versions.length > 1 ? 's' : ''})`);
      
      // Clone each version of the collection
      for (const version of versions) {
        if (!version.url) {
          console.warn(`⚠️  No URL found for ${name}/${version.name}, skipping...`);
          continue;
        }
        
        cloneRepo(name, version.name, version.url);
      }
    }
    
    console.log('✨ All collections processed successfully!');
    console.log(`Collections are available in: ${COLLECTIONS_DIR}`);
    
  } catch (error) {
    console.error('❌ Error fetching collections:', error.message);
    process.exit(1);
  }
}

// Run the script
fetchCollections();
