"""
Unsupervised Machine Learning Training Script
==============================================
This script demonstrates K-Means clustering on the Iris dataset.

Steps:
1. Load the dataset
2. Clean and preprocess data
3. Train K-Means clustering model
4. Evaluate using silhouette score
5. Save the trained model

Note: In unsupervised learning, we don't split into train/test sets the same way
as supervised learning. We use the entire dataset to find patterns.
"""

import os
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import joblib
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

# ==========================================
# STEP 1: LOAD THE DATASET
# ==========================================
print("\n" + "=" * 60)
print("UNSUPERVISED MACHINE LEARNING - K-MEANS CLUSTERING")
print("=" * 60)

print("\nLoading dataset...")

# Check if dataset exists
if not os.path.exists("data/iris.csv"):
    print("❌ Error: Dataset not found!")
    print("Please run: python download_data.py")
    exit()

# Load the CSV file
df = pd.read_csv("data/iris.csv")
print(f"✓ Dataset loaded successfully! Shape: {df.shape}")
print(f"  (Rows: {df.shape[0]}, Columns: {df.shape[1]})")

# Display first few rows to understand the data
print("\nFirst 5 rows of the dataset:")
print(df.head())

# ==========================================
# STEP 2: DATA CLEANING & PREPROCESSING
# ==========================================
print("\n" + "-" * 60)
print("Data Cleaning & Preprocessing...")
print("-" * 60)

# Select only the numerical features (exclude species columns)
# We only want the 4 measurements for clustering
feature_columns = [
    'sepal length (cm)',
    'sepal width (cm)',
    'petal length (cm)',
    'petal width (cm)'
]

X = df[feature_columns].copy()

# Check for missing values
missing_count = X.isnull().sum().sum()
print(f"Missing values: {missing_count}")

if missing_count > 0:
    print("⚠ Filling missing values with column mean...")
    X = X.fillna(X.mean())
    print("✓ Missing values handled!")

# Check for invalid values (infinity, NaN)
if np.isinf(X.values).any():
    print("⚠ Removing infinite values...")
    X = X.replace([np.inf, -np.inf], np.nan)
    X = X.fillna(X.mean())
    print("✓ Invalid values handled!")

print(f"\nFinal data shape: {X.shape}")
print("\nData statistics:")
print(X.describe())

# FEATURE SCALING
# Very important for clustering! Features must be on the same scale
# Otherwise, features with larger values will dominate the clustering
print("\n" + "-" * 60)
print("Scaling features...")
print("-" * 60)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print("✓ Data scaled successfully!")
print("  (All features now have mean=0 and std=1)")

# ==========================================
# STEP 3: TRAIN K-MEANS CLUSTERING MODEL
# ==========================================
print("\n" + "-" * 60)
print("Training K-Means Clustering Model...")
print("-" * 60)

# K-Means parameters:
# - n_clusters=3: We want to find 3 groups (we know Iris has 3 species)
# - random_state=42: For reproducible results
# - n_init=10: Run algorithm 10 times and pick best result
# - max_iter=300: Maximum iterations to converge

n_clusters = 3
print(f"Number of clusters: {n_clusters}")

model = KMeans(
    n_clusters=n_clusters,
    random_state=42,
    n_init=10,
    max_iter=300
)

# Train the model (find cluster centers)
model.fit(X_scaled)

print("✓ Model trained successfully!")
print(f"  Iterations to converge: {model.n_iter_}")

# Get cluster assignments for all data points
cluster_labels = model.predict(X_scaled)

# ==========================================
# STEP 4: MODEL EVALUATION
# ==========================================
print("\n" + "-" * 60)
print("Model Evaluation:")
print("-" * 60)

# Silhouette Score measures how well-separated the clusters are
# Score ranges from -1 to 1:
#   - Close to 1: Well-separated clusters (excellent)
#   - Close to 0: Overlapping clusters (poor)
#   - Negative: Points might be in wrong clusters (very poor)

silhouette_avg = silhouette_score(X_scaled, cluster_labels)
print(f"Silhouette Score: {silhouette_avg:.4f}")
print(f"  (Range: -1 to 1, Higher is better)")

if silhouette_avg > 0.5:
    print("  ✓ Excellent clustering!")
elif silhouette_avg > 0.3:
    print("  ✓ Good clustering!")
else:
    print("  ⚠ Moderate clustering - clusters may overlap")

# Show cluster distribution
print("\nCluster Distribution:")
unique, counts = np.unique(cluster_labels, return_counts=True)
for cluster_id, count in zip(unique, counts):
    percentage = (count / len(cluster_labels)) * 100
    print(f"  Cluster {cluster_id}: {count} samples ({percentage:.1f}%)")

# Show cluster centers (in original scale)
print("\nCluster Centers (Original Scale):")
cluster_centers_original = scaler.inverse_transform(model.cluster_centers_)
centers_df = pd.DataFrame(
    cluster_centers_original,
    columns=feature_columns,
    index=[f"Cluster {i}" for i in range(n_clusters)]
)
print(centers_df.round(2))

# ==========================================
# STEP 5: SAVE THE MODEL
# ==========================================
print("\n" + "-" * 60)
print("Saving Model...")
print("-" * 60)

# Create models directory if it doesn't exist
models_dir = "models"
if not os.path.exists(models_dir):
    os.makedirs(models_dir)
    print(f"✓ Created '{models_dir}/' folder")

# Save the trained model
model_path = os.path.join(models_dir, "kmeans_model.pkl")
joblib.dump(model, model_path)
print(f"✓ Model saved: {model_path}")

# Save the scaler (very important!)
# We need the same scaler for predictions
scaler_path = os.path.join(models_dir, "scaler.pkl")
joblib.dump(scaler, scaler_path)
print(f"✓ Scaler saved: {scaler_path}")

# ==========================================
# TRAINING COMPLETE!
# ==========================================
print("\n" + "=" * 60)
print("TRAINING COMPLETE!")
print("=" * 60)
print("\nNext Step: Run predictions!")
print("Command: python predict.py")
print("\nYou can now classify new iris flowers into clusters.")
print("=" * 60 + "\n")
