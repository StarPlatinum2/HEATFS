@echo off
echo Creating Deep Learning Project Structure...

cd /d "C:\Users\sarus\OneDrive\Documents\MS Word\Artificial Intelligence\Finals\Deep-Learning"

mkdir data 2>nul
mkdir models 2>nul
mkdir training 2>nul
mkdir evaluation 2>nul
mkdir config 2>nul

echo Creating __init__.py files...
type nul > data\__init__.py
type nul > models\__init__.py
type nul > training\__init__.py
type nul > evaluation\__init__.py

echo Creating data\utils.py...
echo import numpy as np > data\utils.py
echo import tensorflow as tf >> data\utils.py
echo from torch.utils.data import Dataset, DataLoader >> data\utils.py
echo. >> data\utils.py
echo class CustomDataset(Dataset): >> data\utils.py
echo     def __init__(self, images, labels, transform=None): >> data\utils.py
echo         self.images = images >> data\utils.py
echo         self.labels = labels >> data\utils.py
echo         self.transform = transform >> data\utils.py
echo     def __len__(self): >> data\utils.py
echo         return len(self.images) >> data\utils.py
echo     def __getitem__(self, idx): >> data\utils.py
echo         image = self.images[idx] >> data\utils.py
echo         label = self.labels[idx] >> data\utils.py
echo         if self.transform: >> data\utils.py
echo             image = self.transform(image) >> data\utils.py
echo         return image, label >> data\utils.py
echo. >> data\utils.py
echo def load_cifar10(): >> data\utils.py
echo     try: >> data\utils.py
echo         (x_train, y_train), (x_test, y_test) = tf.keras.datasets.cifar10.load_data() >> data\utils.py
echo         return (x_train, y_train), (x_test, y_test) >> data\utils.py
echo     except: >> data\utils.py
echo         print("Using dummy data") >> data\utils.py
echo         x_train = np.random.rand(1000, 32, 32, 3).astype(np.float32) >> data\utils.py
echo         y_train = np.random.randint(0, 10, (1000, 1)) >> data\utils.py
echo         x_test = np.random.rand(200, 32, 32, 3).astype(np.float32) >> data\utils.py
echo         y_test = np.random.randint(0, 10, (200, 1)) >> data\utils.py
echo         return (x_train, y_train), (x_test, y_test) >> data\utils.py
echo. >> data\utils.py
echo def preprocess_data(images, labels, num_classes=10): >> data\utils.py
echo     images = images.astype('float32') / 255.0 >> data\utils.py
echo     if len(labels.shape) > 1 and labels.shape[1] == 1: >> data\utils.py
echo         labels = tf.keras.utils.to_categorical(labels, num_classes) >> data\utils.py
echo     return images, labels >> data\utils.py

echo Project setup complete!
echo Now run the project with: python main.py --framework pytorch --epochs 3 --batch_size 16
pause