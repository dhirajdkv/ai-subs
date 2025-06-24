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

/**
 * Interface for daily usage data point
 * @property date - The date of the usage record
 * @property credits - Number of credits consumed on this date
 */
interface UsageData {
  date: string;
  credits: number;
}

/**
 * Interface for API usage data returned from backend
 * Contains aggregated credit usage for a specific date
 */
interface ApiUsageData {
  _sum: {
    credits: number;
  };
  createdAt: string;
}

/**
 * Interface for usage breakdown by type
 * Tracks credit consumption per operation type
 */
interface UsageByType {
  type: string;
  _sum: {
    credits: number;
  };
}

/**
 * Interface for complete usage response from API
 * Contains overall statistics and detailed breakdowns
 */
interface UsageResponse {
  creditsUsed: number;
  usageLast7Days: ApiUsageData[];
  usageLast30Days: ApiUsageData[];
  usageByType: UsageByType[];
  subscription: {
    status: string;
    planId: string;
  } | null;
}

/**
 * Interface for individual usage metric display
 * Used for rendering the metric cards above the chart
 */
interface UsageMetric {
  label: string;
  value: string | number;
}

/**
 * UsageChart Component
 * 
 * A comprehensive dashboard component that displays:
 * - Total credits used
 * - Breakdown by operation type (API calls, content analysis, model training)
 * - Time-series bar chart of credit usage
 * 
 * Features:
 * - Toggleable time range (7 days vs 30 days)
 * - Interactive tooltips
 * - Responsive layout
 * - Formatted numbers for better readability
 */
const UsageChart = () => {
  // State management for usage data and UI controls
  const [data, setData] = useState<UsageData[]>([]);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [usageByType, setUsageByType] = useState<Record<string, number>>({});

  // Define metrics to display in the dashboard cards
  const usageMetrics: UsageMetric[] = [
    {
      label: 'Total Credits Used',
      value: creditsUsed.toLocaleString()
    },
    {
      label: 'API Calls',
      value: (usageByType['API_CALL'] || 0).toLocaleString()
    },
    {
      label: 'Content Analysis',
      value: (usageByType['CONTENT_ANALYSIS'] || 0).toLocaleString()
    },
    {
      label: 'Model Training',
      value: (usageByType['MODEL_TRAINING'] || 0).toLocaleString()
    }
  ];

  // Fetch and process usage data when component mounts or time range changes
  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const response: UsageResponse = await getUsage();
        
        if (response) {
          setCreditsUsed(response.creditsUsed || 0);
          
          // Process usage breakdown by operation type
          const typeUsage: Record<string, number> = {};
          response.usageByType?.forEach(item => {
            typeUsage[item.type] = item._sum.credits || 0;
          });
          setUsageByType(typeUsage);
          
          // Process time series data based on selected range
          const usageData = timeRange === '7d' ? response.usageLast7Days : response.usageLast30Days;
          if (usageData && usageData.length > 0) {
            const chartData = usageData.map((item: ApiUsageData) => ({
              date: item.createdAt,
              credits: item._sum.credits || 0,
            }));
            setData(chartData);
          }
        }
      } catch (error) {
        console.error('Failed to fetch usage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, [timeRange]);

  if (loading) {
    return <div className="text-gray-400">Loading usage data...</div>;
  }

  // Utility function to format dates in chart
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Utility function to format y-axis values (adds k suffix for thousands)
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  // Custom tooltip component for the chart
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
    <div className="space-y-4">
      {/* Header section with title and time range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">Usage Overview</h3>
          {/* <p className="text-sm text-gray-400">Track your API usage</p> */}
        </div>
        <div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#1C1C1C] text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#CEF23F]"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Usage metrics cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {usageMetrics.map((metric) => (
          <div key={metric.label} className="text-center p-3 bg-[#1C1C1C] rounded-lg">
            <p className="text-sm text-gray-400">{metric.label}</p>
            <p className="text-lg sm:text-xl font-semibold text-white mt-1">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Usage chart */}
      <div className="h-[200px] sm:h-[300px]">
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