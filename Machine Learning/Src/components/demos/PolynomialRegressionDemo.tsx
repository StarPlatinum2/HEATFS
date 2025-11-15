import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { PlayCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PolynomialRegressionDemo() {
  const [data, setData] = useState<{x: number, y: number}[]>([]);
  const [degree, setDegree] = useState(2);
  const [coefficients, setCoefficients] = useState<number[]>([]);
  const [trained, setTrained] = useState(false);
  const [r2Score, setR2Score] = useState(0);
  const [predictionX, setPredictionX] = useState('');
  const [predictionY, setPredictionY] = useState<number | null>(null);

  // Generate polynomial data
  const generateData = () => {
    const newData = [];
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 10;
      const y = 0.5 * x * x - 2 * x + 5 + (Math.random() - 0.5) * 5;
      newData.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
    }
    setData(newData.sort((a, b) => a.x - b.x));
    setTrained(false);
    setPredictionY(null);
  };

  useEffect(() => {
    generateData();
  }, []);

  // Polynomial regression using matrix operations (simplified)
  const trainModel = () => {
    if (data.length === 0) return;

    // Create design matrix
    const X: number[][] = data.map(point => {
      const row = [];
      for (let i = 0; i <= degree; i++) {
        row.push(Math.pow(point.x, i));
      }
      return row;
    });

    const y = data.map(point => point.y);

    // Solve using normal equation: coefficients = (X^T X)^-1 X^T y
    // Simplified approach for demo
    const coeffs = solveNormalEquation(X, y);
    setCoefficients(coeffs);

    // Calculate R²
    const predictions = data.map(point => {
      let pred = 0;
      for (let i = 0; i <= degree; i++) {
        pred += coeffs[i] * Math.pow(point.x, i);
      }
      return pred;
    });

    const yMean = y.reduce((a, b) => a + b, 0) / y.length;
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const ssResidual = y.reduce((sum, yi, i) => sum + Math.pow(yi - predictions[i], 2), 0);
    const r2 = 1 - (ssResidual / ssTotal);
    setR2Score(parseFloat(r2.toFixed(4)));

    setTrained(true);
  };

  // Simplified normal equation solver
  const solveNormalEquation = (X: number[][], y: number[]): number[] => {
    const n = X.length;
    const m = X[0].length;
    
    // X^T X
    const XTX: number[][] = Array(m).fill(0).map(() => Array(m).fill(0));
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) {
        for (let k = 0; k < n; k++) {
          XTX[i][j] += X[k][i] * X[k][j];
        }
      }
    }
    
    // X^T y
    const XTy: number[] = Array(m).fill(0);
    for (let i = 0; i < m; i++) {
      for (let k = 0; k < n; k++) {
        XTy[i] += X[k][i] * y[k];
      }
    }
    
    // Solve using Gaussian elimination
    return gaussianElimination(XTX, XTy);
  };

  const gaussianElimination = (A: number[][], b: number[]): number[] => {
    const n = A.length;
    const Ab = A.map((row, i) => [...row, b[i]]);
    
    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(Ab[k][i]) > Math.abs(Ab[maxRow][i])) {
          maxRow = k;
        }
      }
      [Ab[i], Ab[maxRow]] = [Ab[maxRow], Ab[i]];
      
      for (let k = i + 1; k < n; k++) {
        const factor = Ab[k][i] / Ab[i][i];
        for (let j = i; j <= n; j++) {
          Ab[k][j] -= factor * Ab[i][j];
        }
      }
    }
    
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = Ab[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= Ab[i][j] * x[j];
      }
      x[i] /= Ab[i][i];
    }
    
    return x;
  };

  const predict = () => {
    if (!trained || !predictionX) return;
    const x = parseFloat(predictionX);
    let y = 0;
    for (let i = 0; i <= degree; i++) {
      y += coefficients[i] * Math.pow(x, i);
    }
    setPredictionY(parseFloat(y.toFixed(2)));
  };

  const getCurveData = () => {
    if (!trained) return [];
    const minX = Math.min(...data.map(d => d.x));
    const maxX = Math.max(...data.map(d => d.x));
    const points = [];
    for (let x = minX; x <= maxX; x += (maxX - minX) / 100) {
      let y = 0;
      for (let i = 0; i <= degree; i++) {
        y += coefficients[i] * Math.pow(x, i);
      }
      points.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
    }
    return points;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Polynomial Regression</CardTitle>
          <CardDescription>
            Fit a polynomial curve to capture non-linear relationships in data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Polynomial Degree: {degree}</Label>
              <Slider
                value={[degree]}
                onValueChange={([value]) => {
                  setDegree(value);
                  setTrained(false);
                }}
                min={1}
                max={5}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher degree = more complex curve (but risk of overfitting)
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={generateData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New Data
              </Button>
              <Button onClick={trainModel} disabled={data.length === 0}>
                <PlayCircle className="w-4 h-4 mr-2" />
                Train Model (Degree {degree})
              </Button>
            </div>
          </div>

          {trained && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>R² Score</CardDescription>
                  <CardTitle className="text-2xl">
                    {r2Score}
                    <Badge className="ml-2" variant={r2Score > 0.8 ? "default" : "secondary"}>
                      {r2Score > 0.8 ? "Excellent" : r2Score > 0.6 ? "Good" : "Fair"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Polynomial Degree</CardDescription>
                  <CardTitle className="text-2xl">{degree}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}

          <div className="border rounded-lg p-4">
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" name="X" />
                <YAxis dataKey="y" type="number" name="Y" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter name="Data Points" data={data} fill="hsl(var(--primary))" />
                {trained && (
                  <Scatter name="Polynomial Curve" data={getCurveData()} fill="hsl(var(--destructive))" line shape="none" />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {trained && (
            <Card className="bg-accent/20">
              <CardHeader>
                <CardTitle className="text-lg">Make Predictions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="predX">X Value</Label>
                    <Input
                      id="predX"
                      type="number"
                      value={predictionX}
                      onChange={(e) => setPredictionX(e.target.value)}
                      placeholder="Enter X value"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={predict}>Predict</Button>
                  </div>
                </div>
                {predictionY !== null && (
                  <div className="p-4 bg-background rounded-lg border">
                    <p className="text-sm text-muted-foreground">Predicted Y:</p>
                    <p className="text-2xl font-bold text-primary">{predictionY}</p>
                  </div>
                )}
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
            <h4 className="font-semibold mb-1">1. Polynomial Equation</h4>
            <p className="text-muted-foreground">
              Instead of a straight line, polynomial regression fits a curve: 
              <code className="bg-background px-2 py-1 rounded ml-1">y = a₀ + a₁x + a₂x² + ... + aₙxⁿ</code>
              <br />The degree (n) determines curve complexity.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">2. Choosing the Right Degree</h4>
            <p className="text-muted-foreground">
              • <strong>Degree 1:</strong> Linear (straight line)<br />
              • <strong>Degree 2:</strong> Quadratic (parabola) - captures simple curves<br />
              • <strong>Degree 3+:</strong> Higher curves - risk overfitting if too high
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">3. Overfitting Warning</h4>
            <p className="text-muted-foreground">
              High-degree polynomials can perfectly fit training data but perform poorly on new data. 
              This is called overfitting. Balance complexity with generalization.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">4. Real-World Applications</h4>
            <p className="text-muted-foreground">
              • Growth curves (population, business metrics)<br />
              • Physical phenomena (projectile motion)<br />
              • Economic trends with acceleration/deceleration<br />
              • Any non-linear relationships
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
