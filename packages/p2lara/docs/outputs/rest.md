# REST APi

## Sensors

As configured in the `data` object in the configuration file, a REST interface is dynamically built. The REST endpoints are composed using the following structure: `/api/:entity/[:dev_id]`

For example take the following `data` object.

```json
"data": [
    "temperature",
    "humidity",
    "motion",
    "light",
    "battery"
  ]
```

This should result in the following REST endpoints:

* GET `/api/temperature/:dev_id`
* GET `/api/humidity/:dev_id`
* GET `/api/motion/:dev_id`
* GET `/api/light/:dev_id`
* GET `/api/battery/:dev_id`

`:dev_id` is optional. If set, it will return the datapoints for the entity. If not provided, it will list all nodes that have a `temperature` value.

### Filtering data

By default the sensor endpoints will return the data of the last 24 hours. Other *periods* could be used by adding query parameters to the api endpoint.

The following `periods` are supported:

* **last**: Only return the last datapoint
* **hour**: All values of the last hours
* **day**: datapoints from the last 24 hours, average in a 5 minute interval (288 values)
* **week**: datapoints of the last 7 days, average in a 30 minute interval (336 values)
* **month**: datapoints of the last 31 days, average in 1 hour intervals (360 values)
* **year**: datapoints of the last 365 days, average in 24 hour intervals (365 values)
* **all**: all datapoints, average in 24 hour intervals

It is also possible to define custom intervals for each of the periods.

Examples:

* GET `/api/temperature/:dev_id?period=week`
* GET `/api/temperature/:dev_id?period=year;interval=2d`
* GET `/api/temperature/:dev_id?period=week;interval=1m`
* GET `/api/temperature?period=week;interval=1h`

Finally, it is possible to define the period and the maximum number of datapoints to retrieve.

Examples:

* GET `/api/temperature/:dev_id?period=week;datapoints=200`
* GET `/api/temperature?period=year;datapoints=200`

## Nodes

The API will also provide information about the different sensor that are known by the application. The following endpoint can be used to retrieve all known sensor nodes:

* GET `/api/sensors`

## Metadata

Ding.js will provide outputs for those metadata properties as well.

For example for the metadata configuration below, it will result in addition endpoints. Those endpoints are set with the following REST structure: `/api/:meta_data_name/[:value]`

```json
  "metadata": [
    "location",
    "contact",
    "room",
    "installation_date"
  ]
```

This will dynamically provide the following endpoints

* GET `/api/location/:value`
* GET `/api/room/:value`

`:value` is optional. If set, it will return all nodes for a specific metadata value. If not provided it will return all nodes that are related to that `meta_data_name`

## Disabling data and metadata

Data and metadata endpoints can be disabled, i.e. no route or topic will be generated, by adding the `disable` object to the `outputs`. The `disable` object contains two fields, `data` and `metadata` which are arrays containing the data and metadata to be disabled.

An example: 

```json
"outputs": {
    "rest": {
      "disable": {
        "metadata":["contact", "installation_date"],
        "data": ["battery"]
      }
    }
  }
```