import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  Tag, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Target,
  PiggyBank,
  GraduationCap,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { Transaction, CATEGORIES } from '../types';

interface SetupWizardProps {
  onComplete: (transactions: Transaction[]) => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    description: '',
    type: 'expense' as 'income' | 'expense'
  });

  const onDrop = (acceptedFiles: File[]) => {
    setUploadedFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  const processCSV = () => {
    if (!uploadedFile) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const csvTransactions: Transaction[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 4) {
          const transaction: Transaction = {
            id: Date.now().toString() + i,
            date: values[headers.indexOf('date')] || new Date().toISOString().split('T')[0],
            amount: parseFloat(values[headers.indexOf('amount')] || '0'),
            category: values[headers.indexOf('category')] || 'other',
            description: values[headers.indexOf('description')] || 'Imported transaction',
            type: (values[headers.indexOf('type')] || 'expense') as 'income' | 'expense'
          };
          
          if (transaction.amount > 0) {
            csvTransactions.push(transaction);
          }
        }
      }
      
      setTransactions(prev => [...prev, ...csvTransactions]);
      setUploadedFile(null);
    };
    reader.readAsText(uploadedFile);
  };

  const steps = [
    {
      title: 'Welcome to Your Finance Journey! 🎓',
      subtitle: 'Let\'s set up your personal finance tracker',
      component: 'welcome'
    },
    {
      title: 'Add Your Recent Transactions 📝',
      subtitle: 'Start by adding at least 5 transactions to unlock your dashboard',
      component: 'transactions'
    },
    {
      title: 'Setup Complete! 🎉',
      subtitle: 'You\'re ready to explore your financial dashboard',
      component: 'complete'
    }
  ];

  const addTransaction = () => {
    if (!currentTransaction.amount || !currentTransaction.category || !currentTransaction.description) {
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: currentTransaction.date,
      amount: parseFloat(currentTransaction.amount),
      category: currentTransaction.category,
      description: currentTransaction.description,
      type: currentTransaction.type
    };

    setTransactions([...transactions, newTransaction]);
    setCurrentTransaction({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: '',
      description: '',
      type: 'expense'
    });
  };

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return transactions.length >= 5;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(transactions);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getCategoryColor = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.color || '#64748b';
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-4xl w-full border border-white/20 shadow-2xl"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  index <= currentStep
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/20 text-white/60'
                }`}
              >
                {index < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
              </div>
            ))}
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-primary-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2 font-poppins">
                {steps[currentStep].title}
              </h1>
              <p className="text-white/80 text-lg font-nunito">
                {steps[currentStep].subtitle}
              </p>
            </div>

            {/* Welcome Step */}
            {currentStep === 0 && (
              <div className="text-center space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 rounded-2xl p-6 border border-white/20"
                  >
                    <div className="bg-primary-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Student-Friendly</h3>
                    <p className="text-white/70 text-sm">Designed specifically for students and young adults</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 rounded-2xl p-6 border border-white/20"
                  >
                    <div className="bg-secondary-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PiggyBank className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Privacy First</h3>
                    <p className="text-white/70 text-sm">No bank linking required - your data stays private</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 rounded-2xl p-6 border border-white/20"
                  >
                    <div className="bg-accent-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Goal Tracking</h3>
                    <p className="text-white/70 text-sm">Set and track your savings goals and budgets</p>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Transactions Step */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Transaction
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Date
                      </label>
                      <input
                        type="date"
                        value={currentTransaction.date}
                        onChange={(e) => setCurrentTransaction({...currentTransaction, date: e.target.value})}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-2">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentTransaction.amount}
                        onChange={(e) => setCurrentTransaction({...currentTransaction, amount: e.target.value})}
                        placeholder="0.00"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-2">
                        <Tag className="w-4 h-4 inline mr-1" />
                        Category
                      </label>
                      <select
                        value={currentTransaction.category}
                        onChange={(e) => setCurrentTransaction({...currentTransaction, category: e.target.value})}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select category</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value} className="bg-gray-800">
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Type</label>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setCurrentTransaction({...currentTransaction, type: 'expense'})}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            currentTransaction.type === 'expense'
                              ? 'bg-red-500 text-white'
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          Expense
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentTransaction({...currentTransaction, type: 'income'})}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            currentTransaction.type === 'income'
                              ? 'bg-green-500 text-white'
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          Income
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-white/80 text-sm mb-2">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Description
                    </label>
                    <input
                      type="text"
                      value={currentTransaction.description}
                      onChange={(e) => setCurrentTransaction({...currentTransaction, description: e.target.value})}
                      placeholder="What was this for?"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addTransaction}
                    disabled={!currentTransaction.amount || !currentTransaction.category || !currentTransaction.description}
                    className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Transaction</span>
                  </motion.button>
                </div>

                {/* CSV Upload Section */}
                <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <FileSpreadsheet className="w-5 h-5 mr-2" />
                    Or Upload CSV File
                  </h3>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-8 h-8 text-white mx-auto mb-2" />
                    {uploadedFile ? (
                      <div className="text-white">
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-white/70">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="text-white">
                        <p className="font-medium">
                          {isDragActive ? 'Drop the file here' : 'Drag & drop a CSV file'}
                        </p>
                        <p className="text-sm text-white/70">or click to select</p>
                        <p className="text-xs text-white/50 mt-2">
                          Expected columns: date, amount, category, description, type
                        </p>
                      </div>
                    )}
                  </div>
                  {uploadedFile && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={processCSV}
                      className="w-full mt-4 bg-secondary-500 hover:bg-secondary-600 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Process CSV File</span>
                    </motion.button>
                  )}
                </div>

                {/* Transaction List */}
                <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">
                      Your Transactions ({transactions.length}/5 minimum)
                    </h3>
                    <div className="text-sm text-white/70">
                      {transactions.length >= 5 ? '✅ Ready to proceed!' : `${5 - transactions.length} more needed`}
                    </div>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {transactions.map((transaction) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getCategoryColor(transaction.category) }}
                          />
                          <div>
                            <div className="text-white font-medium">{transaction.description}</div>
                            <div className="text-white/60 text-sm">
                              {getCategoryLabel(transaction.category)} • {transaction.date}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`font-semibold ${
                            transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeTransaction(transaction.id)}
                            className="text-white/50 hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    {transactions.length === 0 && (
                      <div className="text-center text-white/60 py-8">
                        No transactions yet. Add your first transaction above!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Complete Step */}
            {currentStep === 2 && (
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">Congratulations! 🎉</h3>
                  <p className="text-white/80 text-lg">
                    You've successfully added {transactions.length} transactions.
                  </p>
                  <p className="text-white/70">
                    Your dashboard is now unlocked with personalized insights and analytics!
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all font-semibold"
          >
            <span>{currentStep === steps.length - 1 ? 'Enter Dashboard' : 'Continue'}</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupWizard;