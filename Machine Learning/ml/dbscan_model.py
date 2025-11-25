import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN
from sklearn.datasets import make_moons, make_blobs
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import json

class DBSCANModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
    
    def generate_synthetic_data(self, n_clusters=3, n_samples=300):
        """Generate synthetic data for DBSCAN"""
        # Generate different cluster shapes
        if n_clusters == 2:
            # Moon-shaped clusters
            X, y = make_moons(n_samples=n_samples, noise=0.1, random_state=42)
        else:
            # Blob-shaped clusters with some noise
            X, y = make_blobs(n_samples=n_samples, centers=n_clusters, 
                             n_features=2, random_state=42, cluster_std=1.0)
            
            # Add some noise
            noise_points = np.random.uniform(-10, 10, (int(n_samples*0.1), 2))
            X = np.vstack([X, noise_points])
            y = np.hstack([y, -1 * np.ones(len(noise_points))])  # -1 for noise
        
        # Scale and shift data
        X = X * 5 + 50
        
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
            'n_samples': len(data_points)
        }
    
    def cluster(self, data_points, eps=0.5, min_samples=5):
        """Perform DBSCAN clustering on data points"""
        # Extract features
        X = np.array([[point['x'], point['y']] for point in data_points])
        
        # Scale the data
        X_scaled = self.scaler.fit_transform(X)
        
        # Perform DBSCAN clustering
        self.model = DBSCAN(eps=eps, min_samples=min_samples)
        labels = self.model.fit_predict(X_scaled)
        
        # Count clusters and noise points
        unique_labels = set(labels)
        n_clusters = len(unique_labels) - (1 if -1 in unique_labels else 0)
        n_noise = list(labels).count(-1)
        
        # Calculate metrics (if there are clusters)
        if n_clusters > 0:
            # Filter out noise for silhouette score
            non_noise_mask = labels != -1
            if sum(non_noise_mask) > 1 and len(set(labels[non_noise_mask])) > 1:
                silhouette = float(silhouette_score(X_scaled[non_noise_mask], labels[non_noise_mask]))
            else:
                silhouette = -1
        else:
            silhouette = -1
        
        # Prepare cluster information
        clusters = []
        for label in unique_labels:
            if label == -1:
                continue  # Skip noise points
            
            cluster_points = [i for i, l in enumerate(labels) if l == label]
            
            # Calculate cluster center
            cluster_data = X[cluster_points]
            center = np.mean(cluster_data, axis=0)
            
            clusters.append({
                'id': int(label),
                'center': {
                    'x': float(center[0]),
                    'y': float(center[1])
                },
                'size': len(cluster_points),
                'points': cluster_points
            })
        
        # Update data points with predicted clusters
        for i, point in enumerate(data_points):
            point['predicted_cluster'] = int(labels[i])
            point['is_noise'] = (labels[i] == -1)
        
        result = {
            'clusters': clusters,
            'data_points': data_points,
            'noise_points': n_noise,
            'total_points': len(data_points),
            'n_clusters_found': n_clusters,
            'metrics': {
                'silhouette_score': silhouette
            },
            'model_params': {
                'eps': eps,
                'min_samples': min_samples
            }
        }
        
        return result
    
    def cluster_dataset(self, dataset, eps=0.5, min_samples=5):
        """Perform DBSCAN on a loaded dataset"""
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
        
        return self.cluster(data_points, eps, min_samples)