// This file contains the NEM12Record class and its subclasses including parsing responsibilities.
//
// Note that an alternative would be to look for a public package but this would need to be reviewed / tested and is not in scope.
// Ideally one would be used from a reputable / known source if it exists.

import { DateTime as LuxonDateTime } from 'luxon';

const date8_format = 'yyyyMMdd'; //CCYYMMDD
const date12_format = 'yyyyMMddhhmm'; //CCYYMMDDhhmm
const date14_format = 'yyyyMMddhhmmss'; //CCYYMMDDhhmmss

const parseDateWithTimezone = (
  dateStr: string,
  format: string,
  tz: string
): Date => {
  // Parse the date string using the provided format and timezone
  const dateTime = LuxonDateTime.fromFormat(dateStr, format, { zone: tz });

  // If parsing fails, fall back to the reference date
  if (!dateTime.isValid) {
    throw new Error(
      'Invalid date or format provided: ' + dateStr + ' with format ' + format
    );
  }

  // Convert to a JavaScript Date object
  return dateTime.toJSDate();
};

export abstract class NEM12Record {
  constructor(
    private readonly recordIndicator: number,
    private readonly content: string[]
  ) {}

  getRecordIndicator(): number {
    return this.recordIndicator;
  }

  getContent(): string[] {
    return this.content;
  }

  static parse(content: string[], tz: string): NEM12Record {
    if (isNaN(Number(content[0]))) {
      throw new Error(`Invalid record indicator: ${content[0]}`);
    }
    const recordIndicator = Number(content[0]);

    switch (recordIndicator) {
      case 100:
        return NEM12_100Record.parseRecord(content, tz);
      case 200:
        return NEM12_200Record.parseRecord(content);
      case 300:
        return NEM12_300Record.parseRecord(content, tz);
      case 500:
        return NEM12_500Record.parseRecord(content, tz);
      case 900:
        return new NEM12_900Record(content);
      default:
        return new UnknownRecord(content);
    }
  }
}

export class UnknownRecord extends NEM12Record {
  constructor(content: string[]) {
    super(-1, content);
  }
}

export class NEM12_100Record extends NEM12Record {
  constructor(
    content: string[],
    private readonly versionHeader: string,
    private readonly date: Date,
    private readonly fromParticipant: string,
    private readonly toParticipant: string
  ) {
    super(100, content);
  }

  static parseRecord(content: string[], tz: string): NEM12_100Record {
    const versionHeader = content[1];
    const date = parseDateWithTimezone(content[2], date12_format, tz);
    const fromParticipant = content[3];
    const toParticipant = content[4];
    return new NEM12_100Record(
      content,
      versionHeader,
      date,
      fromParticipant,
      toParticipant
    );
  }

  getVersionHeader(): string {
    return this.versionHeader;
  }

  getDate(): Date {
    return this.date;
  }

  getFromParticipant(): string {
    return this.fromParticipant;
  }

  getToParticipant(): string {
    return this.toParticipant;
  }
}

export class NEM12_200Record extends NEM12Record {
  constructor(
    content: string[],
    private readonly nmi: string,
    private readonly nmiConfiguration: string,
    private readonly registerId: string,
    private readonly nmiSuffix: string,
    private readonly mDMDataStreamIdentifier: string,
    private readonly meterSerialNumber: string,
    private readonly uom: string,
    private readonly intervalLength: number,
    private readonly nextScheduledReadDate: string
  ) {
    super(200, content);
  }

  getNMI(): string {
    return this.nmi;
  }

  getNMIConfiguration(): string {
    return this.nmiConfiguration;
  }

  getRegisterId(): string {
    return this.registerId;
  }

  getNMISuffix(): string {
    return this.nmiSuffix;
  }

  getMDMDataStreamIdentifier(): string {
    return this.mDMDataStreamIdentifier;
  }

  getMeterSerialNumber(): string {
    return this.meterSerialNumber;
  }

