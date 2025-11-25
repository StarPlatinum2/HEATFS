class DBSCANController {
    constructor() {
        this.chart = null;
        this.currentData = null;
        this.initializeEventListeners();
        this.initializeChart();
        this.loadInitialData();
    }

    initializeEventListeners() {
        // Parameter controls
        document.getElementById('dbscan-epsilon').addEventListener('input', (e) => {
            document.getElementById('dbscan-epsilon-value').textContent = e.target.value;
        });

        // Dataset selection
        document.getElementById('dbscan-dataset').addEventListener('change', (e) => {
            const showUpload = e.target.value === 'custom';
            document.getElementById('dbscan-custom-upload').style.display = showUpload ? 'block' : 'none';
        });

        // File upload
        setupFileUpload(
            document.getElementById('dbscan-upload-area'),
            document.getElementById('dbscan-file'),
            this.handleFileUpload.bind(this)
        );

        // Buttons
        document.getElementById('dbscan-generate').addEventListener('click', this.generateData.bind(this));
        document.getElementById('dbscan-run').addEventListener('click', this.runDBSCAN.bind(this));
    }

    initializeChart() {
        const ctx = document.getElementById('dbscan-chart').getContext('2d');
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
                                const point = context.dataset.data[context.dataIndex];
                                return `${context.dataset.label}: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;
                            }
                        }
                    }
                }
            }
        });
    }

    async loadInitialData() {
        try {
            Utils.showLoading(document.getElementById('dbscan-loading'));
            const data = await Utils.apiRequest('/api/dbscan/generate_data', {
                method: 'POST',
                body: JSON.stringify({
                    n_clusters: 3,
                    n_samples: 300
                })
            });
            this.currentData = data;
            this.updateChart(data.data_points);
        } catch (error) {
            console.error('Error loading initial data:', error);
            alert('Error loading initial data: ' + error.message);
        } finally {
            Utils.hideLoading(document.getElementById('dbscan-loading'));
        }
    }

    async generateData() {
        try {
            Utils.showLoading(document.getElementById('dbscan-loading'));
            const dataset = document.getElementById('dbscan-dataset').value;

            let data;
            if (dataset === 'synthetic' || dataset === 'blobs' || dataset === 'moons') {
                const nClusters = dataset === 'moons' ? 2 : 3;
                data = await Utils.apiRequest('/api/dbscan/generate_data', {
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
                data = await Utils.apiRequest('/api/dbscan/generate_data', {
                    method: 'POST',
                    body: JSON.stringify({
                        dataset: dataset
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
            Utils.hideLoading(document.getElementById('dbscan-loading'));
        }
    }

    async runDBSCAN() {
        if (!this.currentData) {
            alert('Please generate or load data first');
            return;
        }

        try {
            Utils.showLoading(document.getElementById('dbscan-loading'));
            const eps = parseFloat(document.getElementById('dbscan-epsilon').value);
            const minSamples = parseInt(document.getElementById('dbscan-minpts').value);
            const dataset = document.getElementById('dbscan-dataset').value;

            let result;
            if (dataset === 'custom' && this.currentData) {
                result = await Utils.apiRequest('/api/dbscan/cluster', {
                    method: 'POST',
                    body: JSON.stringify({
                        data_points: this.currentData.data_points,
                        eps: eps,
                        min_samples: minSamples
                    })
                });
            } else {
                result = await Utils.apiRequest('/api/dbscan/cluster', {
                    method: 'POST',
                    body: JSON.stringify({
                        dataset: dataset,
                        eps: eps,
                        min_samples: minSamples
                    })
                });
            }

            this.updateResults(result);
            this.updateChartWithClusters(result.data_points, result.clusters);
        } catch (error) {
            console.error('Error running DBSCAN:', error);
            alert('Error running DBSCAN: ' + error.message);
        } finally {
            Utils.hideLoading(document.getElementById('dbscan-loading'));
        }
    }

    updateChart(dataPoints) {
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
                pointRadius: 8,
                pointStyle: 'triangle',
                borderColor: '#000',
                borderWidth: 2
            });
        });

        // Add noise points
        const noisePoints = dataPoints.filter(point => point.is_noise);
        if (noisePoints.length > 0) {
            datasets.push({
                label: 'Noise Points',
                data: noisePoints.map(point => ({ x: point.x, y: point.y })),
                backgroundColor: 'rgba(149, 165, 166, 0.7)',
                pointRadius: 4,
                pointHoverRadius: 6
            });
        }

        this.chart.data.datasets = datasets;
        this.chart.update();
    }

    updateResults(result) {
        // Update results table
        document.getElementById('dbscan-clusters').textContent = result.n_clusters_found;
        document.getElementById('dbscan-noise').textContent = result.noise_points;
        document.getElementById('dbscan-total').textContent = result.total_points;

        // Update cluster summary
        const summaryContainer = document.getElementById('dbscan-summary');
        summaryContainer.innerHTML = '';

        result.clusters.forEach((cluster, index) => {
            const clusterDiv = document.createElement('div');
            clusterDiv.className = 'cluster-badge';
            clusterDiv.style.backgroundColor = Utils.generateColor(index);
            clusterDiv.textContent = `Cluster ${cluster.id + 1} (${cluster.size} points)`;
            summaryContainer.appendChild(clusterDiv);
        });

        // Add noise points summary
        if (result.noise_points > 0) {
            const noiseDiv = document.createElement('div');
            noiseDiv.className = 'cluster-badge noise-point';
            noiseDiv.textContent = `Noise Points (${result.noise_points})`;
            summaryContainer.appendChild(noiseDiv);
        }
    }

    clearResults() {
        document.getElementById('dbscan-clusters').textContent = '3';
        document.getElementById('dbscan-noise').textContent = '6';
        document.getElementById('dbscan-total').textContent = '85';
        
        const summaryContainer = document.getElementById('dbscan-summary');
        summaryContainer.innerHTML = `
            <div class="cluster-badge" style="background-color: #FF6384">Cluster 1</div>
            <div class="cluster-badge" style="background-color: #36A2EB">Cluster 2</div>
            <div class="cluster-badge" style="background-color: #FFCE56">Cluster 3</div>
            <div class="cluster-badge noise-point">Noise Points</div>
        `;
    }

    async handleFileUpload(file) {
        try {
            Utils.showLoading(document.getElementById('dbscan-loading'));
            
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
            Utils.hideLoading(document.getElementById('dbscan-loading'));
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DBSCANController();
});