import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { PlayCircle, RefreshCw, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function LinearRegressionDemo() {
  const [data, setData] = useState<{x: number, y: number}[]>([]);
  const [slope, setSlope] = useState(0);
  const [intercept, setIntercept] = useState(0);
  const [trained, setTrained] = useState(false);
  const [r2Score, setR2Score] = useState(0);
  const [predictionX, setPredictionX] = useState('');
  const [predictionY, setPredictionY] = useState<number | null>(null);

  // Generate sample data
  const generateData = () => {
    const newData = [];
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 100;
      const y = 2.5 * x + 10 + (Math.random() - 0.5) * 30;
      newData.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
    }
    setData(newData);
    setTrained(false);
    setPredictionY(null);
  };

  useEffect(() => {
    generateData();
  }, []);

  // Train linear regression model
  const trainModel = () => {
    if (data.length === 0) return;

    const n = data.length;
    const sumX = data.reduce((sum, point) => sum + point.x, 0);
    const sumY = data.reduce((sum, point) => sum + point.y, 0);
    const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0);

    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    setSlope(parseFloat(m.toFixed(4)));
    setIntercept(parseFloat(b.toFixed(4)));

    // Calculate R² score
    const yMean = sumY / n;
    const ssTotal = data.reduce((sum, point) => sum + Math.pow(point.y - yMean, 2), 0);
    const ssResidual = data.reduce((sum, point) => {
      const predicted = m * point.x + b;
      return sum + Math.pow(point.y - predicted, 2);
    }, 0);
    const r2 = 1 - (ssResidual / ssTotal);
    setR2Score(parseFloat(r2.toFixed(4)));

    setTrained(true);
  };

  // Predict new value
  const predict = () => {
    if (!trained || !predictionX) return;
    const x = parseFloat(predictionX);
    const y = slope * x + intercept;
    setPredictionY(parseFloat(y.toFixed(2)));
  };

  // Get line data for visualization
  const getLineData = () => {
    if (!trained) return [];
    const minX = Math.min(...data.map(d => d.x));
    const maxX = Math.max(...data.map(d => d.x));
    return [
      { x: minX, y: slope * minX + intercept },
      { x: maxX, y: slope * maxX + intercept }
    ];
  };

  const combinedData = trained ? [
    ...data.map(d => ({ ...d, type: 'data' })),
    ...getLineData().map(d => ({ ...d, type: 'line' }))
  ] : data.map(d => ({ ...d, type: 'data' }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Linear Regression</CardTitle>
          <CardDescription>
            Fit a straight line to predict continuous values. The model learns the relationship y = mx + b.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button onClick={generateData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New Data
            </Button>
            <Button onClick={trainModel} disabled={data.length === 0}>
              <PlayCircle className="w-4 h-4 mr-2" />
              Train Model
            </Button>
          </div>

          {trained && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Slope (m)</CardDescription>
                  <CardTitle className="text-2xl">{slope}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Intercept (b)</CardDescription>
                  <CardTitle className="text-2xl">{intercept}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>R² Score</CardDescription>
                  <CardTitle className="text-2xl">
                    {r2Score}
                    <Badge className="ml-2" variant={r2Score > 0.7 ? "default" : "secondary"}>
                      {r2Score > 0.7 ? "Good" : "Fair"}
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
                <XAxis dataKey="x" type="number" name="X" />
                <YAxis dataKey="y" type="number" name="Y" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter name="Data Points" data={data} fill="hsl(var(--primary))" />
                {trained && (
                  <Scatter name="Regression Line" data={getLineData()} fill="hsl(var(--destructive))" line shape="cross" />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {trained && (
            <Card className="bg-accent/20">
              <CardHeader>
                <CardTitle className="text-lg">Make Predictions</CardTitle>
                <CardDescription>Enter an X value to predict Y</CardDescription>
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
                    <p className="text-xs text-muted-foreground mt-2">
                      Formula: y = {slope} × {predictionX} + {intercept}
                    </p>
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
            <h4 className="font-semibold mb-1">1. Training Phase</h4>
            <p className="text-muted-foreground">
              The algorithm calculates the best-fit line using the least squares method. It finds slope (m) and intercept (b) 
              that minimize the sum of squared errors between actual and predicted values.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">2. The Equation</h4>
            <p className="text-muted-foreground">
              Linear regression follows the equation: <code className="bg-background px-2 py-1 rounded">y = mx + b</code>
              <br />where m is the slope (rate of change) and b is the y-intercept (starting value).
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">3. R² Score</h4>
            <p className="text-muted-foreground">
              The R² (coefficient of determination) measures how well the line fits the data. Values range from 0 to 1, 
              where 1 means perfect fit. Generally, R² &gt; 0.7 indicates a good model.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">4. Use Cases</h4>
            <p className="text-muted-foreground">
              • Predicting house prices based on size<br />
              • Forecasting sales from advertising spend<br />
              • Estimating exam scores from study hours<br />
              • Any scenario with linear relationships
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
