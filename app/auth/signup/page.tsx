'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp, signInWithGoogle } from '@/lib/auth/client';

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'decorator' | 'renter'>('renter');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { user, error: signUpError } = await signUp(email, password, name, role);

    if (signUpError) {
      setError(signUpError);
    } else {
      router.push('/auth/login?verified=false');
    }

    setLoading(false);
  }

  async function handleGoogleSignUp() {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">PropFlow</h1>
        <p className="text-center text-gray-600 mb-8">Join the prop rental marketplace</p>

        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">I am a:</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="decorator"
                  checked={role === 'decorator'}
                  onChange={(e) => setRole(e.target.value as 'decorator' | 'renter')}
                  className="mr-2"
                />
                <span className="text-sm">Set Decorator</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="renter"
                  checked={role === 'renter'}
                  onChange={(e) => setRole(e.target.value as 'decorator' | 'renter')}
                  className="mr-2"
                />
                <span className="text-sm">Filmmaker</span>
              </label>
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          Sign up with Google
        </button>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-orange-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
