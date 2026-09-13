# Phase 2 — Realtime Features

- MQTT WebSocket wildcard subscription for city/zone/node telemetry.
- Runtime MQTT credentials from Vite environment variables only.
- Zustand telemetry history capped to the latest 288 points per sensor.
- Realtime alert classification includes water level, rainfall, and measured water-level slope.
- Leaflet sensor map with risk-aware markers and popups.
- Recharts trend visualization for recent water/rain telemetry.
- Responsive sensor cards and live MQTT connection status.

Production TLS, broker ACLs, backend CORS/rate limiting, persistence, and notification delivery remain server-side concerns.
