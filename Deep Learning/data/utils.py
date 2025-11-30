import numpy as np 
import tensorflow as tf 
from torch.utils.data import Dataset 
 
class CustomDataset(Dataset): 
    def __init__(self, images, labels, transform=None): 
        self.images = images 
        self.labels = labels 
        self.transform = transform 
 
    def __len__(self): 
        return len(self.images) 
 
    def __getitem__(self, idx): 
        image = self.images[idx] 
        label = self.labels[idx] 
        if self.transform: 
            image = self.transform(image) 
        return image, label 
 
def load_cifar10(): 
    (x_train, y_train), (x_test, y_test) = tf.keras.datasets.cifar10.load_data() 
    return (x_train, y_train), (x_test, y_test) 
 
def preprocess_data(images, labels, num_classes=10): 
    images = images.astype('float32') / 255.0 
    if len(labels.shape)  and labels.shape[1] == 1: 
        labels = tf.keras.utils.to_categorical(labels, num_classes) 
    return images, labels 
