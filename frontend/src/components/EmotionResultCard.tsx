import React from 'react';
import { AudioAnalysisResult } from '../utils/emotionDetector';

interface EmotionResultCardProps {
  analysisResults: AudioAnalysisResult;  // Expecting 'analysisResults' as the prop
}

const EmotionResultCard: React.FC<EmotionResultCardProps> = ({ analysisResults }) => {
  const { 
    primaryEmotion, 
    emotions, 
    tempo, 
    pitch, 
    notes, 
    dynamics, 
    summary, 
    suggestions 
  } = analysisResults;

  // Get top 3 emotions
  const topEmotions = emotions.slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header with primary emotion */}
      <div className="bg-amber-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Analysis Results</h3>
            <p className="text-amber-100">Primary emotion detected</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm py-2 px-4 rounded-lg">
            <span className="font-bold text-white text-lg">{primaryEmotion.emotion}</span>
            <span className="text-amber-100 ml-2 text-sm">
              {Math.round(primaryEmotion.confidence)}% confidence
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-amber-900">{summary}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-amber-50/50">
        {/* Emotions */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-amber-900 mb-3">Emotional Analysis</h4>
          <div className="space-y-3">
            {topEmotions.map((emotion, index) => (
              <div key={emotion.emotion}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-amber-800">{emotion.emotion}</span>
                  <span className="text-amber-600">{Math.round(emotion.confidence)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: `${Math.round(emotion.confidence)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-amber-900 mb-3">Performance Metrics</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-amber-700">Tempo</p>
              <p className="font-medium text-amber-900">{tempo} BPM</p>
            </div>
            <div>
              <p className="text-xs text-amber-700">Note Accuracy</p>
              <p className="font-medium text-amber-900">{notes.accuracyPercentage}%</p>
            </div>
            <div>
              <p className="text-xs text-amber-700">Avg. Pitch</p>
              <p className="font-medium text-amber-900">{pitch.average} Hz</p>
            </div>
            <div>
              <p className="text-xs text-amber-700">Dynamics</p>
              <p className="font-medium text-amber-900">
                {dynamics.range.min}-{dynamics.range.max} dB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="px-6 py-4">
        <h4 className="font-semibold text-amber-900 mb-2">Suggestions for Improvement</h4>
        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-amber-800">{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EmotionResultCard;
