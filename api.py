from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI()

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- LOAD MODEL & SCALER ----------
model = joblib.load("models/kmeans_model.pkl")
scaler = joblib.load("models/scaler.pkl")

# ---------- INPUT SCHEMA ----------
class FlowerInput(BaseModel):
    sepal_length: float
    sepal_width: float
    petal_length: float
    petal_width: float

# ---------- PREDICT ROUTE ----------
@app.post("/predict")
def predict(flower: FlowerInput):
    features = np.array([[flower.sepal_length, flower.sepal_width,
                          flower.petal_length, flower.petal_width]])
    scaled = scaler.transform(features)
    cluster = int(model.predict(scaled)[0])
    distance = float(model.transform(scaled)[0][cluster])
    return {"cluster": cluster, "distance": round(distance, 4)}