import pandas as pd
import numpy as np
import os
from sklearn.datasets import load_iris, load_wine, make_moons, make_blobs
from config import DATASETS_PATH

class DataLoader:
    def __init__(self):
        self.available_datasets = {
            'iris': 'Iris Dataset',
            'wine': 'Wine Dataset', 
            'moons': 'Moons Dataset',
            'blobs': 'Synthetic Blobs'
        }
    
    def get_available_datasets(self):
        """Get list of available datasets"""
        datasets = list(self.available_datasets.items())
        
        # Add custom datasets from data folder
        custom_datasets = self._get_custom_datasets()
        datasets.extend(custom_datasets)
        
        return datasets
    
    def _get_custom_datasets(self):
        """Get custom datasets from data folder"""
        custom_datasets = []
        if os.path.exists(DATASETS_PATH):
            for filename in os.listdir(DATASETS_PATH):
                if filename.endswith('.csv'):
                    dataset_name = filename[:-4]  # Remove .csv extension
                    custom_datasets.append((dataset_name, f'Custom: {dataset_name}'))
        return custom_datasets
    
    def load_dataset(self, dataset_name):
        """Load a dataset by name"""
        if dataset_name == 'iris':
            return self._load_iris()
        elif dataset_name == 'wine':
            return self._load_wine()
        elif dataset_name == 'moons':
            return self._load_moons()
        elif dataset_name == 'blobs':
            return self._load_blobs()
        else:
            return self.load_custom_dataset(dataset_name)
    
    def _load_iris(self):
        """Load Iris dataset"""
        iris = load_iris()
        df = pd.DataFrame(iris.data, columns=iris.feature_names)
        df['target'] = iris.target
        return {
            'name': 'iris',
            'data': df.values.tolist(),
            'columns': iris.feature_names + ['target'],
            'feature_names': iris.feature_names,
            'target_names': iris.target_names.tolist(),
            'sample_size': len(df)
        }
    
    def _load_wine(self):
        """Load Wine dataset"""
        wine = load_wine()
        df = pd.DataFrame(wine.data, columns=wine.feature_names)
        df['target'] = wine.target
        return {
            'name': 'wine',
            'data': df.values.tolist(),
            'columns': wine.feature_names + ['target'],
            'feature_names': wine.feature_names,
            'target_names': wine.target_names.tolist(),
            'sample_size': len(df)
        }
    
    def _load_moons(self):
        """Generate Moons dataset"""
        X, y = make_moons(n_samples=300, noise=0.1, random_state=42)
        df = pd.DataFrame(X, columns=['x', 'y'])
        df['target'] = y
        return {
            'name': 'moons',
            'data': df.values.tolist(),
            'columns': ['x', 'y', 'target'],
            'feature_names': ['x', 'y'],
            'target_names': ['Class 0', 'Class 1'],
            'sample_size': len(df)
        }
    
    def _load_blobs(self):
        """Generate synthetic blobs dataset"""
        X, y = make_blobs(n_samples=300, centers=4, n_features=2, 
                          random_state=42, cluster_std=1.0)
        df = pd.DataFrame(X, columns=['x', 'y'])
        df['target'] = y
        return {
            'name': 'blobs',
            'data': df.values.tolist(),
            'columns': ['x', 'y', 'target'],
            'feature_names': ['x', 'y'],
            'target_names': [f'Cluster {i}' for i in range(4)],
            'sample_size': len(df)
        }
    
    def load_custom_dataset(self, filename):
        """Load custom dataset from CSV file"""
        filepath = os.path.join(DATASETS_PATH, filename)
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Dataset file {filename} not found")
        
        df = pd.read_csv(filepath)
        dataset_name = filename[:-4]  # Remove .csv extension
        
        return {
            'name': dataset_name,
            'data': df.values.tolist(),
            'columns': df.columns.tolist(),
            'feature_names': df.columns.tolist(),
            'sample_size': len(df)
        }
