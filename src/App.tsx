import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import QRCode from 'qrcode';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Search, Plus, Edit2, Trash2, QrCode as QrCodeIcon, Camera, Download, X, Check, Users, UserCheck, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// ========================================
// FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyDBgLYSMQetSTL1r8L9Xz9zbyMH-QvRnYc",
  authDomain: "aplikasi-tamu-undangan.firebaseapp.com",
  projectId: "aplikasi-tamu-undangan",
  storageBucket: "aplikasi-tamu-undangan.firebasestorage.app",
  messagingSenderId: "918722441585",
  appId: "1:918722441585:web:859591609b99df751e86d0",
  measurementId: "G-LXVPJ5GNG0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ========================================
// INVITATION URL CONFIGURATION
// ========================================
// 🔧 EDIT INI: Ganti dengan URL web undangan Anda setelah deploy
const INVITATION_BASE_URL = 'http://localhost:3000/invitation'; // Local development
// const INVITATION_BASE_URL = 'https://your-wedding.vercel.app/invitation'; // Production (uncomment setelah deploy)


// ========================================
// TYPES
// ========================================
interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: 'VIP' | 'Keluarga' | 'Teman' | 'Rekan Kerja' | 'Rekann Keluarga';
  status: 'belum-hadir' | 'sudah-hadir';
  qrCode: string;
  createdAt: Date;
  checkedInAt?: Date;
}




