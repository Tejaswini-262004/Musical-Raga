import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EmotionResultCard from './EmotionResultCard';
import { AudioAnalysisResult, analyzeAudio } from '../utils/emotionDetector';
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

const Analyzer: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AudioAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id: queryId } = router.query;

  // Load all recordings once when the component is mounted
  useEffect(() => {
    loadRecordings();
  }, []);

  // If a recording ID is provided in the URL, load that specific recording
  useEffect(() => {
    if (queryId && typeof queryId === 'string') {
      loadSpecificRecording(queryId);
    }
  }, [queryId]);

  // Function to load all recordings from storage
  const loadRecordings = async () => {
    try {
      const savedRecordings = await getAllRecordings();
      setRecordings(savedRecordings);
    } catch (error) {
      console.error('Failed to load recordings', error);
      setError('Failed to load recordings. Please try again.');
    }
  };

  // Function to load a specific recording by ID
  const loadSpecificRecording = async (id: string) => {
    try {
      const recording = await getRecordingById(id);
      if (recording) {
        setSelectedRecording(recording);
      }
    } catch (error) {
      console.error('Failed to load specific recording', error);
      setError('Failed to load the selected recording. Please try again.');
    }
  };

  // Handle the selection of a recording from the list
  const handleSelectRecording = (recording: Recording) => {
    setSelectedRecording(recording);
    setAnalysisResults(null); // Reset analysis results when selecting a new recording
    setError(null); // Reset any previous errors
  };

  // Analyze the selected recording
  const handleAnalyze = async () => {
    if (!selectedRecording) return;

    try {
      setIsAnalyzing(true);
      setError(null); // Reset any previous errors

      // Retrieve the audio blob from the selected recording
      let audioBlob = selectedRecording.blob;

      // If no blob exists, fetch the audio file from the URL
      if (!audioBlob && selectedRecording.url) {
        const response = await fetch(selectedRecording.url);
        audioBlob = await response.blob();
      }

      if (!audioBlob) {
        setError('No audio data available for analysis.');
        setIsAnalyzing(false);
        return;
      }

      // Analyze the audio
      const results = await analyzeAudio(audioBlob);
      setAnalysisResults(results);

      // Save analysis results with the selected recording
      if (results) {
        await updateRecording(selectedRecording.id, {
          analysisResults: results,
        });
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze audio. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Delete the selected recording
  const handleDeleteRecording = async (e: React.MouseEvent, recordingId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this recording?')) {
      try {
        await deleteRecording(recordingId);

        // Reset the selected recording and analysis results if the deleted recording was the selected one
        if (selectedRecording?.id === recordingId) {
          setSelectedRecording(null);
          setAnalysisResults(null);
        }

        // Reload the list of recordings
        await loadRecordings();
      } catch (error) {
        console.error('Error deleting recording:', error);
        setError('Failed to delete recording. Please try again.');
      }
    }
  };

  // Download the analysis results as a JSON file
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
            {recordings.map((recording) => (
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
        <div className="md:col-span-2 bg-amber-50/50 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-amber-900 mb-3">Analyze Recording</h3>
          <div className="space-y-4">
            {selectedRecording ? (
              <>
                {/* Recording Info */}
                <div className="text-lg text-amber-700">{selectedRecording.name}</div>
                <div className="text-sm text-amber-600 mb-4">{selectedRecording.date}</div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="bg-amber-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                  </button>
                  <button
                    onClick={handleDownloadResults}
                    disabled={!analysisResults}
                    className="bg-amber-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Download Results
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center text-amber-600">Select a recording to analyze</div>
            )}
            {/* Display error */}
            {error && <div className="text-red-500 text-center mt-4">{error}</div>}
            {/* Display results if available */}
            {analysisResults && (
              <EmotionResultCard
                results={analysisResults}
                recordingName={selectedRecording?.name || ''}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyzer;
