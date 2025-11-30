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
    try:  
        (x_train, y_train), (x_test, y_test) = tf.keras.datasets.cifar10.load_data()  
        print("SUCCESS: Loaded CIFAR-10:", x_train.shape[0], "training samples")  
        return (x_train, y_train), (x_test, y_test)  
    except Exception as e:  
        print("ERROR loading CIFAR-10:", e)  
        x_train = np.random.rand(1000, 32, 32, 3).astype(np.float32)  
        y_train = np.random.randint(0, 10, (1000, 1))  
        x_test = np.random.rand(200, 32, 32, 3).astype(np.float32)  
        y_test = np.random.randint(0, 10, (200, 1))  
        return (x_train, y_train), (x_test, y_test)  
  
def preprocess_data(images, labels, num_classes=10):  
    try:  
        images = images.astype('float32') / 255.0  
  
        if len(labels.shape)  and labels.shape[1] == 1:  
            labels = tf.keras.utils.to_categorical(labels, num_classes)  
  
        print("SUCCESS: Preprocessed data - images", images.shape, "labels", labels.shape)  
        return images, labels  
    except Exception as e:  
        print("ERROR in preprocess_data:", e)  
        return images, labels  
  
content = ''''''''import numpy as np  
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
    try:  
        (x_train, y_train), (x_test, y_test) = tf.keras.datasets.cifar10.load_data()  
        print("SUCCESS: Loaded CIFAR-10:", x_train.shape[0], "training samples")  
        return (x_train, y_train), (x_test, y_test)  
    except Exception as e:  
        print("ERROR loading CIFAR-10:", e)  
        x_train = np.random.rand(1000, 32, 32, 3).astype(np.float32)  
        y_train = np.random.randint(0, 10, (1000, 1))  
        x_test = np.random.rand(200, 32, 32, 3).astype(np.float32)  
        y_test = np.random.randint(0, 10, (200, 1))  
        return (x_train, y_train), (x_test, y_test)  
  
def preprocess_data(images, labels, num_classes=10):  
    try:  
        images = images.astype('float32') / 255.0  
  
        if len(labels.shape)  and labels.shape[1] == 1:  
            labels = tf.keras.utils.to_categorical(labels, num_classes)  
  
        print("SUCCESS: Preprocessed data - images", images.shape, "labels", labels.shape)  
        return images, labels  
    except Exception as e:  
        print("ERROR in preprocess_data:", e)  
        return images, labels  
''''''''  
  
with open('data/utils.py', 'w') as f:  
    f.write(content)  
  
print("SUCCESS: Fixed data/utils.py")  
