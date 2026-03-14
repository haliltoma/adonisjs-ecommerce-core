const fs = require('fs');
const path = require('path');

const CONTROLLERS_DIR = path.join(__dirname, 'app/controllers/admin');
const PAGES_DIR = path.join(__dirname, 'inertia/pages');

function findFilesInDir(startPath, filter) {
  let results = [];
  if (!fs.existsSync(startPath)) return results;
  const files = fs.readdirSync(startPath);
  for (let i = 0; i < files.length; i++) {
    const filename = path.join(startPath, files[i]);
    const stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      results = results.concat(findFilesInDir(filename, filter));
    } else if (filename.endsWith(filter)) {
      results.push(filename);
    }
  }
  return results;
}

const tsFiles = findFilesInDir(CONTROLLERS_DIR, '.ts');
const missingPages = new Set();
let totalChecks = 0;

tsFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Match inertia.render('admin/Something'
  const matches = [...content.matchAll(/inertia\.render\(\s*['"](admin\/[^'"]+)['"]/g)];
  
  matches.forEach(match => {
    totalChecks++;
    const pagePath = match[1]; // e.g. admin/products/Index
    
    // Check if file exists. Inertia components are usually .tsx
    const fullPathTsx = path.join(PAGES_DIR, pagePath + '.tsx');
    const fullPathTs = path.join(PAGES_DIR, pagePath + '.ts');
    
    if (!fs.existsSync(fullPathTsx) && !fs.existsSync(fullPathTs)) {
      missingPages.add(`${pagePath} (referenced in ${path.basename(file)})`);
    }
  });
});

console.log(`Checked ${totalChecks} inertia.render() calls.`);
if (missingPages.size > 0) {
  console.log('🚨 MISSING PAGES FOUND:');
  missingPages.forEach(p => console.log(' - ' + p));
} else {
  console.log('✅ All referenced admin pages exist!');
}
