import { readAndProcess } from './reader';
import { setDebugLogging, logger } from '../utils/logging';

describe('testing Reader', () => {

    setDebugLogging();

    ///Todo. We should check content is correct in the file, that batches make sense according to our rule

    test('test basic reading', async () => {
        let filename = './examples/flo_sample.csv';
        let lines: string[] = [];
        let numBatches = 0;
        await readAndProcess(filename,
            (line: string): boolean => {
                return line.includes("500")
            },
            (batch: string[]): void => {
                numBatches++;
                let grouped = ""
                batch.map((line) => {
                    lines.push(line);
                })
            }
        );
        expect(numBatches).toBe(3);
        expect(lines.length).toBe(14);
    }, 10000);
});