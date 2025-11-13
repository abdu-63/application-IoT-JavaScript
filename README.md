# Système de surveillance de température IoT

Une solution IoT complète pour surveiller la température, l'humidité, les mouvements et le niveau de luminosité, avec alertes en temps réel et contrôle des dispositifs.

## Structure du projet

```
├── backend/              # Backend Node.js avec Express.js
├── docs/                 # Documentation du projet
├── firmware/             # Firmware ESP32 pour les dispositifs IoT
├── public/               # Ressources statiques
├── src/                  # Application frontend React
│   ├── components/       # Composants React
│   ├── pages/            # Pages de l'application
│   ├── services/         # Modules de service
│   └── ...               # Autres fichiers frontend
├── README.md             # Ce fichier
└── package.json          # Dépendances du frontend
```

## Fonctionnalités

- Surveillance temps réel des capteurs (température, humidité, mouvement, luminosité)
- Authentification utilisateur avec JWT
- Contrôle des dispositifs (on/off)
- Seuils d'alerte configurables
- Visualisation des données historiques
- Interface web responsive
- Communication MQTT avec les dispositifs IoT
- Principes « security by design »
- Simulateur de capteur de mouvement pour tester sans matériel physique

## Pile technologique

### Frontend
- React.js avec TypeScript
- Outil de build Vite
- Composants shadcn/ui
- Tailwind CSS
- Client Socket.IO

### Backend
- Node.js
- Express.js
- MongoDB avec Mongoose
- JWT pour l'authentification
- Client MQTT
- Socket.IO

### Dispositifs IoT
- Microcontrôleur ESP32
- Capteur de température/humidité DHT22
- Capteur de mouvement PIR
- Capteur de luminosité

### Infrastructure
- Base de données MongoDB
- Broker MQTT (Mosquitto)

## Démarrage rapide

### Prérequis

- Node.js (v16 ou supérieur)
- MongoDB
- Broker MQTT (Mosquitto)
- Arduino IDE (pour le firmware ESP32)

### Configuration du backend (.env)

Allez dans le dossier backend/ et créez-y un fichier nommé .env.
Ajoutez cette ligne dans le fichier :
```
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@cluster0.z1drbht.mongodb.net/iot-dashboard?retryWrites=true&w=majority
```
Remplacez **<db_user>** par votre utilisateur MongoDB et **<db_password>** par son mot de passe.

### Développement frontend

1. Aller dans le répertoire frontend :
   ```bash
   cd frontend
   ```
   
2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Démarrer le serveur de développement :
   ```bash
   npm run dev
   ```

### Développement backend

1. Aller dans le répertoire backend :
   ```bash
   cd backend
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Démarrer le serveur backend :
   ```bash
   npm run dev
   ```

### Documentation

Une documentation détaillée est disponible dans le répertoire `docs/` :
- [Architecture du système](docs/architecture.md)
- [Implémentation de la sécurité](docs/security.md)
- [Manuel utilisateur](docs/user-manual.md)

### Firmware ESP32

Le firmware pour les dispositifs ESP32 se trouve dans le répertoire `firmware/`. Consultez `firmware/README.md` pour les instructions d'installation.

### Simulateur de capteur de mouvement

Pour tester le système sans capteur PIR physique, un simulateur de capteur de mouvement est fourni dans le répertoire `simulator/` :

1. Assurez-vous qu'un broker MQTT local est en cours d'exécution (par défaut : `mqtt://localhost:1883`).
2. Installez la dépendance MQTT si nécessaire :
   ```bash
   npm install mqtt
   ```
3. Lancez le script du simulateur :
   ```bash
   node simulator/motion-sensor-simulator.js
   ```

Le simulateur publie périodiquement de fausses valeurs de température, d'humidité, de mouvement et de luminosité vers le broker. Ces données sont ensuite affichées dans le tableau de bord et stockées dans l'historique.

## Exigences du projet

Ce projet répond à l'ensemble des exigences du projet de cours IoT :

1. ✅ Implémentation microcontrôleur (ESP32)
2. ✅ Intégration de capteurs (température, humidité, mouvement, luminosité)
3. ✅ Interface web avec React.js
4. ✅ Backend avec Node.js/Express.js
5. ✅ Stockage en base de données (MongoDB)
6. ✅ Communication temps réel (MQTT/WebSocket)
7. ✅ Authentification utilisateur (JWT)
8. ✅ Principes de sécurité « security by design »
9. ✅ Système d'alertes
10. ✅ Capacités de contrôle des dispositifs

## Contribution

1. Forkez le dépôt
2. Créez une branche de fonctionnalité
3. Commitez vos modifications
4. Poussez la branche
5. Créez une pull request
