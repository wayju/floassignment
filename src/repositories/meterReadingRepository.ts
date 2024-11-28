import { db } from './db';
import { InsertResult } from 'kysely';

export async function writeIntervals(
  data: {
    nmi: string;
    timestamp: Date;
    consumption: number;
  }[]
): Promise<InsertResult[]> {
  //    const duplicates = findDuplicatesByNmiAndTimestamp(data);
  return await db.transaction().execute(async (trx) => {
    return await trx.insertInto('meter_readings').values(data).execute();
  });
}
