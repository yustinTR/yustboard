'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { FiMenu, FiX, FiLogOut, FiLayout } from 'react-icons/fi';

export default function PublicNavigation() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold">
              YustBoard
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/blog"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Blog
              </Link>
              {status === 'authenticated' && (
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  <FiLayout size={16} />
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {status === 'authenticated' ? (
              <>
                <span className="text-sm text-gray-600">
                  Hi, {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/blog"
                className="text-gray-600 hover:text-gray-900 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              {status === 'authenticated' && (
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 transition-colors py-2 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiLayout size={16} />
                  Dashboard
                </Link>
              )}
              <div className="border-t pt-3 mt-2">
                {status === 'authenticated' ? (
                  <>
                    <p className="text-sm text-gray-600 mb-2">
                      {session.user?.name || session.user?.email}
                    </p>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                    >
                      <FiLogOut size={16} />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors inline-block text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}