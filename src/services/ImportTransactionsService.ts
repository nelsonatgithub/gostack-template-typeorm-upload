import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface TransactionProps {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  private service: CreateTransactionService;

  constructor(repository: TransactionsRepository) {
    this.service = new CreateTransactionService(repository);
  }

  async execute(
    transactionPropList: TransactionProps[],
  ): Promise<Transaction[]> {
    const transactionList: Transaction[] = [];

    const promiseChain = this.service.execute(transactionPropList[0]);
    let lastPromise = promiseChain;

    transactionPropList.slice(1).forEach(transactionProp => {
      lastPromise = lastPromise.then(transaction => {
        transactionList.push(transaction);
        return this.service.execute(transactionProp);
      });
    });

    await lastPromise;

    return transactionList;
  }
}

export default ImportTransactionsService;
