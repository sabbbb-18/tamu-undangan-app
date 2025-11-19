const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// Check if openScanModal already exists
if (content.includes('const openScanModal')) {
  console.log('✅ openScanModal function already exists!');
  process.exit(0);
}

// Find and replace - more flexible pattern
const lines = content.split('\n');
let newLines = [];
let found = false;

for (let i = 0; i < lines.length; i++) {
  newLines.push(lines[i]);
  
  // Look for the pattern: openQRModal function followed by comment line
  if (lines[i].includes('const openQRModal = (guest: Guest) => {')) {
    // Find the closing brace of openQRModal
    let braceCount = 1;
    let j = i + 1;
    while (j < lines.length && braceCount > 0) {
      newLines.push(lines[j]);
      if (lines[j].includes('{')) braceCount++;
      if (lines[j].includes('}')) braceCount--;
      j++;
    }
    
    // Now add openScanModal function
    newLines.push('');
    newLines.push('  const openScanModal = () => {');
    newLines.push('    setShowScanModal(true);');
    newLines.push('  };');
    
    found = true;
    i = j - 1; // Continue from where we left off
  }
}

if (found) {
  fs.writeFileSync(appPath, newLines.join('\n'), 'utf8');
  console.log('✅ Successfully added openScanModal function!');
} else {
  console.log('❌ Could not find openQRModal function. Manual fix required.');
}
