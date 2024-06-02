const express = require('express')
const app = express()
var path = require('path');

const PORT = process.env.PORT || 80;

var public = path.join(__dirname, 'public');

const http = require('http');

// Main Page
app.get('/', function(req, res) {
    res.sendFile(path.join(public, 'index.html'));
});

app.use('/', express.static(public));

const httpServer = http.createServer(app);
httpServer.listen(PORT, () => console.log('server ready'))

