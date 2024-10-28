import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, TooltipProps } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ChartContainer } from "@/components/ui/chart";

interface SuburbPrice {
  suburb: string;
  price: number;
  isSelected: boolean;
}

interface PriceComparisonChartProps {
  similarSuburbPrices: SuburbPrice[];
}

const PriceComparisonChart: React.FC<PriceComparisonChartProps> = ({ similarSuburbPrices }) => {
  const formatPrice = (value: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const chartConfig = {
    price: {
      color: "hsl(220.9 39.3% 11%)",
      label: "Estimated Price"
    }
  };

  const calculatePriceDifference = (): number | null => {
    if (!similarSuburbPrices || similarSuburbPrices.length < 2) return null;
    const selectedPrice = similarSuburbPrices.find(s => s.isSelected)?.price || 0;
    const avgOtherPrices = similarSuburbPrices
      .filter(s => !s.isSelected)
      .reduce((acc, curr) => acc + curr.price, 0) / (similarSuburbPrices.length - 1);
    const difference = ((selectedPrice - avgOtherPrices) / avgOtherPrices) * 100;
    return difference;
  };

  const sortedData = React.useMemo(() => {
    if (!similarSuburbPrices || similarSuburbPrices.length === 0) return [];
    
    const selected = similarSuburbPrices.find(s => s.isSelected);
    const others = similarSuburbPrices.filter(s => !s.isSelected);
    
    const sortedOthers = others.sort((a, b) => a.price - b.price);
    const leftHalf = sortedOthers.slice(0, Math.floor(sortedOthers.length / 2));
    const rightHalf = sortedOthers.slice(Math.floor(sortedOthers.length / 2));
    
    return [...leftHalf, selected, ...rightHalf];
  }, [similarSuburbPrices]);

  if (!similarSuburbPrices || similarSuburbPrices.length === 0) return null;

  return (
    <Card className="bg-white border-zinc-200">
      <CardHeader>
        <CardTitle className="text-zinc-950">Price Comparison</CardTitle>
        <CardDescription className="text-zinc-500">
          Comparing with suburbs with the similar distance from CBD
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-fit w-full">
          <ChartContainer config={chartConfig}>
            <BarChart 
              data={sortedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="hsl(240 5.9% 90%)" 
              />
              <XAxis 
                dataKey="suburb" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: 'hsl(240 10% 33.9%)' }}
                tickFormatter={(value: string) => value.length > 15 ? `${value.slice(0, 15)}...` : value}
              />
              <Tooltip
                content={({ active, payload }: TooltipProps<number, string>) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-white p-2 border border-zinc-200 rounded shadow-sm">
                      <p className="font-medium text-zinc-950">{payload[0].payload.suburb}</p>
                      <p className="text-sm text-zinc-500">{formatPrice(payload[0].value as number)}</p>
                    </div>
                  );
                }}
              />
              <Bar 
                dataKey="price" 
                fill="hsl(221 8.2% 53.3% / 0.3)"
                radius={[4, 4, 0, 0]}
                shape={(props: any) => {
                  const { x, y, width, height, fill } = props;
                  const isSelected = props.payload.isSelected;
                  
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={isSelected ? "hsl(221 8.2% 53.3%)" : fill}
                      rx={4}
                      ry={4}
                      className={isSelected ? "stroke-2 stroke-black border-dashed" : ""}
                    />
                  );
                }}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm border-t border-zinc-200">
        {calculatePriceDifference() !== null && (
          <div className="flex gap-2 font-medium leading-none text-zinc-950 mt-4">
            {calculatePriceDifference()! > 0 ? (
            
              <>
                Higher than nearby suburbs by {Math.abs(calculatePriceDifference()!).toFixed(1)}%
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </>
            ) : (
              <>
                Lower than nearby suburbs by {Math.abs(calculatePriceDifference()!).toFixed(1)}%
                <TrendingDown className="h-4 w-4 text-red-600" />
              </>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PriceComparisonChart;