//frontend/src/components/form/PricePredictorForm.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, ChevronDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
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
  onPredictionComplete: (
    prediction: number,
    similarPrices: Array<{ suburb: string; price: number; isSelected: boolean }>,
    saleMethodPrices: {
      S: number;
      A: number;
      SP: number;
    },
    formData: FormData
  ) => void;
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
  const [open, setOpen] = useState(false);

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
      [name]: value,
      ...(name === 'Type' && value === 'u' ? { Landsize: '0' } : {})
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
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      // Make predictions for all sale methods
      const methodPredictions = await Promise.all(['S', 'A', 'SP'].map(method => 
        fetch('http://localhost:8000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            Method: method
          }),
        }).then(res => res.json())
      ));
  
      const saleMethodPrices = {
        S: methodPredictions[0].predicted_price,
        A: methodPredictions[1].predicted_price,
        SP: methodPredictions[2].predicted_price
      };
      const distance = parseFloat(formData.Distance);
      
      const similarSuburbs = suburbData
        .map(suburb => ({
          ...suburb,
          distanceDiff: Math.abs(suburb.Distance - distance)
        }))
        .filter(s => s.Suburb !== formData.Suburb)
        .sort((a, b) => a.distanceDiff - b.distanceDiff)
        .slice(0, 10);
      
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
        bedrooms: parseInt(pred.Bedroom2),
        bathrooms: parseInt(pred.Bathroom),
        price: results[index].predicted_price,
        isSelected: index === 0
      }));

      const predictionResult = {
        prediction: results[0].predicted_price,
        similarPrices: comparisonData,
        selectedSuburb: formData.Suburb
      };

      localStorage.setItem('predictionResult', JSON.stringify(predictionResult));
      
      onPredictionComplete(results[0].predicted_price, comparisonData, saleMethodPrices, formData);
    } catch (err) {
      console.error(err);
      setError('Failed to get predictions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="space-y-1 pb-4 border-b">
        <CardTitle className="text-xl font-bold text-gray-900 text-center">Melbourne Housing Price Predictor</CardTitle>
        <CardDescription className='text-center'>Enter property details to get an estimated price</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Suburb</label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full justify-between",
                        !formData.Suburb && "text-muted-foreground"
                      )}
                    >
                      {formData.Suburb || "Select suburb..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search suburb..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No suburb found.</CommandEmpty>
                        <CommandGroup>
                          {suburbData.map((suburb) => (
                            <CommandItem
                              key={suburb.Suburb}
                              value={suburb.Suburb}
                              onSelect={handleSuburbChange}
                            >
                              {suburb.Suburb}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  formData.Suburb === suburb.Suburb
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                <Select
                  value={formData.YearBuilt}
                  onValueChange={(value) => handleSelectChange('YearBuilt', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1950">1940-1960</SelectItem>
                    <SelectItem value="1970">1960-1980</SelectItem>
                    <SelectItem value="1990">1980-2000</SelectItem>
                    <SelectItem value="2015">2000-Present</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <Select
                  value={formData.Type}
                  onValueChange={(value) => handleSelectChange('Type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Method" />
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Land Size (m²)</label>
                <Input
                  type="number"
                  name="Landsize"
                  value={formData.Landsize}
                  onChange={handleInputChange}
                  min="0"
                  readOnly={formData.Type === 'u'}
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
