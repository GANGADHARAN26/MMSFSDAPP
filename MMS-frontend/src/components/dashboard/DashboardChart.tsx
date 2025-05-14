import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardChartProps {
  type: 'bar' | 'line' | 'pie';
  data: ChartData<any>;
  options?: ChartOptions<any>;
  height?: number;
}

const DashboardChart = ({ type, data, options, height = 300 }: DashboardChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const defaultOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  // Render the appropriate chart based on type
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data} options={mergedOptions} />;
      case 'line':
        return <Line data={data} options={mergedOptions} />;
      case 'pie':
        return <Pie data={data} options={mergedOptions} />;
      default:
        return <Bar data={data} options={mergedOptions} />;
    }
  };

  return (
    <div ref={chartRef} style={{ height: `${height}px` }}>
      {renderChart()}
    </div>
  );
};

export default DashboardChart;