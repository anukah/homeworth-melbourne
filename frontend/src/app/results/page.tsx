"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import PriceComparisonChart from '@/components/charts/PriceComparisonChart';

interface PredictionData {
  prediction: number;
  similarPrices: Array<{ suburb: string; price: number; isSelected: boolean; }>;
}

const PredictionResults = () => {
  const router = useRouter();
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('predictionResult');
    if (storedData) {
      setPredictionData(JSON.parse(storedData));
    }
  }, []);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!predictionData) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p>No prediction data available. Please make a prediction first.</p>
            <Button onClick={() => router.push('/price-predictor')} className="mt-4">
              Go to Predictor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Prediction Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle className="text-green-800">Estimated Price</AlertTitle>
            <AlertDescription className="text-2xl font-bold text-green-900 mt-2">
              {formatPrice(predictionData.prediction)}
            </AlertDescription>
          </Alert>

          <PriceComparisonChart similarSuburbPrices={predictionData.similarPrices} />

          <Button 
            onClick={() => router.push('.')}
            className="w-full"
          >
            Make Another Prediction
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionResults;