# Flood Alert Web

Phase 1 scaffold for the Flood Early Warning System: React 19 + TypeScript + Vite + TailwindCSS, React Query and Zustand foundations, MQTT-over-WebSocket service wrapper, typed domain models, and secure API client defaults.

## Development

```bash
cd apps/web-flood-alert
npm install
npm run dev
```

Set `VITE_MQTT_WS_URL` and `VITE_API_URL` in a local `.env` file. Never commit credentials, MQTT passwords, client certificates, or production endpoints containing secrets.

## Architecture

`ESP32 / IoT Gateway -> MQTT Broker -> Backend API -> React Dashboard`

Phase 1 intentionally keeps transport credentials in runtime environment variables and leaves notification delivery to the backend/API boundary.
