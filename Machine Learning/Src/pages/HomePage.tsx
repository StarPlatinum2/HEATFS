import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Layers, BarChart3, Network } from 'lucide-react';
import { SupervisedLearning } from './SupervisedLearning';
import { UnsupervisedLearning } from './UnsupervisedLearning';

type LearningType = 'home' | 'supervised' | 'unsupervised';

export function HomePage() {
  const [view, setView] = useState<LearningType>('home');

  if (view === 'supervised') {
    return <SupervisedLearning onBack={() => setView('home')} />;
  }

  if (view === 'unsupervised') {
    return <UnsupervisedLearning onBack={() => setView('home')} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">ML Explorer</h1>
            <p className="text-sm text-muted-foreground">Machine Learning Dataset Explorer</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Choose Your Learning Approach
            </h2>
            <p className="text-lg text-muted-foreground">
              Select between supervised or unsupervised machine learning
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Supervised Learning Card */}
            <Card 
              className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary/50"
              onClick={() => setView('supervised')}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Supervised Learning</CardTitle>
                <CardDescription className="text-base">
                  Learn from labeled data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Train models to predict outcomes based on labeled examples. Includes regression and classification algorithms.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Linear & Polynomial Regression</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Logistic Regression</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Prediction & Accuracy Metrics</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 group-hover:bg-primary/90">
                  Explore Supervised Learning
                </Button>
              </CardContent>
            </Card>

            {/* Unsupervised Learning Card */}
            <Card 
              className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary/50"
              onClick={() => setView('unsupervised')}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Unsupervised Learning</CardTitle>
                <CardDescription className="text-base">
                  Discover patterns in data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Find hidden patterns and structures in unlabeled data through clustering and dimensionality reduction.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>K-Means Clustering</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>PCA (Dimensionality Reduction)</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Pattern Discovery</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 group-hover:bg-primary/90">
                  Explore Unsupervised Learning
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Built with React, TypeScript, and ML.js • Explore machine learning interactively
        </div>
      </footer>
    </div>
  );
}
