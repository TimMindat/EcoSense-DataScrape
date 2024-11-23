import React from 'react';
import NaiveBayes from 'ml-naive-bayes';

interface PredictionModelProps {
  historicalData: any[];
  metric: string;
  title: string;
}

export function PredictionModel({ historicalData, metric, title }: PredictionModelProps) {
  const [prediction, setPrediction] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (historicalData.length > 2) {
      try {
        // Get valid numerical data points
        const validData = historicalData
          .filter(data => typeof data[metric] === 'number' && !isNaN(data[metric]))
          .map(data => data[metric]);

        if (validData.length > 2) {
          // Prepare training data
          const features = validData.slice(0, -1).map((value, index) => [
            value,
            validData[index + 1]
          ]);
          
          const labels = validData.slice(2).map(value => 
            value > validData[validData.length - 1] ? 1 : 0
          );

          // Train the model
          const classifier = new NaiveBayes();
          classifier.train(features, labels);

          // Make prediction
          const lastTwo = [
            validData[validData.length - 2],
            validData[validData.length - 1]
          ];
          
          const predictedTrend = classifier.predict([lastTwo])[0];
          const lastValue = validData[validData.length - 1];
          
          // Calculate predicted value based on trend
          const predictedValue = predictedTrend === 1 
            ? lastValue * 1.05  // 5% increase
            : lastValue * 0.95; // 5% decrease
          
          setPrediction(Number(predictedValue.toFixed(2)));
        } else {
          setPrediction(null);
        }
      } catch (error) {
        console.error('Prediction error:', error);
        setPrediction(null);
      }
    } else {
      setPrediction(null);
    }
  }, [historicalData, metric]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {prediction !== null ? (
        <div className="text-2xl font-bold text-blue-600">{prediction}</div>
      ) : (
        <div className="text-gray-500">Insufficient data for prediction</div>
      )}
      <p className="text-sm text-gray-500 mt-2">
        Based on Naive Bayes prediction model
      </p>
    </div>
  );
}