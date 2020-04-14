import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface TransactionProps {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  private transactionRepo: TransactionsRepository;

  constructor(repository: TransactionsRepository) {
    this.transactionRepo = repository;
  }

  public async execute(
    transactionProps: TransactionProps,
  ): Promise<Transaction> {
    const balance = await this.transactionRepo.getBalance();

    const isOutcome = transactionProps.type === 'outcome';
    const invalidBalance = transactionProps.value > balance.total;

    if (isOutcome && invalidBalance) {
      throw new AppError('Invalid balance for outcome transaction');
    }
    const transaction = await this.transactionRepo.createOrUpdate(
      transactionProps,
    );
    return transaction;
  }
}

export default CreateTransactionService;
