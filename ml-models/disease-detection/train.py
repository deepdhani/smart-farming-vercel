# ml-models/disease-detection/train.py
# Train CNN for plant disease classification using TensorFlow/Keras
# Compatible with PlantVillage dataset structure

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
import os

# ── Config ───────────────────────────────────────────────────────────────────

IMG_SIZE    = 224
BATCH_SIZE  = 32
EPOCHS      = 30
NUM_CLASSES = 12   # see disease labels in routes/disease.py

DATASET_DIR = "../../datasets/plant_disease"   # PlantVillage dataset path
MODEL_SAVE  = "model/plant_disease_cnn.h5"

os.makedirs("model", exist_ok=True)


# ── Data generators ──────────────────────────────────────────────────────────

def build_generators():
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.15,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode="nearest",
        validation_split=0.2
    )

    train_gen = train_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="training"
    )

    val_gen = train_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="validation"
    )

    return train_gen, val_gen


# ── Model architecture (Transfer Learning with MobileNetV2) ─────────────────

def build_model(num_classes: int):
    """
    MobileNetV2 base (lightweight, suitable for deployment on low-resource devices)
    with custom classification head.
    """
    base = tf.keras.applications.MobileNetV2(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights="imagenet"
    )
    # Freeze base layers initially
    base.trainable = False

    model = models.Sequential([
        base,
        layers.GlobalAveragePooling2D(),
        layers.BatchNormalization(),
        layers.Dense(256, activation="relu"),
        layers.Dropout(0.4),
        layers.Dense(128, activation="relu"),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation="softmax")
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model


# ── Training ─────────────────────────────────────────────────────────────────

def train():
    print("📁 Loading dataset from:", DATASET_DIR)
    if not os.path.exists(DATASET_DIR):
        print("⚠️  Dataset not found. Download PlantVillage from:")
        print("   https://www.kaggle.com/datasets/emmarex/plantdisease")
        print("   Place in datasets/plant_disease/ with class subdirectories")
        return

    train_gen, val_gen = build_generators()
    actual_classes = train_gen.num_classes
    print(f"   Found {actual_classes} classes, {train_gen.samples} training images")

    model = build_model(actual_classes)
    model.summary()

    callbacks = [
        EarlyStopping(patience=5, restore_best_weights=True, monitor="val_accuracy"),
        ModelCheckpoint(MODEL_SAVE, save_best_only=True, monitor="val_accuracy"),
        ReduceLROnPlateau(factor=0.2, patience=3, min_lr=1e-6),
    ]

    # Phase 1: Train head only
    print("\n🔥 Phase 1: Training classification head...")
    model.fit(train_gen, epochs=10, validation_data=val_gen, callbacks=callbacks)

    # Phase 2: Fine-tune top layers of base
    print("\n🔧 Phase 2: Fine-tuning top layers...")
    model.layers[0].trainable = True
    for layer in model.layers[0].layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    model.fit(train_gen, epochs=EPOCHS, validation_data=val_gen, callbacks=callbacks)

    val_loss, val_acc = model.evaluate(val_gen)
    print(f"\n✅ Final Validation Accuracy: {val_acc:.2%}")
    print(f"💾 Model saved → {MODEL_SAVE}")


if __name__ == "__main__":
    train()
