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
              symbol: string;
          };
      }
    | {
          ping: {
              timestampMs: number;
          };
      };


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