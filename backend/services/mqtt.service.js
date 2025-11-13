const mqtt = require('mqtt');
const Sensor = require('../models/Sensor');
const Device = require('../models/Device');
const Alert = require('../models/Alert');
const { checkThresholds } = require('../controllers/sensor.controller');

// Configuration du broker MQTT
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost';
const MQTT_BROKER_PORT = process.env.MQTT_BROKER_PORT || 1883;
const BROKER_URL = `${MQTT_BROKER_URL}:${MQTT_BROKER_PORT}`;

let mqttClient;
let io;

const connectMQTT = (socketIO) => {
  io = socketIO;
  
  // Options de connexion
  const options = {
    clientId: `backend_${Math.random().toString(16).substr(2, 8)}`,
    clean: true,
    connectTimeout: 4000,
    username: process.env.MQTT_USERNAME || '',
    password: process.env.MQTT_PASSWORD || '',
    reconnectPeriod: 1000,
  };
  
  mqttClient = mqtt.connect(BROKER_URL, options);
  
  mqttClient.on('connect', () => {
    console.log('[MQTT] Connecté au broker:', BROKER_URL);
    
    // S'abonner aux topics
    mqttClient.subscribe('sensors/+/data');
    mqttClient.subscribe('devices/+/status');
    mqttClient.subscribe('devices/+/ack');
  });
  
  mqttClient.on('error', (error) => {
    console.error('[MQTT] Erreur de connexion:', error);
  });
  
  mqttClient.on('reconnect', () => {
    console.log('[MQTT] Reconnexion au broker...');
  });
  
  mqttClient.on('close', () => {
    console.log('[MQTT] Connexion fermée');
  });
  
  mqttClient.on('message', async (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      
      // Gérer les données des capteurs
      if (topic.endsWith('/data')) {
        await handleSensorData(data);
      }
      
      // Gérer le statut des dispositifs
      if (topic.endsWith('/status')) {
        await handleDeviceStatus(data);
      }
      
      // Gérer les acknowledgments des commandes
      if (topic.endsWith('/ack')) {
        await handleCommandAck(data);
      }
    } catch (error) {
      console.error('[MQTT] Erreur lors du traitement du message:', error);
    }
  });
};

const handleSensorData = async (data) => {
  try {
    // Créer un nouvel enregistrement de capteur
    const sensorData = new Sensor({
      deviceId: data.deviceId,
      temperature: data.temperature,
      humidity: data.humidity,
      motion: data.motion,
      light: data.light,
      timestamp: new Date(data.timestamp)
    });
    
    await sensorData.save();
    
    // Envoyer les données via WebSocket
    if (io) {
      io.emit('sensor_data', {
        deviceId: data.deviceId,
        temperature: data.temperature,
        humidity: data.humidity,
        motion: data.motion,
        light: data.light,
        timestamp: data.timestamp
      });
      
      // Vérifier les seuils d'alerte
      const alerts = await checkThresholds(data);
      if (alerts.length > 0) {
        alerts.forEach(alert => {
          io.emit('alert', alert);
        });
      }
    }
    
    console.log('[MQTT] Données du capteur enregistrées:', data);
  } catch (error) {
    console.error('[MQTT] Erreur lors de l\'enregistrement des données du capteur:', error);
  }
};

const handleDeviceStatus = async (data) => {
  try {
    // Mettre à jour le statut du dispositif
    await Device.findOneAndUpdate(
      { deviceId: data.deviceId },
      { 
        status: data.status,
        lastSeen: new Date(data.timestamp)
      },
      { upsert: true, new: true }
    );
    
    // Envoyer le statut via WebSocket
    if (io) {
      io.emit('device_status', data);
    }
    
    console.log('[MQTT] Statut du dispositif mis à jour:', data);
  } catch (error) {
    console.error('[MQTT] Erreur lors de la mise à jour du statut du dispositif:', error);
  }
};

const handleCommandAck = async (data) => {
  try {
    // Envoyer l'acknowledgment via WebSocket
    if (io) {
      io.emit('device_ack', data);
    }
    
    console.log('[MQTT] Acknowledgment de commande reçu:', data);
  } catch (error) {
    console.error('[MQTT] Erreur lors du traitement de l\'acknowledgment:', error);
  }
};

const publishCommand = (deviceId, command) => {
  if (!mqttClient || !mqttClient.connected) {
    console.error('[MQTT] Client non connecté');
    return;
  }
  
  const topic = `devices/${deviceId}/command`;
  const payload = JSON.stringify({
    command,
    timestamp: Date.now()
  });
  
  mqttClient.publish(topic, payload, { qos: 1 });
  console.log('[MQTT] Commande publiée:', topic, payload);
};

module.exports = {
  connectMQTT,
  publishCommand
};
