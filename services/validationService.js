require('dotenv').config();

const crypto = require('crypto');
const axios = require('axios');

async function validateData(payload, signature) {
    const errors = [];

    let verification = await verifySignature(signature, JSON.stringify(payload));
    if (!verification) {
        errors.push('Signature not valid');
    }

    if (!payload.paymentId || typeof payload.paymentId !== 'string') {
        errors.push('Invalid or missing "paymentId" field');
    }

    if (!payload.paymentStatus || typeof payload.paymentStatus !== 'string') {
        errors.push('Invalid or missing "paymentStatus" field');
    }

    // ... validate other payments according to business logic

    if (errors.length > 0) {
        return {
            isValid: false,
            errors
        };
    }

    return {
        isValid: true
    };
}

async function fetchPublicKey() {
    try {
        const response = await axios.get(process.env.PEM_URL);
        return `-----BEGIN PUBLIC KEY-----\n${response.data}\n-----END PUBLIC KEY-----`;
    } catch (error) {
        console.error('Error fetching public key:', error);
        return null;
    }
}

async function verifySignature(signature, data) {
    const publicKey = await fetchPublicKey();

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(data);
    return verifier.verify(publicKey, signature, 'base64');
}

// Export the validateData function
module.exports = {
    validateData
};