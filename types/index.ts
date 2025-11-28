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

interface PositionProp {
    symbol: string;
    type: number;
    volume: number;
    openPrice: number;
    tp: number;
    sl: number;
    position: string;
    openTime: Date;
    swap: number;
    pnl: number;
}

// open position
export interface OpenPositionProp extends PositionProp {
    currentPrice: number;
}

// close position
export interface ClosedPositonProp extends PositionProp {
    dealId: string;
    closePrice: number;
    closeTime: Date;
    marginRate: number;
    commission: number;
    fee: number;
    reason: number;
}

export type InstrumentConfig = {
    contractSize: number;
    digits: number;
    marginFactor: number;
    symbolType: 'forex' | 'crypto' | 'metal';
};

// incoming socket messages of orders, positions, deals, accounts
export type IncomingSocketEventType = {
    e: 'positions' | 'orders' | 'accounts' | 'deals';
    t: 'new' | 'del' | 'open' | 'in' | 'upd' | 'close' | 'part_close';
    d: IncomingSocketOrderType | IncomingSocketPositionsType | IncomingSocketDealsType | IncomingSocketAccountType;
};

export type IncomingSocketOrderType = {
    orderId: string;
    type: number;
    price: number;
    volume: number;
    instrument: string;
    sl: number;
    tp: number;
    openTime: number;
    marginRate: number;
    positionId: number | string;
};

export type IncomingSocketPositionsType = {
    dealId: string;
    positionId: string;
    type: number;
    price: number;
    openPrice: number;
    volume: number;
    instrument: string;
    sl: number;
    tp: number;
    commission: number;
    fee: number;
    swap: number;
    openTime: number;
    closeTime: number | null;
    profit: number | null;
    marginRate: number;
    reason: number;
};

export type IncomingSocketDealsType = {
    dealId: string;
    time: number;
    orderId: string;
    positionId: string;
    type: number;
    direction: number;
    price: number;
    volume: number;
    volumeClosed: number;
    instrument: string;
    profit: number;
    sl: number;
    tp: number;
    commission: number;
    fee: number;
    swap: number;
    reason: number;
};

export type IncomingSocketAccountType = {
    balance: {
        balance: number;
        credit: number;
    };
    settings: {
        currency: string;
        leverage: number;
        positionMode: number;
    };
};

export interface PricesProp {
    buy: number;
    sell: number;
    time: number;
}

export type Side = 'buy' | 'sell';
