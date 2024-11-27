import fs from "fs";
import readline from "readline";
import { Writable } from "stream";
import { logger } from '../utils/logging';

export async function readAndProcess(
    filePath: string,
    shouldDispatchFunc: (line: string) => boolean,
    processFunc: (batch: string[]) => void
) {
    const fileStream = fs.createReadStream(filePath);
    const reader = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    let batch: string[] = [];

    // Writable stream to process batches
    const processStream = new Writable({
        objectMode: true,
        write(batch: string[], _, callback) {
            try {
                processFunc(batch); // Call the processing function
                callback();
            } catch (error) {
                logger.error(`Error processing batch: ${error}`);
            }
        },
    });

    // Collect lines into batches
    reader.on("line", (line) => {
        batch.push(line);
        if (shouldDispatchFunc(line)) {
            processStream.write(batch); // Send the batch to the processing stream
            batch = []; // Reset batch
        }
    });

    reader.on("close", () => {
        if (batch.length > 0) {
            processStream.write(batch); // Process remaining lines
        }
        processStream.end(); // Signal that processing is complete
    });

    await new Promise((resolve, reject) => {
        processStream.on("finish", resolve);
        processStream.on("error", reject);
    });
}
