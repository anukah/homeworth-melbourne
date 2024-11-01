"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import suburbPrices from '@/data/suburb_prices.json';

// Define types for the data structure
type SuburbPrice = {
  Suburb: string;
  [key: string]: string | number;
};

type ChartDataPoint = {
  year: string;
  price: number;
};

interface PriceTrendChartProps {
  selectedSuburb?: string;
}

const PriceTrendChart: React.FC<PriceTrendChartProps> = ({ selectedSuburb }) => {
  // State for year range filter
  const [yearRange, setYearRange] = useState<{ start: number; end: number }>({
    start: 2000,
    end: new Date().getFullYear(),
  });

  // Early return if no suburb is selected
  if (!selectedSuburb) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Trend</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Select a suburb to view price trends</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find the price data for the selected suburb
  const suburbData = suburbPrices.find(
    item => item.Suburb === selectedSuburb.toUpperCase()
  );

  // Transform the data for Recharts
  const chartData: ChartDataPoint[] = suburbData
    ? Object.entries(suburbData)
        .filter(([key]) => key !== 'Suburb' && !isNaN(Number(key)))
        .map(([year, price]) => ({
          year,
          price: typeof price === 'string' ? Number(price) : price
        }))
        .sort((a, b) => Number(a.year) - Number(b.year))
    : [];

  // Filter data by the selected year range
  const filteredChartData = chartData.filter(
    (data) => Number(data.year) >= yearRange.start && Number(data.year) <= yearRange.end
  );

  // Format price for tooltip
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow-md">
          <p className="font-semibold">{`Year: ${label}`}</p>
          <p className="text-primary">
            {formatPrice(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // If no data is available for the selected suburb
  if (!suburbData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Trend</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">No price data available for {selectedSuburb}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate min and max values for better Y axis range
  const minPrice = Math.min(...filteredChartData.map(d => d.price));
  const maxPrice = Math.max(...filteredChartData.map(d => d.price));
  const yAxisDomain = [
    Math.floor(minPrice * 0.9),
    Math.ceil(maxPrice * 1.1)
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Trend</CardTitle>
        <CardDescription className="text-zinc-500">Comparing the Median Price of a House in {selectedSuburb} over the past decade</CardDescription>
      </CardHeader>
      <CardContent className="bg-white">
        <div className="mb-4 flex justify-between">
          <div className="flex items-center gap-4">
            <label htmlFor="startYear">Start Year:</label>
            <select
              id="startYear"
              value={yearRange.start}
              onChange={(e) =>
                setYearRange((prev) => ({ ...prev, start: Number(e.target.value) }))
              }
            >
              {Array.from(new Set(chartData.map(data => data.year))).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label htmlFor="endYear">End Year:</label>
            <select
              id="endYear"
              value={yearRange.end}
              onChange={(e) =>
                setYearRange((prev) => ({ ...prev, end: Number(e.target.value) }))
              }
            >
              {Array.from(new Set(chartData.map(data => data.year))).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredChartData}
              margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis
                dataKey="year"
                tick={{ fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                label={{ 
                  value: 'Year', 
                  position: 'insideBottom', 
                  offset: -10 
                }}
              />
              <YAxis
                domain={yAxisDomain}
                tick={{ display: 'none' }}
                tickLine={false}
                axisLine={false}
                label={{ 
                  value: 'Median Price', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -10
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(124.48,55.37%,23.73%)"
                fill="hsl(173 58% 39% /0.5)"
                strokeWidth={2}
                activeDot={{ r: 8 }}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceTrendChart;
