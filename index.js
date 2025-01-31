'use strict'
const serverless = require("serverless-http");
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
app.disable('x-powered-by');

const soundRoutes = require('./src/routes/soundRoutes.js');
// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT');
    res.header('Allow', 'GET, POST, PUT');
    next();
});


// Routes Modules
let routes_path = "/"
app.use('/sound', soundRoutes);
//      localhost:3001/sound(historial_sonido)

//Routes Error
// 404
app.use(function (req, res, next) {
    return res.status(200).send('<h1>200</h1><h3>Entrando a la API de sonido!</h3>');
});

// 500 - Any server error
app.use(function (err, req, res, next) {
    return res.status(500).send('<h1>500</h1><h3>' + err + '</h3>');
});

module.exports.handler = serverless(app);
