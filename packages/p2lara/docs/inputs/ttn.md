# The Things Network - TTN Input

The TTN input will store sensor data from a The Things Network application.

## The Things Network 

[The Things Network](https://www.thethingsnetwork.org)

<!-- Connecting to the TTN MQTT broker (`eu.thethings.network`) using the topic `+/devices/+/up`, it is possible to receive all the data of the TTN application.
For this framework we are specifically interested in the following objects:

* `payload_fields`: This wil contain the different sensor fields.
* `dev_id`: This is the identifier of the node -->

## Confgiruation

To enable the TTN input, you must specify the settings needed to make a connection to the TTN.

```json
"inputs": {
    "ttn": {
        "application_id": "abc",
        "access_token": "xyz"
    }
}
```

### Payload fields

The `payload_fields` object contains different keys with a corresponding value. Using the Ding.js configuration it should be checked which keys should be forwarded to the database. Keys not available in the configuration should be ignored.

Example:

```json
"payload_fields": {
		"humidity": 39,
		"light": 0,
		"motion": 1,
		"temperature": 22.3
	}
```

Note that the `payloads_fields` is only available if a payload decoder is set and configured in the TTN console for the application.

#### Payload decoder

The payload decoder must be configured correctly to match the `data` values defined in the Ding.js configuration.

TODO: Example

### Device id

The `dev_id` is a string object that contains an identifier for the sensor node that has send the data. This should be stored in the database together with the payload field values.

## Full TTN example

```json
{
	"app_id": "campus-monitor",
	"dev_id": "sensor-06",
	"hardware_serial": "A81758FFFE04076A",
	"port": 5,
	"counter": 7309,
	"payload_raw": "AQDfAicEAAAFAQ==",
	"payload_fields": {
		"humidity": 39,
		"light": 0,
		"motion": 1,
		"temperature": 22.3
	},
	"metadata": {
		"time": "2019-04-08T18:57:55.026993331Z",
		"frequency": 867.5,
		"modulation": "LORA",
		"data_rate": "SF9BW125",
		"airtime": 205824000,
		"coding_rate": "4/5",
		"gateways": [{
			"gtw_id": "eui-7276ff002e0627a3",
			"timestamp": 724257404,
			"fine_timestamp_encrypted": "FWH7m/uIo03ibn/hyJJoYw==",
			"time": "2019-04-08T18:57:53.954783Z",
			"channel": 18,
			"rssi": -114,
			"snr": -2,
			"rf_chain": 0,
			"latitude": 51.19419,
			"longitude": 3.218,
			"altitude": 34
		}]
	}
}
```