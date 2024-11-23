import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { DataTable } from './components/DataTable';
import { QualityChart } from './components/QualityChart';
import { PredictionModel } from './components/PredictionModel';
import { Search, Info } from 'lucide-react';

function App() {
  const [startDate, setStartDate] = React.useState<Date | null>(new Date());
  const [endDate, setEndDate] = React.useState<Date | null>(new Date());
  const [location, setLocation] = React.useState<string>('');

  // Fetch data from OpenAQ API for air quality
  const { data: airData } = useQuery({
    queryKey: ['airQuality', location, startDate, endDate],
    queryFn: async () => {
      if (!location || !startDate || !endDate) return [];
      const response = await axios.get(
        `https://api.openaq.org/v2/measurements?location=${encodeURIComponent(location)}&date_from=${startDate.toISOString()}&date_to=${endDate.toISOString()}&limit=1000&parameters=pm25,pm10,no2,o3,so2,co,no,nh3`
      );
      
      // Transform the data to match our schema
      return response.data.results.map((result: any) => ({
        date: result.date.utc,
        location: result.location,
        [result.parameter]: result.value,
      }));
    },
    enabled: !!location && !!startDate && !!endDate,
  });

  // Generate sample water quality data
  const waterData = React.useMemo(() => {
    if (!startDate || !endDate || !location) return [];
    
    const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Array.from({ length: Math.max(1, days) }, (_, i) => ({
      date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
      location,
      ph: 7 + Math.random() * 0.5,
      conductivity: 500 + Math.random() * 100,
      turbidity: 1 + Math.random() * 2,
    }));
  }, [startDate, endDate, location]);

  const airColumns = React.useMemo(
    () => [
      { header: 'Date', accessorKey: 'date' },
      { header: 'Location', accessorKey: 'location' },
      { header: 'PM2.5', accessorKey: 'pm25' },
      { header: 'PM10', accessorKey: 'pm10' },
      { header: 'NO₂', accessorKey: 'no2' },
      { header: 'O₃', accessorKey: 'o3' },
      { header: 'SO₂', accessorKey: 'so2' },
      { header: 'CO', accessorKey: 'co' },
      { header: 'NO', accessorKey: 'no' },
      { header: 'NH₃', accessorKey: 'nh3' },
    ],
    []
  );

  const waterColumns = React.useMemo(
    () => [
      { header: 'Date', accessorKey: 'date' },
      { header: 'Location', accessorKey: 'location' },
      { header: 'pH', accessorKey: 'ph' },
      { header: 'Conductivity (μS/cm)', accessorKey: 'conductivity' },
      { header: 'Turbidity (NTU)', accessorKey: 'turbidity' },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Environmental Quality Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://openaq.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <Info size={18} />
                Data Source
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <QualityChart
            data={airData || []}
            metrics={['pm25', 'pm10', 'no2', 'o3']}
            title="Air Quality Trends"
          />
          <QualityChart
            data={waterData}
            metrics={['ph', 'conductivity', 'turbidity']}
            title="Water Quality Trends"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <PredictionModel
            historicalData={airData || []}
            metric="pm25"
            title="PM2.5 Prediction"
          />
          <PredictionModel
            historicalData={airData || []}
            metric="o3"
            title="O₃ Prediction"
          />
          <PredictionModel
            historicalData={waterData}
            metric="ph"
            title="pH Prediction"
          />
        </div>

        <div className="space-y-8">
          <DataTable
            data={airData || []}
            columns={airColumns}
            title="Air Quality Data"
          />
          <DataTable
            data={waterData}
            columns={waterColumns}
            title="Water Quality Data"
          />
        </div>
      </main>
    </div>
  );
}

export default App;