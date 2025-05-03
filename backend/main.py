from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import librosa
from typing import Dict, Any
import io
from models.emotion_detector import EmotionDetector
from models.pitch_detector import PitchDetector

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
emotion_detector = EmotionDetector()
pitch_detector = PitchDetector()

@app.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Analyze the uploaded audio file for emotion, pitch, and tempo.
    """
    try:
        # Read audio file
        contents = await file.read()
        audio_data = io.BytesIO(contents)
        
        # Load audio using librosa
        y, sr = librosa.load(audio_data, sr=None)
        
        # Extract features
        mfccs = librosa.feature.mfcc(y=y, sr=sr)
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        
        # Detect emotion
        emotion = emotion_detector.predict_emotion(y, sr)
        
        # Detect pitch
        pitch_data = pitch_detector.detect_pitch(y, sr)
        
        # Recommend raaga based on emotion and pitch
        raaga = recommend_raaga(emotion["label"], pitch_data["most_common_note"])
        
        return {
            "emotion": emotion,
            "pitch": {
                "data": pitch_data["data"],
                "labels": pitch_data["labels"]
            },
            "tempo": int(tempo),
            "raaga": raaga
        }
        
    except Exception as e:
        return {"error": str(e)}

def recommend_raaga(emotion: str, note: str) -> str:
    """
    Recommend a raaga based on emotion and pitch.
    This is a simplified version - in a real application, this would be more sophisticated.
    """
    # Mapping of emotions to raagas
    emotion_to_raaga = {
        "happy": "Bhairavi",
        "sad": "Darbari",
        "calm": "Yaman",
        "angry": "Todi",
        "fear": "Malkauns",
        "surprise": "Bageshri",
        "disgust": "Asavari",
        "neutral": "Bilawal"
    }
    
    # Default to Bhairavi if emotion not found
    return emotion_to_raaga.get(emotion, "Bhairavi")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 