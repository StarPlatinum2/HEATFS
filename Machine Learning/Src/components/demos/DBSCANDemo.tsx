import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlayCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Point {
  x: number;
  y: number;
  cluster?: number;
}

export function DBSCANDemo() {
  const [data, setData] = useState<Point[]>([]);
  const [epsilon, setEpsilon] = useState(8);
  const [minPoints, setMinPoints] = useState(4);
  const [trained, setTrained] = useState(false);
  const [numClusters, setNumClusters] = useState(0);
  const [numNoise, setNumNoise] = useState(0);

  // Generate data with irregular shapes and noise
  const generateData = () => {
    const newData: Point[] = [];
    
    // Dense circular cluster
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 8;
      newData.push({
        x: parseFloat((25 + radius * Math.cos(angle)).toFixed(2)),
        y: parseFloat((25 + radius * Math.sin(angle)).toFixed(2))
      });
    }
    
    // Elongated cluster
    for (let i = 0; i < 25; i++) {
      const t = Math.random();
      newData.push({
        x: parseFloat((50 + t * 30 + (Math.random() - 0.5) * 4).toFixed(2)),
        y: parseFloat((50 + t * 20 + (Math.random() - 0.5) * 4).toFixed(2))
      });
    }
    
    // Another dense cluster
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 6;
      newData.push({
        x: parseFloat((70 + radius * Math.cos(angle)).toFixed(2)),
        y: parseFloat((25 + radius * Math.sin(angle)).toFixed(2))
      });
    }
    
    // Noise points
    for (let i = 0; i < 10; i++) {
      newData.push({
        x: parseFloat((Math.random() * 100).toFixed(2)),
        y: parseFloat((Math.random() * 80).toFixed(2))
      });
    }
    
    setData(newData);
    setTrained(false);
  };

  useEffect(() => {
    generateData();
  }, []);

  // Calculate Euclidean distance
  const distance = (p1: Point, p2: Point) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  // Get neighbors within epsilon distance
  const getNeighbors = (point: Point, points: Point[], eps: number) => {
    return points.filter(p => distance(point, p) < eps);
  };

  // DBSCAN algorithm
  const runDBSCAN = () => {
    if (data.length === 0) return;

    const points = data.map(p => ({ ...p, cluster: -1 })); // -1 = unvisited
    let clusterId = 0;

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      
      if (point.cluster !== -1) continue; // Already visited

      const neighbors = getNeighbors(point, points, epsilon);

      if (neighbors.length < minPoints) {
        point.cluster = -2; // Mark as noise (-2)
        continue;
      }

      // Start new cluster
      point.cluster = clusterId;
      const seedSet = [...neighbors];

      let j = 0;
      while (j < seedSet.length) {
        const neighbor = seedSet[j];
        const neighborIndex = points.findIndex(p => p.x === neighbor.x && p.y === neighbor.y);
        
        if (points[neighborIndex].cluster === -2) {
          // Change noise to border point
          points[neighborIndex].cluster = clusterId;
        }
        
        if (points[neighborIndex].cluster !== -1) {
          j++;
          continue;
        }

        points[neighborIndex].cluster = clusterId;
        const newNeighbors = getNeighbors(neighbor, points, epsilon);

        if (newNeighbors.length >= minPoints) {
          seedSet.push(...newNeighbors);
        }

        j++;
      }

      clusterId++;
    }

    setData(points);
    setNumClusters(clusterId);
    setNumNoise(points.filter(p => p.cluster === -2).length);
    setTrained(true);
  };

  // Get data by cluster
  const getClusterData = () => {
    const clusters: { [key: number]: Point[] } = {};
    data.forEach(point => {
      const cluster = point.cluster ?? -1;
      if (!clusters[cluster]) clusters[cluster] = [];
      clusters[cluster].push(point);
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

  const clusterData = getClusterData();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>DBSCAN Clustering</CardTitle>
          <CardDescription>
            Density-based clustering that finds arbitrary-shaped clusters and identifies noise points.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Epsilon (ε): {epsilon} - Neighborhood radius</Label>
              <Slider
                value={[epsilon]}
                onValueChange={([value]) => {
                  setEpsilon(value);
                  setTrained(false);
                }}
                min={3}
                max={15}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Min Points: {minPoints} - Minimum neighbors to form cluster</Label>
              <Slider
                value={[minPoints]}
                onValueChange={([value]) => {
                  setMinPoints(value);
                  setTrained(false);
                }}
                min={2}
                max={10}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="flex gap-4">
              <Button onClick={generateData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New Data
              </Button>
              <Button onClick={runDBSCAN} disabled={data.length === 0}>
                <PlayCircle className="w-4 h-4 mr-2" />
                Run DBSCAN
              </Button>
            </div>
          </div>

          {trained && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Clusters Found</CardDescription>
                  <CardTitle className="text-2xl">
                    {numClusters}
                    <Badge className="ml-2" variant="default">
                      Auto-detected
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Noise Points</CardDescription>
                  <CardTitle className="text-2xl">{numNoise}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Points</CardDescription>
                  <CardTitle className="text-2xl">{data.length}</CardTitle>
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
                {Object.entries(clusterData).map(([clusterId, points]) => {
                  const id = parseInt(clusterId);
                  if (id === -2) {
                    return (
                      <Scatter
                        key="noise"
                        name="Noise"
                        data={points}
                        fill="hsl(var(--muted-foreground))"
                        shape="cross"
                      />
                    );
                  }
                  if (id === -1 || id < 0) return null;
                  return (
                    <Scatter
                      key={id}
                      name={`Cluster ${id + 1}`}
                      data={points}
                      fill={clusterColors[id % clusterColors.length]}
                    />
                  );
                })}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {trained && (
            <Card className="bg-accent/20">
              <CardHeader>
                <CardTitle className="text-lg">Cluster Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(clusterData).map(([clusterId, points]) => {
                    const id = parseInt(clusterId);
                    if (id === -2) {
                      return (
                        <div key="noise" className="flex items-center justify-between p-2 bg-background rounded border">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-muted-foreground rounded-full" />
                            <span className="text-sm font-medium">Noise Points</span>
                          </div>
                          <Badge variant="secondary">{points.length} points</Badge>
                        </div>
                      );
                    }
                    if (id === -1 || id < 0) return null;
                    return (
                      <div key={id} className="flex items-center justify-between p-2 bg-background rounded border">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: clusterColors[id % clusterColors.length] }}
                          />
                          <span className="text-sm font-medium">Cluster {id + 1}</span>
                        </div>
                        <Badge>{points.length} points</Badge>
                      </div>
                    );
                  })}
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
            <h4 className="font-semibold mb-1">1. Density-Based Approach</h4>
            <p className="text-muted-foreground">
              Unlike K-means which assumes spherical clusters, DBSCAN finds clusters based on density. 
              It can discover arbitrary-shaped clusters and identify outliers as noise.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">2. Key Parameters</h4>
            <p className="text-muted-foreground">
              • <strong>Epsilon (ε):</strong> Maximum distance between two points to be neighbors<br />
              • <strong>MinPoints:</strong> Minimum neighbors needed to form a dense region<br />
              Adjusting these changes which points are considered core, border, or noise.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">3. Point Types</h4>
            <p className="text-muted-foreground">
              • <strong>Core points:</strong> Have ≥ MinPoints neighbors within ε (colored points)<br />
              • <strong>Border points:</strong> Within ε of core point but have &lt; MinPoints neighbors<br />
              • <strong>Noise points:</strong> Neither core nor border (marked with ×)
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">4. Algorithm Steps</h4>
            <p className="text-muted-foreground">
              1. Pick an unvisited point<br />
              2. Find all points within ε distance<br />
              3. If &lt; MinPoints neighbors, mark as noise (temporarily)<br />
              4. Otherwise, start new cluster and expand it recursively<br />
              5. Repeat until all points visited
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">5. Advantages Over K-Means</h4>
            <p className="text-muted-foreground">
              • No need to specify number of clusters beforehand<br />
              • Finds arbitrarily shaped clusters (not just circular)<br />
              • Robust to outliers (identifies noise)<br />
              • Better for real-world data with irregular patterns
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">6. Real-World Applications</h4>
            <p className="text-muted-foreground">
              • Anomaly detection in network traffic<br />
              • Geographic data clustering (cities, patterns)<br />
              • Image segmentation<br />
              • Identifying crime hotspots<br />
              • Customer behavior analysis with outlier detection
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
