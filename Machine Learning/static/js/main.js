// Global utility functions
const Utils = {
    // Format number with commas
    formatNumber: (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    
    // Generate random color
    generateColor: (index) => {
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
            '#7CFFB2', '#F465FF', '#FFD166', '#06D6A0'
        ];
        return colors[index % colors.length];
    },
    
    // Show loading indicator
    showLoading: (element) => {
        if (element) {
            element.style.display = 'block';
        }
    },
    
    // Hide loading indicator
    hideLoading: (element) => {
        if (element) {
            element.style.display = 'none';
        }
    },
    
    // Make API request
    apiRequest: async (url, options = {}) => {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },
    
    // Create chart
    createChart: (canvas, config) => {
        return new Chart(canvas, config);
    },
    
    // Download data as JSON
    downloadJSON: (data, filename) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Handle file uploads
function setupFileUpload(uploadArea, fileInput, onFileSelect) {
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            onFileSelect(e.dataTransfer.files[0]);
        }
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            onFileSelect(e.target.files[0]);
        }
    });
}
