import numpy as np 
import matplotlib.pyplot as plt 
from sklearn.metrics import classification_report, confusion_matrix 
import seaborn as sns 
 
def evaluate_model(model, x_test, y_test, framework='keras'): 
    if framework == 'keras': 
        predictions = model.predict(x_test) 
        predicted_classes = np.argmax(predictions, axis=1) 
        true_classes = np.argmax(y_test, axis=1) 
    elif framework == 'pytorch': 
        import torch 
        model.eval() 
        device = next(model.parameters()).device 
        x_test_tensor = torch.FloatTensor(x_test).permute(0, 3, 1, 2).to(device) 
        with torch.no_grad(): 
            outputs = model(x_test_tensor) 
            predicted_classes = torch.argmax(outputs, dim=1).cpu().numpy() 
            true_classes = np.argmax(y_test, axis=1) 
    accuracy = np.mean(predicted_classes == true_classes) 
    print(f"Test Accuracy: {accuracy:.4f}") 
    print("\nClassification Report:") 
    print(classification_report(true_classes, predicted_classes)) 
    cm = confusion_matrix(true_classes, predicted_classes) 
    plt.figure(figsize=(10, 8)) 
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues') 
    plt.title('Confusion Matrix') 
    plt.ylabel('True Label') 
    plt.xlabel('Predicted Label') 
    plt.show() 
    return accuracy, predicted_classes 
 
def plot_sample_predictions(x_test, y_test, predictions, class_names, num_samples=10): 
    fig, axes = plt.subplots(2, 5, figsize=(15, 6)) 
    axes = axes.ravel() 
    for i in range(num_samples): 
        axes[i].imshow(x_test[i]) 
        true_class = class_names[np.argmax(y_test[i])] 
        pred_class = class_names[predictions[i]] 
        color = 'green' if true_class == pred_class else 'red' 
        axes[i].set_title(f'True: {true_class}\nPred: {pred_class}', color=color) 
        axes[i].axis('off') 
    plt.tight_layout() 
