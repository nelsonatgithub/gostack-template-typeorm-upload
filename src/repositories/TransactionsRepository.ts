import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionProps {
  title: string;
  category: string;
  value: number;
  type: 'income' | 'outcome';
}

const transactionReducer: (
  balance: Balance,
  transaction: Transaction,
) => Balance = (balance, transaction) => {
  switch (transaction.type) {
    case 'income':
      return {
        ...balance,
        income: balance.income + transaction.value,
        total: balance.total + transaction.value,
      };
    case 'outcome':
      return {
        ...balance,
        outcome: balance.outcome + transaction.value,
        total: balance.total - transaction.value,
      };
    default:
      return balance;
  }
};

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async createOrUpdate(
    transactionProps: TransactionProps,
  ): Promise<Transaction> {
    const categoryRepo = getRepository(Category);

    let category = await categoryRepo.findOne({
      title: transactionProps.category,
    });

    if (!category) {
      category = categoryRepo.create();
      category.title = transactionProps.category;
      await categoryRepo.save(category);
    }

    const transaction = this.create();
    transaction.title = transactionProps.title;
    transaction.value = transactionProps.value;
    transaction.type = transactionProps.type;
    transaction.category = category;
    return this.save(transaction);
  }

  public async getBalance(): Promise<Balance> {
    const transactionList = await this.find();
    return transactionList.reduce(transactionReducer, {
      income: 0,
      outcome: 0,
      total: 0,
    });
  }
}

export default TransactionsRepository;
