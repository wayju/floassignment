import { db } from "./db";
import { MeterData } from "./types";
import { InsertResult } from 'kysely';

export async function writeIntervals(data: MeterData[]): Promise<InsertResult[]> {
    return await db.insertInto('meterData')
        .values(data.map(d => ({
            nmi: d.nmi,
            timestamp: d.timestamp,
            consumption: d.consumption
        }))).execute();
}