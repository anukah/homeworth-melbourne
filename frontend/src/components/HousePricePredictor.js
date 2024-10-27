"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip } from 'recharts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { ChartContainer } from "@/components/ui/chart";
import suburbData from '@/data/suburb_data.json';

const HousePricePredictor = () => {
  const [formData, setFormData] = useState({
    Rooms: '',
    Distance: '',
    Postcode: '',
    Bedroom2: '',
    Bathroom: '',
    Car: '',
    Landsize: '',
    BuildingArea: '',
    YearBuilt: '',
    Propertycount: '',
    Type: '',
    Method: '',
    Regionname: '',
    CouncilArea: '',
    Suburb: ''
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [similarSuburbPrices, setSimilarSuburbPrices] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSuburbChange = (value) => {
    const selectedSuburb = suburbData.find(s => s.Suburb === value);
    if (selectedSuburb) {
      setFormData(prev => ({
        ...prev,
        Suburb: value,
        Distance: selectedSuburb.Distance.toString(),
        Postcode: selectedSuburb.Postcode.toString(),
        Propertycount: selectedSuburb.Propertycount.toString(),
        Regionname: selectedSuburb.Regionname,
        CouncilArea: selectedSuburb.Suburb
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const distance = parseFloat(formData.Distance);
      const similarSuburbs = suburbData
        .filter(s => 
          Math.abs(s.Distance - distance) <= 2 && 
          s.Suburb !== formData.Suburb
        )
        .slice(0, 4);

      const predictions = [
        formData,
        ...similarSuburbs.map(suburb => ({
          ...formData,
          Suburb: suburb.Suburb,
          Distance: suburb.Distance.toString(),
          Postcode: suburb.Postcode.toString(),
          Propertycount: suburb.Propertycount.toString(),
          Regionname: suburb.Regionname,
          CouncilArea: suburb.Suburb
        }))
      ];

      const responses = await Promise.all(
        predictions.map(predictionData =>
          fetch('http://localhost:8000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(predictionData),
          })
        )
      );

      if (responses.some(response => !response.ok)) {
        throw new Error('One or more predictions failed');
      }

      const results = await Promise.all(
        responses.map(response => response.json())
      );

      setPrediction(results[0].predicted_price);

      const comparisonData = predictions.map((pred, index) => ({
        suburb: pred.Suburb,
        price: results[index].predicted_price,
        isSelected: index === 0
      }));

      setSimilarSuburbPrices(comparisonData);
    } catch (err) {
      setError('Failed to get predictions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="bg-white shadow-lg">
        <CardHeader className="space-y-1 pb-4 border-b">
          <CardTitle className="text-xl font-bold text-gray-900">House Price Predictor</CardTitle>
          <CardDescription>Enter property details to get an estimated price</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suburb</label>
                  <Select value={formData.Suburb} onValueChange={handleSuburbChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select suburb" />
                    </SelectTrigger>
                    <SelectContent>
                      {suburbData.map((suburb) => (
                        <SelectItem key={suburb.Suburb} value={suburb.Suburb}>
                          {suburb.Suburb}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                  <Input
                    type="number"
                    name="Distance"
                    value={formData.Distance}
                    className="bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
                  <Input
                    type="number"
                    name="Rooms"
                    value={formData.Rooms}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <Input
                    type="number"
                    name="Bedroom2"
                    value={formData.Bedroom2}
                    onChange={handleInputChange }
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <Input
                    type="number"
                    name="Bathroom"
                    value={formData.Bathroom}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Car Spaces</label>
                  <Input
                    type="number"
                    name="Car"
                    value={formData.Car}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Land Size (m²)</label>
                  <Input
                    type="number"
                    name="Landsize"
                    value={formData.Landsize}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Building Area (m²)</label>
                  <Input
                    type="number"
                    name="BuildingArea"
                    value={formData.BuildingArea}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                  <Input
                    type="number"
                    name="YearBuilt"
                    value={formData.YearBuilt}
                    onChange={handleInputChange}
                    min="1800"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <Select
                    value={formData.Type}
                    onValueChange={(value) => handleSelectChange('Type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="h">House</SelectItem>
                      <SelectItem value="u">Unit</SelectItem>
                      <SelectItem value="t">Townhouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Method</label>
                  <Select
                    value={formData.Method}
                    onValueChange={(value) => handleSelectChange('Method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S">Private Sale</SelectItem>
                      <SelectItem value="A">Auction</SelectItem>
                      <SelectItem value="SP">Property Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating Price...
                </>
              ) : (
                'Get Price Prediction'
              )}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {prediction && (
            <div className="mt-6 space-y-6">
              <Alert className="bg-green-50 border-green-200">
                <AlertTitle className="text-green-800">Estimated Price</AlertTitle>
                <AlertDescription className="text-2xl font-bold text-green-900 mt-2">
                  {formatPrice(prediction)}
                </AlertDescription>
              </Alert>

              {similarSuburbPrices && similarSuburbPrices.length > 0 && (
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
                          <CartesianGrid strokeDasharray=" 3 3" vertical={false} />
                          <XAxis dataKey="suburb" tickLine={false} axisLine={false} tickFormatter={(value) => value.length > 15 ? `${value.slice(0, 15 )}...` : value} />
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
                          <Bar dataKey="price" fill={similarSuburbPrices[0].isSelected ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)"} radius={[4, 4, 0, 0]} />
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
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HousePricePredictor;