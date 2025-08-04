// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, Eye, Cpu, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Edge AI Tracker
              </span>
            </div>
            <div className="space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Real-time Edge AI
            <span className="text-blue-600 block">Object Tracking</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Monitor and analyze object detection events from your NVIDIA Jetson devices 
            in real-time. Get insights, track performance, and manage your fleet with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg hover-lift">
            <div className="bg-blue-100 rounded-lg p-3 w-fit mb-4">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Real-time Detection
            </h3>
            <p className="text-gray-600">
              Monitor object detection events as they happen with live updates 
              and real-time analytics from your edge devices.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover-lift">
            <div className="bg-green-100 rounded-lg p-3 w-fit mb-4">
              <Cpu className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Fleet Management
            </h3>
            <p className="text-gray-600">
              Manage multiple NVIDIA Jetson devices from a single dashboard. 
              Monitor device health, status, and performance metrics.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover-lift">
            <div className="bg-purple-100 rounded-lg p-3 w-fit mb-4">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Advanced Analytics
            </h3>
            <p className="text-gray-600">
              Get detailed insights with charts, trends, and analytics. 
              Track object types, detection patterns, and system performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}







