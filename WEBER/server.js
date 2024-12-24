const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Инициализация приложения Express
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Обслуживание статических файлов из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Путь к файлу content.json
const contentFilePath = path.join(__dirname, 'content.json');

// Функция для чтения содержимого из content.json
function readContentFromFile() {
    if (!fs.existsSync(contentFilePath)) {
        fs.writeFileSync(contentFilePath, JSON.stringify({ content: '' }, null, 2));
    }
    const data = fs.readFileSync(contentFilePath, 'utf8');
    return JSON.parse(data).content;
}

// Функция для записи содержимого в content.json
function writeContentToFile(content) {
    fs.writeFileSync(contentFilePath, JSON.stringify({ content }, null, 2));
}

// Инициализация текущего текста из файла
let currentText = readContentFromFile();

// Обработка WebSocket подключений
wss.on('connection', (ws) => {
    console.log('New client connected');

    // Отправка текущего текста новому клиенту
    ws.send(JSON.stringify({ type: 'init', content: currentText }));

    // Обработка сообщений от клиента
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'textUpdate') {
            currentText = data.content;

            // Сохранение текста в файл
            writeContentToFile(currentText);

            // Рассылка обновлений всем подключённым клиентам
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'textUpdate', content: currentText }));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
