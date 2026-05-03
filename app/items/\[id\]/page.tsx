'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Item, Decorator } from '@/lib/types';

export default function ItemDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [item, setItem] = useState<Item & { decorators?: Partial<Decorator> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchItem();
  }, [id]);

  async function fetchItem() {
    try {
      const res = await fetch(`/api/items?id=${id}`);
      const data = await res.json();
      setItem(data);
    } catch (err) {
      console.error('Failed to fetch item:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert('Please select dates');
      return;
    }

    router.push(`/bookings/new?itemId=${id}&startDate=${startDate}&endDate=${endDate}&quantity=${quantity}`);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!item) return <div className="min-h-screen flex items-center justify-center">Item not found</div>;

  const days = startDate && endDate ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const totalPrice = days * item.price_per_day * quantity;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            PropFlow
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Photos */}
            <div className="bg-gray-200 rounded-lg aspect-square mb-6 flex items-center justify-center overflow-hidden">
              {item.photos && item.photos.length > 0 ? (
                <img src={item.photos[0]} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400">No image</div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
              <p className="text-gray-600 mb-4">{item.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold">{item.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Condition</p>
                  <p className="font-semibold">{item.condition}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold">{item.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Deposit Required</p>
                  <p className="font-semibold">{item.deposit_required ? `${item.deposit_amount} DHS` : 'No'}</p>
                </div>
              </div>

              {/* Decorator Info */}
              {item.decorators && (
                <Link
                  href={`/decorators/${item.decorator_id}`}
                  className="bg-orange-50 rounded-lg p-4 mb-6 hover:bg-orange-100 transition"
                >
                  <p className="text-sm text-gray-600">Listed by</p>
                  <p className="font-semibold text-lg">{item.decorators.name || 'Unknown'}</p>
                </Link>
              )}
            </div>
          </div>

          {/* Booking Card */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <div className="mb-6">
                <p className="text-4xl font-bold text-orange-600">{item.price_per_day} DHS</p>
                <p className="text-gray-600">/day</p>
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Check-in date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Check-out date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {days > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{days} nights × {quantity} item(s)</span>
                      <span>{totalPrice} DHS</span>
                    </div>
                    {item.deposit_required && (
                      <div className="flex justify-between text-sm">
                        <span>Deposit</span>
                        <span>{item.deposit_amount} DHS</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>{totalPrice + (item.deposit_required ? item.deposit_amount || 0 : 0)} DHS</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50"
                  disabled={!startDate || !endDate}
                >
                  Book now
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
