import React from 'react';
import { Search, Edit2, Trash2, QrCode as QrCodeIcon, Users, UserCheck, UserX, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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

interface GuestTabProps {
  guests: Guest[];
  filteredGuests: Guest[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  openQRModal: (guest: Guest) => void;
  openEditModal: (guest: Guest) => void;
  handleDeleteGuest: (id: string, name: string) => void;
  setShowAddModal: (show: boolean) => void;
}

export default function GuestTab({
  guests,
  filteredGuests,
  loading,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  openQRModal,
  openEditModal,
  handleDeleteGuest,
  setShowAddModal
}: GuestTabProps) {
  const totalGuests = guests.length;
  const attendedGuests = guests.filter(g => g.status === 'sudah-hadir').length;
  const notAttendedGuests = totalGuests - attendedGuests;

  return (
    <>
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
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        guest.category === 'VIP' ? 'bg-purple-100 text-purple-800' :
                        guest.category === 'Keluarga' ? 'bg-blue-100 text-blue-800' :
                        guest.category === 'Teman' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {guest.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full ${
                        guest.status === 'sudah-hadir'
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
    </>
  );
}
