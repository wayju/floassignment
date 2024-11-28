import { readAndProcess } from './reader';
import { setDebugLogging } from '../utils/logging';
import { Batch } from './batch';

describe('testing Reader', () => {
  setDebugLogging();

  test('test basic reading', async () => {
    const filename = './examples/flo_sample.csv';
    const lines: string[] = [];
    let numBatches = 0;
    await readAndProcess(
      filename,
      (line: string): boolean => {
        return line.includes('500');
      },
      async (batch: Batch): Promise<string[]> => {
        numBatches++;
        batch.getRecords().map((line) => {
          lines.push(line);
        });
        return [];
      }
    );
    expect(numBatches).toBe(3);
    expect(lines.length).toBe(14);
  }, 10000);
});
