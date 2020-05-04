# Ding.js configuration

Ding.js configuration is composed of a JSON file that contains all information to setup the application.

* **inputs**: IoT input settings 
  * **ttn**: [MQTT broker settings (for The Things Network)](./thethingsnetwork.md)
* **data**: an array which identifies the IoT data
* **metadata**: an array identifying metadata information
* **outputs**: output API filtering (enabled by default)
  * Supported output API
    * **mqtt** broker
    * [**rest** API](./rest-api.md)
  * Disabling the output API
    * *api* : false
  * Filtering the output API
    * The disable object contains data and metadata which does not generate topics (MQTT) or paths (REST)

## Example configuration

```json
{
  "inputs": {
    "ttn": {
        "protocol": "mqtt",
        "host": "eu.thethings.network",
        "user": "abc",
        "password": "xyz"
    }
  },
  "data": [
    "temperature",
    "humidity",
    "motion",
    "light",
    "battery"
  ],
  "metadata": [
    "location",
    "contact",
    "room",
    "installation_date"
  ],
  "outputs": {
    "mqtt": false,
    "rest": {
      "disable": {
        "metadata":["contact", "installation_date"],
        "data": ["battery"]
      }
    }
  }
}
```