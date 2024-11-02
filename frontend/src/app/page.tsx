// app/page.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import PredictorForm from '@/components/form/PricePredictorForm';
import { usePrediction } from './PredictionContext';

const PricePredictorPage = () => {
  const router = useRouter();
  const { setPredictionData } = usePrediction();

  const handlePredictionComplete = (
    prediction: number,
    similarPrices: any[],
    saleMethodPrices: { S: number; A: number; SP: number },
    formData: any
  ) => {
    setPredictionData({
      prediction,
      similarPrices,
      saleMethodPrices,
      formData
    });
    router.push('/results');
  };

  return (
    <div className="container mx-auto p-4">
      <PredictorForm onPredictionComplete={handlePredictionComplete} />
    </div>
  );
};

export default PricePredictorPage;