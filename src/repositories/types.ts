/// A single file because we only have one type at the moment

import {
    Generated,
    Insertable,
} from 'kysely'

export interface MeterData {
    id: Generated<number>
    nmi: string;
    timestamp: Date;
    consumption: number;
}
export type NewMeterData = Insertable<MeterData>
