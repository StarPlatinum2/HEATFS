import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
from tqdm import tqdm
import time
import os

class TensorFlowTrainer:
    def __init__(self, model, model_name="tensorflow_model"):
        self.model = model
        self.model_name = model_name
        self.history = {
            'train_loss': [],
            'train_accuracy': [],
            'val_loss': [],
            'val_accuracy': [],
            'learning_rates': []
        }
        
        # Create checkpoints directory
        self.checkpoint_dir = f'checkpoints/{model_name}'
        os.makedirs(self.checkpoint_dir, exist_ok=True)
    
    def compile_model(self, learning_rate=0.001, optimizer='adam'):
        """Compile the model with specified optimizer and learning rate"""
        if optimizer.lower() == 'adam':
            opt = tf.keras.optimizers.Adam(learning_rate=learning_rate)
        elif optimizer.lower() == 'sgd':
            opt = tf.keras.optimizers.SGD(learning_rate=learning_rate, momentum=0.9)
        elif optimizer.lower() == 'rmsprop':
            opt = tf.keras.optimizers.RMSprop(learning_rate=learning_rate)
        else:
            opt = tf.keras.optimizers.Adam(learning_rate=learning_rate)
        
        self.model.compile(
            optimizer=opt,
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        # Learning rate scheduler
        self.lr_scheduler = tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-7,
            verbose=1
        )
        
        # Model checkpoint
        self.checkpoint_callback = tf.keras.callbacks.ModelCheckpoint(
            filepath=os.path.join(self.checkpoint_dir, 'best_model.h5'),
            monitor='val_accuracy',
            save_best_only=True,
            save_weights_only=False,
            verbose=1
        )
    
    def train_with_custom_loop(self, train_dataset, val_dataset, epochs=10):
        """Custom training loop with more control"""
        print("Starting custom training loop...")
        
        # Define loss function and metrics
        loss_fn = tf.keras.losses.CategoricalCrossentropy()
        train_acc_metric = tf.keras.metrics.CategoricalAccuracy()
        val_acc_metric = tf.keras.metrics.CategoricalAccuracy()
        
        for epoch in range(epochs):
            print(f"\nEpoch {epoch + 1}/{epochs}")
            start_time = time.time()
            
            # Training phase
            train_losses = []
            for step, (x_batch, y_batch) in enumerate(train_dataset):
                with tf.GradientTape() as tape:
                    logits = self.model(x_batch, training=True)
                    loss_value = loss_fn(y_batch, logits)
                
                grads = tape.gradient(loss_value, self.model.trainable_weights)
                self.model.optimizer.apply_gradients(
                    zip(grads, self.model.trainable_weights)
                )
                
                train_acc_metric.update_state(y_batch, logits)
                train_losses.append(loss_value.numpy())
                
                if step % 100 == 0:
                    print(f"Step {step}, Loss: {loss_value.numpy():.4f}")
            
            # Calculate training metrics
            train_acc = train_acc_metric.result()
            train_loss = np.mean(train_losses)
            
            # Validation phase
            val_losses = []
            for x_batch, y_batch in val_dataset:
                val_logits = self.model(x_batch, training=False)
                val_loss = loss_fn(y_batch, val_logits)
                val_losses.append(val_loss.numpy())
                val_acc_metric.update_state(y_batch, val_logits)
            
            # Calculate validation metrics
            val_acc = val_acc_metric.result()
            val_loss = np.mean(val_losses)
            
            # Store history
            self.history['train_loss'].append(train_loss)
            self.history['train_accuracy'].append(train_acc.numpy())
            self.history['val_loss'].append(val_loss)
            self.history['val_accuracy'].append(val_acc.numpy())
            self.history['learning_rates'].append(
                self.model.optimizer.learning_rate.numpy()
            )
            
            # Reset metrics
            train_acc_metric.reset_states()
            val_acc_metric.reset_states()
            
            epoch_time = time.time() - start_time
            print(f"Time: {epoch_time:.2f}s - "
                  f"loss: {train_loss:.4f} - accuracy: {train_acc:.4f} - "
                  f"val_loss: {val_loss:.4f} - val_accuracy: {val_acc:.4f}")
    
    def train_with_keras_api(self, x_train, y_train, x_val, y_val, 
                           epochs=10, batch_size=32, use_callbacks=True):
        """Train using Keras fit API"""
        print("Training with Keras API...")
        
        callbacks = []
        if use_callbacks:
            callbacks = [self.lr_scheduler, self.checkpoint_callback]
        
        history = self.model.fit(
            x_train, y_train,
            batch_size=batch_size,
            epochs=epochs,
            validation_data=(x_val, y_val),
            callbacks=callbacks,
            verbose=1
        )
        
        # Convert history to our format
        self.history = {
            'train_loss': history.history['loss'],
            'train_accuracy': history.history['accuracy'],
            'val_loss': history.history['val_loss'],
            'val_accuracy': history.history['val_accuracy'],
            'learning_rates': [self.model.optimizer.learning_rate.numpy()] * epochs
        }
        
        return history
    
    def evaluate_model(self, test_dataset):
        """Evaluate model on test dataset"""
        test_loss = tf.keras.metrics.Mean()
        test_accuracy = tf.keras.metrics.CategoricalAccuracy()
        
        for x_batch, y_batch in test_dataset:
            logits = self.model(x_batch, training=False)
            loss_value = tf.keras.losses.categorical_crossentropy(y_batch, logits)
            test_loss.update_state(loss_value)
            test_accuracy.update_state(y_batch, logits)
        
        print(f"Test Loss: {test_loss.result():.4f}")
        print(f"Test Accuracy: {test_accuracy.result():.4f}")
        
        return test_loss.result(), test_accuracy.result()
    
    def plot_training_history(self):
        """Plot comprehensive training history"""
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
        
        # Plot loss
        ax1.plot(self.history['train_loss'], label='Training Loss', linewidth=2)
        ax1.plot(self.history['val_loss'], label='Validation Loss', linewidth=2)
        ax1.set_title('Training and Validation Loss', fontsize=14)
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Loss')
        ax1.legend()
        ax1.grid(True, alpha=0.3)
        
        # Plot accuracy
        ax2.plot(self.history['train_accuracy'], label='Training Accuracy', linewidth=2)
        ax2.plot(self.history['val_accuracy'], label='Validation Accuracy', linewidth=2)
        ax2.set_title('Training and Validation Accuracy', fontsize=14)
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Accuracy')
        ax2.legend()
        ax2.grid(True, alpha=0.3)
        
        # Plot learning rate
        ax3.plot(self.history['learning_rates'], label='Learning Rate', color='red', linewidth=2)
        ax3.set_title('Learning Rate Schedule', fontsize=14)
        ax3.set_xlabel('Epoch')
        ax3.set_ylabel('Learning Rate')
        ax3.set_yscale('log')
        ax3.legend()
        ax3.grid(True, alpha=0.3)
        
        # Plot loss vs accuracy
        ax4.scatter(self.history['train_loss'], self.history['train_accuracy'], 
                   alpha=0.6, s=50, label='Training', c='blue')
        ax4.scatter(self.history['val_loss'], self.history['val_accuracy'], 
                   alpha=0.6, s=50, label='Validation', c='orange')
        ax4.set_title('Loss vs Accuracy', fontsize=14)
        ax4.set_xlabel('Loss')
        ax4.set_ylabel('Accuracy')
        ax4.legend()
        ax4.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.show()
    
    def save_model(self, filepath=None):
        """Save the trained model"""
        if filepath is None:
            filepath = f'{self.model_name}_final.h5'
        
        self.model.save(filepath)
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath):
        """Load a saved model"""
        self.model = tf.keras.models.load_model(filepath)
        print(f"Model loaded from {filepath}")

def create_tensorflow_data_pipeline(x_data, y_data, batch_size=32, shuffle=True, 
                                  augment=False, is_training=False):
    """Create TensorFlow data pipeline with optional augmentation"""
    def preprocess_fn(image, label):
        # Convert to float32 and normalize
        image = tf.cast(image, tf.float32) / 255.0
        
        if augment and is_training:
            # Data augmentation
            image = tf.image.random_flip_left_right(image)
            image = tf.image.random_brightness(image, max_delta=0.1)
            image = tf.image.random_contrast(image, lower=0.9, upper=1.1)
        
        return image, label
    
    dataset = tf.data.Dataset.from_tensor_slices((x_data, y_data))
    
    if shuffle:
        dataset = dataset.shuffle(buffer_size=len(x_data))
    
    dataset = dataset.map(preprocess_fn, num_parallel_calls=tf.data.AUTOTUNE)
    dataset = dataset.batch(batch_size)
    dataset = dataset.prefetch(tf.data.AUTOTUNE)
    
    return dataset