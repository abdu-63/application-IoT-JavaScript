#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT broker
const char* mqtt_server = "YOUR_MQTT_BROKER_IP";
const int mqtt_port = 1883;

// Device configuration
const char* device_id = "esp32_sensor_001";

// Pin definitions
#define DHT_PIN 4
#define DHT_TYPE DHT22
#define MOTION_PIN 5
#define LIGHT_PIN 34
#define RELAY_PIN 18  // For device control

// Sensor objects
DHT dht(DHT_PIN, DHT_TYPE);

// WiFi and MQTT clients
WiFiClient espClient;
PubSubClient client(espClient);

// Device state
bool deviceState = false;

// Timing variables
unsigned long lastSensorUpdate = 0;
const long sensorInterval = 5000; // 5 seconds

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(MOTION_PIN, INPUT);
  pinMode(LIGHT_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);  // Turn off relay initially
  
  // Initialize DHT sensor
  dht.begin();
  
  // Connect to WiFi
  setup_wifi();
  
  // Configure MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  
  // Connect to MQTT
  reconnect();
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);
  
  // Handle device commands
  String commandTopic = String("devices/") + String(device_id) + String("/command");
  if (String(topic) == commandTopic) {
    handleCommand(message);
  }
}

void handleCommand(String command) {
  // Parse JSON command
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, command);
  
  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.c_str());
    return;
  }
  
  String cmd = doc["command"];
  
  if (cmd == "on") {
    digitalWrite(RELAY_PIN, HIGH);
    deviceState = true;
    sendDeviceStatus("on");
    sendCommandAck("on", true);
    Serial.println("Device turned ON");
  } else if (cmd == "off") {
    digitalWrite(RELAY_PIN, LOW);
    deviceState = false;
    sendDeviceStatus("off");
    sendCommandAck("off", true);
    Serial.println("Device turned OFF");
  } else if (cmd == "ping") {
    // Respond to ping
    sendDeviceStatus(deviceState ? "on" : "off");
    sendCommandAck("ping", true);
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    // Create a random client ID
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      
      // Subscribe to device commands
      String commandTopic = String("devices/") + String(device_id) + String("/command");
      client.subscribe(commandTopic.c_str());
      
      // Send initial status
      sendDeviceStatus(deviceState ? "on" : "off");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void sendSensorData() {
  // Read sensors
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int motion = digitalRead(MOTION_PIN);
  int light = analogRead(LIGHT_PIN);
  
  // Check if any reads failed
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  
  // Create JSON payload
  StaticJsonDocument<300> doc;
  doc["deviceId"] = device_id;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["motion"] = motion;
  doc["light"] = light;
  doc["timestamp"] = millis();
  
  char jsonBuffer[300];
  serializeJson(doc, jsonBuffer);
  
  // Publish sensor data
  String topic = String("sensors/") + String(device_id) + String("/data");
  client.publish(topic.c_str(), jsonBuffer);
  
  Serial.println("Sensor data sent: " + String(jsonBuffer));
}

void sendDeviceStatus(const char* status) {
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["deviceId"] = device_id;
  doc["status"] = status;
  doc["timestamp"] = millis();
  
  char jsonBuffer[200];
  serializeJson(doc, jsonBuffer);
  
  // Publish device status
  String topic = String("devices/") + String(device_id) + String("/status");
  client.publish(topic.c_str(), jsonBuffer);
  
  Serial.println("Device status sent: " + String(jsonBuffer));
}

void sendCommandAck(const char* command, bool success) {
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["deviceId"] = device_id;
  doc["command"] = command;
  doc["success"] = success;
  doc["timestamp"] = millis();
  
  char jsonBuffer[200];
  serializeJson(doc, jsonBuffer);
  
  // Publish command acknowledgment
  String topic = String("devices/") + String(device_id) + String("/ack");
  client.publish(topic.c_str(), jsonBuffer);
  
  Serial.println("Command ack sent: " + String(jsonBuffer));
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Send sensor data at regular intervals
  unsigned long currentMillis = millis();
  if (currentMillis - lastSensorUpdate >= sensorInterval) {
    lastSensorUpdate = currentMillis;
    sendSensorData();
  }
}
