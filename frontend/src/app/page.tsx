"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import PredictorForm from '../components/form/PricePredictorForm';

const PricePredictorPage = () => {
  const router = useRouter();

  const handlePrediction = (prediction: number, similarPrices: Array<{ suburb: string; price: number; isSelected: boolean; }>) => {
    localStorage.setItem('predictionResult', JSON.stringify({
      prediction,
      similarPrices
    }));
    router.push('/results');
  };

  return (
    <div className="flex justify-center items-center h-screen max-w-4xl mx-auto p-4">
      <PredictorForm onPredictionComplete={handlePrediction} />
    </div>
  );
};

export default PricePredictorPage;