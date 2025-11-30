# Deep Learning Framework Comparison

A comprehensive deep learning project that implements and compares neural network models across three major frameworks: **PyTorch**, **Keras**, and **TensorFlow**. This project demonstrates image classification on the CIFAR-10 dataset with a modular, extensible architecture.

## 🚀 Features

- **Multi-Framework Support**: Implemented in PyTorch, Keras, and TensorFlow
- **Modular Design**: Clean separation of data, models, training, and evaluation
- **Configurable**: YAML-based configuration system
- **Comprehensive Evaluation**: Accuracy metrics, confusion matrices, sample predictions
- **Progress Tracking**: Real-time training progress with tqdm
- **Model Persistence**: Save and load trained models

## 📁 Project Structure
Deep-Learning/
├── checkpoints/
├── config/
│   ├── config.yaml
│   └── config.yamldir
├── data/
│   ├── _pycache_/
│   │   ├── __init__.cpython-311.pyc
│   │   └── utils.cpython-311.pyc
│   ├── processed/
│   ├── raw/
│   ├── __init__.py
│   ├── utils.py
│   ├── utils.pypython
│   └── simple_test.py
├── evaluation/
│   ├── _pycache_/
│   │   ├── __init__.cpython-311.pyc
│   │   └── evaluate.cpython-311.pyc
│   ├── __init__.py
│   ├── evaluate.py
│   └── visualization.py
├── models/
│   ├── _pycache_/
│   │   ├── __init__.cpython-311.pyc
│   │   ├── keras_model.cpython-311.pyc
│   │   ├── pytorch_model.cpython-311.pyc
│   │   └── tensorflow_model.cpython-311.pyc
│   ├── __init__.py
│   ├── keras_model.py
│   ├── pytorch_model.py
│   └── tensorflow_model.py
├── training/
│   ├── _pycache_/
│   │   ├── __init__.cpython-311.pyc
│   │   ├── train_keras.cpython-311.pyc
│   │   ├── train_pytorch.cpython-311.pyc
│   │   └── train_tensorflow.cpython-311.pyc
│   ├── __init__.py
│   ├── fix_training.py
│   ├── train_keras.py
│   ├── train_pytorch.py
│   ├── train_tensorflow.py
│   └── utils.py
├── fix_data_simple.py
├── fix_data_utils.py
├── keras_model.h5
├── main.py
├── ModuleNotFoundError
├── python
├── pytorch_model.pth
├── README.md
├── requirements.txt
├── setup.bat
├── simple_fix.py
└── tensorflow_model.h5

## 🛠 Installation

### Prerequisites
- Python 3.8+
- pip package manager

### Install from requirements.txt
```bash
# Clone or download the project
cd deep_learning_project

# Install all dependencies
pip install -r requirements.txt

1. Verify Installation
python -c "import torch, tensorflow, keras; print('All frameworks installed successfully!')"

2. Run with PyTorch
python main.py --framework pytorch --epochs 5 --batch_size 32

3. Run with Keras
python main.py --framework keras --epochs 5 --batch_size 32

4. Run with TensorFlow
python main.py --framework tensorflow --epochs 5 --batch_size 32 --training_mode keras_api

⚙️ Configuration
Edit config/config.yaml to customize:

data:
  dataset: "cifar10"
  batch_size: 32
  validation_split: 0.2
  image_size: [32, 32, 3]

model:
  architecture: "cnn"
  num_classes: 10
  hidden_layers: [128, 64]
  dropout_rate: 0.3

training:
  epochs: 10
  learning_rate: 0.001
  optimizer: "adam"
  loss_function: "categorical_crossentropy"

evaluation:
  metrics: ["accuracy", "precision", "recall"]
  