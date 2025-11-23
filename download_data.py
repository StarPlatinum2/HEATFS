"""
Dataset Download Script
=======================
This script downloads the Iris dataset and saves it as a CSV file.

The Iris dataset contains 150 samples of iris flowers with 4 features:
- Sepal Length (cm)
- Sepal Width (cm)
- Petal Length (cm)
- Petal Width (cm)

Perfect for unsupervised learning (clustering) experiments!
"""

import os
import pandas as pd
from sklearn.datasets import load_iris

def download_iris_dataset():
    """
    Downloads the Iris dataset and saves it as a CSV file.
    Creates the data/ folder if it doesn't exist.
    """
    
    print("=" * 50)
    print("Downloading Iris Dataset...")
    print("=" * 50)
    
    # Create data directory if it doesn't exist
    data_dir = "data"
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        print(f"✓ Created '{data_dir}/' folder")
    
    # Load the Iris dataset from scikit-learn
    # This is a built-in dataset, so no internet connection needed!
    iris = load_iris()
    
    # Create a DataFrame (table) with the data
    df = pd.DataFrame(
        data=iris.data,
        columns=iris.feature_names  # Column names for the 4 measurements
    )
    
    # Add the target species as a column (for reference only - we won't use it in unsupervised learning)
    df['species'] = iris.target
    
    # Map species numbers to names (0=setosa, 1=versicolor, 2=virginica)
    species_map = {0: 'setosa', 1: 'versicolor', 2: 'virginica'}
    df['species_name'] = df['species'].map(species_map)
    
    # Save to CSV file
    csv_path = os.path.join(data_dir, "iris.csv")
    df.to_csv(csv_path, index=False)
    
    print(f"✓ Dataset downloaded successfully!")
    print(f"✓ Saved to: {csv_path}")
    print(f"\nDataset Info:")
    print(f"  - Total samples: {len(df)}")
    print(f"  - Features: {len(iris.feature_names)}")
    print(f"  - Feature names: {', '.join(iris.feature_names)}")
    print(f"  - Species: {', '.join(species_map.values())}")
    print("\n" + "=" * 50)
    print("Ready to train! Run: python train_model.py")
    print("=" * 50)

if __name__ == "__main__":
    try:
        download_iris_dataset()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("Make sure you have scikit-learn installed: pip install scikit-learn")
