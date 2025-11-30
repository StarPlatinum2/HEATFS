import tensorflow as tf
from tensorflow.keras import layers
import numpy as np

class TensorFlowCNN(tf.keras.Model):
    def __init__(self, num_classes=10, dropout_rate=0.3):
        super(TensorFlowCNN, self).__init__()
        
        # Convolutional layers
        self.conv1 = layers.Conv2D(32, (3, 3), activation='relu', padding='same')
        self.pool1 = layers.MaxPooling2D((2, 2))
        self.conv2 = layers.Conv2D(64, (3, 3), activation='relu', padding='same')
        self.pool2 = layers.MaxPooling2D((2, 2))
        self.conv3 = layers.Conv2D(128, (3, 3), activation='relu', padding='same')
        self.pool3 = layers.MaxPooling2D((2, 2))
        
        # Fully connected layers
        self.flatten = layers.Flatten()
        self.fc1 = layers.Dense(512, activation='relu')
        self.dropout = layers.Dropout(dropout_rate)
        self.fc2 = layers.Dense(num_classes, activation='softmax')
        
        # Additional layers for regularization
        self.batch_norm1 = layers.BatchNormalization()
        self.batch_norm2 = layers.BatchNormalization()
        self.batch_norm3 = layers.BatchNormalization()
    
    def call(self, inputs, training=False):
        # Convolutional block 1
        x = self.conv1(inputs)
        x = self.batch_norm1(x, training=training)
        x = self.pool1(x)
        
        # Convolutional block 2
        x = self.conv2(x)
        x = self.batch_norm2(x, training=training)
        x = self.pool2(x)
        
        # Convolutional block 3
        x = self.conv3(x)
        x = self.batch_norm3(x, training=training)
        x = self.pool3(x)
        
        # Fully connected layers
        x = self.flatten(x)
        x = self.fc1(x)
        x = self.dropout(x, training=training)
        output = self.fc2(x)
        
        return output
    
    def build_graph(self, input_shape):
        """Build the model graph"""
        x = tf.keras.Input(shape=input_shape)
        return tf.keras.Model(inputs=[x], outputs=self.call(x))

def create_tensorflow_custom_model(input_shape=(32, 32, 3), num_classes=10, dropout_rate=0.3):
    """Factory function to create TensorFlow model"""
    return TensorFlowCNN(num_classes=num_classes, dropout_rate=dropout_rate)

# Alternative functional API implementation
def create_tensorflow_functional_model(input_shape=(32, 32, 3), num_classes=10, dropout_rate=0.3):
    """Create model using TensorFlow Functional API"""
    inputs = tf.keras.Input(shape=input_shape)
    
    # First convolutional block
    x = layers.Conv2D(32, 3, activation='relu', padding='same')(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D()(x)
    
    # Second convolutional block
    x = layers.Conv2D(64, 3, activation='relu', padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D()(x)
    
    # Third convolutional block
    x = layers.Conv2D(128, 3, activation='relu', padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D()(x)
    
    # Fully connected layers
    x = layers.Flatten()(x)
    x = layers.Dense(512, activation='relu')(x)
    x = layers.Dropout(dropout_rate)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)
    
    model = tf.keras.Model(inputs=inputs, outputs=outputs)
    return model
