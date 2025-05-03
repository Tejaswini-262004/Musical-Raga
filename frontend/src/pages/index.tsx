// pages/index.tsx
import Head from 'next/head';
import Link from 'next/link';
import UkuleleBackground from '../components/UkuleleBackground';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50">
      <Head>
        <title>Music Raga</title>
        <meta name="description" content="Analyze your singing and improve your skills" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative overflow-hidden">
        <UkuleleBackground />

        <main className="relative z-10 max-w-6xl mx-auto px-4 pt-20 pb-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-amber-900 mb-4">
              Song Practice Buddy
            </h1>
            <p className="text-xl text-amber-800 max-w-2xl mx-auto">
              Record, upload, and analyze your singing sessions to improve your skills
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Record Card */}
            <Link
              href="/record"
              className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-xl p-8 hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-amber-900 mb-2">Record</h2>
              <p className="text-center text-amber-700">
                Record your song in real-time for instant analysis
              </p>
            </Link>

            {/* Upload Card */}
            <Link
              href="/upload"
              className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-xl p-8 hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-amber-900 mb-2">Upload</h2>
              <p className="text-center text-amber-700">
                Upload your pre-recorded singing sessions for detailed feedback
              </p>
            </Link>

            {/* Analyze Card */}
            <Link
              href="/analyze"
              className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-xl p-8 hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-amber-900 mb-2">Analyze</h2>
              <p className="text-center text-amber-700">
                Get insights about tempo, pitch, and emotional qualities of your playing
              </p>
            </Link>
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-semibold text-amber-900 mb-4">
              Improve Your Singing Skills
            </h3>
            <p className="text-lg text-amber-700 max-w-3xl mx-auto">
              Our AI-powered tools help you understand the emotional quality of your playing,
              detect tempo and pitch accuracy, and track your progress over time.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
