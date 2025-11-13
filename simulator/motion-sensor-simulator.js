const mqtt = require('mqtt');

// Configuration du broker MQTT
const MQTT_BROKER_URL = 'mqtt://localhost:1883';
const DEVICE_ID = 'esp32_sensor_001';

// Connexion au broker MQTT
const client = mqtt.connect(MQTT_BROKER_URL);

client.on('connect', () => {
  console.log('Simulateur de capteur de mouvement connecté au broker MQTT');
  
  // Envoyer des données de capteur à intervalles réguliers
  setInterval(sendSensorData, 5000); // Toutes les 5 secondes
});

client.on('error', (error) => {
  console.error('Erreur de connexion MQTT:', error);
});

function sendSensorData() {
  // Simuler des valeurs de capteur
  const sensorData = {
    deviceId: DEVICE_ID,
    temperature: getRandomValue(20, 30), // Température entre 20°C et 30°C
    humidity: getRandomValue(40, 60),    // Humidité entre 40% et 60%
    motion: Math.random() > 0.7 ? 1 : 0, // Mouvement détecté 30% du temps
    light: getRandomValue(0, 1000),      // Luminosité entre 0 et 1000 lux
    timestamp: Date.now()
  };
  
  // Publier les données sur le topic MQTT
  const topic = `sensors/${DEVICE_ID}/data`;
  client.publish(topic, JSON.stringify(sensorData));
  
  console.log('Données du capteur envoyées:', sensorData);
}

function getRandomValue(min, max) {
  return Math.random() * (max - min) + min;
}

// Gérer la fermeture du programme
process.on('SIGINT', () => {
  console.log('\nFermeture du simulateur...');
  client.end();
  process.exit(0);
});
