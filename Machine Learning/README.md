# Beginner-Friendly Unsupervised Machine Learning Starter Kit

This project demonstrates **unsupervised learning** using K-Means clustering on the Iris dataset. You'll learn how to group data into clusters without labeled categories.

## 📚 What is Unsupervised Learning?

Unlike supervised learning (where we know the answers), unsupervised learning finds hidden patterns in data without labels. We use **K-Means Clustering** to group similar flowers together based on their measurements.

## 🎯 Dataset

We're using the classic **Iris Dataset** (150 flower samples with 4 measurements: sepal length, sepal width, petal length, petal width). The model will discover 3 natural groups in the data.

## 🚀 Setup Instructions

### Step 1: Install Python
Make sure you have Python 3.8 or higher installed. Check with:
```bash
python --version
```

### Step 2: Create Project Folder
```bash
mkdir ml-unsupervised-project
cd ml-unsupervised-project
```

### Step 3: Install Required Packages
```bash
pip install -r requirements.txt
```

Or install individually:
```bash
pip install pandas numpy scikit-learn matplotlib seaborn joblib
```

### Step 4: Download the Dataset
Run the download script:
```bash
python download_data.py
```

This will download the Iris dataset and save it as `iris.csv` in the `data/` folder.

## 📂 Project Structure
```
ml-unsupervised-project/
│
├── data/
│   └── iris.csv                 # Downloaded dataset
│
├── models/
│   ├── kmeans_model.pkl         # Saved trained model
│   └── scaler.pkl               # Saved data scaler
│
├── train_model.py               # Main training script
├── predict.py                   # Real-time prediction script
├── download_data.py             # Dataset download script
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## 🎓 How to Use

### 1. Train the Model
Run the training script to:
- Load and clean the data
- Preprocess (scale) the features
- Train K-Means clustering model
- Evaluate using silhouette score
- Save the model and scaler

```bash
python train_model.py
```

**Expected Output:**
```
Loading dataset...
Dataset loaded successfully! Shape: (150, 5)

Data Cleaning & Preprocessing...
Missing values: 0
Data scaled successfully!

Training K-Means Clustering Model...
Model trained successfully!

Model Evaluation:
Silhouette Score: 0.55 (Higher is better, range: -1 to 1)

Model saved successfully!
Training complete!
```

### 2. Make Predictions
Run the prediction script to classify new flowers into clusters:

```bash
python predict.py
```

**Example Interaction:**
```
=== Iris Flower Cluster Predictor ===

Enter flower measurements:
Sepal Length (cm): 5.1
Sepal Width (cm): 3.5
Petal Length (cm): 1.4
Petal Width (cm): 0.2

PREDICTION RESULT:
This flower belongs to Cluster: 0
(Clusters range from 0-2, representing different flower groups)

Predict another flower? (yes/no): no
Thank you for using the predictor!
```

## 📊 Understanding the Results

### Silhouette Score
- **Range:** -1 to 1
- **Higher is better:** Close to 1 means well-separated clusters
- **Around 0:** Overlapping clusters
- **Negative:** Might be assigned to wrong cluster

Typical Iris clustering scores: 0.45 - 0.65

### Clusters
The model groups flowers into 3 clusters:
- **Cluster 0:** Typically Setosa (smallest petals)
- **Cluster 1:** Typically Versicolor (medium petals)
- **Cluster 2:** Typically Virginica (largest petals)

*Note: Cluster numbers are arbitrary - the model doesn't know flower species names.*

## 🔍 What Each Script Does

### `download_data.py`
- Downloads the Iris dataset from scikit-learn
- Saves it as a CSV file for easy loading
- Creates the `data/` folder automatically

### `train_model.py`
- **Loads data:** Reads the CSV file
- **Cleans data:** Checks for missing/invalid values
- **Preprocesses:** Scales features (StandardScaler) so all measurements are comparable
- **Trains model:** Uses K-Means to find 3 clusters
- **Evaluates:** Calculates silhouette score
- **Saves:** Stores model and scaler for later use

### `predict.py`
- **Loads model:** Retrieves saved model and scaler
- **Gets input:** Asks user for flower measurements
- **Preprocesses:** Scales input using saved scaler
- **Predicts:** Assigns flower to a cluster
- **Displays result:** Shows which cluster (0, 1, or 2)

## 🎯 Learning Goals

After completing this project, you'll understand:
- ✅ What unsupervised learning is
- ✅ How K-Means clustering works
- ✅ Data preprocessing and scaling
- ✅ Model training and evaluation
- ✅ Saving and loading models
- ✅ Making real-time predictions

## 🚨 Common Issues & Solutions

### Issue: "ModuleNotFoundError"
**Solution:** Install missing packages:
```bash
pip install [package-name]
```

### Issue: "FileNotFoundError: data/iris.csv"
**Solution:** Run the download script first:
```bash
python download_data.py
```

### Issue: "No module named 'sklearn'"
**Solution:** Install scikit-learn:
```bash
pip install scikit-learn
```

### Issue: Predictions seem random
**Solution:** This is normal for unsupervised learning! Cluster numbers don't correspond to specific species - they just group similar flowers.

## 📈 Next Steps

Want to learn more? Try:
1. **Change cluster count:** Modify `n_clusters=3` in `train_model.py`
2. **Visualize clusters:** Add matplotlib plots to see the groups
3. **Try different datasets:** Use customer segmentation or image clustering
4. **Compare algorithms:** Try DBSCAN or Hierarchical Clustering

## 📚 Additional Resources

- [Scikit-learn K-Means Documentation](https://scikit-learn.org/stable/modules/clustering.html#k-means)
- [Understanding Unsupervised Learning](https://scikit-learn.org/stable/unsupervised_learning.html)
- [Iris Dataset Information](https://archive.ics.uci.edu/ml/datasets/iris)

## 🤝 Support

If you have questions or need help:
1. Read the comments in each script
2. Check the "Common Issues" section above
3. Review the scikit-learn documentation

Happy Learning! 🎉
