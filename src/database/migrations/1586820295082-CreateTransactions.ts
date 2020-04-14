import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

class CreateTransactions1586820295082 implements MigrationInterface {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'title', type: 'varchar', isNullable: false },
          { name: 'type', type: 'varchar', isNullable: false },
          { name: 'value', type: 'int' },
          { name: 'categoryId', type: 'uuid' },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['categoryId'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable('transactions');
  }
}

export default CreateTransactions1586820295082;
