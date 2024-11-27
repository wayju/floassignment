import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { MeterData } from './types';

interface DB {
    meterData: MeterData;
}

export const db = new Kysely<DB>({
    dialect: new PostgresDialect({
        pool: new Pool({
            host: process.env.DATABASE_HOST,
            database: process.env.DATABASE_DB,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            port: Number(process.env.DATABASE_PORT),
        }),
    }),
});