//Entrypoint for the application. Managaes the command line options and starts the processing of the input file.

import { Command, Option, InvalidArgumentError } from 'commander';
import packageJson from '../package.json';

const app = new Command();
app.version(packageJson.version);

const minParseInt = function (value: string) {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError('Not a number.');
  }

  if (parsedValue < 1) {
    throw new InvalidArgumentError('Should be greater than 0.');
  }
  return parsedValue;
};

//Console application definition and options.
app.description(
  '. ' +
  '. \n\n' +
  '' +
  ''
);
app.requiredOption(
  '-F, --file <filename>',
  `input file containing data in NEM12 format to import.`
);
app.option('-D, --debug', 'print debugging information');

//We only need one action at the moment so do not use any sub commands.
app.action(async (options) => {
  if (options.debug) {
    setDebugLogging();
  }

  //TODO: Implement the file processing

  app.parse();
