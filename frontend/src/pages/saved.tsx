// pages/saved.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getAllRecordings, deleteRecording } from '../utils/storage';
import UkuleleBackground from '../components/UkuleleBackground';

interface Recording {
  id: string;
  name: string;
  date: string;
  url?: string;
  duration?: number;
  size?: number;
  type?: string;
}

const SavedPage: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    setIsLoading(true);
    try {
      const loadedRecordings = await getAllRecordings();
      setRecordings(loadedRecordings);
    } catch (err) {
      console.error('Failed to load recordings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this recording?')) {
      try {
        await deleteRecording(id);
        setRecordings(recordings.filter(rec => rec.id !== id));
        
        if (selectedRecording?.id === id) {
          setSelectedRecording(null);
          setAudioURL(null);
        }
      } catch (err) {
        console.error('Failed to delete recording:', err);
      }
    }
  };

  const handleSelectRecording = (recording: Recording) => {
    setSelectedRecording(recording);
    
    // If the recording doesn't have a URL property already (from earlier loads)
    // we would need to fetch the blob and create a URL
    if (recording.url) {
      setAudioURL(recording.url);
    } else {
      // Here you would typically fetch the blob from your storage
      // and create a URL from it. For now, we'll just show a placeholder
      setAudioURL(null);
    }
  };

  // Format seconds into MM:SS
  const formatTime = (seconds?: number) => {
    if (!seconds) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format file size
  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Sort recordings
  const sortedRecordings = [...recordings]
    .filter(rec => rec.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      }
    });

  const toggleSort = (field: 'date' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50">
      <Head>
        <title>Saved Recordings | Singing Practice Buddy</title>
        <meta name="description" content="View and manage your saved song recordings" />
      </Head>

      <div className="relative overflow-hidden">
        <UkuleleBackground />

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-8 pb-24">
          <nav className="mb-8">
            <Link href="/" className="text-amber-800 hover:text-amber-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </nav>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-amber-900 mb-4">
              Your Saved Recordings
            </h1>
            <p className="text-xl text-amber-800 max-w-2xl mx-auto">
              Manage and analyze your singing practice sessions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left sidebar - Recording list */}
            <div className="lg:col-span-1">
              <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-xl p-6">
                <div className="mb-4">
                  <label htmlFor="search" className="sr-only">Search recordings</label>
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      id="search"
                      placeholder="Search recordings..."
                      className="w-full pl-10 pr-4 py-2 border text-amber-950 border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-amber-900">
                    Recordings ({sortedRecordings.length})
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleSort('name')}
                      className={`p-1 rounded-md ${sortBy === 'name' ? 'bg-amber-100' : 'hover:bg-amber-50'}`}
                      title="Sort by name"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleSort('date')}
                      className={`p-1 rounded-md ${sortBy === 'date' ? 'bg-amber-100' : 'hover:bg-amber-50'}`}
                      title="Sort by date"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="py-8 text-center">
                    <svg className="animate-spin h-8 w-8 text-amber-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-amber-800">Loading recordings...</p>
                  </div>
                ) : sortedRecordings.length === 0 ? (
                  <div className="py-8 text-center text-amber-700">
                    {searchTerm ? (
                      <p>No recordings match your search</p>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-amber-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <p className="mb-2">No recordings found</p>
                        <div className="flex justify-center space-x-4 mt-4">
                          <Link href="/record" className="text-amber-600 hover:text-amber-800 font-medium">
                            Record Now
                          </Link>
                          <Link href="/upload" className="text-amber-600 hover:text-amber-800 font-medium">
                            Upload Recording
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-96 pr-1 -mr-1">
                    <ul className="space-y-2">
                      {sortedRecordings.map((recording) => (
                        <li 
                          key={recording.id}
                          className={`rounded-lg p-3 cursor-pointer transition-all
                            ${selectedRecording?.id === recording.id 
                              ? 'bg-amber-200' 
                              : 'hover:bg-amber-100'}`}
                          onClick={() => handleSelectRecording(recording)}
                        >
                          <div className="flex justify-between">
                            <h3 className="font-medium text-amber-900 truncate pr-4">{recording.name}</h3>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(recording.id);
                              }}
                              className="text-amber-600 hover:text-red-600"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center text-xs text-amber-700 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(recording.date).toLocaleDateString()}
                            
                            {recording.duration && (
                              <span className="ml-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatTime(recording.duration)}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Recording details and player */}
            <div className="lg:col-span-2">
              <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-xl p-6">
                {selectedRecording ? (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold text-amber-900 mb-1">
                        {selectedRecording.name}
                      </h2>
                      <p className="text-amber-700">
                        Recorded on {new Date(selectedRecording.date).toLocaleString()}
                      </p>
                      
                      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-amber-800">
                        {selectedRecording.duration && (
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Duration: {formatTime(selectedRecording.duration)}
                          </div>
                        )}
                        
                        {selectedRecording.size && (
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                            Size: {formatSize(selectedRecording.size)}
                          </div>
                        )}
                        
                        {selectedRecording.type && (
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            Format: {selectedRecording.type.split('/')[1].toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-lg p-4 mb-6">
                      {audioURL ? (
                        <audio src={audioURL} controls className="w-full" />
                      ) : (
                        <div className="text-center py-4 text-amber-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-amber-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                          </svg>
                          <p>Audio playback not available</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link 
                        href={`/analyze?id=${selectedRecording.id}`} 
                        className="py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Analyze
                      </Link>
                      
                      {audioURL && (
                        <button 
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = audioURL;
                            a.download = `${selectedRecording.name}.${selectedRecording.type?.split('/')[1] || 'webm'}`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          className="py-2 px-4 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-md transition-colors flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDelete(selectedRecording.id)}
                        className="py-2 px-4 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-md transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-amber-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-amber-900 mb-2">Select a Recording</h2>
                    <p className="text-amber-700 mb-6">Choose a recording from the list to view and analyze it</p>
                    
                    <div className="flex justify-center space-x-4">
                      <Link 
                        href="/record" 
                        className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        Record New
                      </Link>
                      
                      <Link 
                        href="/upload" 
                        className="py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedPage;