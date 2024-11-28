import fs from 'fs';
import readline from 'readline';
import { Writable } from 'stream';
import { logger } from '../utils/logging';
import { Batch } from './batch';

export async function readAndProcess(
  filePath: string,
  shouldDispatchFunc: (line: string) => boolean,
  processFunc: (batch: Batch) => Promise<string[]>
): Promise<string[]> {
  const fileStream = fs.createReadStream(filePath);
  const reader = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const failures: string[] = [];

  // Writable stream to process batches
  const processStream = new Writable({
    objectMode: true,
    write: async function (b: Batch, _, callback) {
      try {
        logger.debug(
          `Processing batch: lines ${b.getStartLine()}-${b.getEndLine()}`
        );
        const failedRecords = await processFunc(b); // Call the processing function
        failures.push(...failedRecords);
        callback(); // Notify that the batch has been processed successfully
      } catch (error: any) {
        logger.error(
          `Error processing batch: ${error}: lines ${b.getStartLine()}-${b.getEndLine()}`
        );
        callback(error); // Pass the error to the callback to handle it
      } finally {
        reader.resume();
      }
    }
  });

  let batch: string[] = [];
  let startLine = 1;
  let endLine = 0;

  // Collect lines into batches
  reader.on('line', async (line) => {
    if (shouldDispatchFunc(line)) {
      processStream.write(new Batch(startLine, endLine, batch)); // Send the batch to the processing stream
      batch = []; // Reset batch
      startLine = endLine + 1;
      endLine = startLine;
    }

    batch.push(line);
    endLine++;
  });

  reader.on('close', () => {
    if (batch.length > 0) {
      processStream.write(new Batch(startLine, endLine, batch)); // Process remaining lines
    }
    processStream.end(); // Signal that processing is complete
  });

  await new Promise((resolve, reject) => {
    processStream.on('finish', resolve);
    processStream.on('error', reject);
  });

  return failures;
}
