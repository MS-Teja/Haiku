const pinataSDK = require('@pinata/sdk');
const axios = require('axios');

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
const pinataGateway = process.env.PINATA_GATEWAY;

exports.handler = async (event) => {
  const { id } = event.queryStringParameters;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Haiku ID is required' })
    };
  }

  try {
    const response = await axios.get(`https://${pinataGateway}/ipfs/${id}`);
    const haiku = {
      id,
      ...response.data
    };

    return {
      statusCode: 200,
      body: JSON.stringify({ haiku, pinataGateway })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch haiku', details: error.message })
    };
  }
};