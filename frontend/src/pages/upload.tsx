// pages/upload.tsx
import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Head from 'next/head';
import Link from 'next/link';
import { saveRecording } from '../utils/storage';
import UkuleleBackground from '../components/UkuleleBackground';

const UploadPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingName, setRecordingName] = useState('');
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Check if file is an audio file
    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file.');
      return;
    }

    setUploadedFile(file);
    setRecordingName(file.name.replace(/\.[^/.]+$/, "")); // Set filename without extension as the recording name
    
    // Create a URL for the audio file
    const url = URL.createObjectURL(file);
    setAudioURL(url);
  };

  const handleSubmit = async () => {
    if (!uploadedFile) return;
    
    try {
      const name = recordingName.trim() || uploadedFile.name;
      
      // Get file as blob
      const blob = await uploadedFile.arrayBuffer()
        .then(arrayBuffer => new Blob([arrayBuffer], { type: uploadedFile.type }));
      
      const recording = {
        id: uuidv4(),
        name,
        blob,
        url: audioURL,
        date: new Date().toLocaleString(),
        size: uploadedFile.size,
        type: uploadedFile.type
      };

      saveRecording(recording);
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 3000);
    } catch (err) {
      console.error('Error saving recording:', err);
      alert('Failed to save recording. Please try again.');
    }
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setAudioURL(null);
    setRecordingName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50">
      <Head>
        <title>Upload Recording | Singing Practice Buddy</title>
        <meta name="description" content="Upload your song recordings for analysis and feedback" />
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

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-amber-900 mb-4">
              Upload Your Ukulele Recordings
            </h1>
            <p className="text-xl text-amber-800 max-w-2xl mx-auto">
              Upload your pre-recorded singing sessions for detailed feedback and analysis
            </p>
          </div>

          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-xl p-8 max-w-3xl mx-auto">
            {!uploadedFile ? (
              <div 
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all 
                  ${dragActive ? 'border-amber-500 bg-amber-50' : 'border-amber-300 hover:border-amber-500 hover:bg-amber-50'}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-amber-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h3 className="text-lg font-medium text-amber-800 mb-2">Drop your audio file here</h3>
                <p className="text-amber-700 mb-4">or click to browse your files</p>
                <p className="text-amber-600 text-sm">Supports MP3, WAV, OGG, and WEBM audio files</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="audio/*"
                  className="hidden" 
                />
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-amber-900">{uploadedFile.name}</h3>
                    <p className="text-amber-700 text-sm">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB · {uploadedFile.type}
                    </p>
                  </div>
                  <button 
                    onClick={clearUpload} 
                    className="text-amber-700 hover:text-amber-900"
                    title="Remove file"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <label htmlFor="recordingName" className="block text-amber-800 mb-2">
                    Recording Name
                  </label>
                  <input
                    type="text"
                    id="recordingName"
                    className="w-full p-2 border text-amber-800 border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="My Song Practice"
                    value={recordingName}
                    onChange={(e) => setRecordingName(e.target.value)}
                  />
                </div>

                {audioURL && (
                  <div className="mb-6 bg-amber-50 p-4 rounded-lg">
                    <h3 className="text-md font-medium text-amber-800 mb-2">Preview</h3>
                    <audio src={audioURL} controls className="w-full" />
                  </div>
                )}

                <div className="flex space-x-4">
                  <button 
                    onClick={handleSubmit} 
                    className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors"
                  >
                    Save Recording
                  </button>
                  
                  <Link 
                    href="/analyze" 
                    className="py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors"
                  >
                    Analyze Now
                  </Link>
                </div>

                {showSavedMessage && (
                  <div className="mt-4 p-2 bg-green-100 text-green-700 rounded-md text-center">
                    Recording saved successfully!
                  </div>
                )}
              </>
            )}

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-amber-900 mb-4">Recording Tips</h3>
              <ul className="space-y-2 text-amber-800">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  For best results, upload recordings with minimal background noise
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Our system works best with WAV or high-quality MP3 files
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Try to keep your recordings under 5 minutes for more accurate analysis
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;