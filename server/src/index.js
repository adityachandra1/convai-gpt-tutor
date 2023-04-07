const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const generateText = require('../controllers/promptController');

dotenv.config();
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true }, async () => {
    console.log('connected to DB');
})

app.listen(process.env.PORT || 3000, () => console.log('Server running......'));

