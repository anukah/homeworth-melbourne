// src/app/PredictionContext.tsx
"use client";

import React, { createContext, useContext, useState } from 'react';

interface SuburbPrice {
  suburb: string;
  price: number;
  isSelected: boolean;
}

interface FormData {
  Bedroom2: string;
  Bathroom: string;
  Car: string;
  Landsize: string;
  BuildingArea: string;
  YearBuilt: string;
  Suburb: string;
  Type: string;
  Method: string;
}

interface PredictionData {
  prediction: number | null;
  similarPrices: SuburbPrice[];
  saleMethodPrices: {
    S: number;
    A: number;
    SP: number;
  } | null;
  formData: FormData;
}

interface PredictionContextType {
  predictionData: PredictionData;
  setPredictionData: (data: PredictionData) => void;
}

const PredictionContext = createContext<PredictionContextType | undefined>(undefined);

export function PredictionProvider({ children }: { children: React.ReactNode }) {
  const [predictionData, setPredictionData] = useState<PredictionData>({
    prediction: null,
    similarPrices: [],
    saleMethodPrices: null,
    formData: {
      Bedroom2: '',
      Bathroom: '',
      Car: '',
      Landsize: '',
      BuildingArea: '',
      YearBuilt: '',
      Suburb: '',
      Type: '',
      Method: ''
    }
  });

  return (
    <PredictionContext.Provider value={{ predictionData, setPredictionData }}>
      {children}
    </PredictionContext.Provider>
  );
}

export function usePrediction() {
  const context = useContext(PredictionContext);
  if (context === undefined) {
    throw new Error('usePrediction must be used within a PredictionProvider');
  }
  return context;
}

export default PredictionContext;