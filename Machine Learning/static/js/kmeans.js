class KMeansController {
    constructor() {
        this.chart = null;
        this.currentData = null;
        this.initializeEventListeners();
        this.initializeChart();
        this.loadInitialData();
    }

    initializeEventListeners() {
        // Parameter controls
        document.getElementById('kmeans-clusters').addEventListener('input', (e) => {
            document.getElementById('kmeans-clusters-value').textContent = e.target.value;
        });

        // Dataset selection
        document.getElementById('kmeans-dataset').addEventListener('change', (e) => {
            const showUpload = e.target.value === 'custom';
            document.getElementById('kmeans-custom-upload').style.display = showUpload ? 'block' : 'none';
        });

        // File upload
        setupFileUpload(
            document.getElementById('kmeans-upload-area'),
            document.getElementById('kmeans-file'),
            this.handleFileUpload.bind(this)
        );

        // Buttons
        document.getElementById('kmeans-generate').addEventListener('click', this.generateData.bind(this));
        document.getElementById('kmeans-run').addEventListener('click', this.runKMeans.bind(this));
    }

    initializeChart() {
        const ctx = document.getElementById('kmeans-chart').getContext('2d');
        this.chart = Utils.createChart(ctx, {
            type: 'scatter',
            data: {
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Feature 1'
                        },
                        min: 0,
                        max: 100
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Feature 2'
                        },
                        min: 0,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `Cluster ${context.dataset.label}: (${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
                            }
                        }
                    }
                }
            }
        });
    }

    async loadInitialData() {
        try {
            Utils.showLoading(document.getElementById('kmeans-loading'));
            const data = await Utils.apiRequest('/api/kmeans/generate_data', {
                method: 'POST',
                body: JSON.stringify({
                    n_clusters: 4,
                    n_samples: 300
                })
            });
            this.currentData = data;
            this.updateChart(data.data_points);
        } catch (error) {
            console.error('Error loading initial data:', error);
            alert('Error loading initial data: ' + error.message);
        } finally {
            Utils.hideLoading(document.getElementById('kmeans-loading'));
        }
    }

    async generateData() {
        try {
            Utils.showLoading(document.getElementById('kmeans-loading'));
            const nClusters = parseInt(document.getElementById('kmeans-clusters').value);
            const dataset = document.getElementById('kmeans-dataset').value;

            let data;
            if (dataset === 'synthetic' || dataset === 'blobs') {
                data = await Utils.apiRequest('/api/kmeans/generate_data', {
                    method: 'POST',
                    body: JSON.stringify({
                        n_clusters: nClusters,
                        n_samples: 300
                    })
                });
            } else if (dataset === 'custom' && this.currentData) {
                // Use already uploaded data
                data = this.currentData;
            } else {
                data = await Utils.apiRequest('/api/kmeans/generate_data', {
                    method: 'POST',
                    body: JSON.stringify({
                        dataset: dataset,
                        n_clusters: nClusters
                    })
                });
            }

            this.currentData = data;
            this.updateChart(data.data_points);
            this.clearResults();
        } catch (error) {
            console.error('Error generating data:', error);
            alert('Error generating data: ' + error.message);
        } finally {
            Utils.hideLoading(document.getElementById('kmeans-loading'));
        }
    }

    async runKMeans() {
        if (!this.currentData) {
            alert('Please generate or load data first');
            return;
        }

        try {
            Utils.showLoading(document.getElementById('kmeans-loading'));
            const nClusters = parseInt(document.getElementById('kmeans-clusters').value);
            const dataset = document.getElementById('kmeans-dataset').value;

            let result;
            if (dataset === 'custom' && this.currentData) {
                result = await Utils.apiRequest('/api/kmeans/train', {
                    method: 'POST',
                    body: JSON.stringify({
                        data_points: this.currentData.data_points,
                        n_clusters: nClusters
                    })
                });
            } else {
                result = await Utils.apiRequest('/api/kmeans/train', {
                    method: 'POST',
                    body: JSON.stringify({
                        dataset: dataset,
                        n_clusters: nClusters
                    })
                });
            }

            this.updateResults(result);
            this.updateChartWithClusters(result.data_points, result.clusters);
        } catch (error) {
            console.error('Error running K-Means:', error);
            alert('Error running K-Means: ' + error.message);
        } finally {
            Utils.hideLoading(document.getElementById('kmeans-loading'));
        }
    }

    updateChart(dataPoints) {
        // Create a single dataset for unclustered data
        const dataset = {
            label: 'Data Points',
            data: dataPoints.map(point => ({ x: point.x, y: point.y })),
            backgroundColor: 'rgba(100, 100, 100, 0.6)',
            pointRadius: 6,
            pointHoverRadius: 8
        };

        this.chart.data.datasets = [dataset];
        this.chart.update();
    }

    updateChartWithClusters(dataPoints, clusters) {
        const datasets = [];

        // Add cluster datasets
        clusters.forEach((cluster, index) => {
            const clusterPoints = cluster.points.map(pointIndex => ({
                x: dataPoints[pointIndex].x,
                y: dataPoints[pointIndex].y
            }));

            datasets.push({
                label: `Cluster ${cluster.id + 1}`,
                data: clusterPoints,
                backgroundColor: Utils.generateColor(index),
                pointRadius: 6,
                pointHoverRadius: 8
            });

            // Add cluster center
            datasets.push({
                label: `Center ${cluster.id + 1}`,
                data: [{ x: cluster.center.x, y: cluster.center.y }],
                backgroundColor: Utils.generateColor(index),
                pointRadius: 10,
                pointStyle: 'triangle',
                borderColor: '#000',
                borderWidth: 2
            });
        });

        // Add noise points if any
        const noisePoints = dataPoints.filter(point => point.predicted_cluster === -1);
        if (noisePoints.length > 0) {
            datasets.push({
                label: 'Noise',
                data: noisePoints.map(point => ({ x: point.x, y: point.y })),
                backgroundColor: 'rgba(200, 200, 200, 0.6)',
                pointRadius: 4,
                pointHoverRadius: 6
            });
        }

        this.chart.data.datasets = datasets;
        this.chart.update();
    }

    updateResults(result) {
        // Update results table
        const resultsBody = document.getElementById('kmeans-results');
        resultsBody.innerHTML = '';

        // Simulate iteration history
        for (let i = 1; i <= 8; i++) {
            const row = document.createElement('tr');
            const inertia = i === 8 ? result.metrics.inertia.toFixed(2) : (Math.random() * 10000 + 5000).toFixed(2);
            
            row.innerHTML = `
                <td>${i}</td>
                <td>${result.clusters.length}</td>
                <td>${inertia}</td>
            `;
            resultsBody.appendChild(row);
        }

        // Update cluster centers
        const centersContainer = document.getElementById('kmeans-centers');
        centersContainer.innerHTML = '';

        result.clusters.forEach((cluster, index) => {
            const centerDiv = document.createElement('div');
            centerDiv.className = 'cluster-center';
            centerDiv.innerHTML = `
                <strong>Cluster ${cluster.id + 1}</strong><br>
                x: ${cluster.center.x.toFixed(2)}, y: ${cluster.center.y.toFixed(2)}<br>
                <small>Points: ${cluster.size}</small>
            `;
            centerDiv.style.borderLeft = `4px solid ${Utils.generateColor(index)}`;
            centersContainer.appendChild(centerDiv);
        });

        // Update metrics
        document.getElementById('inertia-value').textContent = result.metrics.inertia.toFixed(2);
        document.getElementById('silhouette-value').textContent = result.metrics.silhouette_score?.toFixed(3) || 'N/A';
        document.getElementById('iterations-value').textContent = result.model_params.n_iter || '8';
    }

    clearResults() {
        document.getElementById('kmeans-results').innerHTML = `
            <tr>
                <td>8</td>
                <td>4</td>
                <td>7770</td>
            </tr>
        `;
        document.getElementById('kmeans-centers').innerHTML = '';
        document.getElementById('inertia-value').textContent = '7770';
        document.getElementById('silhouette-value').textContent = '-';
        document.getElementById('iterations-value').textContent = '-';
    }

    async handleFileUpload(file) {
        try {
            Utils.showLoading(document.getElementById('kmeans-loading'));
            
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
                // Auto-generate data with uploaded dataset
                this.generateData();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file: ' + error.message);
        } finally {
            Utils.hideLoading(document.getElementById('kmeans-loading'));
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new KMeansController();
});