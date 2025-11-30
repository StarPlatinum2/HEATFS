from textblob import TextBlob 
from textblob.classifiers import NaiveBayesClassifier 
 
print("TEXT CLASSIFICATION DEMO") 
print("=" * 50) 
 
train_data = [ 
    ("I love this car", "positive"), 
    ("This view is amazing", "positive"), 
    ("I feel great today", "positive"), 
    ("I'm so excited about the concert", "positive"), 
    ("He is my best friend", "positive"), 
    ("I do not like this", "negative"), 
    ("This view is horrible", "negative"), 
    ("I feel tired", "negative"), 
    ("I'm so sad", "negative"), 
    ("He is my enemy", "negative") 
] 
 
classifier = NaiveBayesClassifier(train_data) 
print("Classifier trained successfully!") 
 
test_sentences = [ 
    "I feel happy today", 
    "This is terrible news", 
    "I love my new job", 
    "This makes me angry", 
    "The weather is beautiful", 
    "I hate waiting in line" 
] 
 
print("Classification Results:") 
print("-" * 40) 
 
for sentence in test_sentences: 
    result = classifier.classify(sentence) 
    print(f"Sentence: {sentence}") 
    print(f"Classification: {result}") 
    print() 
 
print("=" * 50) 
print("Classification demo completed!") 
