import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  private transactionRepo: TransactionsRepository;

  constructor(repository: TransactionsRepository) {
    this.transactionRepo = repository;
  }

  public async execute(id: string): Promise<void> {
    const existingTransaction = await this.transactionRepo.findOne({ id });

    if (!existingTransaction) {
      throw new AppError('Unable to delete unexistent transaction');
    }

    await this.transactionRepo.delete({ id });

    return Promise.resolve();
  }
}

export default DeleteTransactionService;
