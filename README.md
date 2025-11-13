# IoT Temperature Monitoring System

A complete IoT solution for monitoring temperature, humidity, motion, and light levels with real-time alerts and device control.

## Project Structure

```
├── backend/              # Node.js backend with Express.js
├── docs/                 # Project documentation
├── firmware/             # ESP32 firmware for IoT devices
├── public/               # Static assets
├── src/                  # Frontend React application
│   ├── components/       # React components
│   ├── pages/            # Page components
│   ├── services/         # Service modules
│   └── ...               # Other frontend files
├── README.md             # This file
└── package.json          # Frontend dependencies
```

## Features

- Real-time sensor monitoring (temperature, humidity, motion, light)
- User authentication with JWT
- Device control (on/off)
- Configurable alert thresholds
- Historical data viewing
- Responsive web interface
- MQTT communication with IoT devices
- Security by design principles

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

### Infrastructure
- MongoDB database
- MQTT broker (Mosquitto)

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- MQTT broker (Mosquitto)
- Arduino IDE (for ESP32 firmware)

### Frontend Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Development

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```

### Documentation

Detailed documentation is available in the `docs/` directory:
- [System Architecture](docs/architecture.md)
- [Security Implementation](docs/security.md)
- [User Manual](docs/user-manual.md)

### ESP32 Firmware

The firmware for ESP32 devices is located in the `firmware/` directory. See `firmware/README.md` for installation instructions.

## Project Requirements

This project fulfills all requirements from the IoT course project:

1. ✅ Microcontroller implementation (ESP32)
2. ✅ Sensor integration (temperature, humidity, motion, light)
3. ✅ Web interface with React.js
4. ✅ Backend with Node.js/Express.js
5. ✅ Database storage (MongoDB)
6. ✅ Real-time communication (MQTT/WebSocket)
7. ✅ User authentication (JWT)
8. ✅ Security by design principles
9. ✅ Alerting system
10. ✅ Device control capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

# application-IoT-JavaScript
