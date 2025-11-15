import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Layers, Maximize2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KMeansClusteringDemo } from '@/components/demos/KMeansClusteringDemo';
import { PCADemo } from '@/components/demos/PCADemo';
import { DBSCANDemo } from '@/components/demos/DBSCANDemo';

interface UnsupervisedLearningProps {
  onBack: () => void;
}

export function UnsupervisedLearning({ onBack }: UnsupervisedLearningProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Unsupervised Learning</h1>
          <p className="text-muted-foreground">
            Discover hidden patterns and structures in data
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <Alert className="mb-8 border-primary/50 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription>
            <strong>What is Unsupervised Learning?</strong> It's a machine learning approach where models find patterns in data without labeled outputs. 
            The algorithm explores the data structure to discover hidden relationships, groupings, or reduce dimensions. This is like learning 
            by observation without a teacher, finding natural patterns on your own.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="kmeans" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="kmeans">
              <Layers className="w-4 h-4 mr-2" />
              K-Means Clustering
            </TabsTrigger>
            <TabsTrigger value="pca">
              <Maximize2 className="w-4 h-4 mr-2" />
              PCA
            </TabsTrigger>
            <TabsTrigger value="dbscan">
              <Layers className="w-4 h-4 mr-2" />
              DBSCAN
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kmeans">
            <KMeansClusteringDemo />
          </TabsContent>

          <TabsContent value="pca">
            <PCADemo />
          </TabsContent>

          <TabsContent value="dbscan">
            <DBSCANDemo />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
