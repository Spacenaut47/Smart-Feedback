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
  heading: string;
  category: string;
  subcategory: string;
  message: string;
  submittedAt: string;
  status: string;
  fullName: string;
  email: string;
  imageUrl?: string;
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

  // Subcategory distribution
  const subcategoryCounts = filteredFeedbacks.reduce((acc: Record<string, number>, fb) => {
    acc[fb.subcategory] = (acc[fb.subcategory] || 0) + 1;
    return acc;
  }, {});

  // Daily trend - group by date
  const dailyTrendMap = filteredFeedbacks.reduce((acc: Record<string, number>, fb) => {
    const date = new Date(fb.submittedAt).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Generate last 7 days for trend chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  });

  const dailyTrendData = last7Days.map(date => dailyTrendMap[date] || 0);

  // Calculate average response time (based on status changes)
  const resolvedFeedbacks = filteredFeedbacks.filter(fb => fb.status === 'Resolved');
  const inProgressFeedbacks = filteredFeedbacks.filter(fb => fb.status === 'In Progress');
  
  // Mock average response time calculation (you can replace with actual data if available)
  const avgResponseHours = resolvedFeedbacks.length > 0 
    ? Math.round((resolvedFeedbacks.length * 2.5 + inProgressFeedbacks.length * 1.2) / (resolvedFeedbacks.length + inProgressFeedbacks.length * 0.5))
    : 0;
  
  const responseTime = avgResponseHours > 24 
    ? `${Math.round(avgResponseHours / 24)} days`
    : `${avgResponseHours} hours`;

  // Most active user (user with most feedback submissions)
  const userSubmissions = filteredFeedbacks.reduce((acc: Record<string, number>, fb) => {
    acc[fb.fullName] = (acc[fb.fullName] || 0) + 1;
    return acc;
  }, {});

  const mostActiveUser = Object.keys(userSubmissions).length > 0 
    ? Object.keys(userSubmissions).reduce((a, b) => userSubmissions[a] > userSubmissions[b] ? a : b)
    : 'N/A';

  // Chart configurations
  const lineChartData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Feedbacks Submitted',
        data: dailyTrendData,
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366F1',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const pieChartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          '#3B82F6', // New - Blue
          '#F59E0B', // In Progress - Amber
          '#10B981', // Resolved - Green
          '#EF4444'  // Any other status - Red
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const barChartData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        label: 'Feedback Count',
        data: Object.values(categoryCounts),
        backgroundColor: [
          '#6366F1',
          '#8B5CF6',
          '#EC4899',
          '#F59E0B'
        ],
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  };

  const subcategoryChartData = {
    labels: Object.keys(subcategoryCounts).slice(0, 5), // Top 5 subcategories
    datasets: [
      {
        data: Object.values(subcategoryCounts).slice(0, 5),
        backgroundColor: [
          '#EF4444',
          '#F59E0B', 
          '#10B981',
          '#3B82F6',
          '#8B5CF6'
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
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
              <option value="365">Last year</option>
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
                <p className="text-sm text-gray-500 mt-1">Estimated based on status</p>
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
              {Object.keys(statusCounts).length > 0 ? (
                <Pie data={pieChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Top Subcategories */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Top Subcategories</h3>
            <div className="h-64">
              {Object.keys(subcategoryCounts).length > 0 ? (
                <Doughnut data={subcategoryChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Category Analysis */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Category Analysis</h3>
            <div className="h-64">
              {Object.keys(categoryCounts).length > 0 ? (
                <Bar data={barChartData} options={barChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Feedback with Images */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Feedback Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">With Images</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">
                    {filteredFeedbacks.filter(fb => fb.imageUrl).length}
                  </div>
                  <div className="text-sm text-gray-500">
                    {totalCount > 0 ? Math.round(filteredFeedbacks.filter(fb => fb.imageUrl).length / totalCount * 100) : 0}%
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Unique Users</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {new Set(filteredFeedbacks.map(fb => fb.email)).size}
                  </div>
                  <div className="text-sm text-gray-500">Active contributors</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Avg. Message Length</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredFeedbacks.length > 0 
                      ? Math.round(filteredFeedbacks.reduce((sum, fb) => sum + fb.message.length, 0) / filteredFeedbacks.length)
                      : 0
                    }
                  </div>
                  <div className="text-sm text-gray-500">characters</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Feedback Submission Trend (Last 7 Days)</h3>
          <div className="h-80">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <h4 className="text-lg font-semibold mb-2">Most Active User</h4>
            <p className="text-xl font-bold truncate">
              {mostActiveUser}
            </p>
            <p className="text-sm opacity-90">
              {mostActiveUser !== 'N/A' ? `${userSubmissions[mostActiveUser]} submissions` : 'No submissions yet'}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-6 text-white">
            <h4 className="text-lg font-semibold mb-2">Resolution Rate</h4>
            <p className="text-3xl font-bold">
              {totalCount > 0 ? Math.round((statusCounts['Resolved'] || 0) / totalCount * 100) : 0}%
            </p>
            <p className="text-sm opacity-90">
              {statusCounts['Resolved'] || 0} of {totalCount} resolved
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white">
            <h4 className="text-lg font-semibold mb-2">Top Category</h4>
            <p className="text-xl font-bold">
              {Object.keys(categoryCounts).length > 0 
                ? Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b)
                : 'N/A'
              }
            </p>
            <p className="text-sm opacity-90">
              {Object.keys(categoryCounts).length > 0 
                ? `${Math.max(...Object.values(categoryCounts))} submissions`
                : 'No data'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;