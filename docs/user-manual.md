# IoT Temperature Monitoring System - User Manual

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Interface Overview](#user-interface-overview)
3. [Authentication](#authentication)
4. [Dashboard](#dashboard)
5. [Device Control](#device-control)
6. [Alerts and Notifications](#alerts-and-notifications)
7. [History and Reports](#history-and-reports)
8. [Settings](#settings)
9. [Troubleshooting](#troubleshooting)

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection
- User account (provided by administrator)

### Accessing the System

1. Open your web browser
2. Navigate to the system URL provided by your administrator
3. You will be directed to the login page

## User Interface Overview

The user interface is divided into several sections:

1. **Header**: Contains navigation links and user controls
2. **Main Content**: Displays the current view (dashboard, history, settings)
3. **Sidebar** (if applicable): Quick access to main features
4. **Footer**: System information and status

## Authentication

### Login

1. Enter your email address
2. Enter your password
3. Click "Login"
4. If credentials are valid, you will be redirected to the dashboard

### Registration

New users can register by:

1. Clicking the "Register" tab on the login page
2. Entering a valid email address
3. Creating a password (minimum 6 characters)
4. Clicking "Create Account"

### Password Recovery

If you forget your password:

1. Click "Forgot Password" on the login page
2. Enter your email address
3. Follow the instructions sent to your email

## Dashboard

The dashboard provides a real-time overview of your IoT system.

### Sensor Cards

Each sensor is displayed in a card showing:
- Current value
- Unit of measurement
- Status indicator (normal, warning, critical)
- Last update time

### Real-time Updates

Sensor data updates automatically every few seconds. Look for the connection status indicator in the header to verify real-time connectivity.

### Device Controls

Control connected devices directly from the dashboard:
- Toggle switches to turn devices on/off
- View current device status
- Receive confirmation of commands

## Device Control

### Viewing Devices

1. Navigate to the Devices section
2. View a list of all registered devices
3. See device status (online/offline)
4. View device type and creation date

### Controlling Devices

1. Find the device you want to control
2. Click the toggle switch to change status
3. Confirm the action if prompted
4. Wait for confirmation that the command was sent

### Adding New Devices

1. Click "Add Device" button
2. Enter device name
3. Enter unique device ID
4. Select device type from dropdown
5. Click "Save"

## Alerts and Notifications

### Alert Types

- **Info**: General information
- **Warning**: Conditions requiring attention
- **Critical**: Immediate action required

### Notification Settings

1. Navigate to Settings
2. Find the Notifications section
3. Toggle browser notifications on/off
4. Configure notification preferences

### Managing Alerts

1. View alerts in the Alerts panel
2. Click "Acknowledge" to mark as seen
3. Use filters to sort by type or date
4. Delete old alerts to keep the list clean

## History and Reports

### Sensor History

1. Navigate to the History section
2. Select "Sensor Data" tab
3. Choose date range and devices
4. View historical data in table or chart format

### Device Logs

1. Navigate to the History section
2. Select "Device Logs" tab
3. View all device commands and status changes
4. Filter by device or date range

### Exporting Data

1. Apply desired filters in history view
2. Click "Export" button
3. Choose export format (CSV, JSON)
4. Save file to your computer

## Settings

### User Profile

1. Navigate to Settings
2. View and edit your profile information
3. Change password if needed
4. Update notification preferences

### Alert Thresholds

1. Navigate to Settings
2. Find "Alert Thresholds" section
3. Adjust minimum and maximum values for each sensor
4. Enable/disable alerts for specific sensors
5. Configure notification preferences per sensor

### System Preferences

1. Navigate to Settings
2. Adjust display preferences
3. Configure data refresh rates
4. Set default date ranges

## Troubleshooting

### Common Issues

#### Dashboard not updating

1. Check internet connection
2. Verify connection status indicator in header
3. Refresh the page
4. Clear browser cache if problem persists

#### Unable to login

1. Verify email and password
2. Check if account is activated
3. Reset password if needed
4. Contact administrator if issues continue

#### Device not responding

1. Check device power and network connection
2. Verify device is registered in system
3. Check device status in device list
4. Restart device if necessary

#### Notifications not working

1. Check browser notification permissions
2. Verify notification settings in user profile
3. Test notifications with "Send Test" button
4. Check browser-specific notification settings

### Browser Compatibility

The system is optimized for:
- Chrome (latest version)
- Firefox (latest version)
- Safari (latest version)
- Edge (latest version)

### Mobile Usage

The interface is responsive and works on mobile devices:
- Rotate device for better viewing of charts
- Use horizontal scrolling for wide tables
- Tap and hold for context menus where applicable

### Performance Tips

- Close unused browser tabs
- Refresh page periodically for optimal performance
- Use wired connection when possible for better reliability
- Keep browser updated to latest version

## Support

For technical support, contact your system administrator or:

- Email: support@iot-system.com
- Phone: +1 (555) 123-4567
- Hours: Monday-Friday, 9AM-5PM EST

## Glossary

- **IoT**: Internet of Things
- **MQTT**: Message Queuing Telemetry Transport
- **JWT**: JSON Web Token
- **API**: Application Programming Interface
- **Real-time**: Data updates as they occur
