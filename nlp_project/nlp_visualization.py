import matplotlib.pyplot as plt 
from wordcloud import WordCloud 
from textblob import TextBlob 
 
texts = [ 
    "Python programming is amazing and fun to learn", 
    "Machine learning and artificial intelligence are fascinating", 
    "Natural language processing helps understand human language", 
    "Data science involves statistics and computer science", 
    "Deep learning uses neural networks for complex tasks" 
] 
 
all_text = " ".join(texts) 
wordcloud = WordCloud(width=800, height=400, background_color='white').generate(all_text) 
 
plt.figure(figsize=(10, 5)) 
plt.imshow(wordcloud, interpolation='bilinear') 
plt.axis('off') 
plt.title('NLP Word Cloud') 
plt.show() 
print("Word cloud generated! Check the popup window.") 
