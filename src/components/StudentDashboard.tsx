import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { generateFinancialInsights } from '../services/openai';
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
  BarElement,
} from 'chart.js';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Target,
  AlertCircle,
  Lightbulb,
  Plus,
  Settings,
  Download,
  Filter,
  Send,
  Goal,
  CheckCircle2
} from 'lucide-react';
import { Transaction, CATEGORIES } from '../types';
import BillsReceiptsManager from './BillsReceiptsManager';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

interface StudentDashboardProps {
  transactions: Transaction[];
  onAddTransaction: () => void;
  onAddTransactions?: (transactions: Transaction[]) => void;
}

interface Goal {
  id: string;
  text: string;
  category: 'income' | 'spending' | 'budget' | 'savings';
  completed: boolean;
  createdAt: string;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  transactions, 
  onAddTransaction, 
  onAddTransactions = () => {} 
}) => {
  const [activeView, setActiveView] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('month');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [goalCategory, setGoalCategory] = useState<Goal['category']>('spending');
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Calculate financial metrics
  const metrics = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netIncome = totalIncome - totalExpenses;
    
    // Category breakdown
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    // Daily spending trend
    const dailySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const date = t.date;
        acc[date] = (acc[date] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      categoryTotals,
      dailySpending,
      averageDaily: totalExpenses / Math.max(Object.keys(dailySpending).length, 1)
    };
  }, [transactions]);

  // Chart data
  const spendingTrendData = {
    labels: Object.keys(metrics.dailySpending).slice(-7),
    datasets: [
      {
        label: 'Daily Spending',
        data: Object.values(metrics.dailySpending).slice(-7),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const categoryData = {
    labels: Object.keys(metrics.categoryTotals).map(cat => 
      CATEGORIES.find(c => c.value === cat)?.label || cat
    ),
    datasets: [
      {
        data: Object.values(metrics.categoryTotals),
        backgroundColor: Object.keys(metrics.categoryTotals).map(cat =>
          CATEGORIES.find(c => c.value === cat)?.color || '#64748b'
        ),
        borderWidth: 0,
      },
    ],
  };

  const monthlyComparisonData = {
    labels: ['Income', 'Expenses', 'Net'],
    datasets: [
      {
        label: 'Amount ($)',
        data: [metrics.totalIncome, metrics.totalExpenses, metrics.netIncome],
        backgroundColor: ['#22c55e', '#ef4444', metrics.netIncome >= 0 ? '#22c55e' : '#ef4444'],
        borderRadius: 8,
      },
    ],
  };

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
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b' },
      },
      y: {
        grid: { color: 'rgba(100, 116, 139, 0.1)' },
        ticks: {
          color: '#64748b',
          callback: function(value: any) {
            return '$' + value.toFixed(0);
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
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: $${context.parsed.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Smart insights
  const insights = useMemo(() => {
    const basicInsights = [];
    
    // High spending category
    const topCategory = Object.entries(metrics.categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topCategory) {
      const categoryLabel = CATEGORIES.find(c => c.value === topCategory[0])?.label || topCategory[0];
      basicInsights.push({
        type: 'warning',
        title: 'Top Spending Category',
        message: `${categoryLabel} accounts for $${topCategory[1].toFixed(2)} of your expenses`,
        action: 'Consider setting a budget limit for this category'
      });
    }

    // Savings rate
    const savingsRate = metrics.totalIncome > 0 ? (metrics.netIncome / metrics.totalIncome) * 100 : 0;
    if (savingsRate < 20 && metrics.totalIncome > 0) {
      basicInsights.push({
        type: 'tip',
        title: 'Improve Your Savings Rate',
        message: `You're saving ${savingsRate.toFixed(1)}% of your income`,
        action: 'Try to save at least 20% for a healthy financial future'
      });
    }

    // Daily spending
    if (metrics.averageDaily > 50) {
      basicInsights.push({
        type: 'alert',
        title: 'High Daily Spending',
        message: `Your average daily spending is $${metrics.averageDaily.toFixed(2)}`,
        action: 'Consider tracking smaller purchases to reduce daily expenses'
      });
    }

    // Combine basic insights with AI insights
    const combinedInsights = [
      ...basicInsights,
      ...aiInsights.map(insight => ({
        type: 'tip' as const,
        title: 'AI Insight',
        message: insight,
        action: 'Consider this recommendation for better financial health'
      }))
    ];

    return combinedInsights;
  }, [metrics]);

  // Load AI insights when transactions change
  useEffect(() => {
    const loadAiInsights = async () => {
      if (transactions.length < 5) return; // Need some data for insights
      
      setIsLoadingInsights(true);
      try {
        const insights = await generateFinancialInsights(transactions);
        setAiInsights(insights);
      } catch (error) {
        console.error('Failed to load AI insights:', error);
      } finally {
        setIsLoadingInsights(false);
      }
    };

    loadAiInsights();
  }, [transactions]);

  // Load goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem('financeTracker_goals');
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (error) {
        console.error('Error loading goals:', error);
      }
    }
  }, []);

  // Save goals to localStorage
  useEffect(() => {
    localStorage.setItem('financeTracker_goals', JSON.stringify(goals));
  }, [goals]);

  const addGoal = () => {
    if (!newGoal.trim()) return;
    
    const goal: Goal = {
      id: Date.now().toString(),
      text: newGoal.trim(),
      category: goalCategory,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    setGoals(prev => [...prev, goal]);
    setNewGoal('');
  };

  const toggleGoal = (goalId: string) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'income': return 'text-green-400 bg-green-500/20';
      case 'spending': return 'text-red-400 bg-red-500/20';
      case 'budget': return 'text-blue-400 bg-blue-500/20';
      case 'savings': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-500 p-2 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-poppins">Student Financial Helper</h1>
                <p className="text-white/60 text-sm">Your financial journey starts here</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="week" className="bg-gray-800">This Week</option>
                <option value="month" className="bg-gray-800">This Month</option>
                <option value="year" className="bg-gray-800">This Year</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddTransaction}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Add Transaction</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-green-400 text-sm font-medium">Income</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              ${metrics.totalIncome.toFixed(2)}
            </div>
            <p className="text-white/60 text-sm">Total earned</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-500/20 p-3 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-red-400 text-sm font-medium">Expenses</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              ${metrics.totalExpenses.toFixed(2)}
            </div>
            <p className="text-white/60 text-sm">Total spent</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metrics.netIncome >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <DollarSign className={`w-6 h-6 ${metrics.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
              <span className={`text-sm font-medium ${metrics.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                Net Income
              </span>
            </div>
            <div className={`text-2xl font-bold mb-1 ${metrics.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${metrics.netIncome.toFixed(2)}
            </div>
            <p className="text-white/60 text-sm">
              {metrics.netIncome >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-blue-400 text-sm font-medium">Daily Avg</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              ${metrics.averageDaily.toFixed(2)}
            </div>
            <p className="text-white/60 text-sm">Per day spending</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Spending Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white font-poppins">Spending Trend</h3>
                <BarChart3 className="w-5 h-5 text-white/60" />
              </div>
              <div className="h-64">
                <Line data={spendingTrendData} options={chartOptions} />
              </div>
            </motion.div>

            {/* Monthly Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white font-poppins">Financial Overview</h3>
                <BarChart3 className="w-5 h-5 text-white/60" />
              </div>
              <div className="h-64">
                <Bar data={monthlyComparisonData} options={chartOptions} />
              </div>
            </motion.div>

            {/* Goals Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mt-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Goal className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold text-white">Financial Goals</h2>
              </div>
              
              {/* Goal Input */}
              <div className="mb-4">
                <div className="flex space-x-2 mb-2">
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value as Goal['category'])}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="spending" className="bg-gray-800">Spending</option>
                    <option value="income" className="bg-gray-800">Income</option>
                    <option value="budget" className="bg-gray-800">Budget</option>
                    <option value="savings" className="bg-gray-800">Savings</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Enter your financial goal..."
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addGoal}
                    disabled={!newGoal.trim()}
                    className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Goals List */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {goals.map((goal) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white/5 rounded-lg p-3 border border-white/10 transition-all ${
                      goal.completed ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <button
                          onClick={() => toggleGoal(goal.id)}
                          className={`mt-0.5 transition-colors ${
                            goal.completed ? 'text-green-400' : 'text-white/40 hover:text-white/60'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(goal.category)}`}>
                              {goal.category}
                            </span>
                          </div>
                          <p className={`text-sm ${goal.completed ? 'line-through text-white/60' : 'text-white'}`}>
                            {goal.text}
                          </p>
                          <p className="text-xs text-white/40 mt-1">
                            {new Date(goal.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="text-white/40 hover:text-red-400 transition-colors ml-2"
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                ))}
                {goals.length === 0 && (
                  <div className="text-center text-white/60 py-4">
                    <Goal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Set your first financial goal!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white font-poppins">Spending by Category</h3>
                <PieChart className="w-5 h-5 text-white/60" />
              </div>
              <div className="h-64">
                <Pie data={categoryData} options={pieOptions} />
              </div>
            </motion.div>

            {/* Smart Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white font-poppins">Smart Insights</h3>
              </div>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        insight.type === 'warning' ? 'bg-yellow-500/20' :
                        insight.type === 'tip' ? 'bg-blue-500/20' : 'bg-red-500/20'
                      }`}>
                        <AlertCircle className={`w-4 h-4 ${
                          insight.type === 'warning' ? 'text-yellow-400' :
                          insight.type === 'tip' ? 'text-blue-400' : 'text-red-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">{insight.title}</h4>
                        <p className="text-white/70 text-xs mt-1">{insight.message}</p>
                        <p className="text-white/50 text-xs mt-2 italic">{insight.action}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {insights.length === 0 && (
                  <div className="text-center text-white/60 py-4">
                    <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Add more transactions to get personalized insights!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white font-poppins">Recent Transactions</h3>
            <button className="text-white/60 hover:text-white transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {transactions.slice(-10).reverse().map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: CATEGORIES.find(c => c.value === transaction.category)?.color || '#64748b' 
                    }}
                  />
                  <div>
                    <div className="text-white font-medium">{transaction.description}</div>
                    <div className="text-white/60 text-sm">
                      {CATEGORIES.find(c => c.value === transaction.category)?.label || transaction.category} • {transaction.date}
                    </div>
                  </div>
                </div>
                <span className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bills & Receipts Manager */}
        <div className="mt-12">
          <BillsReceiptsManager 
            onAddTransactions={onAddTransactions} 
            transactions={transactions}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;