// This file contains the NEM12Record class and its subclasses including parsing responsibilities.
//
// Note that an alternative would be to look for a public package but this would need to be reviewed / tested and is not in scope. 
// Ideally one would be used from a reputable / known source if it exists.

import { DateTime as LuxonDateTime } from 'luxon';

const date8_format = "yyyyMMdd"; //CCYYMMDD
const date12_format = "yyyyMMddhhmm"; //CCYYMMDDhhmm
const date14_format = "yyyyMMddhhmmss"; //CCYYMMDDhhmmss

const parseDateWithTimezone = (dateStr: string, format: string, tz: string): Date => {

    // Parse the date string using the provided format and timezone
    const dateTime = LuxonDateTime.fromFormat(dateStr, format, { zone: tz });

    // If parsing fails, fall back to the reference date
    if (!dateTime.isValid) {
        throw new Error('Invalid date or format provided: ' + dateStr + ' with format ' + format);
    }

    // Convert to a JavaScript Date object
    return dateTime.toJSDate();
};

export abstract class NEM12Record {
    private readonly recordIndicator: number;
    private readonly content: string[];

    constructor(recordIndicator: number, content: string[]) {
        this.recordIndicator = recordIndicator;
        this.content = content;
    }

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
        let recordIndicator = Number(content[0]);

        switch (recordIndicator) {
            case 100:
                return NEM12_100Record.parseRecord(content, tz);
            case 200:
                return NEM12_200Record.parseRecord(content, tz);
            case 300:
                return NEM12_300Record.parseRecord(content, tz);
            case 500:
                return NEM12_500Record.parseRecord(content, tz);

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
    private readonly versionHeader: string;
    private readonly date: Date;
    private readonly fromParticipant: string;
    private readonly toParticipant: string;

    constructor(content: string[], versionHeader: string, date: Date, fromParticipant: string, toParticipant: string) {
        super(100, content);
        this.date = date;
        this.versionHeader = versionHeader;
        this.fromParticipant = fromParticipant;
        this.toParticipant = toParticipant;
    }

    static parseRecord(content: string[], tz: string): NEM12_100Record {
        let versionHeader = content[1];
        let date = parseDateWithTimezone(content[2], date12_format, tz);
        let fromParticipant = content[3];
        let toParticipant = content[4];
        return new NEM12_100Record(content, versionHeader, date, fromParticipant, toParticipant);
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
    private readonly nmi: string;
    private readonly nmiConfiguration: string;
    private readonly registerId: string;
    private readonly nmiSuffix: string;
    private readonly mDMDataStreamIdentifier: string;
    private readonly meterSerialNumber: string;
    private readonly uom: string;
    private readonly intervalLength: number;
    private readonly nextScheduledReadDate: string;

    constructor(content: string[], nmi: string, nmiConfiguration: string, registerId: string, nmiSuffix: string, mDMDataStreamIdentifier: string, meterSerialNumber: string, uom: string, intervalLength: number, nextScheduledReadDate: string) {
        super(200, content);
        this.nmi = nmi;
        this.nmiConfiguration = nmiConfiguration;
        this.registerId = registerId;
        this.nmiSuffix = nmiSuffix;
        this.mDMDataStreamIdentifier = mDMDataStreamIdentifier;
        this.meterSerialNumber = meterSerialNumber;
        this.uom = uom;
        this.intervalLength = intervalLength;
        this.nextScheduledReadDate = nextScheduledReadDate;
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
        return this.nextScheduledReadDate
    }

    static parseRecord(content: string[], tz: string): NEM12_200Record {
        let nmi = content[1]
        let nmiConfiguration = content[2]
        let registerId = content[3]
        let nmiSuffix = content[4]
        let mDMDataStreamIdentifier = content[5]
        let meterSerialNumber = content[6]
        let uom = content[7]
        let intervalLength = Number(content[8])

        let nextScheduledReadDate = content[9];
        return new NEM12_200Record(content, nmi, nmiConfiguration, registerId, nmiSuffix, mDMDataStreamIdentifier, meterSerialNumber, uom, intervalLength, nextScheduledReadDate);
    }
}

export class NEM12_300Record extends NEM12Record {
    private readonly intervalDate: string;
    private readonly intervalValues: number[];
    private readonly qualityMethod: string;
    private readonly reasonCode: string;
    private readonly reasonDescription: string;
    private readonly updateDateTime: Date;
    private readonly mSATSLoadDateTime: Date;

    constructor(content: string[], intervalDate: string, intervalValues: number[], qualityMethod: string, reasonCode: string, reasonDescription: string, updateDateTime: Date, mSATSLoadDateTime: Date) {
        super(300, content);
        this.intervalDate = intervalDate;
        this.intervalValues = intervalValues;
        this.qualityMethod = qualityMethod;
        this.reasonCode = reasonCode;
        this.reasonDescription = reasonDescription;
        this.updateDateTime = updateDateTime;
        this.mSATSLoadDateTime = mSATSLoadDateTime;
    }

    getIntervalDate(): string {
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

    getMSATSLoadDateTime(): Date {
        return this.mSATSLoadDateTime;
    }

    static parseRecord(content: string[], tz: string): NEM12_300Record {
        let intervalDate = content[1]
        let intervalValues: number[] = [];
        for (var i = 2; i < content.length - 5; i++) {
            if (isNaN(Number(content[i]))) {
                throw new Error('Invalid interval value');
            }
            intervalValues.push(Number(content[i]));
        }
        let qualityMethod = content[i++]
        let reasonCode = content[i++]
        let reasonDescription = content[i++]
        let updateDateTime = parseDateWithTimezone(content[i++], date14_format, tz)
        let mSATSLoadDateTime = parseDateWithTimezone(content[i++], date14_format, tz)
        return new NEM12_300Record(content, intervalDate, intervalValues, qualityMethod, reasonCode, reasonDescription, updateDateTime, mSATSLoadDateTime);
    }
}

export class NEM12_500Record extends NEM12Record {
    private readonly transCode: string;
    private readonly retServiceOrder: string;
    private readonly readDateTime: Date;
    private readonly indexRead: string;

    constructor(content: string[], transCode: string, retServiceOrder: string, readDateTime: Date, indexRead: string) {
        super(500, content);
        this.transCode = transCode;
        this.retServiceOrder = retServiceOrder;
        this.readDateTime = readDateTime;
        this.indexRead = indexRead;
    }

    static parseRecord(content: string[], tz: string): NEM12_500Record {
        let transCode = content[1];
        let retServiceOrder = content[2];
        let readDateTime = parseDateWithTimezone(content[3], date14_format, tz);
        let indexRead = content[4];

        return new NEM12_500Record(content, transCode, retServiceOrder, readDateTime, indexRead);
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