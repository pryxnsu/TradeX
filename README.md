# TradeX

A modern trading platform inspired by Exness, built with a distributed architecture for real-time trading, market data streaming.

> **Note:** This repository contains only the frontend application. TradeX is composed of multiple services that work together to provide the complete trading experience.

## Architecture

```text
Frontend (this repo)
        │
        ├── HTTP Server (REST APIs)
        ├── WebSocket Server (Real-time updates)
        └── Layer (Background processing)
```

## 🔗 Related Repositories

| Repository                                                   | Description                                                                                                                |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| [Frontend](https://github.com/pryxnsu/tradex-frontend)       | User-facing web application                                                                                                |
| [HTTP Server](https://github.com/pryxnsu/exness-http-server) | REST API server handling authentication, accounts, orders, and trading operations                                          |
| [WebSocket Server](https://github.com/pryxnsu/exness-ws)     | Maintains client WebSocket connections and delivers real-time market updates                                               |
| [Layer](https://github.com/pryxnsu/exness-layer)             | Fetches live market prices from Alpaca, publishes ticker updates via Redis Pub/Sub, and powers real-time data distribution |

## Overview

The frontend communicates with multiple backend services:

- **HTTP Server** — Handles authentication, user accounts, positions, orders, and trading operations.
- **WebSocket Server** — Streams live market prices, portfolio updates, and trading events to connected clients.
- **Layer** — Consumes market data from Alpaca, publishes ticker updates through Redis Pub/Sub, and serves as the market data pipeline for the platform.

### High-Level Flow

```text
Alpaca Market Data
        │
        ▼
      Layer
        │
 Redis Pub/Sub
        │
        ▼
 WebSocket Server
        │
        ▼
    Frontend
```

Together, these services form the complete TradeX platform.
