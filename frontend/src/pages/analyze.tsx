// pages/analyze.tsx
import React from 'react';
import Head from 'next/head';
import Analyzer from '../components/Analyzer';
import UkuleleBackground from '../components/UkuleleBackground';

const AnalyzePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50">
      <Head>
        <title>Analyze Your Song - Music Raga</title>
        <meta name="description" content="Analyze your song recordings and improve your skills" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative overflow-hidden">
        <UkuleleBackground />

        <main className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-20">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-amber-900 mb-3">
              Analyze Your Recordings
            </h1>
            <p className="text-lg text-amber-800 max-w-2xl mx-auto">
              Get insights about the tempo, pitch, and emotional qualities of your song playing
            </p>
          </div>
          
          <Analyzer />
        </main>
      </div>
    </div>
  );
};

export default AnalyzePage;