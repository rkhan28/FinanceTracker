import React, { useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { 
  TrendingUp, 
  DollarSign, 
  PlusCircle, 
  Upload,
  CreditCard,
  Wallet,
  Brain,
  Target,
  TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
  icon: React.ReactNode;
  change: number;
  lastSync: string;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const accounts: Account[] = [
    {
      id: '1',
      name: 'Checking Account',
      balance: 4250.75,
      type: 'Bank',
      icon: <CreditCard className="w-5 h-5" />,
      change: 2.5,
      lastSync: '2 min ago'
    },
    {
      id: '2',
      name: 'Savings Account',
      balance: 15890.50,
      type: 'Bank',
      icon: <Wallet className="w-5 h-5" />,
      change: 1.2,
      lastSync: '5 min ago'
    },
    {
      id: '3',
      name: 'Credit Card',
      balance: -1205.30,
      type: 'Credit',
      icon: <CreditCard className="w-5 h-5" />,
      change: -5.8,
      lastSync: '1 min ago'
    },
    {
      id: '4',
      name: 'Investment Account',
      balance: 8967.20,
      type: 'Investment',
      icon: <TrendingUp className="w-5 h-5" />,
      change: 8.4,
      lastSync: '10 min ago'
    }
  ];

  const totalWealth = accounts.reduce((sum, account) => sum + account.balance, 0);

  const wealthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Total Wealth',
        data: [22000, 23500, 21800, 25200, 26800, totalWealth],
        borderColor: '#14B8A6',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const categoryData = {
    labels: ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills', 'Other'],
    datasets: [
      {
        data: [420, 280, 350, 180, 650, 220],
        backgroundColor: [
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
          '#10B981',
          '#F97316',
        ],
        borderWidth: 0,
      },
    ],
  };

  const aiSuggestions = [
    {
      type: 'savings',
      title: 'Optimize Food Spending',
      description: 'You spent 23% more on dining out this month. Consider meal planning to save ~$150/month.',
      impact: '+$150/month',
      icon: <Target className="w-5 h-5" />
    },
    {
      type: 'investment',
      title: 'Emergency Fund Goal',
      description: 'Build your emergency fund to 6 months of expenses. You need $3,200 more.',
      impact: '6 months security',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      type: 'budget',
      title: 'Credit Card Alert',
      description: 'Your credit utilization is at 65%. Consider paying down $800 to improve credit score.',
      impact: '+50 credit score',
      icon: <Brain className="w-5 h-5" />
    }
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#14B8A6',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
        },
      },
      y: {
        grid: {
          color: 'rgba(100, 116, 139, 0.1)',
        },
        ticks: {
          color: '#64748b',
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          color: '#64748b',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#14B8A6',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            return context.label + ': $' + context.parsed.toLocaleString();
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-transparent relative z-10">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">FinanceAI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Transaction</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload CSV</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Category Breakdown */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-lg font-semibold text-white mb-6">Spending Categories</h2>
              <div className="h-64">
                <Pie data={categoryData} options={pieOptions} />
              </div>
            </motion.div>

            {/* AI Suggestions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mt-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">AI Insights</h2>
              </div>
              <div className="space-y-4">
                {aiSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-500/20 p-2 rounded-lg">
                        {suggestion.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-white">{suggestion.title}</h3>
                        <p className="text-xs text-gray-300 mt-1">{suggestion.description}</p>
                        <span className="text-xs text-teal-400 font-medium">{suggestion.impact}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Main Dashboard */}
          <div className="lg:col-span-3">
            {/* Wealth Summary */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">${totalWealth.toLocaleString()}</h2>
                  <p className="text-gray-300">Total Wealth</p>
                </div>
                <div className="flex items-center space-x-2 text-green-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">+12.5% this month</span>
                </div>
              </div>
              <div className="h-64">
                <Line data={wealthData} options={chartOptions} />
              </div>
            </motion.div>

            {/* Account Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {accounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-500/20 p-2 rounded-lg">
                        {account.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{account.name}</h3>
                        <p className="text-gray-400 text-sm">{account.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        ${Math.abs(account.balance).toLocaleString()}
                      </div>
                      <div className={`text-sm flex items-center space-x-1 ${
                        account.change > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {account.change > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{Math.abs(account.change)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Last sync: {account.lastSync}</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;