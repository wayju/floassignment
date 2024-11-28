//Entrypoint for the application. Managaes the command line options and starts the processing of the input file.

import { Command } from 'commander';
import packageJson from '../package.json';
import { setDebugLogging, logger } from './utils/logging';
import { readAndProcess } from './reader/reader';

import { NEM12Processor } from './nem12/nem12Processor';

const app = new Command();
app.version(packageJson.version);

//Console application definition and options.
app.description(
  'Import NEM12 data from a file and store it in a database. The data is expected to be in NEM12 format.'
);

app.requiredOption(
  '-F, --file <filename>',
  `input file containing data in NEM12 format to import.`
);
app.option('-D, --debug', 'print debugging information');
app.option(
  '-T --timezone <timezone>',
  'timezone to use for processing. Default is Australia/Sydney',
  'Australia/Sydney'
);

//We only need one action at the moment so do not use any sub commands.
app.action(async (options) => {
  if (options.debug) {
    setDebugLogging();
  }

  logger.debug('Starting import');
  const processor = new NEM12Processor(options.timezone);
  try {
    const failedRecords = await readAndProcess(
      options.file,
      processor.shouldDispatchFunc,
      processor.processFunc
    );
    if (failedRecords.length > 0) {
      logger.error(`Failed to process ${failedRecords.length} records`);
      for (let i = 0; i < failedRecords.length; i++) {
        logger.error(`${failedRecords[i]}`);
      }
    }
  } catch (e) {
    logger.error(`Error processing file: ${e}`);
  }
  logger.debug('Import complete');
});

app.parse();
