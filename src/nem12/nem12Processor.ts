import { addMinutes } from 'date-fns';
import { writeIntervals } from '../repositories/meterReadingRepository'; // TODO this should be injected
import { NEM12Record, NEM12_200Record, NEM12_300Record } from './nem12Record';
import { logger } from '../utils/logging';
import { Batch } from '../reader/batch';

export class NEM12Processor {
  constructor(private readonly timezone: string) {}

  public shouldDispatchFunc(line: string): boolean {
    return line.startsWith('200');
  }

  public processFunc = async (batch: Batch): Promise<string[]> => {
    const b = batch.getRecords();
    logger.debug(`Processing batch of ${b.length} records`);

    try {
      let nmi = '';
      let intervalLength = 0;
      let records = [];

      for (let i = 0; i < b.length; i++) {
        const values = b[i].split(',');
        const record = NEM12Record.parse(values, this.timezone);

        if (record.getRecordIndicator() == 200) {
          const r200 = record as NEM12_200Record;
          nmi = r200.getNMI();
          intervalLength = r200.getIntervalLength();
          if (records.length > 0) {
            await writeIntervals(records);
            records = [];
          }
        } else if (record.getRecordIndicator() == 300) {
          const r300 = record as NEM12_300Record;
          const intervals = r300.getIntervalValues();
          for (let i = 0; i < intervals.length; i++) {
            records.push({
              nmi: nmi,
              timestamp: addMinutes(
                r300.getIntervalDate(),
                intervalLength * (i + 1)
              ),
              consumption: intervals[i]
            });
          }
        }
      }
      if (records.length > 0) {
        await writeIntervals(records);
        records = [];
      }
      logger.debug(`Processed batch of ${b.length} records`);
      return [];
    } catch (e) {
      return batch
        .getRecords()
        .map(
          (b) => `${b},${e},lines ${batch.getStartLine()}-${batch.getEndLine()}`
        );
    }
  };
}
