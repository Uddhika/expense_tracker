'use client';
import ExpenseList from '@/components/ExpenseList';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchExpenses, syncPendingActions } from '@/redux/expenseSlice';
import { AppDispatch } from '@/redux/store';
import Header from '@/components/Header';
import { Alert } from 'antd';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showOnlineMessage, setShowOnlineMessage] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineMessage(true);
      dispatch(syncPendingActions());
      dispatch(fetchExpenses({ page: 1, pageSize: 5, selectedCategory: '' }));
      setTimeout(() => setShowOnlineMessage(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  return (
    <>
      {!isOnline && (
        <Alert message="You are offline" type="warning" showIcon banner />
      )}
      {showOnlineMessage && (
        <Alert message="You are back online!" type="success" showIcon banner />
      )}
      <Header setSelectedCategory={setSelectedCategory} />
      <ExpenseList selectedCategory={selectedCategory} />
    </>
  );
}
