import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class CreateOrders1593719886118 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            isPrimary: true,
            type: 'uuid',
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {},
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
