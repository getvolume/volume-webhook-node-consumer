const express = require('express');
const bodyParser = require('body-parser');
const { validateData } = require('./services/validationService');

const app = express();

var rawBodySaver = function (req, res, buf, encoding) {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
}
app.use(bodyParser.json({ verify: rawBodySaver }));
app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: true }));
app.use(bodyParser.raw({ verify: rawBodySaver, type: '*/*' }));

app.put('/api/webhook', async (req, res) => {
    const payload = req.body;
    const payloadRaw = req.rawBody;

    // Get the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({message: 'Missing or invalid Authorization header'});
    }

    // Extract the token from the Authorization header
    const signature = authHeader.split(' ')[1];

    const validation = await validateData(payload, payloadRaw, signature);
    if (!validation.isValid) {
        // If validation fails, respond with a 400 Bad Request status and the error messages
        return res.status(400).json({
            message: 'Validation failed',
            errors: validation.errors
        });
    }

    console.log("Received data:", payload);

    res.json({
        message: "Data received successfully",
        receivedData: payload
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


