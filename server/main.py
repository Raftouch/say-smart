from fastapi import FastAPI, Query, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
from datasets import load_dataset
from dotenv import load_dotenv
import soundfile as sf
import torch
import os
import uuid

load_dotenv()


app = FastAPI()

environment = os.getenv("ENVIRONMENT", "development")

if environment == "production":
    origins = [os.getenv("CORS_ORIGIN", "https://crypto-overview-today.netlify.app")]
else:
    origins = [os.getenv("CORS_ORIGIN", "http://localhost:5173")]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

device = "cuda" if torch.cuda.is_available() else "cpu"

# lighter model for production
synthesiser = pipeline("text-to-speech", "espnet/kan-bayashi_ljspeech_vits", device=device)

# synthesiser = pipeline("text-to-speech", "microsoft/speecht5_tts", device=device)
embeddings_dataset = load_dataset("Matthijs/cmu-arctic-xvectors", split="validation")
speaker_embedding = torch.tensor(embeddings_dataset[7306]["xvector"]).unsqueeze(0)


@app.get("/")
def get_hello():
    return {"message": "Hello"}


def delete_file_after_response(path: str):
    if os.path.exists(path):
        os.remove(path)


@app.get("/saysmart")
def say_smart(text: str = Query(..., max_length=200, description="Text to convert to speech"), background_tasks: BackgroundTasks = None):
    os.makedirs("output", exist_ok=True)

    filename = f"{uuid.uuid4().hex}.wav"
    filepath = os.path.join("output", filename)

    speech = synthesiser(text, forward_params={"speaker_embeddings": speaker_embedding})

    sf.write(filepath, speech["audio"], samplerate=speech["sampling_rate"])

    background_tasks.add_task(delete_file_after_response, filepath)

    return FileResponse(filepath, media_type="audio/wav", filename="speech.wav")