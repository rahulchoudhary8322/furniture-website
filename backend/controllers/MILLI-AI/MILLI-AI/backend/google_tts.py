from gtts import gTTS
import sys
import re

# ULTIMATE EMOJI REMOVER
def remove_all_emojis(text):
    # All possible emoji patterns
    patterns = [
        r'[\U0001F600-\U0001F64F]',  # Emoticons
        r'[\U0001F300-\U0001F5FF]',  # Symbols
        r'[\U0001F680-\U0001F6FF]',  # Transport
        r'[\U0001F700-\U0001F77F]',  # Alchemical
        r'[\U0001F780-\U0001F7FF]',  # Geometric
        r'[\U0001F800-\U0001F8FF]',  # Supplemental
        r'[\U0001F900-\U0001F9FF]',  # Supplemental
        r'[\U0001FA00-\U0001FA6F]',  # Chess
        r'[\U0001FA70-\U0001FAFF]',  # Symbols
        r'[\U00002702-\U000027B0]',  # Dingbats
        r'[\U000024C2-\U0001F251]',  # Enclosed
        r'[\U0001F1E0-\U0001F1FF]',  # Flags
        r'[\U00010000-\U0010FFFF]',  # Everything else
    ]
    
    for pattern in patterns:
        text = re.sub(pattern, '', text, flags=re.UNICODE)
    
    # Remove text emojis
    text = re.sub(r'[:;][-~]?[\(\)DdpP/\\]', '', text)
    text = re.sub(r'[😀-🙏]', '', text)
    text = re.sub(r'[⭐-〰]', '', text)
    text = re.sub(r'[😂-🤿]', '', text)
    
    # Keep ONLY Hindi, English, numbers, punctuation
    text = re.sub(r'[^\u0900-\u097F\w\s\.\,\?\!]', ' ', text)
    
    # Clean spaces
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

text = sys.argv[1]
clean_text = remove_all_emojis(text)

print(f"CLEAN: {clean_text}")

if clean_text:
    tts = gTTS(text=clean_text, lang='hi', slow=False)
    tts.save("output.wav")
    print("SUCCESS")
else:
    print("EMPTY")