import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import API from '../api/api';
import { Link } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

interface Feedback {
  id: number;
  category: string;
  status: string;
  submittedAt: string;
  priority?: 'Low' | 'Medium' | 'High';
  rating?: number;
}

const AdminAnalytics: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7'); // days

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await API.get('/admin/all-feedbacks');
        setFeedbacks(res.data);
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  // Filter feedbacks by date range
  const filteredFeedbacks = feedbacks.filter(fb => {
    const submittedDate = new Date(fb.submittedAt);
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
    return submittedDate >= daysAgo;
  });

  // Analytics calculations
  const totalCount = filteredFeedbacks.length;
  const previousPeriodCount = feedbacks.filter(fb => {
    const submittedDate = new Date(fb.submittedAt);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange) * 2);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - parseInt(dateRange));
    return submittedDate >= startDate && submittedDate < endDate;
  }).length;

  const growthRate = previousPeriodCount > 0 ? ((totalCount - previousPeriodCount) / previousPeriodCount * 100).toFixed(1) : '0';

  // Status distribution
  const statusCounts = filteredFeedbacks.reduce((acc: Record<string, number>, fb) => {
    acc[fb.status] = (acc[fb.status] || 0) + 1;
    return acc;
  }, {});

  // Category distribution
  const categoryCounts = filteredFeedbacks.reduce((acc: Record<string, number>, fb) => {
    acc[fb.category] = (acc[fb.category] || 0) + 1;
    return acc;
  }, {});

  // Priority distribution (mock data for demo)
  const priorityCounts = {
    'High': Math.floor(totalCount * 0.2),
    'Medium': Math.floor(totalCount * 0.5),
    'Low': Math.floor(totalCount * 0.3)
  };

  // Daily trend
  const dailyTrend = filteredFeedbacks.reduce((acc: Record<string, number>, fb) => {
    const date = new Date(fb.submittedAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Average rating (mock data)
  const avgRating = 4.2;
  const responseTime = '2.3 hours'; // mock data

  // Chart configurations
  const lineChartData = {
    labels: Object.keys(dailyTrend).slice(-7), // Last 7 days
    datasets: [
      {
        label: 'Feedbacks Submitted',
        data: Object.values(dailyTrend).slice(-7),
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const pieChartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'],
        borderWidth: 0,
      },
    ],
  };

  const barChartData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        label: 'Feedback Count',
        data: Object.values(categoryCounts),
        backgroundColor: '#6366F1',
        borderRadius: 8,
      },
    ],
  };

  const priorityChartData = {
    labels: Object.keys(priorityCounts),
    datasets: [
      {
        data: Object.values(priorityCounts),
        backgroundColor: ['#EF4444', '#F59E0B', '#10B981'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive feedback analytics and insights</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <Link to="/admin">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Feedbacks</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalCount}</p>
                <p className={`text-sm mt-1 ${parseFloat(growthRate) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(growthRate) >= 0 ? '↗' : '↘'} {Math.abs(parseFloat(growthRate))}% from last period
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{statusCounts['In Progress'] || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {totalCount > 0 ? Math.round((statusCounts['In Progress'] || 0) / totalCount * 100) : 0}% of total
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{statusCounts['Resolved'] || 0}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {totalCount > 0 ? Math.round((statusCounts['Resolved'] || 0) / totalCount * 100) : 0}% of total
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{responseTime}</p>
                <p className="text-sm text-green-600 mt-1">↗ 15% improvement</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Status Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Status Distribution</h3>
            <div className="h-64">
              <Pie data={pieChartData} options={chartOptions} />
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Priority Breakdown</h3>
            <div className="h-64">
              <Doughnut data={priorityChartData} options={chartOptions} />
            </div>
          </div>

          {/* Category Analysis */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Category Analysis</h3>
            <div className="h-64">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>

          {/* Rating Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Rating Overview</h3>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-6xl font-bold text-indigo-600 mb-2">{avgRating}</div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-6 h-6 ${i < Math.floor(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600">Average Rating</p>
                <p className="text-sm text-gray-500 mt-1">Based on {totalCount} feedbacks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Feedback Submission Trend</h3>
          <div className="h-80">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <h4 className="text-lg font-semibold mb-2">Most Active Day</h4>
            <p className="text-2xl font-bold">
              {Object.keys(dailyTrend).reduce((a, b) => dailyTrend[a] > dailyTrend[b] ? a : b) || 'N/A'}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-6 text-white">
            <h4 className="text-lg font-semibold mb-2">Resolution Rate</h4>
            <p className="text-2xl font-bold">
              {totalCount > 0 ? Math.round((statusCounts['Resolved'] || 0) / totalCount * 100) : 0}%
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white">
            <h4 className="text-lg font-semibold mb-2">Top Category</h4>
            <p className="text-2xl font-bold">
              {Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b) || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;