from piper.voice import PiperVoice
import wave
import sys
import os
import re

# Sirf Hindi rakho (English + Emoji hatao)
def clean_text(text):
    # Pehle emoji hatao
    text = re.sub(r'[😀-🙏]', '', text)
    text = re.sub(r'[😂-🤿]', '', text)
    text = re.sub(r'[\U0001F600-\U0001F64F]', '', text)
    text = re.sub(r'[\U0001F300-\U0001F5FF]', '', text)
    text = re.sub(r'[\U0001F680-\U0001F6FF]', '', text)
    
    # English letters hatao
    text = re.sub(r'[a-zA-Z0-9]', ' ', text)
    
    # Sirf Hindi characters rakho
    text = re.sub(r'[^\u0900-\u097F\s\.\,\?\!]', '', text)
    
    # Extra spaces hatao
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

# TERA MODEL (Jo already hai tere paas)
model_path = os.path.join("voice", "hi_IN-priyamvada-medium.onnx")

# Check karo model hai ya nahi
if not os.path.exists(model_path):
    print(f"❌ Model not found at: {model_path}")
    print("Checking current directory...")
    print("Files in voice folder:", os.listdir("voice") if os.path.exists("voice") else "voice folder not found")
    sys.exit(1)

print(f"✅ Loading model: {model_path}")

voice = PiperVoice.load(model_path)

text = sys.argv[1]
clean_text = clean_text(text)

print(f"📝 Original: {text}")
print(f"🎤 Speaking: {clean_text}")

with wave.open("output.wav", "wb") as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(22050)
    voice.synthesize(clean_text, wav)

print("✅ DONE")