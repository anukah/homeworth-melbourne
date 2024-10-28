import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import suburbData from '@/data/suburb_data.json';

interface FormData {
  Rooms: string;
  Distance: string;
  Postcode: string;
  Bedroom2: string;
  Bathroom: string;
  Car: string;
  Landsize: string;
  BuildingArea: string;
  YearBuilt: string;
  Propertycount: string;
  Type: string;
  Method: string;
  Regionname: string;
  CouncilArea: string;
  Suburb: string;
}

interface PredictionResult {
  predicted_price: number;
}

interface PredictorFormProps {
  onPredictionComplete: (prediction: number, similarPrices: Array<{ suburb: string; price: number; isSelected: boolean; }>) => void;
}

const PredictorForm: React.FC<PredictorFormProps> = ({ onPredictionComplete }) => {
  const [formData, setFormData] = useState<FormData>({
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

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Update Rooms whenever bedrooms or bathrooms change
  useEffect(() => {
    const bedrooms = parseInt(formData.Bedroom2) || 0;
    const bathrooms = parseInt(formData.Bathroom) || 0;
    const totalRooms = bedrooms + bathrooms;
    
    setFormData(prev => ({
      ...prev,
      Rooms: totalRooms.toString()
    }));
  }, [formData.Bedroom2, formData.Bathroom]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSuburbChange = (value: string) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        responses.map(response => response.json() as Promise<PredictionResult>)
      );

      const comparisonData = predictions.map((pred, index) => ({
        suburb: pred.Suburb,
        price: results[index].predicted_price,
        isSelected: index === 0
      }));

      onPredictionComplete(results[0].predicted_price, comparisonData);
    } catch (err) {
      setError('Failed to get predictions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
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

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <Input
                  type="number"
                  name="Bedroom2"
                  value={formData.Bedroom2}
                  onChange={handleInputChange}
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
      </CardContent>
    </Card>
  );
};

export default PredictorForm;