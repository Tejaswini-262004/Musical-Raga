// utils/audioUtils.ts

/**
 * Converts an audio Blob to an AudioBuffer for analysis
 */
export const getAudioBuffer = async (blob: Blob): Promise<AudioBuffer> => {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  return await audioContext.decodeAudioData(arrayBuffer);
};

/**
 * Detects the fundamental pitch/frequency of an audio sample using autocorrelation
 * Returns frequency in Hz
 */
export const detectPitch = (audioBuffer: AudioBuffer): number => {
  // Get audio data from the first channel
  const bufferLength = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0);
  
  // Use autocorrelation to find the fundamental frequency
  const correlations: number[] = [];
  const maxLag = Math.floor(sampleRate / 60); // For detecting frequencies down to ~60Hz
  
  for (let lag = 0; lag < maxLag; lag++) {
    let correlation = 0;
    const comparisonSamples = Math.floor(bufferLength / 3); // Use a subset for performance
    
    for (let i = 0; i < comparisonSamples; i++) {
      if (i + lag < bufferLength) {
        correlation += channelData[i] * channelData[i + lag];
      }
    }
    
    correlations.push(correlation);
  }
  
  // Find the first peak after the initial drop
  let firstDropIndex = 0;
  while (firstDropIndex < correlations.length - 1 && 
         correlations[firstDropIndex + 1] >= correlations[firstDropIndex]) {
    firstDropIndex++;
  }
  
  let peakIndex = firstDropIndex + 1;
  for (let i = firstDropIndex + 1; i < correlations.length - 1; i++) {
    if (correlations[i] > correlations[peakIndex]) {
      peakIndex = i;
    }
  }
  
  // Calculate frequency from the peak index
  const fundamentalFrequency = sampleRate / peakIndex;
  
  // Return frequency rounded to nearest 0.1 Hz
  return Math.round(fundamentalFrequency * 10) / 10;
};

/**
 * Estimates the tempo (BPM) of an audio sample using onset detection
 * Returns tempo in beats per minute
 */
export const estimateTempo = (audioBuffer: AudioBuffer): number => {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  
  // Create energy profile using RMS (root mean square) in short windows
  const windowSize = Math.floor(sampleRate * 0.02); // 20ms windows
  const energyProfile: number[] = [];
  
  for (let i = 0; i < channelData.length; i += windowSize) {
    let sum = 0;
    const limit = Math.min(i + windowSize, channelData.length);
    
    for (let j = i; j < limit; j++) {
      sum += channelData[j] * channelData[j]; // Square for energy
    }
    
    const rms = Math.sqrt(sum / (limit - i));
    energyProfile.push(rms);
  }
  
  // Find onsets (peaks in energy)
  const onsets: number[] = [];
  const threshold = calculateDynamicThreshold(energyProfile);
  
  for (let i = 1; i < energyProfile.length - 1; i++) {
    if (energyProfile[i] > threshold && 
        energyProfile[i] > energyProfile[i-1] && 
        energyProfile[i] >= energyProfile[i+1]) {
      onsets.push(i);
    }
  }
  
  // Calculate intervals between onsets
  const intervals: number[] = [];
  for (let i = 1; i < onsets.length; i++) {
    intervals.push(onsets[i] - onsets[i-1]);
  }
  
  // Find the most common interval using a histogram approach
  const histogramBins: {[key: number]: number} = {};
  intervals.forEach(interval => {
    // Group similar intervals
    const normalizedInterval = Math.round(interval / 2) * 2;
    histogramBins[normalizedInterval] = (histogramBins[normalizedInterval] || 0) + 1;
  });
  
  let mostCommonInterval = 0;
  let maxCount = 0;
  
  Object.entries(histogramBins).forEach(([interval, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonInterval = parseInt(interval);
    }
  });
  
  // Convert interval to BPM
  // Time between windows = windowSize / sampleRate (in seconds)
  // Time between peaks = mostCommonInterval * (windowSize / sampleRate)
  // BPM = 60 / time between peaks
  const secondsPerWindow = windowSize / sampleRate;
  const secondsPerBeat = mostCommonInterval * secondsPerWindow;
  let bpm = 60 / secondsPerBeat;
  
  // Adjust if BPM is outside typical range
  if (bpm > 240) bpm /= 2;
  if (bpm < 60) bpm *= 2;
  
  return Math.round(bpm);
};

/**
 * Helper function to calculate a dynamic threshold for onset detection
 */
const calculateDynamicThreshold = (energyProfile: number[]): number => {
  // Calculate mean energy
  const sum = energyProfile.reduce((acc, val) => acc + val, 0);
  const mean = sum / energyProfile.length;
  
  // Calculate standard deviation
  const squaredDiffs = energyProfile.map(val => (val - mean) ** 2);
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / energyProfile.length;
  const stdDev = Math.sqrt(variance);
  
  // Threshold = mean + 1.5 * standard deviation
  return mean + (1.5 * stdDev);
};