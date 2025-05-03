import React, { useState, useEffect, useRef } from 'react';
import { saveRecording } from '../utils/storage';

const Recorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [visualData, setVisualData] = useState<number[]>(Array(50).fill(0));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      // Set up audio context and analyzer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setAudioBlob(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start visualization
      visualize();
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop stream tracks
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Stop visualization
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      setIsRecording(false);
    }
  };

  const visualize = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateVisualization = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Sample the frequency data for visualization
      const sampleSize = Math.floor(bufferLength / 50);
      const visualDataNew = Array(50).fill(0);
      
      for (let i = 0; i < 50; i++) {
        const startIndex = i * sampleSize;
        let sum = 0;
        for (let j = 0; j < sampleSize && startIndex + j < bufferLength; j++) {
          sum += dataArray[startIndex + j];
        }
        visualDataNew[i] = sum / sampleSize / 255; // Normalize to 0-1
      }
      
      setVisualData(visualDataNew);
      animationFrameRef.current = requestAnimationFrame(updateVisualization);
    };
    
    updateVisualization();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveRecording = () => {
    if (audioBlob) {
      const name = prompt('Name your recording:', `Song Recording ${new Date().toLocaleDateString()}`);
      if (name) {
        saveRecording(name, audioBlob);
        alert('Recording saved! You can find it in the Analyze page.');
      }
    }
  };

  return (
    <div className="bg-white bg-opacity-90 rounded-xl shadow-xl p-6 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">Record Your Song</h2>
      
      {/* Visualizer */}
      <div className="mb-6 h-32 bg-amber-50 rounded-lg flex items-end p-2">
        {visualData.map((value, index) => (
          <div 
            key={index}
            className="w-full bg-amber-500 mx-px rounded-t-sm transition-all duration-75"
            style={{ 
              height: `${Math.max(2, value * 100)}%`,
              opacity: isRecording ? 0.7 + (value * 0.3) : 0.3
            }}
          />
        ))}
      </div>
      
      {/* Timer */}
      <div className="text-center mb-6">
        <div className="text-2xl font-mono text-amber-800">
          {formatTime(recordingTime)}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="6" />
            </svg>
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-gray-700 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <rect x="6" y="6" width="8" height="8" />
            </svg>
            Stop Recording
          </button>
        )}
      </div>
      
      {/* Audio playback */}
      {audioURL && (
        <div className="mb-6">
          <audio 
            src={audioURL} 
            controls 
            className="w-full"
          />
          <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={handleSaveRecording}
              className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Save Recording
            </button>
            <button
              onClick={() => {
                setAudioURL(null);
                setAudioBlob(null);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Discard
            </button>
          </div>
        </div>
      )}
      
      <div className="text-center text-sm text-gray-600 mt-6">
        <p>Make sure your voice is tuned before recording for the best analysis results.</p>
      </div>
    </div>
  );
};

export default Recorder;