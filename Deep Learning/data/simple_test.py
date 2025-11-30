# simple_test.py - Put this in your main folder and run: python simple_test.py
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
import tensorflow as tf

print("🚀 Starting SIMPLE Deep Learning Test...")

# Simple dataset
class SimpleDataset(Dataset):
    def __init__(self, images, labels):
        self.images = torch.FloatTensor(images).permute(0, 3, 1, 2)  # NHWC to NCHW
        self.labels = torch.LongTensor(labels.flatten())
    
    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        return self.images[idx], self.labels[idx]

# Simple model
class SimpleCNN(nn.Module):
    def __init__(self):
        super(SimpleCNN, self).__init__()
        self.network = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Flatten(),
            nn.Linear(64 * 8 * 8, 128), nn.ReLU(),
            nn.Linear(128, 10)
        )
    
    def forward(self, x):
        return self.network(x)

# Load data
print("📦 Loading data...")
try:
    (x_train, y_train), (x_test, y_test) = tf.keras.datasets.cifar10.load_data()
    print("✅ Real CIFAR-10 data loaded!")
except:
    print("⚠️  Using dummy data")
    x_train = np.random.rand(500, 32, 32, 3).astype(np.float32)
    y_train = np.random.randint(0, 10, (500, 1))
    x_test = np.random.rand(100, 32, 32, 3).astype(np.float32)
    y_test = np.random.randint(0, 10, (100, 1))

# Normalize
x_train = x_train / 255.0
x_test = x_test / 255.0

# Create dataset and loader
dataset = SimpleDataset(x_train, y_train)
loader = DataLoader(dataset, batch_size=16, shuffle=True)

# Setup
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = SimpleCNN().to(device)
optimizer = optim.Adam(model.parameters(), lr=0.001)
criterion = nn.CrossEntropyLoss()

print(f"🖥️  Using: {device}")
print("🎯 Training for 3 epochs...")

# Train
model.train()
for epoch in range(3):
    total_loss = 0
    for data, target in loader:
        data, target = data.to(device), target.to(device)
        optimizer.zero_grad()
        output = model(data)
        loss = criterion(output, target)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    
    print(f"Epoch {epoch+1}/3 - Loss: {total_loss/len(loader):.4f}")

print("✅ Training completed!")
print("🎉 Deep Learning test SUCCESSFUL!")
