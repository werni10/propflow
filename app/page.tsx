'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Item, Decorator } from '@/lib/types';

export default function Home() {
  const [items, setItems] = useState<(Item & { decorators?: Partial<Decorator> })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    minPrice: '',
    maxPrice: '',
  });

  const categories = ['Furniture', 'Lighting', 'Decor', 'Props', 'Textiles', 'Other'];
  const locations = ['Casablanca', 'Fes', 'Marrakech', 'Tangier', 'Rabat'];

  useEffect(() => {
    fetchItems();
  }, [filters]);

  async function fetchItems() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const res = await fetch(`/api/items?${params}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            PropFlow
          </Link>
          <nav className="flex gap-4">
            <Link href="/auth/login" className="text-gray-600 hover:text-orange-600">
              Sign in
            </Link>
            <Link href="/auth/signup" className="bg-orange-600 text-white px-4 py-2 rounded-lg">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            🚀 Live & Operational
          </div>
          <h1 className="text-4xl font-bold mb-4">Find Cinema Props</h1>
          <p className="text-xl text-gray-600">Morocco's premier prop rental marketplace for filmmakers & set decorators</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Min price (DHS)"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <input
              type="number"
              placeholder="Max price (DHS)"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <button
              onClick={() =>
                setFilters({
                  category: '',
                  location: '',
                  minPrice: '',
                  maxPrice: '',
                })
              }
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Reset
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading props...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No props found matching your filters</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-200 relative">
                  {item.photos && item.photos.length > 0 ? (
                    <img
                      src={item.photos[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-orange-600 font-bold mb-2">{item.price_per_day} DHS/day</p>
                  <p className="text-sm text-gray-600 mb-3">{item.category}</p>
                  <p className="text-xs text-gray-500">{item.location}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
