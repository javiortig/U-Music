const express = require('express');
const cors = require('cors');
const morganBody = require('morgan-body');
require('dotenv' ).config();
const loggerStream = require('./utils/handleLogger');
const dbConnect = require('./config/database');
const app = express();
const path = require('path');

//socket.io
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);


//slack
morganBody(app, {
    noColors: true,
    skip: function (req, res) {
        return res.statusCode < 400;
    },
    stream: loggerStream
});

// Connect to database
app.use(cors());
app.use(express.json());

app.use("/api", require("./routes"))
app.use('/storage', express.static(path.join(__dirname, 'storage')));

const PORT = process.env.PORT || 3000;

//Configurar Socket.IO
global.io = io;

io.on('connection', socket => {
    console.log('Usuario conectado');
    
    // Manejar eventos de chat
    socket.on('chat message', data => {
        console.log('Mensaje recibido:', data);
        // Aquí puedes guardar el mensaje en la base de datos si es necesario
        // y luego emitirlo a todos los clientes conectados
        io.emit('chat message', data);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    dbConnect();
}); 

module.exports = app;
