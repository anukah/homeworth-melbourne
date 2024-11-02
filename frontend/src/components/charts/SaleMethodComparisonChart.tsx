// frontend/src/components/charts/SaleMethodComparisonChart.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Tooltip, TooltipProps, ResponsiveContainer } from 'recharts';
import { ChartContainer } from "@/components/ui/chart";

interface SaleMethodPrice {
  method: string;
  price: number;
  isSelected: boolean;
}

interface SaleMethodComparisonChartProps {
  formData: {
    Bedroom2: string;
    Bathroom: string;
    Suburb: string;
    Type: string;
  };
  currentMethod: string;
  predictions: {
    S: number;
    A: number;
    SP: number;
  };
}

const SaleMethodComparisonChart: React.FC<SaleMethodComparisonChartProps> = ({ 
  formData, 
  currentMethod, 
  predictions 
}) => {
  const formatPrice = (value: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const methodLabels: { [key: string]: string } = {
    'S': 'Private Sale',
    'A': 'Auction',
    'SP': 'Property Sale'
  };

  const chartData = React.useMemo(() => {
    return Object.entries(predictions).map(([method, price]) => ({
      method: methodLabels[method],
      price: price,
      isSelected: method === currentMethod
    }));
  }, [predictions, currentMethod]);

  const chartConfig = {
    price: {
      color: "hsl(220.9 39.3% 11%)",
      label: "Estimated Price"
    },
    label: {
      color: "hsl(0 0% 100%)"
    }
  };

  return (
    <Card className="bg-white border-zinc-200">
      <CardHeader>
        <CardTitle className="text-zinc-950">Sale Method Comparison</CardTitle>
        <CardDescription className="text-zinc-500">
          Price estimates for different sale methods in {formData.Suburb}
          {' '}({formData.Bedroom2} bed, {formData.Bathroom} bath {
            formData.Type === 'h' ? 'house' : 
            formData.Type === 'u' ? 'unit' : 'townhouse'
          })
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={chartConfig}>
              <BarChart 
                data={chartData}
                layout="vertical"
                margin={{ top: 20, right: 120, left: 20, bottom: 10 }}
              >
                <CartesianGrid 
                  horizontal={false}
                  stroke="hsl(240 50.9% 90%)" 
                />
                <YAxis 
                  type="category"
                  hide
                />
                <XAxis
                  type="number"
                  tickFormatter={formatPrice}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(240 10% 33.9%)' }}
                />
                <Tooltip
                  content={({ active, payload }: TooltipProps<number, string>) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white p-2 border border-zinc-200 rounded shadow-sm">
                        <p className="font-medium text-zinc-950">{payload[0].payload.method}</p>
                        <p className="text-sm text-zinc-500">{formatPrice(payload[0].value as number)}</p>
                      </div>
                    );
                  }}
                />
                <Bar 
                  dataKey="price" 
                  radius={[0, 4, 4, 0]}
                  shape={(props: any) => {
                    const { x, y, width, height } = props;
                    const isSelected = props.payload.isSelected;
                    
                    return (
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={isSelected ? "hsl(173 58% 39% /0.5)" : "hsl(30 80% 55% / 0.3)"}
                        rx={4}
                        ry={4}
                        className={isSelected ? "stroke-1 stroke-green-900 border-dashed" : ""}
                      />
                    );
                  }}
                >
                  <LabelList
                    dataKey="method"
                    position="insideLeft"
                    offset={8}
                    className="fill-zinc-900 font-medium"
                    fontSize={12}
                  />
                  <LabelList
                    dataKey="price"
                    position="right"
                    offset={8}
                    className="fill-zinc-600"
                    fontSize={12}
                    formatter={formatPrice}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SaleMethodComparisonChart;