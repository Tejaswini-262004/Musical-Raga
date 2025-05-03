// pages/record.tsx
import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Head from 'next/head';
import Link from 'next/link';
import { saveRecording } from '../utils/storage';
import UkuleleBackground from '../components/UkuleleBackground';

const RecordPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingName, setRecordingName] = useState('');
  const chunks = useRef<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [recordingsList, setRecordingsList] = useState<any[]>([]);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      setRecordingTime(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setAudioURL(null);

      // Start the timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      chunks.current = [];
      recorder.ondataavailable = (e) => {
        chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);

        // Default recording name if none provided
        const name = recordingName.trim() || `Ukulele Practice - ${new Date().toLocaleDateString()}`;
        
        const recording = {
          id: uuidv4(),
          name,
          blob,
          url,
          date: new Date().toLocaleString(),
          duration: recordingTime
        };

        saveRecording(recording);
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 3000);
        
        // Refresh recordings list
        loadRecordings();
      };
    } catch (err) {
      console.error('Recording failed:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      
      // Stop all audio tracks to release the microphone
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
      
      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const loadRecordings = () => {
    // This would normally load from your storage utility
    // For now, we'll leave this as a placeholder function
    // The actual implementation would depend on your saveRecording implementation
    
    // Mock implementation for demonstration:
    // const savedRecordings = localStorage.getItem('recordings');
    // setRecordingsList(savedRecordings ? JSON.parse(savedRecordings) : []);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50">
      <Head>
        <title>Record Practice | Singing Practice Buddy</title>
        <meta name="description" content="Record your singing sessions" />
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
              Record Your Song Practice
            </h1>
            <p className="text-xl text-amber-800 max-w-2xl mx-auto">
              Capture your playing to get insights and track your progress
            </p>
          </div>

          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-xl p-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center mb-8">
              {isRecording ? (
                <div className="w-32 h-32 rounded-full bg-red-100 flex items-center justify-center mb-4 animate-pulse">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{formatTime(recordingTime)}</span>
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              )}

              <div className="w-full max-w-md">
                <div className="mb-4">
                  <label htmlFor="recordingName" className="block text-amber-800 mb-2">
                    Recording Name
                  </label>
                  <input
                    type="text"
                    id="recordingName"
                    className="w-full p-2 border text-amber-900 border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="My Song Practice"
                    value={recordingName}
                    onChange={(e) => setRecordingName(e.target.value)}
                    disabled={isRecording}
                  />
                </div>

                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-full py-3 px-4 rounded-md font-medium transition-all duration-300 flex items-center justify-center
                    ${isRecording 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
                >
                  {isRecording ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Recording
                    </>
                  )}
                </button>

                {showSavedMessage && (
                  <div className="mt-3 p-2 bg-green-100 text-green-700 rounded-md text-center animate-fade-in-out">
                    Recording saved successfully!
                  </div>
                )}
              </div>
            </div>

            {audioURL && (
              <div className="mt-6 bg-amber-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-amber-800 mb-3">Preview Your Recording</h3>
                <audio src={audioURL} controls className="w-full" />
                <div className="mt-4 flex justify-between">
                  <button 
                    className="px-4 py-2 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors"
                    onClick={() => {
                      if (audioURL) {
                        const a = document.createElement('a');
                        a.href = audioURL;
                        a.download = `${recordingName || 'song-recording'}.webm`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }
                    }}
                  >
                    Download Recording
                  </button>
                  <Link 
                    href="/analyze" 
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                  >
                    Analyze This Recording
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-amber-900 mb-4">Tips for Great Recordings</h3>
              <ul className="space-y-2 text-amber-800">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Record in a quiet environment with minimal background noise
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Position your device about 2-3 feet away from your face
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Try playing a short piece you're familiar with for best analysis results
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordPage;