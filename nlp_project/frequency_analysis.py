from textblob import TextBlob 
from collections import Counter 
 
print("WORD FREQUENCY ANALYSIS") 
print("=" * 50) 
 
sample_text = "Natural Language Processing is a field of artificial intelligence that gives computers the ability to understand human language. Language processing and language understanding are key components of modern AI systems." 
 
print(f"Sample Text: {sample_text}") 
print() 
blob = TextBlob(sample_text) 
 
words = [word.lower() for word in blob.words if word.isalpha() and len(word) > 2] 
word_freq = Counter(words) 
 
print("Most Common Words (Top 10):") 
print("-" * 30) 
for word, count in word_freq.most_common(10): 
    print(f"{word:15} : {count:2} occurrences") 
 
print() 
print("Text Statistics:") 
print("-" * 30) 
print(f"Total Words: {len(blob.words)}") 
print(f"Total Sentences: {len(blob.sentences)}") 
print(f"Unique Words: {len(set(words))}") 
print(f"Lexical Diversity: {len(set(words)) / len(blob.words):.3f}") 
 
print("=" * 50) 
print("Frequency analysis completed!") 
