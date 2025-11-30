from textblob import TextBlob 
from textblob import Word 
import nltk 
from collections import Counter 
 
print("=" * 70) 
print("COMPREHENSIVE NATURAL LANGUAGE PROCESSING DEMONSTRATION") 
print("=" * 70) 
 
nltk.download('punkt') 
nltk.download('averaged_perceptron_tagger') 
 
class NLPProcessor: 
    def __init__(self): 
        print("NLP Processor Initialized!") 
 
    def analyze_sentiment(self, text): 
        blob = TextBlob(text) 
        polarity = blob.sentiment.polarity 
        subjectivity = blob.sentiment.subjectivity 
 
        if polarity > 0.3: 
            assessment = "STRONGLY POSITIVE" 
        elif polarity > 0.1: 
            assessment = "POSITIVE" 
        elif polarity < -0.3: 
            assessment = "STRONGLY NEGATIVE" 
        elif polarity < -0.1: 
            assessment = "NEGATIVE" 
        else: 
            assessment = "NEUTRAL" 
 
        return { 
            'polarity': polarity, 
            'subjectivity': subjectivity, 
            'assessment': assessment 
        } 
 
    def text_analysis(self, text): 
        blob = TextBlob(text) 
        analysis = { 
            'word_count': len(blob.words), 
            'sentence_count': len(blob.sentences), 
            'noun_phrases': blob.noun_phrases, 
            'pos_tags': blob.tags 
        } 
        return analysis 
 
    def spelling_correction(self, text): 
        return str(TextBlob(text).correct()) 
 
nlp = NLPProcessor() 
 
print("1. SENTIMENT ANALYSIS") 
print("-" * 50) 
 
sample_texts = [ 
    "I absolutely love this amazing product! It works perfectly.", 
    "This is the worst experience I've ever had. Terrible service!", 
    "The weather is nice today. I might go for a walk.", 
    "Machine learning and artificial intelligence are transforming industries.", 
    "The movie was okay, nothing special but not bad either." 
] 
 
for i, text in enumerate(sample_texts, 1): 
    print(f"Text {i}:") 
    print(f"  Content: {text}") 
 
    sentiment = nlp.analyze_sentiment(text) 
    print(f"  Polarity: {sentiment['polarity']:.3f}") 
    print(f"  Subjectivity: {sentiment['subjectivity']:.3f}") 
    print(f"  Assessment: {sentiment['assessment']}") 
    print() 
 
print("2. TEXT ANALYSIS") 
print("-" * 50) 
 
demo_text = "The quick brown foxes are jumping over the lazy dogs." 
print(f"Sample Text: {demo_text}") 
 
analysis = nlp.text_analysis(demo_text) 
print(f"Word Count: {analysis['word_count']}") 
print(f"Sentence Count: {analysis['sentence_count']}") 
print(f"Noun Phrases: {analysis['noun_phrases']}") 
 
print("Part-of-Speech Tags:") 
for word, pos in analysis['pos_tags']: 
    print(f"  {word}: {pos}") 
 
print("3. SPELLING CORRECTION") 
print("-" * 50) 
 
misspelled_text = "I hav a gret idear for a nu project" 
print(f"Original: {misspelled_text}") 
corrected = nlp.spelling_correction(misspelled_text) 
print(f"Corrected: {corrected}") 
 
print("=" * 70) 
print("NLP DEMONSTRATION COMPLETED!") 
print("=" * 70) 
