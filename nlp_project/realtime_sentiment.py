from textblob import TextBlob 
 
print("REAL-TIME SENTIMENT ANALYZER") 
print("Type 'quit' to exit") 
print("=" * 40) 
 
while True: 
    text = input("Enter text to analyze: ") 
    if text.lower() == 'quit': 
        break 
    blob = TextBlob(text) 
    polarity = blob.sentiment.polarity 
    print(f"Sentiment: {polarity:.3f}") 
    if polarity 
        print("-> POSITIVE") 
        print("-> NEGATIVE") 
    else: 
        print("-> NEUTRAL") 
    print("-" * 30) 
