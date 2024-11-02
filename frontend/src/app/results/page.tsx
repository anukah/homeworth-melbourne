// src/app/results/page.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePrediction } from '../PredictionContext';
import PriceComparisonChart from '@/components/charts/PriceComparisonChart';
import SaleMethodComparisonChart from '@/components/charts/SaleMethodComparisonChart';
import PriceTrendChart from '@/components/charts/PriceTrendChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {Alert, AlertTitle, AlertDescription} from '@/components/ui/alert' 

const ResultsPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { predictionData } = usePrediction();
  const { prediction, similarPrices, saleMethodPrices, formData } = predictionData;

  React.useEffect(() => {
    if (!prediction) {
      toast({
        title: "No prediction data",
        description: "Redirecting to prediction form...",
        variant: "destructive",
      });
      router.push('/');
    }
  }, [prediction, router, toast]);

  if (!prediction) {
    return null;
  }
  
  const formatPrice = (price: number | null) => {
    if (!price) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  

  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Prediction Results</h1>
        <Button
          className=''
          variant="default" 
          onClick={() => router.push('/')}
        >
          Make Another Prediction
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle className="text-green-800 text-base sm:text-lg">
              Estimated Price
            </AlertTitle>
            <AlertDescription className="text-2xl sm:text-2xl md:text-3xl font-bold text-green-900 mt-2">
              {formatPrice(prediction)}
            </AlertDescription>
            <div className="mt-2 text-sm text-green-700">
              For {formData.Suburb}, {formData.Bedroom2} bedrooms, {formData.Bathroom} bathrooms
            </div>
          </Alert>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
    
        {/* Price Comparison Chart */}
        <PriceComparisonChart similarSuburbPrices={similarPrices} />
        
        {/* Trend Chart */}
        <PriceTrendChart selectedSuburb={formData.Suburb} />
        
        {/* Sale Method Comparison Chart */}
        {saleMethodPrices && (
            <SaleMethodComparisonChart
            formData={formData}
            currentMethod={formData.Method}
            predictions={saleMethodPrices}
            />
        )}
      </div>
    </main>
  );
};

export default ResultsPage;