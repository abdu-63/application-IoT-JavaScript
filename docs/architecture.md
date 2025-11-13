# System Architecture

## Overview

The IoT Temperature Monitoring System follows a distributed architecture with clear separation of concerns between the frontend, backend, database, and IoT devices.

## Component Diagram

```
+-----------------------------------------------------+
|                    Frontend Layer                   |
|  +----------------+  +---------------------------+  |
|  |   Web Client   |  |   Admin Interface         |  |
|  |  (React/Vite)  |  |  (React/Vite)             |  |
|  +----------------+  +---------------------------+  |
+-----------------------------------------------------+
              | HTTP/WS API      | HTTP/WS API
              v                  v
+-----------------------------------------------------+
|                    Backend Layer                    |
|  +----------------+  +---------------------------+  |
|  |  REST API      |  |   Real-time Service       |  |
|  | (Express.js)   |  |   (Socket.IO)             |  |
|  +----------------+  +---------------------------+  |
|                                                     |
|  +----------------+  +---------------------------+  |
|  | Auth Service   |  |   Device Management       |  |
|  | (JWT)          |  |   Service                 |  |
|  +----------------+  +---------------------------+  |
|                                                     |
|  +----------------+  +---------------------------+  |
|  | Alert Service  |  |   Data Processing         |  |
|  |                |  |   Service                 |  |
|  +----------------+  +---------------------------+  |
+-----------------------------------------------------+
              | MongoDB         | MQTT
              v                 v
+----------------------+  +----------------------+
|   Database Layer     |  |   IoT Device Layer   |
|  +----------------+  |  |  +----------------+  |
|  |   MongoDB      |  |  |  |   ESP32 #1     |  |
|  |  (Sensors DB)  |  |  |  | (DHT22, PIR)   |  |
|  +----------------+  |  |  +----------------+  |
|                      |  |                      |
|  +----------------+  |  |  +----------------+  |
|  |   InfluxDB     |  |  |  |   ESP32 #2     |  |
|  |  (Time Series) |  |  |  | (DHT22, Light) |  |
|  +----------------+  |  |  +----------------+  |
+----------------------+  +----------------------+
```

## Data Flow

1. **User Authentication Flow**
   - User submits credentials to frontend
   - Frontend sends request to backend auth service
   - Backend validates credentials and generates JWT
   - JWT is returned to frontend and stored in localStorage
   - JWT is included in subsequent API requests

2. **Sensor Data Flow**
   - ESP32 devices collect sensor data periodically
   - Data is published to MQTT broker
   - Backend MQTT service subscribes to sensor topics
   - Backend processes and stores data in MongoDB
   - Backend emits real-time updates via Socket.IO
   - Frontend receives updates and updates UI

3. **Device Control Flow**
   - User sends command from frontend
   - Frontend sends request to backend device service
   - Backend publishes command to MQTT broker
   - ESP32 device receives command and executes
   - Device sends status update back to backend
   - Backend updates database and notifies frontend

4. **Alert Flow**
   - Backend processes incoming sensor data
   - Data is checked against configured thresholds
   - Alerts are generated when thresholds are exceeded
   - Alerts are stored in database
   - Real-time alerts are sent to frontend via Socket.IO
   - Browser notifications are displayed to user

## Security Architecture

```
+----------------+    HTTPS    +----------------+    HTTPS/MQTT TLS    +----------------+
|   Browser      | <---------> |   Backend      | <------------------> |   ESP32        |
|                |             |   (Node.js)    |                      |   Device       |
+----------------+             +----------------+                      +----------------+
       |                              |                                     |
       | JWT Token                    | JWT Validation                      | Device Auth
       |                              |                                     |
       v                              v                                     v
+----------------+             +----------------+                      +----------------+
| Local Storage  |             |   MongoDB      |                      | Secure Boot    |
| (Encrypted)    |             |   (Encrypted)  |                      | (Certificates) |
+----------------+             +----------------+                      +----------------+
```

## Scalability Considerations

1. **Horizontal Scaling**
   - Backend services can be containerized and scaled with Docker/Kubernetes
   - MongoDB can be configured as a replica set
   - MQTT broker can be clustered for high availability

2. **Load Distribution**
   - Load balancer can distribute requests across multiple backend instances
   - CDN can serve static frontend assets
   - Database read replicas can handle query load

3. **Caching Strategy**
   - Redis can cache frequently accessed data
   - Frontend can implement local caching
   - API responses can be cached at the CDN level

## Deployment Architecture

```
Internet
    |
    v
+----------------+
|   Load         |
|   Balancer     |
+----------------+
    |
    v
+----------------+    +----------------+
|   Frontend     |    |   Frontend     |
|   Server       |    |   Server       |
|   (Node.js)    |    |   (Node.js)    |
+----------------+    +----------------+
    |                     |
    v                     v
+----------------+    +----------------+
|   Backend      |    |   Backend      |
|   Service      |    |   Service      |
|   (Node.js)    |    |   (Node.js)    |
+----------------+    +----------------+
    |                     |
    v                     v
+----------------+    +----------------+
|   MongoDB      |    |   MongoDB      |
|   Replica      |    |   Replica      |
|   Set          |    |   Set          |
+----------------+    +----------------+
    |                     |
    v                     v
+----------------+    +----------------+
|   MQTT         |    |   MQTT         |
|   Broker       |    |   Broker       |
|   (Mosquitto)  |    |   (Mosquitto)  |
+----------------+    +----------------+
```
