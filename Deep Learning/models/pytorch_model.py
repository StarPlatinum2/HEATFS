import torch 
import torch.nn as nn 
 
class PyTorchCNN(nn.Module): 
    def __init__(self, num_classes=10, dropout_rate=0.3): 
        super(PyTorchCNN, self).__init__() 
        self.conv_layers = nn.Sequential( 
            nn.Conv2d(3, 32, kernel_size=3, padding=1), 
            nn.ReLU(), 
            nn.MaxPool2d(2), 
            nn.Conv2d(32, 64, kernel_size=3, padding=1), 
            nn.ReLU(), 
            nn.MaxPool2d(2), 
            nn.Conv2d(64, 128, kernel_size=3, padding=1), 
            nn.ReLU(), 
            nn.MaxPool2d(2) 
        ) 
        self.fc_layers = nn.Sequential( 
            nn.Flatten(), 
            nn.Linear(128 * 4 * 4, 512), 
            nn.ReLU(), 
            nn.Dropout(dropout_rate), 
            nn.Linear(512, num_classes) 
        ) 
    def forward(self, x): 
        x = self.conv_layers(x) 
        x = self.fc_layers(x) 
        return x 
 
def get_pytorch_model(num_classes=10): 
    return PyTorchCNN(num_classes=num_classes) 
