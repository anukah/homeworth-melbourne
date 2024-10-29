"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import PriceComparisonChart from '@/components/charts/PriceComparisonChart';

interface PredictionData {
  prediction: number;
  similarPrices: Array<{
    suburb: string;
    bedrooms: number;
    bathrooms: number;
    price: number;
    isSelected: boolean;
  }>;
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

  const handleNewPrediction = () => {
    router.push('/');
    localStorage.removeItem('predictionResult');
  };

  if (!predictionData) {
    return (
      <div className="flex justify-center items-center h-screen w-screen mx-auto p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-zinc-600">No prediction data available. Please make a prediction first.</p>
              <Button 
                onClick={handleNewPrediction} 
                className="w-full sm:w-auto"
              >
                Go to Predictor
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Card className="bg-white shadow-lg overflow-hidden">
          <CardHeader className="p-4 sm:p-6 border-b border-gray-100">
            <CardTitle className="text-xl sm:text-xl font-bold text-gray-900">
              Prediction Results
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 p-4 sm:p-6">
            <Alert className="bg-green-50 border-green-200">
              <AlertTitle className="text-green-800 text-base sm:text-lg">
                Estimated Price
              </AlertTitle>
              <AlertDescription className="text-2xl sm:text-2xl md:text-3xl font-bold text-green-900 mt-2">
                {formatPrice(predictionData.prediction)}
              </AlertDescription>
            </Alert>

            <div className="rounded-lg overflow-hidden">
              <PriceComparisonChart 
                similarSuburbPrices={predictionData.similarPrices} 
              />
            </div>

            <div className="pt-4">
              <Button
                onClick={handleNewPrediction}
                className="w-full sm:w-auto sm:min-w-[200px] mx-auto block"
              >
                Make Another Prediction
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PredictionResults;