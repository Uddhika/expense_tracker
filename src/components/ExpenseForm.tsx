'use client';

import { useDispatch, useSelector } from 'react-redux';
import {
  addExpenseAsync,
  fetchExpenses,
  updateExpenseAsync,
} from '@/redux/expenseSlice';
import { Form, Input, DatePicker, Select, Button, Flex } from 'antd';
import dayjs from 'dayjs';
import { AppDispatch, RootState } from '@/redux/store';
import { useEffect } from 'react';

interface ExpenseFormProps {
  expense?: {
    id: string;
    title: string;
    amount: number;
    date: string;
    category: string;
    notes?: string;
  };
  onCancel?: () => void;
}

export default function ExpenseForm({ expense, onCancel }: ExpenseFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const currentPage = useSelector((state: RootState) => state.expenses.page);

  useEffect(() => {
    if (expense) {
      form.setFieldsValue({
        title: expense.title,
        amount: expense.amount,
        date: dayjs(expense.date),
        category: expense.category,
        notes: expense.notes || '',
      });
    }
  }, [expense, form]);

  // Handle form submission
  const handleSubmit = async (values: any) => {
    const newExpense = {
      id: expense?.id || String(Math.random()),
      title: values.title,
      amount: +values.amount,
      date: values.date.format('YYYY-MM-DD'),
      category: values.category,
      notes: values.notes,
    };

    if (expense) {
      await dispatch(updateExpenseAsync(newExpense));
    } else {
      await dispatch(addExpenseAsync(newExpense));
      dispatch(fetchExpenses({ page: currentPage, pageSize: 5 }));
    }
    form.resetFields();
    onCancel?.();
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        label="Title"
        name="title"
        rules={[{ required: true, message: 'Please enter a title' }]}
      >
        <Input placeholder="Enter title" />
      </Form.Item>

      <Form.Item
        label="Amount"
        name="amount"
        rules={[{ required: true, message: 'Please enter an amount' }]}
      >
        <Input type="number" placeholder="Enter amount" />
      </Form.Item>

      <Form.Item
        label="Date"
        name="date"
        rules={[{ required: true, message: 'Please select a date' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label="Category"
        name="category"
        rules={[{ required: true, message: 'Please select a category' }]}
      >
        <Select placeholder="Select Category">
          <Select.Option value="Food">Food</Select.Option>
          <Select.Option value="Travel">Travel</Select.Option>
          <Select.Option value="Shopping">Shopping</Select.Option>
          <Select.Option value="Other">Other</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Notes" name="notes">
        <Input.TextArea placeholder="Enter notes" />
      </Form.Item>

      <Form.Item>
        <Flex gap={10}>
          <Button style={{ width: '100%' }} type="primary" htmlType="submit">
            {expense ? 'Edit Expense' : 'Add Expense'}
          </Button>

          <Button style={{ width: '100%' }} onClick={onCancel}>
            Cancel
          </Button>
        </Flex>
      </Form.Item>
    </Form>
  );
}
