import mqtt, { type IClientOptions, type MqttClient } from 'mqtt';
export const MQTT_WS_URL = import.meta.env.VITE_MQTT_WS_URL ?? 'ws://localhost:9001';
export const MQTT_USERNAME = import.meta.env.VITE_MQTT_USERNAME;
export const MQTT_PASSWORD = import.meta.env.VITE_MQTT_PASSWORD;
export const createMqttClient = (): MqttClient => { const options: IClientOptions = { clean: true, reconnectPeriod: 5000, connectTimeout: 10000 }; if (MQTT_USERNAME) options.username = MQTT_USERNAME; if (MQTT_PASSWORD) options.password = MQTT_PASSWORD; return mqtt.connect(MQTT_WS_URL, options); };
export const topicFor = (city: string, zoneId: string, nodeId: string, metric: string) => `${city}/${zoneId}/${nodeId}/${metric}`;
export const telemetryWildcard = (city = import.meta.env.VITE_MQTT_CITY ?? 'city') => `${city}/+/+/+`;
