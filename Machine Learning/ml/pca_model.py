import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import make_classification
import json

class PCAModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
    
    def generate_synthetic_data(self, n_samples=100, n_features=3):
        """Generate synthetic 3D data for PCA"""
        X, y = make_classification(
            n_samples=n_samples, 
            n_features=n_features, 
            n_informative=3,
            n_redundant=0,
            n_classes=3,
            random_state=42
        )
        
        # Scale to make data more realistic
        X = self.scaler.fit_transform(X) * 20 + 50
        
        data_points = []
        for i in range(len(X)):
            point = {
                'x': float(X[i, 0]),
                'y': float(X[i, 1]),
                'z': float(X[i, 2]) if n_features > 2 else 0,
                'original_class': int(y[i])
            }
            data_points.append(point)
        
        return {
            'data_points': data_points,
            'n_samples': n_samples,
            'n_features': n_features
        }
    
    def analyze(self, data_points, n_components=2):
        """Perform PCA analysis on data points"""
        # Extract features
        if 'z' in data_points[0]:
            # 3D data
            X = np.array([[point['x'], point['y'], point['z']] for point in data_points])
        else:
            # 2D data
            X = np.array([[point['x'], point['y']] for point in data_points])
        
        # Scale the data
        X_scaled = self.scaler.fit_transform(X)
        
        # Perform PCA
        n_components = min(n_components, X.shape[1])
        self.model = PCA(n_components=n_components)
        X_transformed = self.model.fit_transform(X_scaled)
        
        # Calculate explained variance
        explained_variance = self.model.explained_variance_ratio_.tolist()
        cumulative_variance = np.cumsum(explained_variance).tolist()
        
        # Get component directions
        components = self.model.components_.tolist()
        
        # Transform data points
        transformed_points = []
        for i, point in enumerate(data_points):
            transformed_point = {
                'pc1': float(X_transformed[i, 0]),
                'original_x': point['x'],
                'original_y': point['y']
            }
            if n_components > 1:
                transformed_point['pc2'] = float(X_transformed[i, 1])
            if 'z' in point:
                transformed_point['original_z'] = point['z']
            if 'original_class' in point:
                transformed_point['original_class'] = point['original_class']
            
            transformed_points.append(transformed_point)
        
        result = {
            'transformed_points': transformed_points,
            'explained_variance': explained_variance,
            'cumulative_variance': cumulative_variance,
            'components': components,
            'n_components': n_components,
            'total_variance': float(np.sum(self.model.explained_variance_ratio_))
        }
        
        return result
    
    def analyze_dataset(self, dataset, n_components=2):
        """Perform PCA on a loaded dataset"""
        data = dataset['data']
        feature_names = dataset['feature_names']
        
        # Use all features for PCA
        X = np.array([point[:len(feature_names)] for point in data])
        
        data_points = []
        for i in range(len(X)):
            point = {'x': float(X[i, 0]), 'y': float(X[i, 1])}
            if len(feature_names) > 2:
                point['z'] = float(X[i, 2])
            if 'target' in dataset.get('columns', []):
                point['original_class'] = int(data[i][-1])
            data_points.append(point)
        
        return self.analyze(data_points, n_components)