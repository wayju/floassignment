///
/// Unit test for nem12Record.ts
///
/// TODO: 
/// - test all the fields with values, since they are basic values we wont use in this example project I have skipped it
///

import { NEM12Record, NEM12_100Record, NEM12_200Record, NEM12_300Record, NEM12_500Record } from './nem12Record';

const timeZone = 'Australia/Sydney';

function csvToString(csv: string): string[] {
    return csv.split(",");
}

describe('testing NEM12Record', () => {
    test('test basic NEM12 record parsing', () => {
        let line = csvToString("100,NEM12,200506081149,UNITEDDP,NEMMCO");
        let record = NEM12Record.parse(line, timeZone);
        expect(record.getRecordIndicator()).toBe(100);
        expect(record.getContent()).toEqual(line);
    });
});

describe('testing NEM12_100Record', () => {
    test('test basic NEM12 record parsing', () => {
        let line = csvToString("100,NEM12,200506081149,UNITEDDP,NEMMCO");
        let record = NEM12Record.parse(line, timeZone);
        expect(record).toBeInstanceOf(NEM12_100Record);
        expect(record.getRecordIndicator()).toBe(100);
        expect(record.getContent()).toEqual(line);

        let record100 = record as NEM12_100Record;

        expect(record100.getVersionHeader()).toBe("NEM12");
        expect(record100.getDate()).toEqual(new Date("2005-06-08T11:49:00+10:00"));
        expect(record100.getFromParticipant()).toBe("UNITEDDP");
        expect(record100.getToParticipant()).toBe("NEMMCO");
        expect(record100.getRecordIndicator()).toBe(100);
    });
});

describe('testing NEM12_200Record', () => {
    test('test basic NEM12 record parsing', () => {
        let line = csvToString("200,NEM1201009,E1E2,1,E1,N1,01009,kWh,30,20050610");
        let record = NEM12Record.parse(line, timeZone);
        expect(record).toBeInstanceOf(NEM12_200Record);
        expect(record.getRecordIndicator()).toBe(200);
        expect(record.getContent()).toEqual(line);

        let record200 = record as NEM12_200Record;

        expect(record200.getNMI()).toBe("NEM1201009");
        expect(record200.getNMIConfiguration()).toEqual("E1E2");
        expect(record200.getRegisterId()).toBe("1");
        expect(record200.getNMISuffix()).toBe("E1");
        expect(record200.getMDMDataStreamIdentifier()).toBe("N1");
        expect(record200.getMeterSerialNumber()).toBe("01009");
        expect(record200.getUOM()).toBe("kWh");
        expect(record200.getIntervalLength()).toBe(30);
        expect(record200.getNextScheduledReadDate()).toEqual("20050610");
    });
});

describe('testing NEM12_300Record', () => {
    test('test basic NEM12 record parsing', () => {
        let line = csvToString("300,20050304,0,0,0,0,0,0,0,0,0,0,0,0,0.335,0.667,0.790,1.023,1.145,1.777,1.563,1.344,1.087,1.453,0.996,1.125,1.435,1.263,1.085,1.487,1.278,0.768,0.878,0.754,0.476,1.045,1.132,0.896,0.879,0.679,0.887,0.784,0.954,0.712,0.599,0.593,0.674,0.799,0.232,0.612,A,,,20050310121004,20050310182204");
        let record = NEM12Record.parse(line, timeZone);
        expect(record).toBeInstanceOf(NEM12_300Record);
        expect(record.getRecordIndicator()).toBe(300);
        expect(record.getContent()).toEqual(line);

        let record200 = record as NEM12_300Record;

        expect(record200.getIntervalDate()).toEqual("20050304");
        expect(record200.getQualityMethod()).toBe("A");
        expect(record200.getReasonCode()).toBe("");
        expect(record200.getReasonDescription()).toBe("");
        expect(record200.getUpdateDateTime()).toEqual(new Date("2005-03-10T12:10:04+11:00")); //DST
        expect(record200.getMSATSLoadDateTime()).toEqual(new Date("2005-03-10T18:22:04+11:00")); //DST
    });
});

describe('testing NEM12_500Record', () => {
    test('test basic NEM12 record parsing', () => {
        let line = csvToString("500,O,S01009,20050310121004,");
        let record = NEM12Record.parse(line, timeZone);
        expect(record).toBeInstanceOf(NEM12_500Record);
        expect(record.getRecordIndicator()).toBe(500);
        expect(record.getContent()).toEqual(line);

        let record500 = record as NEM12_500Record;

        expect(record500.getTransCode()).toBe("O");
        expect(record500.getRetServiceOrder()).toBe("S01009");
        expect(record500.getReadDateTime()).toEqual(new Date("2005-03-10T12:10:04+11:00")); //DST
        expect(record500.getIndexRead()).toBe("");
    });
});