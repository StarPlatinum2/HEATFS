class PCAController {
    constructor() {
        this.originalChart = null;
        this.transformedChart = null;
        this.currentData = null;
        this.initializeEventListeners();
        this.initializeCharts();
        this.loadInitialData();
    }

    initializeEventListeners() {
        // Parameter controls
        document.getElementById('pca-components').addEventListener('input', (e) => {
            document.getElementById('pca-components-value').textContent = e.target.value;
            document.getElementById('pca-dimensions').textContent = `3D → ${e.target.value}D`;
        });

        // Dataset selection
        document.getElementById('pca-dataset').addEventListener('change', (e) => {
            const showUpload = e.target.value === 'custom';
            document.getElementById('pca-custom-upload').style.display = showUpload ? 'block' : 'none';
        });

        // File upload
        setupFileUpload(
            document.getElementById('pca-upload-area'),
            document.getElementById('pca-file'),
            this.handleFileUpload.bind(this)
        );

        // Buttons
        document.getElementById('pca-generate').addEventListener('click', this.generateData.bind(this));
        document.getElementById('pca-run').addEventListener('click', this.runPCA.bind(this));
    }

    initializeCharts() {
        // Original data chart
        const originalCtx = document.getElementById('pca-original-chart').getContext('2d');
        this.originalChart = Utils.createChart(originalCtx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Original Data',
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'X'
                        },
                        min: 0,
                        max: 100
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Y'
                        },
                        min: 0,
                        max: 100
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Original Data (X vs Y)'
                    }
                }
            }
        });

        // Transformed data chart
        const transformedCtx = document.getElementById('pca-transformed-chart').getContext('2d');
        this.transformedChart = Utils.createChart(transformedCtx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'PC1 Projection',
                    data: [],
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '1st Principal Component'
                        },
                        min: -100,
                        max: 100
                    },
                    y: {
                        display: false
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'After PCA (1st Principal Component)'
                    }
                }
            }
        });
    }

    async loadInitialData() {
        try {
            Utils.showLoading(document.getElementById('pca-loading'));
            const data = await Utils.apiRequest('/api/pca/generate_data', {
                method: 'POST',
                body: JSON.stringify({
                    n_samples: 100,
                    n_features: 3
                })
            });
            this.currentData = data;
            this.updateOriginalChart(data.data_points);
        } catch (error) {
            console.error('Error loading initial data:', error);
            alert('Error loading initial data: ' + error.message);
        } finally {
            Utils.hideLoading(document.getElementById('pca-loading'));
        }
    }

    async generateData() {
        try {
            Utils.showLoading(document.getElementById('pca-loading'));
            const dataset = document.getElementById('pca-dataset').value;

            let data;
            if (dataset === 'synthetic') {
                data = await Utils.apiRequest('/api/pca/generate_data', {
                    method: 'POST',
                    body: JSON.stringify({
                        n_samples: 100,
                        n_features: 3
                    })
                });
            } else if (dataset === 'custom' && this.currentData) {
                // Use already uploaded data
                data = this.currentData;
            } else {
                data = await Utils.apiRequest('/api/pca/generate_data', {
                    method: 'POST',
                    body: JSON.stringify({
                        dataset: dataset
                    })
                });
            }

            this.currentData = data;
            this.updateOriginalChart(data.data_points);
            this.clearResults();
        } catch (error) {
            console.error('Error generating data:', error);
            alert('Error generating data: ' + error.message);
        } finally {
            Utils.hideLoading(document.getElementById('pca-loading'));
        }
    }

    async runPCA() {
        if (!this.currentData) {
            alert('Please generate or load data first');
            return;
        }

        try {
            Utils.showLoading(document.getElementById('pca-loading'));
            const nComponents = parseInt(document.getElementById('pca-components').value);
            const dataset = document.getElementById('pca-dataset').value;

            let result;
            if (dataset === 'custom' && this.currentData) {
                result = await Utils.apiRequest('/api/pca/analyze', {
                    method: 'POST',
                    body: JSON.stringify({
                        data_points: this.currentData.data_points,
                        n_components: nComponents
                    })
                });
            } else {
                result = await Utils.apiRequest('/api/pca/analyze', {
                    method: 'POST',
                    body: JSON.stringify({
                        dataset: dataset,
                        n_components: nComponents
                    })
                });
            }

            this.updateResults(result);
            this.updateTransformedChart(result.transformed_points, nComponents);
        } catch (error) {
            console.error('Error running PCA:', error);
            alert('Error running PCA: ' + error.message);
        } finally {
            Utils.hideLoading(document.getElementById('pca-loading'));
        }
    }

    updateOriginalChart(dataPoints) {
        const dataset = {
            label: 'Original Data',
            data: dataPoints.map(point => ({ x: point.x, y: point.y })),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            pointRadius: 6,
            pointHoverRadius: 8
        };

        this.originalChart.data.datasets = [dataset];
        this.originalChart.update();
    }

    updateTransformedChart(transformedPoints, nComponents) {
        let dataset;
        
        if (nComponents === 1) {
            // 1D projection - show as scatter plot along x-axis
            dataset = {
                label: 'PC1 Projection',
                data: transformedPoints.map(point => ({ x: point.pc1, y: 0 })),
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                pointRadius: 6,
                pointHoverRadius: 8
            };
        } else {
            // 2D projection
            dataset = {
                label: 'PCA Projection',
                data: transformedPoints.map(point => ({ x: point.pc1, y: point.pc2 })),
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                pointRadius: 6,
                pointHoverRadius: 8
            };

            // Update y-axis for 2D
            this.transformedChart.options.scales.y.display = true;
            this.transformedChart.options.scales.y.title = { display: true, text: '2nd Principal Component' };
        }

        this.transformedChart.data.datasets = [dataset];
        this.transformedChart.update();
    }

    updateResults(result) {
        // Update variance explained
        const totalVariance = (result.total_variance * 100).toFixed(2);
        document.getElementById('pca-variance').textContent = `${totalVariance}%`;
        
        // Update PC directions
        if (result.components && result.components.length > 0) {
            const pc1 = result.components[0];
            let vectorText = `X: ${pc1[0].toFixed(3)}`;
            if (pc1.length > 1) vectorText += `, Y: ${pc1[1].toFixed(3)}`;
            if (pc1.length > 2) vectorText += `, Z: ${pc1[2].toFixed(3)}`;
            document.getElementById('pca-vector').textContent = vectorText;
        }

        // Update variance bars
        const varianceBars = document.getElementById('pca-variance-bars');
        varianceBars.innerHTML = '';

        result.explained_variance.forEach((variance, index) => {
            const variancePercent = (variance * 100).toFixed(1);
            const cumulativePercent = (result.cumulative_variance[index] * 100).toFixed(1);
            
            const barContainer = document.createElement('div');
            barContainer.className = 'mb-2';
            barContainer.innerHTML = `
                <div class="d-flex justify-content-between small">
                    <span>PC${index + 1}</span>
                    <span>${variancePercent}% (Cumulative: ${cumulativePercent}%)</span>
                </div>
                <div class="explained-variance">
                    <div class="variance-bar" style="width: ${variancePercent}%"></div>
                </div>
            `;
            varianceBars.appendChild(barContainer);
        });
    }

    clearResults() {
        document.getElementById('pca-variance').textContent = '97.98%';
        document.getElementById('pca-vector').textContent = 'X: 0.675, Y: 0.551, Z: 0.491';
        document.getElementById('pca-variance-bars').innerHTML = '';
        
        // Clear transformed chart
        this.transformedChart.data.datasets[0].data = [];
        this.transformedChart.update();
    }

    async handleFileUpload(file) {
        try {
            Utils.showLoading(document.getElementById('pca-loading'));
            
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload_dataset', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (response.ok) {
                this.currentData = result;
                alert('Dataset uploaded successfully!');
                this.generateData();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file: ' + error.message);
        } finally {
            Utils.hideLoading(document.getElementById('pca-loading'));
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PCAController();
});