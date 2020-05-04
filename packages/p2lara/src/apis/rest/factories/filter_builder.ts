import * as express from 'express';
import Filter from '../../../storages/influxdb/filter';

export default class FilterBuilder {

  static mapping: { [id: string] : any }  = {
    'default': { period: '24h' },
    'day': { period: '24h', interval: '5m' },
    'week': { period: '7d', interval: '30m' },
    'month': { period: '31d', interval: '1h' },
    'year': { period: '365d', interval: '24h' },
    'all': { interval: '24h' },
    'last': { limit: 1 },
  };

  static build(params: any) : Filter {
    const period = params.period || 'default';
    let filter = new Filter(FilterBuilder.mapping[period]);

    if (params.datapoints) {
      filter.limit(params.datapoints);
    }

    if (params.interval) {
      filter.interval(params.interval);
    }

    return filter;
  }
}