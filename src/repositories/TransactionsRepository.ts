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

interface ReturnableTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: ReturnableCategory;
}

interface ReturnableCategory {
  id: string;
  title: string;
}

const categoryParser: (
  category: Category,
) => ReturnableCategory = category => ({
  id: category.id,
  title: category.title,
});

const transactionParser: (
  transaction: Transaction,
) => ReturnableTransaction = transaction => ({
  id: transaction.id,
  title: transaction.title,
  value: transaction.value,
  type: transaction.type,
  category: categoryParser(transaction.category),
});

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

  public async getTransactions(): Promise<ReturnableTransaction[]> {
    const transactionList = await this.find({ relations: ['category'] });
    return transactionList.map(transactionParser);
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
