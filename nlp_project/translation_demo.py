from textblob import TextBlob 
 
print("LANGUAGE TRANSLATION DEMO") 
print("=" * 50) 
 
texts = [ 
    "Hello, how are you today?", 
    "I love programming in Python", 
    "This is a beautiful day", 
    "Machine learning is fascinating" 
] 
 
for text in texts: 
    print(f"English: {text}") 
    blob = TextBlob(text) 
    try: 
        spanish = blob.translate(to='es') 
        print(f"Spanish: {spanish}") 
    except: 
        print("Translation service not available") 
    print("-" * 30) 
 
print("=" * 50) 
print("Translation demo completed!") 
