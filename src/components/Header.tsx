'use client';
import { Button, Flex, Modal, Select } from 'antd';
import { useState } from 'react';
import ExpenseForm from './ExpenseForm';

interface HeaderProps {
  setSelectedCategory: (category: string) => void;
}

export default function Header({ setSelectedCategory }: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onChange = (value: string) => {
    setSelectedCategory(value);
  };

  return (
    <>
      <Flex
        justify="space-between"
        align="center"
        style={{ padding: '10px 20px' }}
      >
        <h1>Expense Tracker</h1>
        <Flex gap={15}>
          <Select
            allowClear
            style={{ width: '180px' }}
            showSearch
            placeholder="Filter by Category"
            optionFilterProp="label"
            onChange={onChange}
            options={[
              {
                value: 'Food',
                label: 'Food',
              },
              {
                value: 'Travel',
                label: 'Travel',
              },
              {
                value: 'Shopping',
                label: 'Shopping',
              },
              {
                value: 'Other',
                label: 'Other',
              },
            ]}
          />
          <Button onClick={showModal} type="primary">
            Add Expense
          </Button>
        </Flex>
      </Flex>
      <Modal
        width={450}
        title="Add Expense"
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <ExpenseForm onCancel={handleCancel} />
      </Modal>
    </>
  );
}
