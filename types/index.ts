export type PanelTypes = 'instruments' | 'settings' | 'calender' | null;

// send event message type of websocket server
export type SocketMessageType =
    | {
          subscribe: {
              event: string;
              symbols: string[];
          };
      }
    | {
          unsubscribe: {
              event: string;
              symbols: string[];
          };
      }
    | {
          ping: {
              timestampMs: number;
          };
      };

// Candle
export interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

// logged in user
export interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    avatar: string;
    createdAt: string;
    updatedAt: string;
}

export interface Wallet {
    id: string;
    type: 'demo' | 'real';
    balance: number;
    equity: number;
    margin: number;
    freeMargin: number;
    currency: string;
    leverage: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
