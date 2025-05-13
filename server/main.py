from fastapi import FastAPI, Query, BackgroundTasks
from fastapi.responses import FileResponse
from transformers import pipeline
from datasets import load_dataset
import soundfile as sf
import torch
import os
import uuid


app = FastAPI()

device = "cuda" if torch.cuda.is_available() else "cpu"

synthesiser = pipeline("text-to-speech", "microsoft/speecht5_tts", device=device)
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