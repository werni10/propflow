'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/client';
import { Item, User } from '@/lib/types';

export default function DecoratorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'decorator') {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
    fetchItems(currentUser.id);
  }

  async function fetchItems(decoratorId: string) {
    try {
      const res = await fetch(`/api/items?decoratorId=${decoratorId}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            PropFlow
          </Link>
          <div className="flex gap-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <button
              onClick={() => {
                // Sign out logic
                router.push('/');
              }}
              className="text-sm text-gray-600 hover:text-orange-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Props</h1>
          <Link
            href="/items/new"
            className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700"
          >
            Add new prop
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">No props listed yet</p>
            <Link
              href="/items/new"
              className="text-orange-600 hover:underline font-semibold"
            >
              List your first prop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-square bg-gray-200">
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
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-orange-600 font-bold mb-4">{item.price_per_day} DHS/day</p>
                  <div className="flex gap-2">
                    <Link
                      href={`/items/${item.id}`}
                      className="flex-1 text-center bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200"
                    >
                      View
                    </Link>
                    <button className="flex-1 text-center bg-orange-100 text-orange-700 py-2 rounded hover:bg-orange-200">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
