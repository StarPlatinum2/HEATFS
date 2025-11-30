from textblob.classifiers import NaiveBayesClassifier 
 
train_data = [ 
    ('I love this', 'pos'), ('This is great', 'pos'), ('Amazing product', 'pos'), 
    ('I hate this', 'neg'), ('This is terrible', 'neg'), ('Awful experience', 'neg'), 
    ('The weather is nice', 'pos'), ('Beautiful day', 'pos'), ('Wonderful time', 'pos'), 
    ('I feel sad', 'neg'), ('This is disappointing', 'neg'), ('Poor quality', 'neg') 
] 
 
cl = NaiveBayesClassifier(train_data) 
print('Improved classifier ready!') 
 
test = ['This is wonderful', 'I dislike this', 'It is okay'] 
for t in test: 
    print(f'{t} -> {cl.classify(t)}') 
