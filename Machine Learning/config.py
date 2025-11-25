import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Secret key for session management
SECRET_KEY = 'your-secret-key-here'

# Data paths
DATA_PATH = os.path.join(BASE_DIR, 'data')
DATASETS_PATH = os.path.join(DATA_PATH, 'datasets')
RESULTS_PATH = os.path.join(DATA_PATH, 'results')

# Model configurations
KMEANS_MAX_ITER = 300
PCA_MAX_COMPONENTS = 10
DBSCAN_MAX_EPS = 2.0
DBSCAN_MAX_SAMPLES = 20

# Create directories if they don't exist
os.makedirs(DATASETS_PATH, exist_ok=True)
os.makedirs(RESULTS_PATH, exist_ok=True)