'use client';

import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { Table, Button, Popconfirm, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Expense } from '@/utils/api';
import ExpenseForm from './ExpenseForm';
import { deleteExpenseAsync, fetchExpenses } from '@/redux/expenseSlice';

interface DataType {
  key: string;
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
}

interface ExpenseListProps {
  selectedCategory: string;
}

export default function ExpenseList({ selectedCategory }: ExpenseListProps) {
  const loading = useSelector((state: RootState) => state.expenses.loading);
  const expenses = useSelector((state: RootState) => state.expenses.expenses);
  const totalExpenses = useSelector((state: RootState) => state.expenses.total);
  const dispatch = useDispatch<AppDispatch>();
  const [openEdit, setOpenEdit] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Expense>();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const handleEdit = (record: Expense) => {
    setOpenEdit(true);
    setCurrentRecord(record);
  };

  const handleCancel = () => {
    setOpenEdit(false);
    setCurrentRecord(undefined);
  };

  const columns: ColumnsType<DataType> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this expense?"
            onConfirm={async () => {
              await dispatch(deleteExpenseAsync(record.id));
              setCurrentPage(1);
              dispatch(fetchExpenses({ page: 1, pageSize: 5 }));
            }}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const filteredExpenses = selectedCategory
    ? expenses.filter((exp) => exp.category === selectedCategory)
    : expenses;

  const data: DataType[] = filteredExpenses.map((exp) => ({
    key: exp.id,
    id: exp.id,
    title: exp.title,
    amount: exp.amount,
    date: exp.date,
    category: exp.category,
    notes: exp.notes,
  }));

  useEffect(() => {
    dispatch(fetchExpenses({ page: currentPage, pageSize }));
  }, [dispatch, currentPage]);

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    dispatch(fetchExpenses({ page: pagination.current, pageSize }));
  };

  const paginationConfig = {
    current: currentPage,
    pageSize,
    total: totalExpenses, // Update total from API
    onChange: (page: number) => setCurrentPage(page),
  };

  return (
    <>
      <Table
        style={{ padding: '10px 20px' }}
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={paginationConfig}
        onChange={handleTableChange}
      />

      <Modal
        width={450}
        title="Edit Expense"
        open={openEdit}
        footer={null}
        onCancel={handleCancel}
      >
        <ExpenseForm expense={currentRecord} onCancel={handleCancel} />
      </Modal>
    </>
  );
}
