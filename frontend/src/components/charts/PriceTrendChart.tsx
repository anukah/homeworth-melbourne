import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  // Early return if no suburb is selected
  if (!selectedSuburb) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-gray-500">Select a suburb to view price trends</p>
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
        .filter(([key]) => key !== 'Suburb' && !isNaN(Number(key))) // Remove non-year keys
        .map(([year, price]) => ({
          year,
          price: typeof price === 'string' ? Number(price) : price
        }))
        .sort((a, b) => Number(a.year) - Number(b.year)) // Sort by year
    : [];

  // Format price for tooltip and axis
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
        <div className="bg-white p-4 border rounded shadow">
          <p className="font-medium">{`Year: ${label}`}</p>
          <p className="text-blue-600">
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
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-gray-500">No price data available for {selectedSuburb}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate min and max values for better Y axis range
  const minPrice = Math.min(...chartData.map(d => d.price));
  const maxPrice = Math.max(...chartData.map(d => d.price));
  const yAxisDomain = [
    Math.floor(minPrice * 0.9), // Add 10% padding to the bottom
    Math.ceil(maxPrice * 1.1)   // Add 10% padding to the top
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Trend for {selectedSuburb}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 60, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis
                dataKey="year"
                tick={{ fill: '#666' }}
                tickLine={{ stroke: '#666' }}
                label={{ 
                  value: 'Year', 
                  position: 'insideBottom', 
                  offset: -20 
                }}
              />
              <YAxis
                domain={yAxisDomain}
                tickFormatter={formatPrice}
                tick={{ fill: '#666' }}
                tickLine={{ stroke: '#666' }}
                label={{ 
                  value: 'Median Price', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -50
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2 }}
                activeDot={{ r: 8 }}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceTrendChart;