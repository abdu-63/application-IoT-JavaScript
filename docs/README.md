# IoT Temperature Monitoring System

A complete IoT solution for monitoring temperature, humidity, motion, and light levels with real-time alerts and device control.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Installation](#installation)
6. [Usage](#usage)
7. [API Documentation](#api-documentation)
8. [Security](#security)
9. [Contributing](#contributing)
10. [License](#license)

## Project Overview

This IoT system provides real-time monitoring of environmental conditions using ESP32 microcontrollers and a web-based dashboard. The system includes user authentication, real-time data visualization, alerting capabilities, and device control.

## Architecture

The system follows a microservices architecture with the following components:

1. **Frontend**: React.js web application with TypeScript
2. **Backend**: Node.js/Express.js REST API with MongoDB
3. **IoT Devices**: ESP32 microcontrollers with various sensors
4. **Communication**: MQTT protocol for device communication, WebSocket for real-time web updates
5. **Database**: MongoDB for data persistence

```
+----------------+    HTTP/WS    +----------------+    MQTT    +----------------+
|   Frontend     | <---------->  |    Backend     | <--------> |   ESP32 Dev    |
|  (React.js)    |               | (Node.js/Express)|          |   (Sensors)    |
+----------------+               +----------------+          +----------------+
                                          |
                                          | MongoDB
                                          v
                                   +----------------+
                                   |   Database     |
                                   |   (MongoDB)    |
                                   +----------------+
```

## Features

- User authentication with JWT
- Real-time sensor data visualization
- Configurable alert thresholds
- Device control (on/off)
- Historical data viewing
- Responsive web interface
- Security by design principles
- MQTT communication with IoT devices

## Technology Stack

### Frontend
- React.js with TypeScript
- Vite build tool
- shadcn/ui components
- Tailwind CSS
- Socket.IO client

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- MQTT client
- Socket.IO

### IoT Devices
- ESP32 microcontroller
- DHT22 temperature/humidity sensor
- PIR motion sensor
- Light sensor
- Arduino IDE

### Infrastructure
- MongoDB database
- MQTT broker (Mosquitto)

## Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- MQTT broker (Mosquitto)
- Arduino IDE (for ESP32 firmware)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```bash
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/iot-dashboard
   JWT_SECRET=your-secret-key
   FRONTEND_URL=http://localhost:5173
   MQTT_BROKER_URL=mqtt://localhost:1883
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the project root:
   ```bash
   cd ..
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### ESP32 Firmware Setup

1. Open `firmware/iot_sensor.ino` in Arduino IDE
2. Install required libraries:
   - WiFi
   - PubSubClient
   - DHT sensor library
   - ArduinoJson
3. Update WiFi and MQTT credentials
4. Upload to ESP32

## Usage

1. Start MongoDB and MQTT broker services
2. Start the backend server
3. Start the frontend development server
4. Flash firmware to ESP32 devices
5. Access the web interface at `http://localhost:5173`

## API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Sensors

- `POST /api/sensors` - Create sensor data
- `GET /api/sensors` - Get sensor data
- `GET /api/sensors/latest` - Get latest sensor data

### Devices

- `POST /api/devices` - Create device
- `GET /api/devices` - Get all devices
- `GET /api/devices/:id` - Get device by ID
- `PATCH /api/devices/:id/status` - Update device status
- `DELETE /api/devices/:id` - Delete device

### Alerts

- `GET /api/alerts` - Get alerts
- `PATCH /api/alerts/:id/acknowledge` - Acknowledge alert
- `DELETE /api/alerts/:id` - Delete alert

## Security

The system implements the following security measures:

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Helmet.js for HTTP headers security
- Rate limiting (to be implemented)
- Secure MQTT communication (to be implemented)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.
