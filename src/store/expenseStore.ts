import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Expense, MemberName } from '../types';

// NOTE: 分帳 store - 支援等分 / 自費 / 自訂比例三種模式

interface ExpenseState {
  expenses: Expense[];
  members: MemberName[];
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  getBalances: () => Record<MemberName, number>;
  getTotalByMember: () => Record<MemberName, number>;
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],
      members: ['Sandy', 'Partner'],

      addExpense: (expense) => {
        set(state => ({ expenses: [...state.expenses, expense] }));
      },

      removeExpense: (id) => {
        set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }));
      },

      // NOTE: 計算每人淨餘額（正數=被欠，負數=欠人）
      getBalances: () => {
        const { expenses, members } = get();
        const balances: Record<string, number> = {};
        members.forEach(m => (balances[m] = 0));

        expenses.forEach(exp => {
          if (exp.splitType === 'solo') {
            // 自費：不計入分帳
            return;
          }

          if (exp.splitType === 'equal') {
            const share = exp.amount / exp.participants.length;
            exp.participants.forEach(p => {
              balances[p] -= share;
            });
            balances[exp.paidBy] += exp.amount;
          }

          if (exp.splitType === 'custom' && exp.customRatio) {
            const total = Object.values(exp.customRatio).reduce((a, b) => a + b, 0);
            exp.participants.forEach(p => {
              const ratio = (exp.customRatio?.[p] ?? 0) / total;
              balances[p] -= exp.amount * ratio;
            });
            balances[exp.paidBy] += exp.amount;
          }
        });

        return balances as Record<MemberName, number>;
      },

      getTotalByMember: () => {
        const { expenses, members } = get();
        const totals: Record<string, number> = {};
        members.forEach(m => (totals[m] = 0));
        expenses.forEach(exp => {
          totals[exp.paidBy] = (totals[exp.paidBy] || 0) + exp.amount;
        });
        return totals as Record<MemberName, number>;
      },
    }),
    { name: 'bali-travel-expenses' }
  )
);
