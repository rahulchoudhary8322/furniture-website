from gtts import gTTS

# Simple Hindi test
text = "नमस्ते भाई, कैसे हो?"
tts = gTTS(text=text, lang='hi', slow=False)
tts.save("test_output.wav")
print("✅ Test audio saved as test_output.wav")