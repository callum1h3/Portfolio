const express = require('express')
const app = express()
var path = require('path');
var https = require('https');
var http = require('http');
var fs = require('fs');

// This line is from the Node.js HTTPS documentation.
var options = {};
options.key = null;
options.cert = null;

try {
    options.key = fs.readFileSync('./keys/key.pem');
    options.cert = fs.readFileSync('./keys/cert.cert');
} catch (err) {
    console.log(err);
}

var public = path.join(__dirname, 'public');
var mobile = path.join(__dirname, 'mobile');

// Main Page
app.get('/', function(req, res) {
    res.sendFile(path.join(public, 'index.html'));
});

app.use('/', express.static(public));

app.get('/mobile/', function(req, res) {
    res.sendFile(path.join(mobile, 'index.html'));
});

app.use('/mobile/', express.static(mobile));

http.createServer(app).listen(80);
// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(443);
