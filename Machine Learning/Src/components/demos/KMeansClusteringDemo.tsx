import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlayCircle, RefreshCw, Pause } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Point {
  x: number;
  y: number;
  cluster?: number;
}

export function KMeansClusteringDemo() {
  const [data, setData] = useState<Point[]>([]);
  const [k, setK] = useState(3);
  const [centroids, setCentroids] = useState<Point[]>([]);
  const [trained, setTrained] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inertia, setInertia] = useState(0);

  // Generate clustered data
  const generateData = () => {
    const newData: Point[] = [];
    
    // Generate 3 natural clusters
    const clusterCenters = [
      { x: 20, y: 20 },
      { x: 50, y: 60 },
      { x: 80, y: 30 }
    ];
    
    clusterCenters.forEach(center => {
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * 10 + 5;
        newData.push({
          x: parseFloat((center.x + radius * Math.cos(angle)).toFixed(2)),
          y: parseFloat((center.y + radius * Math.sin(angle)).toFixed(2))
        });
      }
    });
    
    setData(newData);
    setTrained(false);
    setCentroids([]);
    setIteration(0);
  };

  useEffect(() => {
    generateData();
  }, []);

  // Initialize centroids randomly
  const initializeCentroids = () => {
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, k);
  };

  // Calculate Euclidean distance
  const distance = (p1: Point, p2: Point) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  // Assign points to nearest centroid
  const assignClusters = (points: Point[], cents: Point[]) => {
    return points.map(point => {
      let minDist = Infinity;
      let cluster = 0;
      
      cents.forEach((centroid, i) => {
        const dist = distance(point, centroid);
        if (dist < minDist) {
          minDist = dist;
          cluster = i;
        }
      });
      
      return { ...point, cluster };
    });
  };

  // Update centroids based on cluster assignments
  const updateCentroids = (points: Point[], numClusters: number) => {
    const newCentroids: Point[] = [];
    
    for (let i = 0; i < numClusters; i++) {
      const clusterPoints = points.filter(p => p.cluster === i);
      if (clusterPoints.length > 0) {
        const sumX = clusterPoints.reduce((sum, p) => sum + p.x, 0);
        const sumY = clusterPoints.reduce((sum, p) => sum + p.y, 0);
        newCentroids.push({
          x: parseFloat((sumX / clusterPoints.length).toFixed(2)),
          y: parseFloat((sumY / clusterPoints.length).toFixed(2))
        });
      } else {
        newCentroids.push(cents[i]);
      }
    }
    
    return newCentroids;
  };

  // Calculate inertia (sum of squared distances)
  const calculateInertia = (points: Point[], cents: Point[]) => {
    return points.reduce((sum, point) => {
      const centroid = cents[point.cluster || 0];
      return sum + Math.pow(distance(point, centroid), 2);
    }, 0);
  };

  // Single iteration of K-means
  const [cents, setCents] = useState<Point[]>([]);
  
  const runIteration = () => {
    let currentCents = cents.length > 0 ? cents : initializeCentroids();
    let currentData = assignClusters(data, currentCents);
    currentCents = updateCentroids(currentData, k);
    
    setData(currentData);
    setCentroids(currentCents);
    setCents(currentCents);
    setIteration(prev => prev + 1);
    
    const newInertia = calculateInertia(currentData, currentCents);
    setInertia(parseFloat(newInertia.toFixed(2)));
  };

  // Train full model
  const trainModel = async () => {
    setIsAnimating(true);
    setIteration(0);
    let currentCents = initializeCentroids();
    let currentData = [...data];
    
    for (let i = 0; i < 20; i++) {
      currentData = assignClusters(currentData, currentCents);
      const newCents = updateCentroids(currentData, k);
      
      // Check convergence
      const moved = currentCents.some((cent, idx) => 
        distance(cent, newCents[idx]) > 0.01
      );
      
      currentCents = newCents;
      setData([...currentData]);
      setCentroids([...currentCents]);
      setCents([...currentCents]);
      setIteration(i + 1);
      
      const newInertia = calculateInertia(currentData, currentCents);
      setInertia(parseFloat(newInertia.toFixed(2)));
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!moved) break;
    }
    
    setTrained(true);
    setIsAnimating(false);
  };

  // Get data by cluster for visualization
  const getClusterData = () => {
    const clusters: Point[][] = Array(k).fill(0).map(() => []);
    data.forEach(point => {
      if (point.cluster !== undefined) {
        clusters[point.cluster].push(point);
      }
    });
    return clusters;
  };

  const clusterColors = [
    'hsl(var(--primary))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>K-Means Clustering</CardTitle>
          <CardDescription>
            Group similar data points together by iteratively assigning points to nearest centroids.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Number of Clusters (K): {k}</Label>
              <Slider
                value={[k]}
                onValueChange={([value]) => {
                  setK(value);
                  setTrained(false);
                  setCentroids([]);
                }}
                min={2}
                max={5}
                step={1}
                className="mt-2"
                disabled={isAnimating}
              />
            </div>

            <div className="flex gap-4">
              <Button onClick={generateData} variant="outline" disabled={isAnimating}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New Data
              </Button>
              <Button onClick={trainModel} disabled={data.length === 0 || isAnimating}>
                <PlayCircle className="w-4 h-4 mr-2" />
                Auto-Train (Animated)
              </Button>
              <Button onClick={runIteration} variant="secondary" disabled={data.length === 0 || isAnimating}>
                Single Step
              </Button>
            </div>
          </div>

          {iteration > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Iteration</CardDescription>
                  <CardTitle className="text-2xl">{iteration}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Clusters</CardDescription>
                  <CardTitle className="text-2xl">{k}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Inertia (Lower = Better)</CardDescription>
                  <CardTitle className="text-2xl">
                    {inertia}
                    <Badge className="ml-2" variant="secondary" size="sm">
                      {trained ? "Converged" : "Training"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}

          <div className="border rounded-lg p-4">
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" name="Feature 1" domain={[0, 100]} />
                <YAxis dataKey="y" type="number" name="Feature 2" domain={[0, 100]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                {getClusterData().map((cluster, i) => (
                  <Scatter
                    key={i}
                    name={`Cluster ${i + 1}`}
                    data={cluster}
                    fill={clusterColors[i]}
                  />
                ))}
                {centroids.length > 0 && (
                  <Scatter
                    name="Centroids"
                    data={centroids}
                    fill="hsl(var(--destructive))"
                    shape="star"
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {centroids.length > 0 && (
            <Card className="bg-accent/20">
              <CardHeader>
                <CardTitle className="text-lg">Cluster Centers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {centroids.map((centroid, i) => (
                    <div key={i} className="p-3 bg-background rounded border">
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: clusterColors[i] }}
                        />
                        <p className="font-semibold text-sm">Cluster {i + 1}</p>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        x: {centroid.x}, y: {centroid.y}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold mb-1">1. Initialization</h4>
            <p className="text-muted-foreground">
              Randomly place K centroids (marked as stars) in the data space. These represent initial cluster centers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">2. Assignment Step</h4>
            <p className="text-muted-foreground">
              Assign each data point to the nearest centroid based on Euclidean distance. Points form colored clusters.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">3. Update Step</h4>
            <p className="text-muted-foreground">
              Recalculate centroid positions as the mean of all points in each cluster. Centroids move toward cluster centers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">4. Convergence</h4>
            <p className="text-muted-foreground">
              Repeat steps 2-3 until centroids stop moving significantly. The algorithm has found stable clusters.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">5. Choosing K</h4>
            <p className="text-muted-foreground">
              The number of clusters must be specified beforehand. Use domain knowledge or methods like the elbow method. 
              Too few = underfitting, too many = overfitting.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">6. Real-World Applications</h4>
            <p className="text-muted-foreground">
              • Customer segmentation for marketing<br />
              • Image compression (color quantization)<br />
              • Document clustering by topic<br />
              • Anomaly detection<br />
              • Grouping similar products or users
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
