# ml-models/crop-recommendation/train.py
# Train a Random Forest model for crop recommendation
# Uses synthetic dataset representative of Uttarakhand mountain farming

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# ── Generate synthetic training data ────────────────────────────────────────

def generate_dataset(n=2000):
    """
    Generate representative crop-altitude-temperature data for
    Himalayan farming conditions (Uttarakhand).
    """
    np.random.seed(42)
    records = []

    crop_profiles = [
        # (crop, soil_types, seasons, altitude_range, temp_range)
        ("rajma",         [1,3],    [0,1],  (1500,3000), (15,25)),
        ("apple",         [1,5],    [1,2],  (1500,3000), (5,20)),
        ("finger_millet", [1,2,4],  [0],    (1000,2500), (18,30)),
        ("potato",        [1,3,2],  [0,1],  (1200,3500), (10,22)),
        ("buckwheat",     [1,2,3],  [0,2],  (2000,4000), (5,20)),
        ("pea",           [1,3],    [1,2],  (1000,2500), (10,18)),
        ("garlic",        [1,5],    [1],    (800,2200),  (12,24)),
        ("barley",        [1,2,3],  [1],    (1500,3500), (8,20)),
    ]

    for crop, soils, seasons, alt_range, temp_range in crop_profiles:
        n_samples = n // len(crop_profiles)
        for _ in range(n_samples):
            soil = np.random.choice(soils)
            season = np.random.choice(seasons)
            altitude = np.random.randint(*alt_range)
            temp = np.random.uniform(*temp_range)
            rainfall = np.random.uniform(600, 1400)
            # Add some noise to make it realistic
            temp += np.random.normal(0, 2)
            records.append([soil, season, altitude, temp, rainfall, crop])

    df = pd.DataFrame(records, columns=["soil_type","season","altitude","temperature","rainfall","crop"])
    df = df.sample(frac=1).reset_index(drop=True)  # shuffle
    return df


# ── Train ────────────────────────────────────────────────────────────────────

def train():
    print("📊 Generating dataset...")
    df = generate_dataset(2000)
    df.to_csv("dataset.csv", index=False)
    print(f"   Dataset shape: {df.shape}")
    print(f"   Crops: {df['crop'].unique()}")

    X = df[["soil_type","season","altitude","temperature","rainfall"]].values
    y = df["crop"].values

    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(X, y_enc, test_size=0.2, random_state=42)

    print("\n🌲 Training Random Forest...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n✅ Accuracy: {acc:.2%}")
    print("\n📋 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    # Save model and label encoder
    joblib.dump(model, "model.pkl")
    joblib.dump(le, "label_encoder.pkl")
    print("\n💾 Model saved → model.pkl")
    print("💾 Label encoder saved → label_encoder.pkl")


if __name__ == "__main__":
    train()
