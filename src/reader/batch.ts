export class Batch {
  constructor(
    private readonly startLine: number,
    private readonly endLine: number,
    private readonly records: string[]
  ) {}

  public getStartLine(): number {
    return this.startLine;
  }

  public getEndLine(): number {
    return this.endLine;
  }

  public getRecords(): string[] {
    return this.records;
  }
}
