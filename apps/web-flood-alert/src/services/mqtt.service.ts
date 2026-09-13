import mqtt, { type MqttClient } from 'mqtt';
export const MQTT_WS_URL = import.meta.env.VITE_MQTT_WS_URL ?? 'wss://localhost:443/mqtt';
export const createMqttClient = (username?:string, password?:string):MqttClient => mqtt.connect(MQTT_WS_URL,{username,password,clean:true,reconnectPeriod:5000,connectTimeout:10000});
export const topicFor = (city:string,zoneId:string,nodeId:string,metric:string) => `${city}/${zoneId}/${nodeId}/${metric}`;
