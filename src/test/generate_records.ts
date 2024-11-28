import fs from 'fs';

const numMeters = 10000;
const numDays = 30; // Total number of days to simulate
const startYear = 2005;
const startMonth = 6;
const startDay = 1;
const outputFilePath = 'examples/10000x30_sample.csv';

const headerTemplate = `100,NEM12,200506081149,UNITEDDP,NEMMCO`;

// Days in each month (non-leap year)
const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function generate200Record(nmi: number): string {
  return `200,NEM12${nmi},E1E2,1,E1,N1,01009,kWh,30,20050610`;
}

function generate300Record(year: number, month: number, day: number): string {
  const formattedMonth = month.toString().padStart(2, '0');
  const formattedDay = day.toString().padStart(2, '0');
  return `300,${year}${formattedMonth}${formattedDay},0,0,0,0,0,0,0,0,0,0,0,0,0.461,0.810,0.568,1.234,1.353,1.507,1.344,1.773,0.848,1.271,0.895,1.327,1.013,1.793,0.988,0.985,0.876,0.555,0.760,0.938,0.566,0.512,0.970,0.760,0.731,0.615,0.886,0.531,0.774,0.712,0.598,0.670,0.587,0.657,0.345,0.231,A,,,20050310121004,20050310182204`;
}

function getNextDate(
  year: number,
  month: number,
  day: number
): [number, number, number] {
  const maxDays = month === 2 && isLeapYear(year) ? 29 : daysInMonth[month - 1];
  day += 1;
  if (day > maxDays) {
    day = 1;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return [year, month, day];
}

// Write header to the file
fs.writeFileSync(outputFilePath, `${headerTemplate}\n`, 'utf8');

// Generate records and append them to the file
for (let i = 1; i <= numMeters; i++) {
  fs.appendFileSync(outputFilePath, `${generate200Record(i)}\n`, 'utf8');

  let currentYear = startYear;
  let currentMonth = startMonth;
  let currentDay = startDay;

  for (let j = 0; j < numDays; j++) {
    fs.appendFileSync(
      outputFilePath,
      `${generate300Record(currentYear, currentMonth, currentDay)}\n`,
      'utf8'
    );
    [currentYear, currentMonth, currentDay] = getNextDate(
      currentYear,
      currentMonth,
      currentDay
    );
  }
}

console.log(`File written to ${outputFilePath}`);
