import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

let wss: WebSocketServer | null = null;

export const initWebSocketServer = (server: Server) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('🔌 Client connected to Real-Time Radar');

        ws.on('message', (message) => {
            console.log('Received:', message.toString());
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });

        // Send welcome message
        ws.send(JSON.stringify({ type: 'WELCOME', message: 'Connected to RightWhale Radar Stream' }));
    });

    console.log('🚀 WebSocket Server Initialized');
};

export const broadcast = (type: string, data: any) => {
    if (!wss) return;

    const payload = JSON.stringify({ type, data, timestamp: new Date().toISOString() });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
};
