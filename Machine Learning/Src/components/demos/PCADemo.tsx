import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart } from 'recharts';
import { PlayCircle, RefreshCw, Maximize2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PCADemo() {
  const [originalData, setOriginalData] = useState<{x: number, y: number, z: number}[]>([]);
  const [reducedData, setReducedData] = useState<{x: number, component1: number}[]>([]);
  const [trained, setTrained] = useState(false);
  const [explainedVariance, setExplainedVariance] = useState<number[]>([]);
  const [principalComponents, setPrincipalComponents] = useState<number[][]>([]);

  // Generate correlated 3D data
  const generateData = () => {
    const newData = [];
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 100;
      const y = 0.8 * x + (Math.random() - 0.5) * 20;
      const z = 0.5 * x + 0.3 * y + (Math.random() - 0.5) * 15;
      newData.push({
        x: parseFloat(x.toFixed(2)),
        y: parseFloat(y.toFixed(2)),
        z: parseFloat(z.toFixed(2))
      });
    }
    setOriginalData(newData);
    setTrained(false);
    setReducedData([]);
  };

  useEffect(() => {
    generateData();
  }, []);

  // Simplified PCA implementation
  const performPCA = () => {
    if (originalData.length === 0) return;

    // Step 1: Standardize the data (mean = 0)
    const meanX = originalData.reduce((sum, d) => sum + d.x, 0) / originalData.length;
    const meanY = originalData.reduce((sum, d) => sum + d.y, 0) / originalData.length;
    const meanZ = originalData.reduce((sum, d) => sum + d.z, 0) / originalData.length;

    const centered = originalData.map(d => ({
      x: d.x - meanX,
      y: d.y - meanY,
      z: d.z - meanZ
    }));

    // Step 2: Compute covariance matrix (simplified for 3D)
    const n = centered.length;
    let cov_xx = 0, cov_xy = 0, cov_xz = 0;
    let cov_yy = 0, cov_yz = 0, cov_zz = 0;

    centered.forEach(d => {
      cov_xx += d.x * d.x;
      cov_xy += d.x * d.y;
      cov_xz += d.x * d.z;
      cov_yy += d.y * d.y;
      cov_yz += d.y * d.z;
      cov_zz += d.z * d.z;
    });

    cov_xx /= n; cov_xy /= n; cov_xz /= n;
    cov_yy /= n; cov_yz /= n; cov_zz /= n;

    // Step 3: Find eigenvectors (simplified - using power iteration for first PC)
    // First principal component (approximate)
    let v1 = [1, 1, 1];
    for (let iter = 0; iter < 50; iter++) {
      const temp = [
        cov_xx * v1[0] + cov_xy * v1[1] + cov_xz * v1[2],
        cov_xy * v1[0] + cov_yy * v1[1] + cov_yz * v1[2],
        cov_xz * v1[0] + cov_yz * v1[1] + cov_zz * v1[2]
      ];
      const norm = Math.sqrt(temp[0]**2 + temp[1]**2 + temp[2]**2);
      v1 = [temp[0]/norm, temp[1]/norm, temp[2]/norm];
    }

    // Calculate eigenvalue (variance explained by PC1)
    const eigenvalue1 = cov_xx * v1[0]**2 + cov_yy * v1[1]**2 + cov_zz * v1[2]**2 + 
                        2 * (cov_xy * v1[0] * v1[1] + cov_xz * v1[0] * v1[2] + cov_yz * v1[1] * v1[2]);

    const totalVariance = cov_xx + cov_yy + cov_zz;
    const variance1 = (eigenvalue1 / totalVariance) * 100;

    // Project data onto first principal component
    const reduced = centered.map((d, i) => ({
      x: originalData[i].x,
      component1: parseFloat((d.x * v1[0] + d.y * v1[1] + d.z * v1[2]).toFixed(2))
    }));

    setReducedData(reduced);
    setExplainedVariance([parseFloat(variance1.toFixed(2))]);
    setPrincipalComponents([v1]);
    setTrained(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Principal Component Analysis (PCA)</CardTitle>
          <CardDescription>
            Reduce data dimensions while preserving maximum variance. Transform 3D data to 1D.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button onClick={generateData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New Data
            </Button>
            <Button onClick={performPCA} disabled={originalData.length === 0}>
              <PlayCircle className="w-4 h-4 mr-2" />
              Run PCA
            </Button>
          </div>

          {trained && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Variance Explained</CardDescription>
                  <CardTitle className="text-2xl">
                    {explainedVariance[0]}%
                    <Badge className="ml-2" variant={explainedVariance[0] > 70 ? "default" : "secondary"}>
                      {explainedVariance[0] > 70 ? "Excellent" : "Good"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Dimensions</CardDescription>
                  <CardTitle className="text-2xl">3D → 1D</CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Original 2D projection */}
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-2">Original Data (X vs Y)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" type="number" name="X" />
                  <YAxis dataKey="y" type="number" name="Y" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Original" data={originalData} fill="hsl(var(--chart-2))" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Reduced 1D data */}
            {trained && (
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2">After PCA (1st Principal Component)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" type="number" name="Original X" />
                    <YAxis dataKey="component1" type="number" name="PC1" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Reduced" data={reducedData} fill="hsl(var(--primary))" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {trained && (
            <Card className="bg-accent/20">
              <CardHeader>
                <CardTitle className="text-lg">Principal Component Directions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-background rounded border font-mono text-sm">
                  <p className="text-muted-foreground mb-2">PC1 Direction Vector:</p>
                  <p>X: {principalComponents[0][0].toFixed(3)}</p>
                  <p>Y: {principalComponents[0][1].toFixed(3)}</p>
                  <p>Z: {principalComponents[0][2].toFixed(3)}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  This vector shows the direction of maximum variance in the original 3D space.
                </p>
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
            <h4 className="font-semibold mb-1">1. What is PCA?</h4>
            <p className="text-muted-foreground">
              PCA finds the directions (principal components) along which data varies the most. It transforms data into a new 
              coordinate system where these directions become the axes, ordered by variance.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">2. Standardization</h4>
            <p className="text-muted-foreground">
              First, center the data by subtracting the mean. This ensures PCA focuses on variance, not absolute position.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">3. Finding Principal Components</h4>
            <p className="text-muted-foreground">
              • Calculate the covariance matrix showing how features vary together<br />
              • Find eigenvectors (directions) and eigenvalues (importance)<br />
              • Sort by eigenvalue - top components capture most variance
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">4. Dimensionality Reduction</h4>
            <p className="text-muted-foreground">
              Keep only the top K components (here K=1). Project original data onto these components. 
              In this demo, 3D data becomes 1D while retaining {trained && explainedVariance[0]}% of information.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">5. Why Reduce Dimensions?</h4>
            <p className="text-muted-foreground">
              • Visualization (plot 100D data in 2D/3D)<br />
              • Speed up training (fewer features)<br />
              • Remove noise and redundancy<br />
              • Combat curse of dimensionality<br />
              • Feature extraction and compression
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">6. Real-World Applications</h4>
            <p className="text-muted-foreground">
              • Face recognition (eigenfaces)<br />
              • Image compression<br />
              • Genomics (analyzing gene expression)<br />
              • Finance (portfolio optimization)<br />
              • Data visualization and exploration
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
