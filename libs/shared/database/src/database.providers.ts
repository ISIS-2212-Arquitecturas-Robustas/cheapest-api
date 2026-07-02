import { Provider } from '@nestjs/common';
import { DataSource, EntitySchema } from 'typeorm';
import { DATA_SOURCE } from './database.tokens';

type DatabaseEntity = Function | string | EntitySchema;

function isTrue(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
}

export function createDataSource(entities: DatabaseEntity[]): DataSource {
  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'chiper',
    entities,
    synchronize: isTrue(process.env.DB_SYNCHRONIZE, true),
    logging: false,
    connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '5000', 10),
    ssl: isTrue(process.env.DB_SSL, true)
      ? { rejectUnauthorized: false }
      : false,
  });
}

export function createDatabaseProviders(
  entities: DatabaseEntity[],
): Provider[] {
  return [
    {
      provide: DATA_SOURCE,
      useFactory: async () => {
        const dataSource = createDataSource(entities);
        return dataSource.initialize();
      },
    },
  ];
}
