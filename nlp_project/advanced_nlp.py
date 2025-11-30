from textblob import TextBlob 
import nltk 
from collections import Counter 
 
def analyze_text_complexity(text): 
    blob = TextBlob(text) 
    words = blob.words 
    sentences = blob.sentences 
 
    word_count = len(words) 
    sentence_count = len(sentences) 
    avg_sentence_length = word_count / sentence_count if sentence_count  else 0 
 
    return { 
        'word_count': word_count, 
        'sentence_count': sentence_count, 
        'avg_sentence_length': avg_sentence_length, 
        'lexical_diversity': len(set(words)) / word_count if word_count  else 0 
    } 
 
def extract_keywords(text, n=5): 
    blob = TextBlob(text) 
    words = [word.lower() for word in blob.words if word.isalpha() and len(word) 
    word_freq = Counter(words) 
    return word_freq.most_common(n) 
 
print("ADVANCED TEXT ANALYSIS") 
print("=" * 50) 
 
sample_text = "Natural Language Processing is a fascinating field of study. It combines computer science, artificial intelligence, and linguistics to enable computers to understand human language. This technology powers many applications we use every day." 
 
print(f"Sample Text: {sample_text}") 
 
complexity = analyze_text_complexity(sample_text) 
print("\\nText Complexity Analysis:") 
for key, value in complexity.items(): 
    print(f"  {key}: {value:.2f}") 
 
keywords = extract_keywords(sample_text) 
print("\\nTop Keywords:") 
for word, freq in keywords: 
    print(f"  {word}: {freq}") 
 
sentiment = TextBlob(sample_text).sentiment 
print(f"\\nSentiment - Polarity: {sentiment.polarity:.3f}, Subjectivity: {sentiment.subjectivity:.3f}") 
