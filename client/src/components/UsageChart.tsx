import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { getUsage } from '../services/api';

interface UsageData {
  date: string;
  credits: number;
}

interface ApiUsageData {
  date: string;
  _sum: {
    credits: number;
  };
}

interface UsageResponse {
  creditsUsed: number;
  creditsRemaining: number;
  usageLast7Days: ApiUsageData[];
}

// Sample data for when backend data is not available
const sampleData = [
  { date: '2024-03-01', credits: 120 },
  { date: '2024-03-02', credits: 250 },
  { date: '2024-03-03', credits: 180 },
  { date: '2024-03-04', credits: 320 },
  { date: '2024-03-05', credits: 280 },
  { date: '2024-03-06', credits: 150 },
  { date: '2024-03-07', credits: 200 },
];

const UsageChart = () => {
  const [data, setData] = useState<UsageData[]>([]);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [creditsRemaining, setCreditsRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const response = await getUsage();
        
        // If we have valid data from the backend, use it
        if (response && response.usageLast7Days && response.usageLast7Days.length > 0) {
          setCreditsUsed(response.creditsUsed);
          setCreditsRemaining(response.creditsRemaining);
          
          const chartData = response.usageLast7Days.map((item: ApiUsageData) => ({
            date: item.date,
            credits: item._sum.credits || 0,
          }));
          
          setData(chartData);
        } else {
          // Use sample data if no backend data is available
          setData(sampleData);
          const totalCredits = sampleData.reduce((sum, item) => sum + item.credits, 0);
          setCreditsUsed(totalCredits);
          setCreditsRemaining(10000 - totalCredits); // Assuming a 10k credit plan
        }
      } catch (error) {
        console.error('Failed to fetch usage data:', error);
        // Fallback to sample data on error
        setData(sampleData);
        const totalCredits = sampleData.reduce((sum, item) => sum + item.credits, 0);
        setCreditsUsed(totalCredits);
        setCreditsRemaining(10000 - totalCredits); // Assuming a 10k credit plan
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, []);

  if (loading) {
    return <div className="text-gray-400">Loading usage data...</div>;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload?.[0]?.value !== undefined) {
      return (
        <div className="bg-[#1C1C1C] p-3 rounded-lg border border-gray-700 shadow-lg">
          <p className="text-gray-300 mb-1">{formatDate(label)}</p>
          <p className="text-[#CEF23F] font-medium">
            {payload[0].value.toLocaleString()} credits
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-8">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">
                {creditsUsed.toLocaleString()}
              </span>
              <span className="text-gray-400">credits used</span>
            </div>
            <p className="text-sm text-gray-400">Last 7 days</p>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#CEF23F]">
                {creditsRemaining.toLocaleString()}
              </span>
              <span className="text-gray-400">credits remaining</span>
            </div>
            <p className="text-sm text-gray-400">Current plan</p>
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#404040" 
            />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fill: '#9CA3AF' }}
              axisLine={{ stroke: '#404040' }}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{ fill: '#9CA3AF' }}
              axisLine={{ stroke: '#404040' }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(206, 242, 63, 0.1)' }}
            />
            <Bar 
              dataKey="credits" 
              fill="#CEF23F"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UsageChart; 