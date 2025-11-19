import React from 'react';
import { Search, Trash2, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Wish {
  id: string;
  name: string;
  message: string;
  timestamp: Date;
}

interface WishTabProps {
  wishList: Wish[];
  filteredWishes: Wish[];
  wishLoading: boolean;
  wishSearchTerm: string;
  setWishSearchTerm: (term: string) => void;
  handleDeleteWish: (id: string, name: string) => void;
}

export default function WishTab({
  wishList,
  filteredWishes,
  wishLoading,
  wishSearchTerm,
  setWishSearchTerm,
  handleDeleteWish
}: WishTabProps) {
  const totalWishes = wishList.length;

  return (
    <>
      {/* WISH STATISTICS */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Ucapan</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalWishes}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-full">
              <Heart className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* WISH FILTERS */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari nama atau ucapan..."
            value={wishSearchTerm}
            onChange={(e) => setWishSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* WISH CARDS */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {wishLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Memuat ucapan...</p>
          </div>
        ) : filteredWishes.length === 0 ? (
          <div className="p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Belum ada ucapan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWishes.map((wish) => (
              <div key={wish.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100 relative hover:shadow-md transition-shadow">
                <button
                  onClick={() => handleDeleteWish(wish.id, wish.name)}
                  className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-start space-x-3 mb-3">
                  <div className="bg-purple-200 p-2 rounded-full">
                    <Heart className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{wish.name}</h4>
                    <p className="text-xs text-gray-500">
                      {format(wish.timestamp, 'dd MMM yyyy HH:mm', { locale: id })}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{wish.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
