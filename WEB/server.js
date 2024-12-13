const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000; // Порт сервера

// Указываем путь к файлу с комментариями
const COMMENTS_FILE = path.join(__dirname,'public', 'comments.txt');

// Указываем папку для статических файлов
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Папка для HTML и других статических файлов

// Возвращаем основной HTML-файл при GET-запросе к "/"
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'MySite.html');
    res.sendFile(indexPath);
});

// Эндпоинт для получения комментариев
app.get('/api/comments', (req, res) => {
    if (fs.existsSync(COMMENTS_FILE)) {
        const comments = fs.readFileSync(COMMENTS_FILE, 'utf-8')
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => JSON.parse(line));
        res.json(comments);
    } else {
        res.json([]); // Если файл не существует, возвращаем пустой массив
    }
});

// Эндпоинт для добавления комментариев
app.post('/api/comments', (req, res) => {
    const { nickname, comment } = req.body;

    if (!nickname || !comment) {
        return res.status(400).send('Ник и комментарий обязательны');
    }

    const commentData = { nickname, comment, timestamp: new Date().toISOString() };
    fs.appendFileSync(COMMENTS_FILE, JSON.stringify(commentData) + '\n');

    res.status(200).send('Комментарий добавлен');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
