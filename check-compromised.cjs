const fs = require('fs');
const path = require('path');

let foundCompromised = false;

// Function to find files recursively
function findFiles(dir, filename) {
  const files = [];
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory() && item.name !== '.git') {
        files.push(...findFiles(fullPath, filename));
      } else if (item.name === filename) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    // Ignore errors like permission denied
  }
  return files;
}

// Path to the bad packages file
const badPackagesFile = path.join(__dirname, 'bad-packages.txt');

// Function to parse bad-packages.txt
function parseBadPackages() {
  const badPackages = new Map();
  const content = fs.readFileSync(badPackagesFile, 'utf8');
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.trim() === '') continue;
    const parts = line.split('\t');
    if (parts.length >= 2) {
      const pkg = parts[0].trim();
      const versions = parts[1].split(',').map(v => v.trim());
      if (!badPackages.has(pkg)) {
        badPackages.set(pkg, new Set());
      }
      versions.forEach(v => badPackages.get(pkg).add(v));
    }
  }
  return badPackages;
}

// Function to check dependencies in package-lock.json
function checkPackageLock(badPackages, filePath) {
  if (!fs.existsSync(filePath)) return;
  const lock = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`Checking ${filePath}...`);

  // Check dependencies
  if (lock.dependencies) {
    checkDeps(lock.dependencies, badPackages);
  }

  // Check packages (for newer package-lock.json)
  if (lock.packages) {
    for (const [pkgPath, info] of Object.entries(lock.packages)) {
      if (pkgPath.startsWith('node_modules/')) {
        const pkg = pkgPath.replace('node_modules/', '');
        const version = info.version;
        if (badPackages.has(pkg) && badPackages.get(pkg).has(version)) {
          foundCompromised = true;
          console.log(`\x1b[31mCompromised in package-lock.json: ${pkg}@${version}\x1b[0m`);
        }
      }
    }
  }
}

// Function to check dependencies in pnpm-lock.yaml
function checkPnpmLock(badPackages, filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`Checking ${filePath}...`);

  // Simple regex to find package: version lines
  const lines = content.split('\n');
  for (const line of lines) {
    // Match lines like 'package': 'version'
    const match = line.match(/^\s*'([^']+)':\s*'([^']+)'$/);
    if (match) {
      const pkg = match[1];
      const version = match[2];
      if (badPackages.has(pkg) && badPackages.get(pkg).has(version)) {
        foundCompromised = true;
        console.log(`\x1b[31mCompromised in pnpm-lock.yaml: ${pkg}@${version}\x1b[0m`);
      }
    }
  }
}

// Helper function to check deps object
function checkDeps(deps, badPackages) {
  for (const [pkg, info] of Object.entries(deps)) {
    const version = info.version;
    if (badPackages.has(pkg) && badPackages.get(pkg).has(version)) {
      foundCompromised = true;
      console.log(`\x1b[31mCompromised: ${pkg}@${version}\x1b[0m`);
    }
    // Recursively check nested dependencies if needed
    if (info.dependencies) {
      checkDeps(info.dependencies, badPackages);
    }
  }
}

// Function to check dependencies in package.json
function checkPackageJson(badPackages, filePath) {
  if (!fs.existsSync(filePath)) return;
  const pkgJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`Checking ${filePath}...`);
  const allDeps = Object.assign({}, pkgJson.dependencies || {}, pkgJson.devDependencies || {}, pkgJson.optionalDependencies || {});
  for (const [pkg, version] of Object.entries(allDeps)) {
    // Remove ^, ~, >=, <=, etc. for direct match
    const cleanVersion = version.replace(/^[^\d]*/, '').split(' ')[0];
    if (badPackages.has(pkg) && badPackages.get(pkg).has(cleanVersion)) {
      foundCompromised = true;
      console.log(`\x1b[31mCompromised in package.json: ${pkg}@${cleanVersion}\x1b[0m`);
    }
  }
}

// Main function
function main() {
  const badPackages = parseBadPackages();
  console.log(`Loaded ${badPackages.size} bad packages from bad-packages.txt`);

  const packageLockFiles = findFiles(__dirname, 'package-lock.json');
  const pnpmLockFiles = findFiles(__dirname, 'pnpm-lock.yaml');
  const packageJsonFiles = findFiles(__dirname, 'package.json');

  if (packageLockFiles.length > 0) {
    console.log(`Found ${packageLockFiles.length} package-lock.json file(s):`);
    for (const file of packageLockFiles) {
      console.log(`  - ${file}`);
    }
  } else {
    console.log('No package-lock.json files found.');
  }

  if (pnpmLockFiles.length > 0) {
    console.log(`Found ${pnpmLockFiles.length} pnpm-lock.yaml file(s):`);
    for (const file of pnpmLockFiles) {
      console.log(`  - ${file}`);
    }
  } else {
    console.log('No pnpm-lock.yaml files found.');
  }

  for (const file of packageLockFiles) {
    checkPackageLock(badPackages, file);
  }

  for (const file of pnpmLockFiles) {
    checkPnpmLock(badPackages, file);
  }

  if (packageJsonFiles.length > 0) {
    console.log(`Found ${packageJsonFiles.length} package.json file(s):`);
    for (const file of packageJsonFiles) {
      console.log(`  - ${file}`);
    }
    for (const file of packageJsonFiles) {
      checkPackageJson(badPackages, file);
    }
  } else {
    console.log('No package.json files found.');
  }

  console.log('Check complete.');
  if (!foundCompromised) {
    console.log('\x1b[32mEverything looks good! No compromised packages found.\x1b[0m');
  }
}

main();