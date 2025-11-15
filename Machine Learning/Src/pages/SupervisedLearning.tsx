import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, GitBranch, Target, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LinearRegressionDemo } from '@/components/demos/LinearRegressionDemo';
import { PolynomialRegressionDemo } from '@/components/demos/PolynomialRegressionDemo';
import { LogisticRegressionDemo } from '@/components/demos/LogisticRegressionDemo';

interface SupervisedLearningProps {
  onBack: () => void;
}

export function SupervisedLearning({ onBack }: SupervisedLearningProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Supervised Learning</h1>
          <p className="text-muted-foreground">
            Learn from labeled data to make predictions
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <Alert className="mb-8 border-primary/50 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription>
            <strong>What is Supervised Learning?</strong> It's a machine learning approach where models learn from labeled training data. 
            The algorithm learns to map inputs to outputs by studying example input-output pairs. This is like learning with a teacher 
            who provides the correct answers during training.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="linear" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="linear">
              <TrendingUp className="w-4 h-4 mr-2" />
              Linear Regression
            </TabsTrigger>
            <TabsTrigger value="polynomial">
              <GitBranch className="w-4 h-4 mr-2" />
              Polynomial Regression
            </TabsTrigger>
            <TabsTrigger value="logistic">
              <Target className="w-4 h-4 mr-2" />
              Logistic Regression
            </TabsTrigger>
          </TabsList>

          <TabsContent value="linear">
            <LinearRegressionDemo />
          </TabsContent>

          <TabsContent value="polynomial">
            <PolynomialRegressionDemo />
          </TabsContent>

          <TabsContent value="logistic">
            <LogisticRegressionDemo />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
