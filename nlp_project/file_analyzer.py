from textblob import TextBlob 
 
# Create a sample text file 
with open('sample_reviews.txt', 'w') as f: 
    f.write('''I love this product! It's amazing. 
This is the worst purchase ever. 
The quality is good but could be better. 
Excellent service and fast delivery. 
Very disappointed with the results.''') 
 
print("FILE SENTIMENT ANALYSIS") 
print("=" * 40) 
 
with open('sample_reviews.txt', 'r') as f: 
    for line_num, line in enumerate(f, 1): 
        if line.strip(): 
            blob = TextBlob(line.strip()) 
            polarity = blob.sentiment.polarity 
            print(f"Line {line_num}: {polarity:.3f} - {line.strip()}") 
