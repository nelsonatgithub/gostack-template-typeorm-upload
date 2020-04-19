import fs from 'fs';
import parse from 'csv-parse';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface TransactionProps {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

export enum SupportedFormats {
  'csv',
}

interface FromCSVInterface {
  filePath: string;
  shouldDelete: boolean;
  onData: Function;
}

class ImportTransactionsService {
  private service: CreateTransactionService;

  private fileType: SupportedFormats;

  constructor(fileType: SupportedFormats, repository: TransactionsRepository) {
    this.fileType = fileType;
    this.service = new CreateTransactionService(repository);
  }

  async execute(filePath: string, shouldDelete = true): Promise<Transaction[]> {
    const transactionList: Transaction[] = [];

    const promiseChain = Promise.resolve();
    let lastPromise: Promise<Transaction | void> = promiseChain;

    switch (this.fileType) {
      case SupportedFormats.csv:
        /* awaits for the last csv line reading */
        await this.parseCSV({
          filePath,
          /* for each data appends a new promise to run createTransaction */
          onData: (transactionProp: TransactionProps) => {
            lastPromise = lastPromise.then(transaction => {
              if (transaction) {
                transactionList.push(transaction);
              }
              return this.service.execute(transactionProp);
            });
          },
          shouldDelete,
        });
        break;
      default:
        throw new AppError('Unsupported format');
    }

    /* awaits for the last service execution */
    await lastPromise;

    return transactionList;
  }

  /**
   *  Strategy to handle CSV
   *  onData is called for each json object
   */
  parseCSV({
    filePath,
    onData,
    shouldDelete,
  }: FromCSVInterface): Promise<void> {
    return new Promise((resolve, reject) => {
      /* Initialize streams */
      const fileReadStream = fs.createReadStream(filePath);
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        delimiter: ', ',
        cast: (value, context) => {
          switch (context.column) {
            case 'title':
            case 'category':
            case 'type':
              return value;
            case 'value':
              return Number(value);
            default:
              return value;
          }
        },
      });

      parser.on('error', error => reject(error));
      parser.on('end', () => {
        if (shouldDelete) fs.unlinkSync(filePath);
        resolve();
      });
      parser.on('data', data => onData(data));

      fileReadStream.on('error', error => reject(error));
      fileReadStream.on('end', () => parser.end());
      fileReadStream.on('data', data => {
        parser.write(data);
      });
    });
  }
}

export default ImportTransactionsService;
