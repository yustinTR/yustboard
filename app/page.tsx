'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FiLayout, FiCalendar, FiDollarSign, FiMap, FiCloud, FiUsers } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

const features = [
  {
    icon: FiLayout,
    title: 'Personal Dashboard',
    description: 'All your important information in one place'
  },
  {
    icon: FiCalendar,
    title: 'Agenda',
    description: 'Keep track of your tasks and appointments'
  },
  {
    icon: FiDollarSign,
    title: 'Banking',
    description: 'Monitor your financial transactions'
  },
  {
    icon: FiMap,
    title: 'Routes',
    description: 'Plan your journeys and track distances'
  },
  {
    icon: FiCloud,
    title: 'Weather',
    description: 'Stay updated with local weather forecasts'
  },
  {
    icon: FiUsers,
    title: 'Social',
    description: 'View your social media feeds in one place'
  }
];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Use useEffect for navigation instead of doing it during render
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Show loading while authenticating
  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {status === 'authenticated' ? 'Redirecting to dashboard...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">YustBoard</h1>
          <Link
            href="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Login
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-4">Your Personal Dashboard</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              One place for your agenda, banking, routes, weather, and social media feeds.
            </p>
            <Link
              href="/login"
              className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p>© {new Date().getFullYear()} YustBoard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}