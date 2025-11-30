import yaml
import argparse
import numpy as np
from data.utils import load_cifar10, preprocess_data, CustomDataset
from models.pytorch_model import get_pytorch_model
from models.keras_model import create_keras_model
from models.tensorflow_model import create_tensorflow_custom_model, create_tensorflow_functional_model
from training.train_pytorch import PyTorchTrainer
from training.train_keras import KerasTrainer
from training.train_tensorflow import TensorFlowTrainer, create_tensorflow_data_pipeline
from evaluation.evaluate import evaluate_model, plot_sample_predictions
import torch
from torch.utils.data import DataLoader
import torchvision.transforms as transforms

def load_config(config_path='config/config.yaml'):
    with open(config_path, 'r') as file:
        config = yaml.safe_load(file)
    return config

def main():
    parser = argparse.ArgumentParser(description='Deep Learning Framework Comparison')
    parser.add_argument('--framework', type=str, required=True, 
                       choices=['pytorch', 'keras', 'tensorflow'],
                       help='Deep learning framework to use')
    parser.add_argument('--epochs', type=int, default=10, help='Number of epochs')
    parser.add_argument('--batch_size', type=int, default=32, help='Batch size')
    parser.add_argument('--training_mode', type=str, default='keras_api',
                       choices=['keras_api', 'custom_loop'],
                       help='Training mode for TensorFlow')
    args = parser.parse_args()
    
    # Load configuration
    config = load_config()
    
    # Load and preprocess data
    print("Loading CIFAR-10 dataset...")
    (x_train, y_train), (x_test, y_test) = load_cifar10()
    
    # Preprocess data
    x_train, y_train = preprocess_data(x_train, y_train)
    x_test, y_test = preprocess_data(x_test, y_test)
    
    # Split training data for validation
    split_idx = int(len(x_train) * (1 - config['data']['validation_split']))
    x_val, y_val = x_train[split_idx:], y_train[split_idx:]
    x_train, y_train = x_train[:split_idx], y_train[:split_idx]
    
    class_names = ['airplane', 'automobile', 'bird', 'cat', 'deer', 
                   'dog', 'frog', 'horse', 'ship', 'truck']
    
    if args.framework == 'pytorch':
        # PyTorch implementation
        print("Using PyTorch framework...")
        
        # Transform for PyTorch (CHW format)
        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
        ])
        
        # Create datasets
        train_dataset = CustomDataset(x_train, np.argmax(y_train, axis=1), transform)
        val_dataset = CustomDataset(x_val, np.argmax(y_val, axis=1), transform)
        
        # Create data loaders
        train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True)
        val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False)
        
        # Create model
        model = get_pytorch_model(num_classes=config['model']['num_classes'])
        
        # Train model
        trainer = PyTorchTrainer(model)
        trainer.train(train_loader, val_loader, epochs=args.epochs, 
                     learning_rate=config['training']['learning_rate'])
        
        # Save model
        trainer.save_model('pytorch_model.pth')
        
        # Evaluate
        accuracy, predictions = evaluate_model(model, x_test, y_test, framework='pytorch')
        
    elif args.framework == 'keras':
        # Keras implementation
        print("Using Keras framework...")
        
        model = create_keras_model(
            input_shape=config['data']['image_size'],
            num_classes=config['model']['num_classes']
        )
        
        # Train model
        trainer = KerasTrainer(model)
        trainer.compile_model(learning_rate=config['training']['learning_rate'])
        trainer.train(x_train, y_train, x_val, y_val, 
                     epochs=args.epochs, batch_size=args.batch_size)
        
        # Plot training history
        trainer.plot_training_history()
        
        # Save model
        trainer.save_model('keras_model.h5')
        
        # Evaluate
        accuracy, predictions = evaluate_model(model, x_test, y_test, framework='keras')
    
    else:
        # TensorFlow implementation
        print("Using TensorFlow framework...")
        
        # Create model
        model = create_tensorflow_custom_model(
            num_classes=config['model']['num_classes']
        )
        
        # Build model
        model.build(input_shape=(None, *config['data']['image_size']))
        
        # Create trainer
        trainer = TensorFlowTrainer(model, model_name="tensorflow_cnn")
        trainer.compile_model(
            learning_rate=config['training']['learning_rate'],
            optimizer=config['training']['optimizer']
        )
        
        if args.training_mode == 'custom_loop':
            # Create TensorFlow datasets
            train_dataset = create_tensorflow_data_pipeline(
                x_train, y_train, 
                batch_size=args.batch_size, 
                shuffle=True, 
                augment=True, 
                is_training=True
            )
            val_dataset = create_tensorflow_data_pipeline(
                x_val, y_val, 
                batch_size=args.batch_size, 
                shuffle=False
            )
            
            # Train with custom loop
            trainer.train_with_custom_loop(
                train_dataset, val_dataset, 
                epochs=args.epochs
            )
        else:
            # Train with Keras API
            trainer.train_with_keras_api(
                x_train, y_train, x_val, y_val,
                epochs=args.epochs, 
                batch_size=args.batch_size
            )
        
        # Plot comprehensive training history
        trainer.plot_training_history()
        
        # Save model
        trainer.save_model('tensorflow_model.h5')
        
        # Evaluate
        test_dataset = create_tensorflow_data_pipeline(
            x_test, y_test, 
            batch_size=args.batch_size, 
            shuffle=False
        )
        test_loss, test_accuracy = trainer.evaluate_model(test_dataset)
        accuracy = test_accuracy.numpy()
        
        # Get predictions for visualization
        predictions = model.predict(x_test)
        predictions = np.argmax(predictions, axis=1)
    
    # Plot sample predictions
    plot_sample_predictions(x_test, y_test, predictions, class_names)
    
    print(f"\nTraining completed with {args.framework}!")
    print(f"Final test accuracy: {accuracy:.4f}")

if __name__ == "__main__":
    main()
