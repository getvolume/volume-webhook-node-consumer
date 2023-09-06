const express = require('express');
const bodyParser = require('body-parser');
const { validateData } = require('./services/validationService');

const app = express();

app.use(bodyParser.json());

app.put('/api/webhook', (req, res) => {
    const payload = req.body;

    // Get the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }

    // Extract the token from the Authorization header
    const signature = authHeader.split(' ')[1];

    const validation = validateData(payload, signature);

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


