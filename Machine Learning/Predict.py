"""
Real-Time Prediction Script
============================
This script loads the trained K-Means clustering model and makes
predictions on new iris flower measurements.

The model will assign each flower to one of 3 clusters based on
similarity to the cluster centers.
"""

import os
import numpy as np
import joblib
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

def load_model():
    """
    Load the trained model and scaler from files.
    Returns the model and scaler, or exits if files not found.
    """
    model_path = "models/kmeans_model.pkl"
    scaler_path = "models/scaler.pkl"
    
    # Check if model files exist
    if not os.path.exists(model_path):
        print("❌ Error: Model not found!")
        print("Please train the model first: python train_model.py")
        exit()
    
    if not os.path.exists(scaler_path):
        print("❌ Error: Scaler not found!")
        print("Please train the model first: python train_model.py")
        exit()
    
    # Load model and scaler
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    
    return model, scaler

def get_user_input():
    """
    Get iris flower measurements from the user.
    Returns a numpy array with the 4 measurements.
    """
    print("\nEnter flower measurements:")
    print("-" * 40)
    
    try:
        # Get each measurement from the user
        sepal_length = float(input("Sepal Length (cm): "))
        sepal_width = float(input("Sepal Width (cm): "))
        petal_length = float(input("Petal Length (cm): "))
        petal_width = float(input("Petal Width (cm): "))
        
        # Validate inputs (basic sanity checks)
        if any(val <= 0 or val > 20 for val in [sepal_length, sepal_width, petal_length, petal_width]):
            print("\n⚠ Warning: Unusual values detected!")
            print("  Typical ranges: 0.1 - 8.0 cm for all measurements")
            proceed = input("  Continue anyway? (yes/no): ").lower()
            if proceed != 'yes':
                return None
        
        # Create feature array (same order as training data)
        features = np.array([[sepal_length, sepal_width, petal_length, petal_width]])
        
        return features
    
    except ValueError:
        print("\n❌ Error: Please enter valid numbers!")
        return None
    except KeyboardInterrupt:
        print("\n\nPrediction cancelled by user.")
        return None

def predict_cluster(model, scaler, features):
    """
    Predict the cluster for given features.
    
    Args:
        model: Trained K-Means model
        scaler: Fitted StandardScaler
        features: Numpy array with shape (1, 4)
    
    Returns:
        cluster_id: Integer (0, 1, or 2)
        distance: Distance to cluster center
    """
    # Scale the features (MUST use the same scaler as training!)
    features_scaled = scaler.transform(features)
    
    # Predict the cluster
    cluster_id = model.predict(features_scaled)[0]
    
    # Calculate distance to cluster center (confidence indicator)
    distances = model.transform(features_scaled)[0]
    distance_to_center = distances[cluster_id]
    
    return cluster_id, distance_to_center

def display_prediction(features, cluster_id, distance):
    """
    Display the prediction result in a user-friendly format.
    """
    print("\n" + "=" * 60)
    print("PREDICTION RESULT")
    print("=" * 60)
    
    print("\nInput Features:")
    print(f"  Sepal Length: {features[0][0]:.2f} cm")
    print(f"  Sepal Width:  {features[0][1]:.2f} cm")
    print(f"  Petal Length: {features[0][2]:.2f} cm")
    print(f"  Petal Width:  {features[0][3]:.2f} cm")
    
    print(f"\n🎯 Predicted Cluster: {cluster_id}")
    print(f"   (Clusters range from 0 to 2)")
    
    print(f"\n📏 Distance to Cluster Center: {distance:.4f}")
    if distance < 1.0:
        print("   ✓ High confidence - very close to cluster center")
    elif distance < 2.0:
        print("   ✓ Good confidence - moderately close to cluster center")
    else:
        print("   ⚠ Lower confidence - further from cluster center")
    
    print("\n💡 Interpretation:")
    print("   This flower is most similar to flowers in Cluster " + str(cluster_id) + ".")
    print("   Flowers in the same cluster share similar characteristics.")
    
    print("\n" + "=" * 60)

def main():
    """
    Main function to run the prediction loop.
    """
    print("\n" + "=" * 60)
    print("IRIS FLOWER CLUSTER PREDICTOR")
    print("=" * 60)
    print("\nThis tool predicts which cluster an iris flower belongs to")
    print("based on its measurements (unsupervised learning).")
    
    # Load the trained model and scaler
    print("\nLoading trained model...")
    model, scaler = load_model()
    print("✓ Model loaded successfully!")
    print(f"✓ Model type: K-Means with {model.n_clusters} clusters")
    
    # Prediction loop
    while True:
        # Get user input
        features = get_user_input()
        
        if features is None:
            continue
        
        # Make prediction
        cluster_id, distance = predict_cluster(model, scaler, features)
        
        # Display result
        display_prediction(features, cluster_id, distance)
        
        # Ask if user wants to predict another
        print("\n" + "-" * 60)
        another = input("Predict another flower? (yes/no): ").lower()
        
        if another not in ['yes', 'y']:
            break
    
    print("\n" + "=" * 60)
    print("Thank you for using the Iris Cluster Predictor!")
    print("=" * 60 + "\n")

# ==========================================
# EXAMPLE INPUTS (for testing)
# ==========================================
"""
Here are some example inputs you can try:

Example 1 - Typical Setosa (small petals):
  Sepal Length: 5.1
  Sepal Width: 3.5
  Petal Length: 1.4
  Petal Width: 0.2

Example 2 - Typical Versicolor (medium petals):
  Sepal Length: 5.9
  Sepal Width: 3.0
  Petal Length: 4.2
  Petal Width: 1.5

Example 3 - Typical Virginica (large petals):
  Sepal Length: 6.5
  Sepal Width: 3.0
  Petal Length: 5.5
  Petal Width: 1.8
"""

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nProgram terminated by user. Goodbye!")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        print("Please make sure you've trained the model first: python train_model.py")
