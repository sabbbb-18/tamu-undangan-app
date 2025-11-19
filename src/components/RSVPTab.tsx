import React from 'react';
import { Search, Trash2, Check, X, UserCheck, UserX, Users, MessageSquare, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface RSVP {
  id: string;
  name: string;
  attendance: string;
  guests: number;
  message: string;
  guestId: string;
  timestamp: Date;
}

interface RSVPTabProps {
  rsvpList: RSVP[];
  filteredRSVP: RSVP[];
  rsvpLoading: boolean;
  rsvpSearchTerm: string;
  setRsvpSearchTerm: (term: string) => void;
  rsvpFilterStatus: string;
  setRsvpFilterStatus: (status: string) => void;
  handleDeleteRSVP: (id: string, name: string) => void;
  exportRSVPtoCSV: () => void;
}

export default function RSVPTab({
  rsvpList,
  filteredRSVP,
  rsvpLoading,
  rsvpSearchTerm,
  setRsvpSearchTerm,
  rsvpFilterStatus,
  setRsvpFilterStatus,
  handleDeleteRSVP,
  exportRSVPtoCSV
}: RSVPTabProps) {
  const totalRSVP = rsvpList.length;
  const attendingRSVP = rsvpList.filter(r => r.attendance !== '0').length;
  const notAttendingRSVP = rsvpList.filter(r => r.attendance === '0').length;
  const totalGuestsFromRSVP = rsvpList.reduce((sum, r) => sum + (r.guests || 0), 0);

  return (
    <>
      {/* RSVP STATISTICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total RSVP</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalRSVP}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <MessageSquare className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hadir</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{attendingRSVP}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <UserCheck className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tidak Hadir</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{notAttendingRSVP}</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-full">
              <UserX className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tamu</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalGuestsFromRSVP}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-full">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* RSVP FILTERS */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari nama atau pesan..."
              value={rsvpSearchTerm}
              onChange={(e) => setRsvpSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={rsvpFilterStatus}
            onChange={(e) => setRsvpFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="hadir">Hadir</option>
            <option value="tidak-hadir">Tidak Hadir</option>
          </select>

          <button
            onClick={exportRSVPtoCSV}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl"
          >
            <FileDown className="w-5 h-5" />
            <span className="font-semibold">Export CSV</span>
          </button>
        </div>
      </div>

      {/* RSVP TABLE */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {rsvpLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Memuat data RSVP...</p>
          </div>
        ) : filteredRSVP.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Belum ada RSVP</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jumlah Tamu</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pesan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRSVP.map((rsvp) => (
                  <tr key={rsvp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{rsvp.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full ${
                        rsvp.attendance === '0'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {rsvp.attendance === '0' ? (
                          <>
                            <X className="w-3 h-3" />
                            <span>Tidak Hadir</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Hadir</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {rsvp.guests} orang
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {rsvp.message || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(rsvp.timestamp, 'dd MMM yyyy HH:mm', { locale: id })}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteRSVP(rsvp.id, rsvp.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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
