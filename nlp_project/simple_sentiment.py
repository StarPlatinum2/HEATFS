from textblob import TextBlob 
 
print("QUICK SENTIMENT ANALYSIS") 
print("=" * 30) 
 
texts = ["I love this!", "I hate this!", "It is okay"] 
 
for text in texts: 
    blob = TextBlob(text) 
    polarity = blob.sentiment.polarity 
    print(f"{text} -^> {polarity:.3f}") 
 
print("=" * 30) 
print("Done!") 
