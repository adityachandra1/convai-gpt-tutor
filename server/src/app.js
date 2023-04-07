const express = require('express');
const app = express();
const router = require('../routes/index');
const cors = require('cors');

app.use(express.json());
app.use(cors());
app.use('/api/', router);

module.exports = app;