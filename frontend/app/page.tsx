import HousePricePredictor from '../src/components/HousePricePredictor';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">
          House Price Predictor
        </h1>
        <HousePricePredictor />
      </div>
    </main>
  );
}