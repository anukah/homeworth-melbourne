import React, { useState, useEffect, useMemo, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check } from 'lucide-react';
import { Combobox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import suburbData from '@/data/suburb_data.json';

interface SuburbDataType {
  Suburb: string;
  Distance: number;
  Postcode: number;
  Propertycount: number;
  Regionname: string;
}

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

interface ComparisonData {
  suburb: string;
  price: number;
  isSelected: boolean;
}

interface PredictorFormProps {
  onPredictionComplete: (prediction: number, similarPrices: ComparisonData[]) => void;
}

const INITIAL_FORM_DATA: FormData = {
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
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const PredictorForm: React.FC<PredictorFormProps> = ({ onPredictionComplete }) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Memoize suburb data to prevent unnecessary re-renders
  const SUBURB_DATA = useMemo(() => suburbData as SuburbDataType[], []);

  const filteredSuburbs = useMemo(() => 
    query === ''
      ? SUBURB_DATA
      : SUBURB_DATA.filter((suburb) =>
          suburb.Suburb.toLowerCase().includes(query.toLowerCase())
        ),
    [query, SUBURB_DATA]
  );

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
    const sanitizedValue = name === 'Landsize' || name === 'BuildingArea' 
      ? Math.max(0, Number(value)).toString()
      : value;

    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  const handleSelectChange = (name: keyof FormData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSuburbChange = (value: string) => {
    const selectedSuburb = SUBURB_DATA.find(s => s.Suburb === value);
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

  const findSimilarSuburbs = (distance: number): SuburbDataType[] => {
    return SUBURB_DATA
      .filter(s => 
        Math.abs(s.Distance - distance) <= 2 && 
        s.Suburb !== formData.Suburb
      )
      .slice(0, 4);
  };

  const createPredictionData = (suburb: SuburbDataType): FormData => ({
    ...formData,
    Suburb: suburb.Suburb,
    Distance: suburb.Distance.toString(),
    Postcode: suburb.Postcode.toString(),
    Propertycount: suburb.Propertycount.toString(),
    Regionname: suburb.Regionname,
    CouncilArea: suburb.Suburb
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const distance = parseFloat(formData.Distance);
      const similarSuburbs = findSimilarSuburbs(distance);
      const predictions = [
        formData,
        ...similarSuburbs.map(createPredictionData)
      ];

      const responses = await Promise.all(
        predictions.map(predictionData =>
          fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(predictionData),
          })
        )
      );

      if (!responses.every(response => response.ok)) {
        throw new Error('One or more predictions failed');
      }

      const results = await Promise.all(
        responses.map(response => response.json() as Promise<PredictionResult>)
      );

      const comparisonData: ComparisonData[] = predictions.map((pred, index) => ({
        suburb: pred.Suburb,
        price: results[index].predicted_price,
        isSelected: index === 0
      }));

      onPredictionComplete(results[0].predicted_price, comparisonData);
    } catch (err) {
      setError('Failed to get predictions. Please try again.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="space-y-1 pb-4 border-b">
        <CardTitle className="text-xl font-bold text-gray-900">Melbourne Housing Price Predictor</CardTitle>
        <CardDescription>Enter property details to get an estimated price</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Suburb</label>
                <Combobox value={formData.Suburb} onChange={handleSuburbChange}>
                  <div className="relative">
                    <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left border border-input focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2">
                      <Combobox.Input
                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                        onChange={(event) => setQuery(event.target.value)}
                        displayValue={(suburb: string) => suburb}
                        placeholder="Select suburb..."
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                      afterLeave={() => setQuery('')}
                    >
                      <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                        {filteredSuburbs.length === 0 && query !== '' ? (
                          <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                            Nothing found.
                          </div>
                        ) : (
                          filteredSuburbs.map((suburb) => (
                            <Combobox.Option
                              key={suburb.Suburb}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-primary text-white' : 'text-gray-900'
                                }`
                              }
                              value={suburb.Suburb}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? 'font-medium' : 'font-normal'
                                    }`}
                                  >
                                    {suburb.Suburb}
                                  </span>
                                  {selected ? (
                                    <span
                                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                        active ? 'text-white' : 'text-primary'
                                      }`}
                                    >
                                      <Check className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </Transition>
                  </div>
                </Combobox>
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
                <Select value={formData.YearBuilt} onValueChange={handleSelectChange('YearBuilt')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year range" />
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
                <Select value={formData.Type} onValueChange={handleSelectChange('Type')}>
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
                <Select value={formData.Method} onValueChange={handleSelectChange('Method')}>
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