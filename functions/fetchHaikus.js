const pinataSDK = require('@pinata/sdk');
const axios = require('axios');

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
const pinataGateway = process.env.PINATA_GATEWAY;

exports.handler = async (event) => {
  try {
    const pinList = await pinata.pinList({
      status: 'pinned',
      metadata: { name: 'haiku_metadata.json' }
    });

    const haikus = await Promise.all(pinList.rows.map(async (pin) => {
      const response = await axios.get(`https://${pinataGateway}/ipfs/${pin.ipfs_pin_hash}`);
      return {
        id: pin.ipfs_pin_hash,
        ...response.data
      };
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ haikus, pinataGateway })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch haikus', details: error.message })
    };
  }
};