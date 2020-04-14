import { MigrationInterface, QueryRunner, Table } from 'typeorm';

class CreateCategories1586811537215 implements MigrationInterface {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: 'categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
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
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable('categories');
  }
}

export default CreateCategories1586811537215;
