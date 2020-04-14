import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import Transaction from '../models/Transaction';
import fromCSV from '../services/TransactionParser';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const repo = getCustomRepository(TransactionsRepository);
  const transactions = await repo.find();
  const balance = await repo.getBalance();
  return response.status(200).json({
    transactions,
    balance,
  });
});

interface TransactionProps {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

transactionsRouter.post('/', async (request, response) => {
  const transactionProps: TransactionProps = request.body;

  const repo = getCustomRepository(TransactionsRepository);
  const service = new CreateTransactionService(repo);

  const createdTransaction = await service.execute(transactionProps);

  return response.status(200).json(createdTransaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const repo = getCustomRepository(TransactionsRepository);
  const service = new DeleteTransactionService(repo);

  await service.execute(id);

  return response.status(200).json({});
});

const uploadCSV = multer({ dest: 'tmp/' }).single('file');

transactionsRouter.post('/import', uploadCSV, async (request, response) => {
  const { path: csvFilePath } = request.file;
  const transactionPropList: TransactionProps[] = await fromCSV(csvFilePath);

  const repo = getCustomRepository(TransactionsRepository);
  const service = new ImportTransactionsService(repo);

  const transactionList: Transaction[] = await service.execute(
    transactionPropList,
  );

  return response.status(200).json(transactionList);
});

export default transactionsRouter;
