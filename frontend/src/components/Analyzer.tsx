import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EmotionResultCard from './EmotionResultCard';
import type { AudioAnalysisResult } from '../utils/emotionDetector';
import { getAllRecordings, getRecordingById, deleteRecording, updateRecording } from '../utils/storage';

interface Recording {
  id: string;
  name: string;
  date: string;
  url?: string;
  blob?: Blob;
  duration?: number;
  size?: number;
  type?: string;
}

interface AudioAnalysisResult {
  // Define the structure based on your emotionDetector implementation
  // This is a placeholder - update with your actual structure
  emotions: {
    happiness: number;
    sadness: number;
    excitement: number;
    calmness: number;
    // any other emotions you're tracking
  };
  technicalDetails?: {
    tempo?: number;
    key?: string;
    // other technical details
  };
  feedback?: string;
}

const Analyzer: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AudioAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id: queryId } = router.query;

  useEffect(() => {
    loadRecordings();
  }, []);

  useEffect(() => {
    // If a recording ID is provided in the URL, select that recording
    if (queryId && typeof queryId === 'string') {
      loadSpecificRecording(queryId);
    }
  }, [queryId, recordings]);

  const loadRecordings = async () => {
    try {
      const saved = await getAllRecordings();
      setRecordings(saved);
    } catch (error) {
      console.error('Failed to load recordings', error);
      setError('Failed to load recordings. Please try again.');
    }
  };

  const loadSpecificRecording = async (id: string) => {
    try {
      const recording = await getRecordingById(id);
      if (recording) {
        setSelectedRecording(recording);
      }
    } catch (error) {
      console.error('Failed to load specific recording', error);
    }
  };

  const handleSelectRecording = (recording: Recording) => {
    setSelectedRecording(recording);
    setAnalysisResults(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedRecording) return;
    
    try {
      setIsAnalyzing(true);
      setError(null);
      
      // For this to work, we need to access the actual audio blob
      // If we only have a URL, we need to fetch it
      let audioBlob = selectedRecording.blob;
      
      if (!audioBlob && selectedRecording.url) {
        try {
          const response = await fetch(selectedRecording.url);
          audioBlob = await response.blob();
        } catch (err) {
          console.error('Error fetching audio blob:', err);
          setError('Could not access audio data. Please try again.');
          setIsAnalyzing(false);
          return;
        }
      }
      
      if (!audioBlob) {
        setError('No audio data available for analysis');
        setIsAnalyzing(false);
        return;
      }

      const results = await analyzeAudio(audioBlob);
      setAnalysisResults(results);
      
      // Save analysis results with the recording
      if (results) {
        await updateRecording(selectedRecording.id, {
          analysisResults: results
        });
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze audio. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteRecording = async (e: React.MouseEvent, recordingId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this recording?')) {
      try {
        await deleteRecording(recordingId);
        
        if (selectedRecording?.id === recordingId) {
          setSelectedRecording(null);
          setAnalysisResults(null);
        }
        
        await loadRecordings();
      } catch (error) {
        console.error('Error deleting recording:', error);
        setError('Failed to delete recording. Please try again.');
      }
    }
  };

  const handleDownloadResults = () => {
    if (!analysisResults || !selectedRecording) return;

    const resultsJson = JSON.stringify(analysisResults, null, 2);
    const blob = new Blob([resultsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedRecording.name}-analysis.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (recordings.length === 0) {
    return (
      <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-xl p-8 w-full max-w-4xl mx-auto">
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-amber-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h2 className="text-2xl font-bold text-amber-900 mb-3">No Recordings Found</h2>
          <p className="text-gray-600 mb-6">You don't have any saved recordings to analyze.</p>
          <div className="flex justify-center space-x-4">
            <button onClick={() => router.push('/record')} className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 shadow-md">
              Record Now
            </button>
            <button onClick={() => router.push('/upload')} className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 shadow-md">
              Upload Audio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-xl p-8 w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recordings List */}
        <div className="md:col-span-1 bg-amber-50 rounded-xl p-4 h-96 overflow-y-auto shadow-inner">
          <h3 className="font-semibold text-amber-900 mb-3">Your Recordings</h3>
          <div className="space-y-2">
            {recordings.map(recording => (
              <div
                key={recording.id}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 flex justify-between items-center ${
                  selectedRecording?.id === recording.id ? 'bg-amber-100 border-l-4 border-amber-500' : 'hover:bg-amber-50/80'
                }`}
                onClick={() => handleSelectRecording(recording)}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium text-amber-900 truncate max-w-[180px]">{recording.name}</div>
                    <div className="text-xs text-amber-700/70">{recording.date}</div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteRecording(e, recording.id)}
                  className="text-amber-400 hover:text-red-500 transition-colors"
                  aria-label="Delete recording"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Section */}
        <div className="md:col-span-2 bg-amber-50/50 p-6 rounded-xl shadow-sm">
          {selectedRecording ? (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="font-semibold text-amber-900 mb-1">Selected Recording</h3>
                <p className="text-amber-800">{selectedRecording.name}</p>
                
                <div className="mt-4">
                  <audio 
                    src={selectedRecording.url} 
                    controls 
                    className="w-full"
                  />
                </div>
              </div>
              
              {isAnalyzing ? (
                <div className="flex flex-col justify-center items-center space-y-3 py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4V2m0 20v-2m8-12h2m-20 0h2m14.828 6.172l1.414 1.414M4.929 4.929l1.414 1.414M18 16l1.414 1.414m-12.828 0L4.929 16" />
                  </svg>
                  <p className="text-amber-700 font-medium">Analyzing your Song Playing...</p>
                </div>
              ) : analysisResults ? (
                <div>
                  <EmotionResultCard analysisResults={analysisResults} />
                  <button 
                    onClick={handleDownloadResults} 
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-6 rounded-lg shadow-md transition-all duration-300 mt-4 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download Analysis Results
                  </button>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleAnalyze} 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 px-6 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analyze Song Playing
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <h3 className="text-xl font-semibold text-amber-900 mb-2">Select a Recording</h3>
              <p className="text-amber-700">Choose a recording from the list to analyze its emotional qualities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analyzer;
