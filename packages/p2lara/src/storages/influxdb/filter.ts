export default class Filter {
  private _limit :number = 1000;
  private _period :string = '24h';
  private _interval :string = undefined;

  public constructor(options: any) {
    this._limit = options['limit'] || this._limit;
    this._period = options['period'] || this._period;
    this._interval = options['interval'] || this._interval;
  }

  public limit(n: number) : Filter {
    this._limit = n;
    return this;
  }

  public period(time: string) : Filter {
    this._period = time;
    return this;
  }

  public interval(time: string) : Filter {
    this._interval = time;
    return this;
  }

  public get_limit() : number {
    return this._limit;
  }

  public get_period() : string {
    return this._period;
  }

  public get_interval() : string {
    return this._interval;
  }

  public is_grouped() : boolean {
    return (this._interval != null);
  }
}