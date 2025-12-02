import { WebSocketServer } from 'ws';

let wss;

// Инициализация WebSocket
export const setupWebSocket = (server) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('WebSocket подключен');

        ws.on('close', () => {
            console.log('WebSocket отключён');
        });

        ws.on('error', (err) => {
            console.error('WebSocket ошибка:', err);
        });
    });
};

// Отправка уведомлений всем клиентам
export const broadcastNotification = (message) => {
    if (!wss) return;
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};
