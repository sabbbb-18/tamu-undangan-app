const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// Find the location after openQRModal function
const searchString = `  const openQRModal = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowQRModal(true);
  };

  // ========================================
  useEffect(() => {`;

const replaceString = `  const openQRModal = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowQRModal(true);
  };

  const openScanModal = () => {
    setShowScanModal(true);
  };

  // ========================================
  // QR SCANNER
  // ========================================
  useEffect(() => {`;

if (content.includes(searchString)) {
  content = content.replace(searchString, replaceString);
  fs.writeFileSync(appPath, content, 'utf8');
  console.log('✅ Successfully added openScanModal function!');
} else {
  console.log('❌ Could not find the exact match. The function might already exist or the file structure is different.');
  console.log('\nSearching for openScanModal...');
  if (content.includes('const openScanModal')) {
    console.log('✅ openScanModal function already exists!');
  } else {
    console.log('❌ openScanModal function not found. Manual fix required.');
  }
}
