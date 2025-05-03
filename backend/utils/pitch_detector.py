import crepe
import numpy as np
from typing import Dict, Any, List, Tuple

class PitchDetector:
    def __init__(self):
        self.sample_rate = 16000  # CREPE's default sample rate
        
    def detect_pitch(self, audio_data: np.ndarray, sr: int) -> Dict[str, Any]:
        """
        Detect pitch using CREPE.
        """
        try:
            # Resample if necessary
            if sr != self.sample_rate:
                import librosa
                audio_data = librosa.resample(audio_data, orig_sr=sr, target_sr=self.sample_rate)
            
            # Run CREPE
            time, frequency, confidence, activation = crepe.predict(
                audio_data,
                self.sample_rate,
                viterbi=True
            )
            
            # Convert frequency to note names
            notes = self._frequency_to_notes(frequency)
            
            # Get the most common note
            most_common_note = max(set(notes), key=notes.count)
            
            return {
                "data": frequency.tolist(),
                "labels": notes,
                "confidence": confidence.tolist(),
                "most_common_note": most_common_note
            }
            
        except Exception as e:
            print(f"Error in pitch detection: {str(e)}")
            return {
                "data": [],
                "labels": [],
                "confidence": [],
                "most_common_note": "unknown"
            }
    
    def _frequency_to_notes(self, frequencies: np.ndarray) -> List[str]:
        """
        Convert frequencies to musical note names.
        """
        notes = []
        for freq in frequencies:
            if freq > 0:
                note = self._frequency_to_note(freq)
                notes.append(note)
            else:
                notes.append("silence")
        return notes
    
    def _frequency_to_note(self, frequency: float) -> str:
        """
        Convert a single frequency to a musical note name.
        """
        A4 = 440.0
        C0 = A4 * (2 ** -4.75)
        note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        
        if frequency == 0:
            return "silence"
            
        h = round(12 * np.log2(frequency / C0))
        octave = h // 12
        n = h % 12
        return f"{note_names[n]}{octave}" 