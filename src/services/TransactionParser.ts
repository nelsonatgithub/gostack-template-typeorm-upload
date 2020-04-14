import fs from 'fs';
import parse from 'csv-parse/lib/sync';

interface TransactionProps {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

export const fromCSV: (
  csvFilePath: string,
  shouldDelete?: boolean,
) => TransactionProps[] = (csvFilePath, shouldDelete = true) => {
  const csvContent = fs.readFileSync(csvFilePath).toString();

  const parsed = parse(csvContent, {
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

  if (shouldDelete) fs.unlinkSync(csvFilePath);

  return parsed;
};

export default fromCSV;
