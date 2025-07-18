import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GeometricBackground from './components/GeometricBackground';
import AnimatedBackground from './components/AnimatedBackground';
import SetupWizard from './components/SetupWizard';
import StudentDashboard from './components/StudentDashboard';
import TransactionModal from './components/TransactionModal';
import { Transaction } from './types';

function App() {
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSetup = localStorage.getItem('financeTracker_setup');
    const savedTransactions = localStorage.getItem('financeTracker_transactions');
    
    if (savedSetup === 'true') {
      setHasCompletedSetup(true);
    }
    
    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions));
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('financeTracker_setup', hasCompletedSetup.toString());
  }, [hasCompletedSetup]);

  useEffect(() => {
    localStorage.setItem('financeTracker_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleSetupComplete = (initialTransactions: Transaction[]) => {
    setTransactions(initialTransactions);
    setHasCompletedSetup(true);
  };

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const handleAddTransactions = (newTransactions: Transaction[]) => {
    setTransactions(prev => [...prev, ...newTransactions]);
  };

  const openTransactionModal = () => {
    setIsTransactionModalOpen(true);
  };

  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {!hasCompletedSetup ? <GeometricBackground /> : <AnimatedBackground />}
      
      <AnimatePresence mode="wait">
        {!hasCompletedSetup ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SetupWizard onComplete={handleSetupComplete} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StudentDashboard 
              transactions={transactions} 
              onAddTransaction={openTransactionModal}
              onAddTransactions={handleAddTransactions}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
        onAdd={handleAddTransaction}
      />
    </div>
  );
}

export default App;