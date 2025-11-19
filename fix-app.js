const fs = require('fs');
const path = require('path');

// Read the original App.tsx
const appPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// Fix 1: Add missing imports
content = content.replace(
  "import { Plus, QrCode as QrCodeIcon, Camera, Download, X, Check, Users, MessageSquare, Heart } from 'lucide-react';",
  "import { Plus, QrCode as QrCodeIcon, Camera, Download, X, Check, Users, MessageSquare, Heart, UserCheck, UserX, Search, Edit2, Trash2 } from 'lucide-react';"
);

// Fix 2: Remove duplicate qrScanner declaration (line 486)
const lines = content.split('\n');
let inBadSection = false;
let fixedLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Skip the duplicate qrScanner declaration and bad JSX fragment
  if (line.includes('// QR SCANNER') && i > 400) {
    // Skip this section until we find the useEffect
    inBadSection = true;
    continue;
  }
  
  if (inBadSection && line.includes('useEffect(() => {')) {
    inBadSection = false;
    fixedLines.push(line);
    continue;
  }
  
  if (!inBadSection) {
    fixedLines.push(line);
  }
}

content = fixedLines.join('\n');

// Fix 3: Add missing RSVP & Wish functions before "// STATISTICS"
const functionsToAdd = `
  // ========================================
  // DELETE RSVP
  // ========================================
  const handleDeleteRSVP = async (rsvpId: string, rsvpName: string) => {
    if (!window.confirm(\`Apakah Anda yakin ingin menghapus RSVP dari \${rsvpName}?\`)) return;
    try {
      await deleteDoc(doc(db, 'rsvp', rsvpId));
      alert('✅ RSVP berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting RSVP:', error);
      alert('❌ Gagal menghapus RSVP.');
    }
  };

  // ========================================
  // DELETE WISH
  // ========================================
  const handleDeleteWish = async (wishId: string, wishName: string) => {
    if (!window.confirm(\`Apakah Anda yakin ingin menghapus ucapan dari \${wishName}?\`)) return;
    try {
      await deleteDoc(doc(db, 'wishes', wishId));
      alert('✅ Ucapan berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting wish:', error);
      alert('❌ Gagal menghapus ucapan.');
    }
  };

  // ========================================
  // EXPORT RSVP TO CSV
  // ========================================
  const exportRSVPtoCSV = () => {
    const headers = ['Nama', 'Status Kehadiran', 'Jumlah Tamu', 'Pesan', 'Tanggal'];
    const rows = filteredRSVP.map(rsvp => [
      rsvp.name,
      rsvp.attendance === '0' ? 'Tidak Hadir' : \`Hadir (\${rsvp.guests} orang)\`,
      rsvp.guests,
      rsvp.message,
      format(rsvp.timestamp, 'dd MMM yyyy HH:mm', { locale: id })
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => \`"\${cell}"\`).join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = \`RSVP_\${format(new Date(), 'yyyy-MM-dd')}.csv\`;
    link.click();
  };

`;

content = content.replace('  // ========================================\n  // STATISTICS', functionsToAdd + '  // ========================================\n  // STATISTICS');

// Fix 4: Add statistics for RSVP & Wishes
content = content.replace(
  '  const totalGuests = guests.length;\n  const attendedGuests = guests.filter(g => g.status === \'sudah-hadir\').length;\n  const notAttendedGuests = totalGuests - attendedGuests;',
  `  const totalGuests = guests.length;
  const attendedGuests = guests.filter(g => g.status === 'sudah-hadir').length;
  const notAttendedGuests = totalGuests - attendedGuests;
  const totalRSVP = rsvpList.length;
  const totalWishes = wishList.length;`
);

// Fix 5: Replace main content with tab navigation
const mainContentOld = '      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">\n            {/* STATISTICS */}';
const mainContentNew = `      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB NAVIGATION */}
        <div className="bg-white rounded-xl shadow-md mb-6 p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('guests')}
              className={\`flex-1 px-6 py-3 rounded-lg font-semibold transition-all \${
                activeTab === 'guests'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }\`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Tamu ({totalGuests})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('rsvp')}
              className={\`flex-1 px-6 py-3 rounded-lg font-semibold transition-all \${
                activeTab === 'rsvp'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }\`}
            >
              <div className="flex items-center justify-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>RSVP ({totalRSVP})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('wishes')}
              className={\`flex-1 px-6 py-3 rounded-lg font-semibold transition-all \${
                activeTab === 'wishes'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }\`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Ucapan ({totalWishes})</span>
              </div>
            </button>
          </div>
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'guests' && (
          <>
            {/* STATISTICS */}`;

content = content.replace(mainContentOld, mainContentNew);

// Fix 6: Close the guests tab and add RSVP & Wish tabs
const endOfGuestsTable = '            )}\n          </div>\n      </main>';
const newEndWithTabs = `            )}
          </div>
          </>
        )}

        {activeTab === 'rsvp' && (
          <RSVPTab
            rsvpList={rsvpList}
            filteredRSVP={filteredRSVP}
            rsvpLoading={rsvpLoading}
            rsvpSearchTerm={rsvpSearchTerm}
            setRsvpSearchTerm={setRsvpSearchTerm}
            rsvpFilterStatus={rsvpFilterStatus}
            setRsvpFilterStatus={setRsvpFilterStatus}
            handleDeleteRSVP={handleDeleteRSVP}
            exportRSVPtoCSV={exportRSVPtoCSV}
          />
        )}

        {activeTab === 'wishes' && (
          <WishTab
            wishList={wishList}
            filteredWishes={filteredWishes}
            wishLoading={wishLoading}
            wishSearchTerm={wishSearchTerm}
            setWishSearchTerm={setWishSearchTerm}
            handleDeleteWish={handleDeleteWish}
          />
        )}
      </main>`;

content = content.replace(endOfGuestsTable, newEndWithTabs);

// Write the fixed content
fs.writeFileSync(appPath, content, 'utf8');

console.log('✅ App.tsx has been fixed successfully!');
console.log('Fixed issues:');
console.log('  1. Added missing imports (UserCheck, UserX, Search, Edit2, Trash2)');
console.log('  2. Removed duplicate qrScanner declaration');
console.log('  3. Removed bad JSX fragment');
console.log('  4. Added handleDeleteRSVP, handleDeleteWish, exportRSVPtoCSV functions');
console.log('  5. Added tab navigation UI');
console.log('  6. Integrated RSVPTab and WishTab components');
console.log('\nYou can now run: npm start');
