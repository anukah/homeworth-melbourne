//frontend/src/components/form/PricePredictorForm.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Tooltip, TooltipProps, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ChartContainer } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SuburbPrice {
  suburb: string;
  price: number;
  isSelected: boolean;
}

interface PriceComparisonChartProps {
  similarSuburbPrices: SuburbPrice[];
}

const PriceComparisonChart: React.FC<PriceComparisonChartProps> = ({ similarSuburbPrices }) => {
  const [displayCount, setDisplayCount] = React.useState<string>("8");
  const [sortOrder, setSortOrder] = React.useState<string>("price");

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
    },
    label: {
      color: "hsl(0 0% 100%)"
    }
  };

  const calculatePriceDifference = (filteredData: SuburbPrice[]): number | null => {
    if (!filteredData || filteredData.length < 2) return null;
    const selectedPrice = filteredData.find(s => s.isSelected)?.price || 0;
    const avgOtherPrices = filteredData
      .filter(s => !s.isSelected)
      .reduce((acc, curr) => acc + curr.price, 0) / (filteredData.length - 1);
    const difference = ((selectedPrice - avgOtherPrices) / avgOtherPrices) * 100;
    return difference;
  };

  const filteredAndSortedData = React.useMemo(() => {
    if (!similarSuburbPrices || similarSuburbPrices.length === 0) return [];

    const selected = similarSuburbPrices.find(s => s.isSelected);
    if (!selected) return [];

    // Get all suburbs including selected one for initial sorting
    let allSuburbs = [...similarSuburbPrices];

    // Sort all suburbs based on the selected criteria
    allSuburbs.sort((a, b) => {
      switch (sortOrder) {
        case "price":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name":
          return a.suburb.localeCompare(b.suburb);
        case "difference":
          const selectedPrice = selected.price;
          return Math.abs(selectedPrice - a.price) - Math.abs(selectedPrice - b.price);
        default:
          return 0;
      }
    });

    // Handle display count
    if (displayCount !== "all") {
      const count = parseInt(displayCount);
      
      if (sortOrder === "difference") {
        // Filter out selected suburb first, then take closest ones and add selected suburb back at the start
        const nonSelectedSuburbs = allSuburbs.filter(s => !s.isSelected).slice(0, count - 1);
        allSuburbs = [selected, ...nonSelectedSuburbs];
      } else {
        // Find the index of selected suburb in sorted array
        const selectedIndex = allSuburbs.findIndex(s => s.isSelected);
        const totalToShow = count;
        
        // Calculate how many items to take before and after the selected suburb
        const itemsBeforeSelected = Math.floor((totalToShow - 1) / 2);
        const itemsAfterSelected = totalToShow - 1 - itemsBeforeSelected;
        
        // Get the range of items around the selected suburb
        const startIndex = Math.max(0, selectedIndex - itemsBeforeSelected);
        const endIndex = Math.min(allSuburbs.length, selectedIndex + itemsAfterSelected + 1);
        
        // Take slice without adding selected suburb again
        allSuburbs = allSuburbs.slice(startIndex, endIndex);
        
        // If we couldn't get enough items after the selected suburb, take more from before
        if (allSuburbs.length < totalToShow && startIndex > 0) {
          const remaining = totalToShow - allSuburbs.length;
          const additionalStart = Math.max(0, startIndex - remaining);
          allSuburbs = [...allSuburbs.slice(additionalStart, startIndex), ...allSuburbs];
        }
      }
    }

    return allSuburbs;
  }, [similarSuburbPrices, displayCount, sortOrder]);

  if (!similarSuburbPrices || similarSuburbPrices.length === 0) return null;

  const getChartHeight = () => {
    const baseHeight = 50;
    const minHeight = 400;
    return Math.max(minHeight, filteredAndSortedData.length * baseHeight);
  };

  return (
    <Card className="bg-white border-zinc-200">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-zinc-950">Price Comparison</CardTitle>
            <CardDescription className="text-zinc-500">
              Comparing with suburbs with similar distance from CBD
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={displayCount} onValueChange={setDisplayCount}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Display Count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 Suburbs</SelectItem>
                <SelectItem value="8">8 Suburbs</SelectItem>
                <SelectItem value="all">All Suburbs</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Price (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                <SelectItem value="name">Suburb Name</SelectItem>
                <SelectItem value="difference">Price Difference</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full" style={{ height: getChartHeight() }}>
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={chartConfig}>
              <BarChart 
                data={filteredAndSortedData}
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
                        <p className="font-medium text-zinc-950">{payload[0].payload.suburb}</p>
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
                    dataKey="suburb"
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
      <CardFooter className="flex-col items-start gap-2 text-sm border-t border-zinc-200">
        {calculatePriceDifference(filteredAndSortedData) !== null && (
          <div className="flex gap-2 font-medium leading-none text-zinc-950 mt-4">
            {calculatePriceDifference(filteredAndSortedData)! > 0 ? (
              <>
                Higher than nearby suburbs by {Math.abs(calculatePriceDifference(filteredAndSortedData)!).toFixed(1)}%
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </>
            ) : (
              <>
                Lower than nearby suburbs by {Math.abs(calculatePriceDifference(filteredAndSortedData)!).toFixed(1)}%
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