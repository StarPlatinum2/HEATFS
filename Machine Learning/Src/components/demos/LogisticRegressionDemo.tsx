import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PlayCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function LogisticRegressionDemo() {
  const [data, setData] = useState<{x: number, y: number, class: number}[]>([]);
  const [weights, setWeights] = useState<number[]>([0, 0]);
  const [trained, setTrained] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [predictionX, setPredictionX] = useState('');
  const [predictionResult, setPredictionResult] = useState<{class: number, probability: number} | null>(null);

  // Generate binary classification data
  const generateData = () => {
    const newData = [];
    
    // Class 0 (lower values)
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 50 + 10;
      const noise = (Math.random() - 0.5) * 15;
      const y = 0.5 * x + noise;
      newData.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)), class: 0 });
    }
    
    // Class 1 (higher values)
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 50 + 10;
      const noise = (Math.random() - 0.5) * 15;
      const y = 0.5 * x + 30 + noise;
      newData.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)), class: 1 });
    }
    
    setData(newData);
    setTrained(false);
    setPredictionResult(null);
  };

  useEffect(() => {
    generateData();
  }, []);

  // Sigmoid function
  const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

  // Train logistic regression using gradient descent
  const trainModel = () => {
    if (data.length === 0) return;

    let w0 = 0;
    let w1 = 0;
    let w2 = 0;
    const learningRate = 0.01;
    const iterations = 1000;

    for (let iter = 0; iter < iterations; iter++) {
      let dw0 = 0;
      let dw1 = 0;
      let dw2 = 0;

      for (const point of data) {
        const z = w0 + w1 * point.x + w2 * point.y;
        const prediction = sigmoid(z);
        const error = prediction - point.class;

        dw0 += error;
        dw1 += error * point.x;
        dw2 += error * point.y;
      }

      w0 -= (learningRate / data.length) * dw0;
      w1 -= (learningRate / data.length) * dw1;
      w2 -= (learningRate / data.length) * dw2;
    }

    setWeights([w0, w1, w2]);

    // Calculate accuracy
    let correct = 0;
    for (const point of data) {
      const z = w0 + w1 * point.x + w2 * point.y;
      const probability = sigmoid(z);
      const predictedClass = probability >= 0.5 ? 1 : 0;
      if (predictedClass === point.class) correct++;
    }
    setAccuracy(parseFloat(((correct / data.length) * 100).toFixed(2)));

    setTrained(true);
  };

  const predict = () => {
    if (!trained || !predictionX) return;
    const x = parseFloat(predictionX);
    // Use average y value for prediction
    const avgY = data.reduce((sum, d) => sum + d.y, 0) / data.length;
    const z = weights[0] + weights[1] * x + weights[2] * avgY;
    const probability = sigmoid(z);
    const predictedClass = probability >= 0.5 ? 1 : 0;
    setPredictionResult({
      class: predictedClass,
      probability: parseFloat((probability * 100).toFixed(2))
    });
  };

  // Get decision boundary points
  const getDecisionBoundary = () => {
    if (!trained) return [];
    const minX = Math.min(...data.map(d => d.x));
    const maxX = Math.max(...data.map(d => d.x));
    
    // For decision boundary, probability = 0.5, so w0 + w1*x + w2*y = 0
    // Solving for y: y = -(w0 + w1*x) / w2
    if (Math.abs(weights[2]) < 0.001) return [];
    
    return [
      { x: minX, y: -(weights[0] + weights[1] * minX) / weights[2] },
      { x: maxX, y: -(weights[0] + weights[1] * maxX) / weights[2] }
    ];
  };

  const class0Data = data.filter(d => d.class === 0);
  const class1Data = data.filter(d => d.class === 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logistic Regression</CardTitle>
          <CardDescription>
            Binary classification using a sigmoid function to predict probabilities between 0 and 1.
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
              Train Classifier
            </Button>
          </div>

          {trained && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Accuracy</CardDescription>
                  <CardTitle className="text-2xl">
                    {accuracy}%
                    <Badge className="ml-2" variant={accuracy > 80 ? "default" : "secondary"}>
                      {accuracy > 80 ? "Excellent" : accuracy > 60 ? "Good" : "Fair"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Weights</CardDescription>
                  <div className="text-sm font-mono mt-1">
                    w₀: {weights[0].toFixed(3)}<br />
                    w₁: {weights[1].toFixed(3)}<br />
                    w₂: {weights[2].toFixed(3)}
                  </div>
                </CardHeader>
              </Card>
            </div>
          )}

          <div className="border rounded-lg p-4">
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" name="Feature 1" />
                <YAxis dataKey="y" type="number" name="Feature 2" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter name="Class 0" data={class0Data} fill="hsl(var(--chart-2))" />
                <Scatter name="Class 1" data={class1Data} fill="hsl(var(--primary))" />
                {trained && getDecisionBoundary().length > 0 && (
                  <Scatter name="Decision Boundary" data={getDecisionBoundary()} fill="hsl(var(--destructive))" line shape="none" />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {trained && (
            <Card className="bg-accent/20">
              <CardHeader>
                <CardTitle className="text-lg">Make Predictions</CardTitle>
                <CardDescription>Enter Feature 1 value to classify</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="predX">Feature 1 Value</Label>
                    <Input
                      id="predX"
                      type="number"
                      value={predictionX}
                      onChange={(e) => setPredictionX(e.target.value)}
                      placeholder="Enter value"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={predict}>Classify</Button>
                  </div>
                </div>
                {predictionResult !== null && (
                  <div className="p-4 bg-background rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm text-muted-foreground">Predicted Class:</p>
                      <Badge variant={predictionResult.class === 1 ? "default" : "secondary"}>
                        Class {predictionResult.class}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-primary mb-2">{predictionResult.probability}%</p>
                    <p className="text-xs text-muted-foreground">
                      Confidence that this belongs to Class {predictionResult.class}
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
            <h4 className="font-semibold mb-1">1. Sigmoid Function</h4>
            <p className="text-muted-foreground">
              Logistic regression uses the sigmoid function: <code className="bg-background px-2 py-1 rounded">σ(z) = 1 / (1 + e^(-z))</code>
              <br />This maps any input to a probability between 0 and 1.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">2. Decision Boundary</h4>
            <p className="text-muted-foreground">
              The red line shows where probability = 0.5. Points above are classified as Class 1, below as Class 0. 
              The algorithm learns the optimal position and angle of this boundary.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">3. Training Process</h4>
            <p className="text-muted-foreground">
              Uses gradient descent to minimize prediction errors. Adjusts weights iteratively to find the best decision boundary 
              that separates the two classes.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">4. Real-World Applications</h4>
            <p className="text-muted-foreground">
              • Email spam detection (spam/not spam)<br />
              • Medical diagnosis (disease/healthy)<br />
              • Credit approval (approve/reject)<br />
              • Customer churn prediction (stay/leave)<br />
              • Any yes/no classification problem
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