  getUOM(): string {
    return this.uom;
  }

  getIntervalLength(): number {
    return this.intervalLength;
  }

  getNextScheduledReadDate(): string {
    return this.nextScheduledReadDate;
  }

  static parseRecord(content: string[]): NEM12_200Record {
    const nmi = content[1];
    const nmiConfiguration = content[2];
    const registerId = content[3];
    const nmiSuffix = content[4];
    const mDMDataStreamIdentifier = content[5];
    const meterSerialNumber = content[6];
    const uom = content[7];
    const intervalLength = Number(content[8]);
    const nextScheduledReadDate = content[9];
    return new NEM12_200Record(
      content,
      nmi,
      nmiConfiguration,
      registerId,
      nmiSuffix,
      mDMDataStreamIdentifier,
      meterSerialNumber,
      uom,
      intervalLength,
      nextScheduledReadDate
    );
  }
}

export class NEM12_300Record extends NEM12Record {
  constructor(
    content: string[],
    private readonly intervalDate: Date,
    private readonly intervalValues: number[],
    private readonly qualityMethod: string,
    private readonly reasonCode: string,
    private readonly reasonDescription: string,
    private readonly updateDateTime: Date,
    private readonly mSATSLoadDateTime: Date | null
  ) {
    super(300, content);
  }

  getIntervalDate(): Date {
    return this.intervalDate;
  }

  getIntervalValues(): number[] {
    return this.intervalValues;
  }

  getQualityMethod(): string {
    return this.qualityMethod;
  }

  getReasonCode(): string {
    return this.reasonCode;
  }

  getReasonDescription(): string {
    return this.reasonDescription;
  }

  getUpdateDateTime(): Date {
    return this.updateDateTime;
  }

  getMSATSLoadDateTime(): Date | null {
    return this.mSATSLoadDateTime;
  }

  static parseRecord(content: string[], tz: string): NEM12_300Record {
    const intervalDate = parseDateWithTimezone(content[1], date8_format, tz);
    const intervalValues: number[] = [];
    for (let i = 2; i < 50; i++) {
      //Actualy we should use 1440/interval length
      if (isNaN(Number(content[i]))) {
        throw new Error('Invalid interval value');
      }
      intervalValues.push(Number(content[i]));
    }
    const qualityMethod = content[50];
    const reasonCode = content[51];
    const reasonDescription = content[52];
    const updateDateTime = parseDateWithTimezone(
      content[53],
      date14_format,
      tz
    );
    const mSATSLoadDateTime =
      content[54] !== undefined && content[54].trim() != ''
        ? parseDateWithTimezone(content[54], date14_format, tz)
        : null;
    return new NEM12_300Record(
      content,
      intervalDate,
      intervalValues,
      qualityMethod,
      reasonCode,
      reasonDescription,
      updateDateTime,
      mSATSLoadDateTime
    );
  }
}

export class NEM12_500Record extends NEM12Record {
  constructor(
    content: string[],
    private readonly transCode: string,
    private readonly retServiceOrder: string,
    private readonly readDateTime: Date,
    private readonly indexRead: string
  ) {
    super(500, content);
  }

  static parseRecord(content: string[], tz: string): NEM12_500Record {
    const transCode = content[1];
    const retServiceOrder = content[2];
    const readDateTime = parseDateWithTimezone(content[3], date14_format, tz);
    const indexRead = content[4];

    return new NEM12_500Record(
      content,
      transCode,
      retServiceOrder,
      readDateTime,
      indexRead
    );
  }

  getTransCode(): string {
    return this.transCode;
  }

  getRetServiceOrder(): string {
    return this.retServiceOrder;
  }

  getReadDateTime(): Date {
    return this.readDateTime;
  }

  getIndexRead(): string {
    return this.indexRead;
  }
}

/// 900 Record indicates the end of the file
export class NEM12_900Record extends NEM12Record {
  constructor(content: string[]) {
    super(900, content);
  }
}
