const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const app = express();
const {connectToDb} = require('./services/connectToDb');


connectToDb();

let origin = 'http://localhost:3000';

app.use(cors({
    credentials: true,
    origin
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/auth', require('./routes/auth'));


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});