// ========================================
// MAIN APP COMPONENT
// ========================================
export default function App() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Teman' as Guest['category']
  });


  
  // ========================================
  // LOAD GUESTS FROM FIRESTORE
  // ========================================
  const loadGuests = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'guests'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const guestsData: Guest[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        guestsData.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          category: data.category,
          status: data.status,
          qrCode: data.qrCode,
          createdAt: data.createdAt.toDate(),
          checkedInAt: data.checkedInAt?.toDate()
        });
      });

      setGuests(guestsData);
      setFilteredGuests(guestsData);
    } catch (error) {
      console.error('Error loading guests:', error);
      alert('Gagal memuat data tamu. Pastikan koneksi internet dan konfigurasi Firebase sudah benar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, []);



  
  // ========================================
  // FILTER & SEARCH
  // ========================================
  useEffect(() => {
    let filtered = guests;

    if (searchTerm) {
      filtered = filtered.filter(guest =>
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.phone.includes(searchTerm)
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(guest => guest.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(guest => guest.status === filterStatus);
    }

    setFilteredGuests(filtered);
  }, [searchTerm, filterCategory, filterStatus, guests]);

  // ========================================
  // GENERATE QR CODE
  // ========================================
  const generateQRCode = async (guestId: string, name: string): Promise<string> => {
    try {
      const qrData = JSON.stringify({
        id: guestId,
        name: name,
        timestamp: new Date().toISOString()
      });
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  // ========================================
  // ADD GUEST
  // ========================================
  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      alert('Mohon lengkapi semua data!');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'guests'), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        category: formData.category,
        status: 'belum-hadir',
        qrCode: '',
        createdAt: Timestamp.now()
      });

      const qrCode = await generateQRCode(docRef.id, formData.name);

      await updateDoc(doc(db, 'guests', docRef.id), {
        qrCode: qrCode
      });

      // 🎉 BARU: Generate URL undangan unik untuk tamu
      const invitationUrl = `${INVITATION_BASE_URL}/${docRef.id}`;

      // 🎉 BARU: Tampilkan popup dengan URL undangan yang bisa di-copy
      const message = `✅ Tamu berhasil ditambahkan!\n\n` +
        `👤 Nama: ${formData.name}\n` +
        `📧 Email: ${formData.email}\n\n` +
        `🔗 URL Undangan:\n${invitationUrl}\n\n` +
        `📋 URL sudah di-copy ke clipboard!\n` +
        `Kirim URL ini ke ${formData.name} via WhatsApp/Email.`;

      // Copy URL ke clipboard
      navigator.clipboard.writeText(invitationUrl).then(() => {
        alert(message);
      }).catch(() => {
        alert(message + '\n\n⚠️ Gagal copy otomatis, silakan copy manual.');
      });

      setShowAddModal(false);
      setFormData({ name: '', email: '', phone: '', category: 'Teman' });
      loadGuests();
    } catch (error) {
      console.error('Error adding guest:', error);
      alert('❌ Gagal menambahkan tamu. Silakan coba lagi.');
    }
  };

  // ========================================
  // UPDATE GUEST
  // ========================================
  const handleUpdateGuest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGuest) return;

    try {
      await updateDoc(doc(db, 'guests', selectedGuest.id), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        category: formData.category
      });

      alert('✅ Data tamu berhasil diperbarui!');
      setShowEditModal(false);
      setSelectedGuest(null);
      loadGuests();
    } catch (error) {
      console.error('Error updating guest:', error);
      alert('❌ Gagal memperbarui data tamu.');
    }
  };


  
  // ========================================
  // DELETE GUEST
  // ========================================
  const handleDeleteGuest = async (guestId: string, guestName: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${guestName}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'guests', guestId));
      alert('✅ Tamu berhasil dihapus!');
      loadGuests();
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('❌ Gagal menghapus tamu.');
    }
  };

  // ========================================
  // CHECK IN GUEST
  // ========================================
  const handleCheckIn = async (guestId: string) => {
    try {
      await updateDoc(doc(db, 'guests', guestId), {
        status: 'sudah-hadir',
        checkedInAt: Timestamp.now()
      });
      alert('✅ Tamu berhasil check-in!');
      loadGuests();
      setShowQRModal(false);
      setShowScanModal(false);
    } catch (error) {
      console.error('Error checking in guest:', error);
      alert('❌ Gagal melakukan check-in.');
    }
  };

  // ========================================
  // DOWNLOAD QR CODE
  // ========================================
  const downloadQRCode = (guest: Guest) => {
    const link = document.createElement('a');
    link.download = `QR-${guest.name.replace(/\s+/g, '-')}.png`;
    link.href = guest.qrCode;
    link.click();
  };

  // ========================================
  // OPEN MODALS
  // ========================================
  const openEditModal = (guest: Guest) => {
    setSelectedGuest(guest);
    setFormData({
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      category: guest.category
    });
    setShowEditModal(true);
  };

  const openQRModal = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowQRModal(true);
  };

  // ========================================
  // QR SCANNER
  // ========================================
  // QR SCANNER
  const [qrScanner, setQrScanner] = useState<Html5QrcodeScanner | null>(null);

  const openScanModal = () => {
    setShowScanModal(true);
  };

  const closeScanModal = () => {
    if (qrScanner) {
      qrScanner.clear().catch(err => console.error('Error clearing scanner:', err));
      setQrScanner(null);
    }
    setShowScanModal(false);
  };

  useEffect(() => {
    if (showScanModal && !qrScanner) {
      setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true
          },
          false
        );

        scanner.render(
          (decodedText) => {
            try {
              const data = JSON.parse(decodedText);
              const guest = guests.find(g => g.id === data.id);

              if (guest) {
                scanner.clear().then(() => {
                  setQrScanner(null);
                  setSelectedGuest(guest);
                  setShowQRModal(true);
                  setShowScanModal(false);
                });
              } else {
                alert('❌ Tamu tidak ditemukan!');
              }
            } catch (error) {
              alert('❌ QR Code tidak valid!');
            }
          },
          (error) => {
            // Ignore errors (terlalu banyak log)
          }
        );

        setQrScanner(scanner);
      }, 300); // Tambah delay untuk memastikan DOM sudah ready
    }
  }, [showScanModal, qrScanner, guests]);
  // ========================================
  // STATISTICS
  // ========================================
  const totalGuests = guests.length;
  const attendedGuests = guests.filter(g => g.status === 'sudah-hadir').length;
  const notAttendedGuests = totalGuests - attendedGuests;

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* HEADER */}
      <header className="bg-white shadow-md border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Tamu Undangan</h1>
                <p className="text-sm text-gray-600 mt-1">Kelola tamu dengan mudah dan modern</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Tambah Tamu</span>
              </button>
              <button
                onClick={openScanModal}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all shadow-lg hover:shadow-xl"
              >
                <Camera className="w-5 h-5" />
                <span className="font-semibold">Scan QR</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* STATISTICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tamu</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalGuests}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sudah Hadir</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{attendedGuests}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Belum Hadir</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{notAttendedGuests}</p>
              </div>
              <div className="bg-orange-100 p-4 rounded-full">
                <UserX className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama, email, atau telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Kategori</option>
              <option value="VIP">VIP</option>
              <option value="Keluarga">Keluarga</option>
              <option value="Teman">Teman</option>
              <option value="Rekan Kerja">Rekan Kerja</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="belum-hadir">Belum Hadir</option>
              <option value="sudah-hadir">Sudah Hadir</option>
            </select>
          </div>
        </div>

        {/* GUESTS TABLE */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Memuat data tamu...</p>
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Belum ada tamu yang terdaftar</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Tambah Tamu Pertama
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Telepon</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{guest.name}</div>
                        <div className="text-sm text-gray-500">
                          {format(guest.createdAt, 'dd MMM yyyy', { locale: id })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{guest.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{guest.phone}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${guest.category === 'VIP' ? 'bg-purple-100 text-purple-800' :
                            guest.category === 'Keluarga' ? 'bg-blue-100 text-blue-800' :
                              guest.category === 'Teman' ? 'bg-green-100 text-green-800' :
                                'bg-orange-100 text-orange-800'
                          }`}>
                          {guest.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full ${guest.status === 'sudah-hadir'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {guest.status === 'sudah-hadir' ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Sudah Hadir</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" />
                              <span>Belum Hadir</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openQRModal(guest)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Lihat QR Code"
                          >
                            <QrCodeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(guest)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(guest.id, guest.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tambah Tamu Baru</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddGuest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: john@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: 08123456789"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Guest['category'] })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="VIP">VIP</option>
                  <option value="Keluarga">Keluarga</option>
                  <option value="Teman">Teman</option>
                  <option value="Rekan Kerja">Rekan Kerja</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg"
                >
                  Tambah Tamu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Data Tamu</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateGuest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Guest['category'] })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="VIP">VIP</option>
                  <option value="Keluarga">Keluarga</option>
                  <option value="Teman">Teman</option>
                  <option value="Rekan Kerja">Rekan Kerja</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-lg"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR CODE MODAL */}
      {showQRModal && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">QR Code Tamu</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center">
              <div className="bg-gray-50 p-6 rounded-lg mb-4">
                <img
                  src={selectedGuest.qrCode}
                  alt="QR Code untuk tamu undangan"
                  className="w-64 h-64 mx-auto"
                />
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedGuest.name}</h3>
                <p className="text-gray-600">{selectedGuest.email}</p>
                <p className="text-gray-600">{selectedGuest.phone}</p>
                <span className={`inline-block mt-2 px-3 py-1 text-sm font-semibold rounded-full ${selectedGuest.status === 'sudah-hadir'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                  {selectedGuest.status === 'sudah-hadir' ? 'Sudah Hadir' : 'Belum Hadir'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex space-x-3">
                  <button
                    onClick={() => downloadQRCode(selectedGuest)}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center space-x-2 font-medium"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download QR</span>
                  </button>
                  {selectedGuest.status === 'belum-hadir' && (
                    <button
                      onClick={() => handleCheckIn(selectedGuest.id)}
                      className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center space-x-2 font-medium"
                    >
                      <Check className="w-5 h-5" />
                      <span>Check In</span>
                    </button>
                  )}
                </div>

                {/* 🎉 BARU: Tombol Copy URL Undangan */}
                <button
                  onClick={() => {
                    const invitationUrl = `${INVITATION_BASE_URL}/${selectedGuest.id}`;
                    navigator.clipboard.writeText(invitationUrl).then(() => {
                      alert(`✅ URL Undangan berhasil di-copy!\n\n${invitationUrl}\n\nKirim URL ini ke ${selectedGuest.name} via WhatsApp/Email.`);
                    }).catch(() => {
                      alert(`📋 Copy URL ini:\n\n${invitationUrl}`);
                    });
                  }}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center space-x-2 font-medium"
                >
                  <QrCodeIcon className="w-5 h-5" />
                  <span>Copy URL Undangan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      // {/* SCAN MODAL */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Scan QR Code</h2>
              <button
                onClick={() => setShowScanModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div id="qr-reader" className="w-full"></div>
            </div>

            <p className="text-center text-gray-600 mt-4 text-sm">
              Arahkan kamera ke QR Code tamu untuk melakukan check-in
            </p>
          </div>
        </div>
      )}
    </div>
  );
}