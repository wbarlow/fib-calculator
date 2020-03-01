const keys = require('./keys');

// Express setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let rh = require('./modules/ValueRequestHandler');
let ValueRequestHandler = rh.ValueRequestHandler;
requestHandler = new ValueRequestHandler();

app.get('/', (req, res) => {
    console.log("default response");
    res.send('Hi');
});

app.get('/api', (req, res) => {
    console.log("default response");
    res.send('Hi');
});

app.get('/api/values/all', async (req, res) => {
    console.log("getting all values");
    let result = await requestHandler.getAllValues();
    res.send(result.rows);
});

app.get('/api/values/current', async (req, res) => {
    let recent = await requestHandler.getRecentValues();
    res.send(recent);
});

app.get('/api/values/:number', async (req, res) => {
    let result = await requestHandler.getCachedValue(req.params.number);
    res.send(result);
});


app.post('/api/values', async (req, res) => {
    console.log("got a value for the client" + res);

    const index = req.body.index;

    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high');
    }

    requestHandler.postValue(index);

    res.send({ working: true });
});

app.listen(5000, err => {
    console.log('Listening.....');
});
