import requests
import json
import sys
import re
import os

# API Key (loaded dynamically from environment)
API_KEY = os.environ.get("SARVAM_API_KEY", "")

def clean_text(text):
    # Remove emojis
    text = re.sub(r'[😀-🙏]', '', text)
    text = re.sub(r'[a-zA-Z0-9]', ' ', text)
    text = re.sub(r'[^\u0900-\u097F\s\.\,\?\!]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

text = sys.argv[1]
clean_text = clean_text(text)

url = "https://api.sarvam.ai/text-to-speech"

payload = {
    "inputs": [clean_text],
    "target_language_code": "hi-IN",  # Hindi
    "speaker": "meera",  # Female voice
    "pitch": 1.0,
    "pace": 1.0,
    "loudness": 1.0,
    "speech_sample_rate": 22050,
    "enable_preprocessing": True,
    "model": "bulbul"
}

headers = {
    "Content-Type": "application/json",
    "API-Subscription-Key": API_KEY
}

response = requests.post(url, json=payload, headers=headers)

if response.status_code == 200:
    # Save audio
    import base64
    audio_data = base64.b64decode(response.json()["audios"][0])
    with open("output.wav", "wb") as f:
        f.write(audio_data)
    print("✅ DONE")
else:
    print(f"Error: {response.status_code}")