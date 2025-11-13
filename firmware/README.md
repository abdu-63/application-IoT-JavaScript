# ESP32 IoT Sensor Firmware

This firmware is designed for an ESP32 microcontroller to collect sensor data and communicate with the IoT backend via MQTT. It also supports device control through relay output.

## Hardware Requirements

- ESP32 development board
- DHT22 temperature and humidity sensor
- PIR motion sensor
- Light sensor (LDR or photodiode)
- Relay module (5V)
- Jumper wires
- Breadboard

## Wiring Diagram

```
ESP32 Pin    Component
--------    ---------
GPIO 4      DHT22 Data Pin
GPIO 5      PIR Motion Sensor Output
GPIO 34     Light Sensor Output
GPIO 18     Relay Control Pin
3.3V        DHT22 VCC, PIR VCC
GND         DHT22 GND, PIR GND, Light Sensor GND, Relay GND
5V          Relay VCC
```

## Installation

1. Install the Arduino IDE
2. Install the following libraries:
   - WiFi
   - PubSubClient
   - DHT sensor library
   - ArduinoJson
3. Update the WiFi and MQTT credentials in the code
4. Upload the firmware to your ESP32

## Configuration

Before uploading, update the following variables in the code:

- `ssid`: Your WiFi network name
- `password`: Your WiFi password
- `mqtt_server`: IP address of your MQTT broker
- `device_id`: Unique identifier for this device

## MQTT Topics

The firmware uses the following MQTT topics:

- `sensors/{device_id}/data`: Sensor data publishing
- `devices/{device_id}/status`: Device status publishing
- `devices/{device_id}/command`: Device command subscription
- `devices/{device_id}/ack`: Command acknowledgment

## Supported Commands

The firmware supports the following commands sent to the `devices/{device_id}/command` topic:

- `on`: Turn the relay ON
- `off`: Turn the relay OFF
- `ping`: Request device status

## Data Format

### Sensor Data

Sensor data is published in JSON format:

```json
{
  "deviceId": "esp32_sensor_001",
  "temperature": 24.5,
  "humidity": 45.2,
  "motion": 1,
  "light": 750,
  "timestamp": 1234567890
}
```

### Device Status

Device status is published in JSON format:

```json
{
  "deviceId": "esp32_sensor_001",
  "status": "on",
  "timestamp": 1234567890
}
```

### Command Acknowledgment

Command acknowledgments are published in JSON format:

```json
{
  "deviceId": "esp32_sensor_001",
  "command": "on",
  "success": true,
  "timestamp": 1234567890
}
```
