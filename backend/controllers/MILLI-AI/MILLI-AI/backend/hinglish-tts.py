from inference import load_model, synthesize
import soundfile as sf
import sys
import re

# Model load (pehli baar me download hoga ~1.3GB)
model = load_model()

# Reference audio chahiye (sample Hindi voice)
REF_AUDIO = "data/reference_audio/hindi_ref.wav"
REF_TEXT = "यह एक नमूना आवाज है"

def clean_text(text):
    text = re.sub(r'[😀-🙏]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

text = sys.argv[1]
clean_text = clean_text(text)

# Generate speech
audio = synthesize(model, clean_text, REF_AUDIO, REF_TEXT)

# Save
sf.write("output.wav", audio, 24000)
print("✅ DONE")