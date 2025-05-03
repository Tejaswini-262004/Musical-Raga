// utils/storage.ts
/**
 * Storage utility for managing ukulele recordings
 * This module provides functions to store, retrieve, and manage audio recordings
 */

export interface Recording {
  id: string;
  name: string;
  date: string;
  url?: string;
  blob?: Blob;
  duration?: number;
  size?: number;
  type?: string;
  analysisResults?: any; // Type for analysis results
}

// Key for storing recordings metadata in localStorage
const STORAGE_KEY = 'ukulele-recordings';

/**
 * Get all saved recordings from local storage
 * @returns Promise<Recording[]> Array of recording objects
 */
export async function getAllRecordings(): Promise<Recording[]> {
  return new Promise((resolve) => {
    try {
      // Try to get recordings from localStorage
      const recordingsJson = localStorage.getItem(STORAGE_KEY);
      
      // If there are no recordings yet, return an empty array
      if (!recordingsJson) {
        resolve([]);
        return;
      }
      
      // Parse the JSON string to get the recordings array
      const recordings: Recording[] = JSON.parse(recordingsJson);
      
      // For each recording, ensure URL is available if one exists in storage
      const processedRecordings = recordings.map(recording => {
        // If the recording doesn't have a URL but should (has an object URL stored)
        if (!recording.url && recording.id) {
          // Try to get the blob from sessionStorage or another mechanism
          // In a real implementation with IndexedDB, you'd retrieve the blob here
          // For now, we'll work with what's stored
        }
        return recording;
      });
      
      resolve(processedRecordings);
    } catch (error) {
      console.error('Error getting recordings:', error);
      resolve([]);
    }
  });
}

/**
 * Save a new recording to storage
 * @param recording Recording object to save
 * @param audioBlob Optional audio blob data
 * @returns Promise<string> ID of the saved recording
 */
export async function saveRecording(
  recording: Omit<Recording, 'id'>, 
  audioBlob?: Blob
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Generate a unique ID for the recording
      const id = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get current recordings
      const recordingsJson = localStorage.getItem(STORAGE_KEY);
      const recordings: Recording[] = recordingsJson ? JSON.parse(recordingsJson) : [];
      
      // Add the new recording
      const newRecording: Recording = {
        ...recording,
        id,
      };
      
      // If there's audio blob data, store it
      if (audioBlob) {
        // Create a URL for the blob
        newRecording.url = URL.createObjectURL(audioBlob);
        // Store blob properties
        newRecording.size = audioBlob.size;
        newRecording.type = audioBlob.type;
        
        // In a real implementation, you might store the blob in IndexedDB
        // For now, we'll keep the blob reference for the session
        // This ensures the analyzer component can access it
        newRecording.blob = audioBlob;
      }
      
      // Add to recordings array
      recordings.push(newRecording);
      
      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(
        recordings.map(rec => {
          // Remove blob from localStorage JSON (it can't be serialized)
          const { blob, ...storable } = rec;
          return storable;
        })
      ));
      
      resolve(id);
    } catch (error) {
      console.error('Error saving recording:', error);
      reject(error);
    }
  });
}

/**
 * Delete a recording by ID
 * @param id ID of the recording to delete
 * @returns Promise<void>
 */
export async function deleteRecording(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Get current recordings
      const recordingsJson = localStorage.getItem(STORAGE_KEY);
      
      if (!recordingsJson) {
        resolve();
        return;
      }
      
      const recordings: Recording[] = JSON.parse(recordingsJson);
      
      // Find the recording to delete
      const recordingToDelete = recordings.find(rec => rec.id === id);
      
      if (recordingToDelete && recordingToDelete.url) {
        // If there's a URL, revoke it to free memory
        if (recordingToDelete.url.startsWith('blob:')) {
          URL.revokeObjectURL(recordingToDelete.url);
        }
      }
      
      // Filter out the recording with the matching ID
      const updatedRecordings = recordings.filter(rec => rec.id !== id);
      
      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecordings));
      
      resolve();
    } catch (error) {
      console.error('Error deleting recording:', error);
      reject(error);
    }
  });
}

/**
 * Get a single recording by ID
 * @param id ID of the recording to retrieve
 * @returns Promise<Recording | null>
 */
export async function getRecordingById(id: string): Promise<Recording | null> {
  return new Promise((resolve) => {
    try {
      // Get all recordings
      const recordingsJson = localStorage.getItem(STORAGE_KEY);
      
      if (!recordingsJson) {
        resolve(null);
        return;
      }
      
      const recordings: Recording[] = JSON.parse(recordingsJson);
      
      // Find the recording with the matching ID
      const recording = recordings.find(rec => rec.id === id);
      
      if (!recording) {
        resolve(null);
        return;
      }
      
      resolve(recording);
    } catch (error) {
      console.error('Error getting recording by ID:', error);
      resolve(null);
    }
  });
}

/**
 * Update a recording's metadata
 * @param id ID of the recording to update
 * @param updates Partial recording object with fields to update
 * @returns Promise<Recording | null> Updated recording or null if not found
 */
export async function updateRecording(
  id: string, 
  updates: Partial<Recording>
): Promise<Recording | null> {
  return new Promise((resolve, reject) => {
    try {
      // Get all recordings
      const recordingsJson = localStorage.getItem(STORAGE_KEY);
      
      if (!recordingsJson) {
        resolve(null);
        return;
      }
      
      const recordings: Recording[] = JSON.parse(recordingsJson);
      
      // Find the index of the recording to update
      const index = recordings.findIndex(rec => rec.id === id);
      
      if (index === -1) {
        resolve(null);
        return;
      }
      
      // Handle special case for blob property
      const { blob, ...updateWithoutBlob } = updates;
      
      // Update the recording
      const updatedRecording = {
        ...recordings[index],
        ...updateWithoutBlob,
        id, // Ensure ID doesn't change
      };
      
      // If there's a blob in the updates, keep it in memory but don't store in localStorage
      if (blob) {
        updatedRecording.blob = blob;
      }
      
      recordings[index] = updatedRecording;
      
      // Save back to localStorage (without the blob)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(
        recordings.map(rec => {
          // Remove blob from localStorage JSON (it can't be serialized)
          const { blob, ...storable } = rec;
          return storable;
        })
      ));
      
      resolve(updatedRecording);
    } catch (error) {
      console.error('Error updating recording:', error);
      reject(error);
    }
  });
}

/**
 * Save analysis results for a recording
 * @param recordingId ID of the recording
 * @param results Analysis results object 
 * @returns Promise<void>
 */
export async function saveAnalysisResult(
  recordingId: string,
  results: any
): Promise<void> {
  try {
    await updateRecording(recordingId, { analysisResults: results });
  } catch (error) {
    console.error('Error saving analysis results:', error);
    throw error;
  }
}

/**
 * Get saved recordings for analysis (with complete data)
 * This function is specifically for the analyzer component
 * @returns Promise<Recording[]>
 */
export async function getSavedRecordings(): Promise<Recording[]> {
  // This is a wrapper around getAllRecordings to maintain compatibility
  // with the original analyzer component
  return getAllRecordings();
}