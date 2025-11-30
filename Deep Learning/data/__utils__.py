# data/utils.py
import numpy as np
import tensorflow as tf
from torch.utils.data import Dataset, DataLoader
import matplotlib.pyplot as plt

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
    """Load CIFAR-10 dataset"""
    try:
        (x_train, y_train), (x_test, y_test) = tf.keras.datasets.cifar10.load_data()
        print(f"✅ Loaded CIFAR-10: {x_train.shape[0]} training samples")
        return (x_train, y_train), (x_test, y_test)
    except Exception as e:
        print(f"❌ Error loading CIFAR-10: {e}")
        # Create dummy data for testing
        print("⚠️  Using dummy data instead")
        x_train = np.random.rand(1000, 32, 32, 3).astype(np.float32)
        y_train = np.random.randint(0, 10, (1000, 1))
        x_test = np.random.rand(200, 32, 32, 3).astype(np.float32)
        y_test = np.random.randint(0, 10, (200, 1))
        return (x_train, y_train), (x_test, y_test)

def preprocess_data(images, labels, num_classes=10):
    """Preprocess images and labels - FIXED VERSION"""
    try:
        # Normalize images
        images = images.astype('float32') / 255.0
        
        # Convert labels to categorical if needed
        if len(labels.shape) > 1 and labels.shape[1] == 1:
            labels = tf.keras.utils.to_categorical(labels, num_classes)
        
        print(f"✅ Preprocessed data: images {images.shape}, labels {labels.shape}")
        return images, labels
    except Exception as e:
        print(f"❌ Error in preprocess_data: {e}")
        # Return the original data if preprocessing fails
        return images, labels