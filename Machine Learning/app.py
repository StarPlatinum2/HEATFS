from flask import Flask, render_template, request, jsonify, send_file
import json
import numpy as np
import pandas as pd
from ml.kmeans_model import KMeansModel
from ml.pca_model import PCAModel
from ml.dbscan_model import DBSCANModel
from ml.data_loader import DataLoader
import os

app = Flask(__name__)
app.config.from_pyfile('config.py')

# Initialize models
kmeans_model = KMeansModel()
pca_model = PCAModel()
dbscan_model = DBSCANModel()
data_loader = DataLoader()

@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@app.route('/kmeans')
def kmeans_page():
    return render_template('kmeans.html')

@app.route('/pca')
def pca_page():
    return render_template('pca.html')

@app.route('/dbscan')
def dbscan_page():
    return render_template('dbscan.html')

# K-Means API endpoints
@app.route('/api/kmeans/generate_data', methods=['POST'])
def kmeans_generate_data():
    try:
        data = request.json
        n_clusters = data.get('n_clusters', 4)
        n_samples = data.get('n_samples', 300)
        
        result = kmeans_model.generate_synthetic_data(n_clusters, n_samples)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/kmeans/train', methods=['POST'])
def kmeans_train():
    try:
        data = request.json
        n_clusters = data.get('n_clusters', 4)
        data_points = data.get('data_points')
        
        if data_points:
            result = kmeans_model.train(data_points, n_clusters)
        else:
            dataset_name = data.get('dataset', 'synthetic')
            dataset = data_loader.load_dataset(dataset_name)
            result = kmeans_model.train_from_dataset(dataset, n_clusters)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# PCA API endpoints
@app.route('/api/pca/generate_data', methods=['POST'])
def pca_generate_data():
    try:
        data = request.json
        n_samples = data.get('n_samples', 100)
        
        result = pca_model.generate_synthetic_data(n_samples)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pca/analyze', methods=['POST'])
def pca_analyze():
    try:
        data = request.json
        data_points = data.get('data_points')
        n_components = data.get('n_components', 2)
        
        if data_points:
            result = pca_model.analyze(data_points, n_components)
        else:
            dataset_name = data.get('dataset', 'synthetic')
            dataset = data_loader.load_dataset(dataset_name)
            result = pca_model.analyze_dataset(dataset, n_components)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# DBSCAN API endpoints
@app.route('/api/dbscan/generate_data', methods=['POST'])
def dbscan_generate_data():
    try:
        data = request.json
        n_clusters = data.get('n_clusters', 3)
        n_samples = data.get('n_samples', 300)
        
        result = dbscan_model.generate_synthetic_data(n_clusters, n_samples)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dbscan/cluster', methods=['POST'])
def dbscan_cluster():
    try:
        data = request.json
        data_points = data.get('data_points')
        eps = data.get('eps', 0.5)
        min_samples = data.get('min_samples', 5)
        
        if data_points:
            result = dbscan_model.cluster(data_points, eps, min_samples)
        else:
            dataset_name = data.get('dataset', 'synthetic')
            dataset = data_loader.load_dataset(dataset_name)
            result = dbscan_model.cluster_dataset(dataset, eps, min_samples)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Dataset endpoints
@app.route('/api/datasets')
def get_datasets():
    datasets = data_loader.get_available_datasets()
    return jsonify(datasets)

@app.route('/api/upload_dataset', methods=['POST'])
def upload_dataset():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and file.filename.endswith('.csv'):
            filename = file.filename
            filepath = os.path.join('data/datasets', filename)
            file.save(filepath)
            
            # Validate the dataset
            dataset = data_loader.load_custom_dataset(filename)
            return jsonify({
                'message': 'Dataset uploaded successfully',
                'dataset': dataset['name'],
                'columns': dataset['columns'],
                'sample_size': dataset['sample_size']
            })
        else:
            return jsonify({'error': 'Only CSV files are supported'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
