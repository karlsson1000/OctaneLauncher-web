'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const GITHUB_REPO = 'karlsson1000/OctaneLauncher';
const RELEASES_API = `https://api.github.com/repos/${GITHUB_REPO}/releases`;
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '';

interface Release {
  tag_name: string;
  name: string;
  published_at: string;
  body: string;
}

export default function Changelog() {
  const [releases, setReleases] = React.useState<Release[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }

    fetch(RELEASES_API, { headers })
      .then(res => {
        if (!res.ok) {
          throw new Error(`GitHub API error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setReleases(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch releases:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-neutral-900 p-4 sm:p-8 relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <Image
          src="/bg.png"
          alt=""
          fill
          className="object-cover opacity-5"
          priority
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Logo and Title */}
      <Link href="/" className="absolute top-3 sm:top-4 left-3 sm:left-4 flex items-center gap-2 z-10 hover:opacity-80 transition-opacity cursor-pointer">
        <Image src="/logo.png" alt="Logo" width={24} height={24} priority className="w-5 h-5 sm:w-6 sm:h-6" />
        <h1 className="text-white text-sm sm:text-base font-semibold">Octane Launcher</h1>
      </Link>

      {/* Content */}
      <div className="max-w-3xl mx-auto pt-16 sm:pt-20 relative z-10 px-2">
        <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Changelog</h2>

        {loading && (
          <p className="text-white/60 text-sm sm:text-base">Loading releases...</p>
        )}

        {error && (
          <p className="text-red-400 text-sm sm:text-base">Failed to load changelog.</p>
        )}

        {!loading && !error && releases.length === 0 && (
          <p className="text-white/60 text-sm sm:text-base">No releases found.</p>
        )}

        <div className="space-y-4 sm:space-y-6">
          {releases.map((release, index) => (
            <div 
              key={release.tag_name} 
              className="border-l-2 border-[#4572e3] pl-4 sm:pl-6 py-3 sm:py-4 bg-white/5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2 pr-2 sm:pr-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <h3 className="text-white text-lg sm:text-xl font-semibold">
                    {release.name || release.tag_name}
                  </h3>
                  {index === 0 && (
                    <span className="bg-[#4572e3] text-white text-xs px-2 py-1 rounded">
                      Latest
                    </span>
                  )}
                </div>
                <span className="text-white/40 text-xs sm:text-sm">
                  {formatDate(release.published_at)}
                </span>
              </div>
              
              <div className="text-white/70 text-xs sm:text-sm whitespace-pre-wrap pr-2 sm:pr-4">
                {release.body || 'No release notes available.'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}