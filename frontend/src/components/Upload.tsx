import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveRecording } from '../utils/storage';

const Upload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/x-wav'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid audio file (WAV, MP3)');
      return false;
    }
    
    // 50MB max file size
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return false;
    }
    
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      handleFile(selectedFile);
    }
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setFile(file);
      // Create URL for audio preview
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      const url = URL.createObjectURL(file);
      setAudioURL(url);
    }
  };

  const handleSaveRecording = async () => {
    if (file) {
      const name = prompt('Name your recording:', file.name.replace(/\.[^/.]+$/, ''));
      if (name) {
        try {
          setIsSaving(true);
          
          // Create a proper Recording object matching the interface in storage.ts
          const recordingObj = {
            id: uuidv4(),
            name: name,
            blob: file,
            date: new Date().toLocaleString()
          };
          
          await saveRecording(recordingObj);
          alert('Recording saved! You can find it in the Analyze page.');
          handleCancel(); // Reset form after successful save
        } catch (err) {
          console.error('Error saving recording:', err);
          setError('Failed to save recording. Please try again.');
        } finally {
          setIsSaving(false);
        }
      }
    }
  };

  const handleCancel = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setFile(null);
    setAudioURL(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white bg-opacity-90 rounded-xl shadow-xl p-6 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">Upload Song Recording</h2>

      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 ${
            isDragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300'
          } transition-all duration-300 text-center cursor-pointer`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/wav,audio/mp3,audio/mpeg,audio/x-wav"
          />
          
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drag and drop your audio file here
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse your files
          </p>
          <p className="text-xs text-gray-400">
            Supported formats: WAV, MP3 (up to 50MB)
          </p>
          
          {error && (
            <div className="mt-4 text-red-500 text-sm font-medium">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-amber-50 p-4 rounded-lg">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <div>
                <p className="font-medium text-gray-800 truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-red-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {audioURL && (
            <div className="mb-6">
              <audio 
                src={audioURL} 
                controls 
                className="w-full"
              />
            </div>
          )}
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleSaveRecording}
              disabled={isSaving}
              className={`bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 flex items-center ${
                isSaving ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Save for Analysis
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      <div className="text-center text-sm text-gray-600 mt-6">
        <p>Upload recordings of your song practice for analysis.</p>
      </div>
    </div>
  );
};

export default Upload;