import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", 'http://127.0.0.1:5173'], // frontend URL
        methods: ["GET", "POST"]
    }
});

let messages: any[] = [];

// Mapeamento entre sockets e usuários
const users:any = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Evento para quando o usuário se identifica
    socket.on('identify', (username) => {
        users[socket.id] = username;
        console.log(`${username} connected with socket id: ${socket.id}`);

        // Enviar apenas as mensagens relevantes ao usuário
        const userMessages = messages.filter(
            msg => msg.recipient === 'all' || msg.recipient === username || msg.sender === username
        );
        socket.emit('loadMessages', userMessages);
    });

    // Evento para quando um cliente envia uma nova mensagem
    socket.on('sendMessage', (message) => {
        message.id = messages.length + 1;
        message.status = 'received';
        message.read = false;

        // Adicionar mensagem ao array
        messages.push(message);

        // Enviar mensagem ao destinatário(s)
        if (message.recipient === 'all') {
            // Enviar para todos
            io.emit('newMessage', message);
        } else {
            // Enviar para o remetente e destinatário(s)
            for (const [socketId, username] of Object.entries(users)) {
                if (username === message.sender || username === message.recipient) {
                    io.to(socketId).emit('newMessage', message);
                }
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete users[socket.id];
    });
});

app.post('/read-message', (req, res) => {
    const { id, username } = req.body;
    const messageIndex = messages.findIndex((msg) => msg.id === id);
    if (messageIndex !== -1 && (messages[messageIndex].recipient === username || messages[messageIndex].sender === username)) {
        messages[messageIndex].read = true;
        io.emit('messageRead', { id, recipient: username });
        res.status(200).send({ status: 'Message marked as read' });
    } else {
        res.status(404).send({ status: 'Message not found or unauthorized' });
    }
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});