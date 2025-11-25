import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler
import json

class KMeansModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.history = []
    
    def generate_synthetic_data(self, n_clusters=4, n_samples=300):
        """Generate synthetic data for K-Means"""
        X, y = make_blobs(n_samples=n_samples, centers=n_clusters, 
                          n_features=2, random_state=42, cluster_std=1.5)
        
        data_points = []
        for i in range(len(X)):
            data_points.append({
                'x': float(X[i, 0]),
                'y': float(X[i, 1]),
                'true_cluster': int(y[i])
            })
        
        return {
            'data_points': data_points,
            'n_clusters': n_clusters,
            'n_samples': n_samples
        }
    
    def train(self, data_points, n_clusters=4):
        """Train K-Means model on provided data points"""
        # Extract features from data points
        X = np.array([[point['x'], point['y']] for point in data_points])
        
        # Scale the data
        X_scaled = self.scaler.fit_transform(X)
        
        # Train K-Means
        self.model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = self.model.fit_predict(X_scaled)
        
        # Calculate metrics
        inertia = float(self.model.inertia_)
        silhouette = float(silhouette_score(X_scaled, labels))
        
        # Get cluster centers (in original scale)
        centers_scaled = self.model.cluster_centers_
        centers_original = self.scaler.inverse_transform(centers_scaled)
        
        # Prepare results
        clusters = []
        for i in range(n_clusters):
            cluster_points = [j for j, label in enumerate(labels) if label == i]
            clusters.append({
                'id': i,
                'center': {
                    'x': float(centers_original[i, 0]),
                    'y': float(centers_original[i, 1])
                },
                'size': len(cluster_points),
                'points': cluster_points
            })
        
        # Update data points with predicted clusters
        for i, point in enumerate(data_points):
            point['predicted_cluster'] = int(labels[i])
        
        result = {
            'clusters': clusters,
            'data_points': data_points,
            'metrics': {
                'inertia': inertia,
                'silhouette_score': silhouette
            },
            'model_params': {
                'n_clusters': n_clusters,
                'n_iter': self.model.n_iter_
            }
        }
        
        # Save to history
        self.history.append(result)
        
        return result
    
    def train_from_dataset(self, dataset, n_clusters=4):
        """Train K-Means on a loaded dataset"""
        data = dataset['data']
        feature_names = dataset['feature_names']
        
        # Use first two features for 2D visualization
        if len(feature_names) >= 2:
            X = np.array([point[:2] for point in data])
        else:
            X = np.array([point for point in data])
        
        data_points = []
        for i in range(len(X)):
            point = {'x': float(X[i, 0]), 'y': float(X[i, 1])}
            if 'target' in dataset.get('columns', []):
                point['true_cluster'] = int(data[i][-1])
            data_points.append(point)
        
        return self.train(data_points, n_clusters)
    
    def find_optimal_clusters(self, data_points, max_k=10):
        """Find optimal number of clusters using elbow method"""
        X = np.array([[point['x'], point['y']] for point in data_points])
        X_scaled = self.scaler.fit_transform(X)
        
        inertias = []
        silhouette_scores = []
        
        for k in range(2, max_k + 1):
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = kmeans.fit_predict(X_scaled)
            
            inertias.append(float(kmeans.inertia_))
            silhouette_scores.append(float(silhouette_score(X_scaled, labels)))
        
        return {
            'inertias': inertias,
            'silhouette_scores': silhouette_scores,
            'k_values': list(range(2, max_k + 1))
        }