import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ChartContainer } from "@/components/ui/chart";

const PriceComparisonChart = ({ similarSuburbPrices }) => {
  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const chartConfig = {
    price: {
      color: "hsl(var(--primary))",
      label: "Estimated Price"
    }
  };

  const calculatePriceDifference = () => {
    if (!similarSuburbPrices || similarSuburbPrices.length < 2) return null;
    const selectedPrice = similarSuburbPrices[0].price;
    const avgOtherPrices = similarSuburbPrices
      .slice(1)
      .reduce((acc, curr) => acc + curr.price, 0) / (similarSuburbPrices.length - 1);
    const difference = ((selectedPrice - avgOtherPrices) / avgOtherPrices) * 100;
    return difference;
  };

  if (!similarSuburbPrices || similarSuburbPrices.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Comparison</CardTitle>
        <CardDescription>Comparing with nearby suburbs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ChartContainer config={chartConfig}>
            <BarChart 
              data={similarSuburbPrices}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="suburb" 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => value.length > 15 ? `${value.slice(0, 15)}...` : value} 
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-white p-2 border rounded shadow-lg">
                      <p className="font-medium">{payload[0].payload.suburb}</p>
                      <p className="text-sm">{formatPrice(payload[0].value)}</p>
                    </div>
                  );
                }}
              />
              <Bar 
                dataKey="price" 
                fill={similarSuburbPrices[0].isSelected ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)"} 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {calculatePriceDifference() !== null && (
          <div className="flex gap-2 font-medium leading-none">
            {calculatePriceDifference() > 0 ? (
              <>
                Higher than nearby suburbs by {Math.abs(calculatePriceDifference()).toFixed(1)}%
                <TrendingUp className="h-4 w-4 text-green-500" />
              </>
            ) : (
              <>
                Lower than nearby suburbs by {Math.abs(calculatePriceDifference()).toFixed(1)}%
                <TrendingDown className="h-4 w-4 text-red-500" />
              </>
            )}
          </div>
        )}
        <div className="leading-none text-muted-foreground">
          Comparing prices with suburbs within 2km radius
        </div>
      </CardFooter>
    </Card>
  );
};

export default PriceComparisonChart;