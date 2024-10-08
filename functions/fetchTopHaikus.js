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
      const { text, image, timestamp, userId, displayName, photoURL, tags, likes } = response.data.keyvalues;
      return {
        id: pin.ipfs_pin_hash,
        text,
        imageHash: image,
        timestamp,
        userId,
        displayName,
        photoURL,
        tags: tags ? tags.split(',') : [],
        likes: parseInt(likes) || 0
      };
    }));

    // Sort haikus by likes in descending order and get the top 5
    const topHaikus = haikus.sort((a, b) => b.likes - a.likes).slice(0, 5);

    return {
      statusCode: 200,
      body: JSON.stringify({ haikus: topHaikus, pinataGateway })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch top haikus', details: error.message })
    };
  }
};