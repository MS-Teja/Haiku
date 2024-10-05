const pinataSDK = require('@pinata/sdk');
const axios = require('axios');

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
const IMAGE_MAP_CID = 'QmbVtDZJJrKyFAtGRzJPXayDkVecayQCKq8QCMeEghP6vZ'; // CID of your imageMap.json

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { text, imageId } = JSON.parse(event.body);

    if (!text || !imageId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing text or imageId' }) };
    }

    // Fetch the image map
    const imageMapResponse = await axios.get(`https://${process.env.PINATA_GATEWAY}/ipfs/${IMAGE_MAP_CID}`);
    const imageMap = imageMapResponse.data;

    if (!imageMap[imageId]) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid imageId' }) };
    }

    // Create and upload haiku metadata
    const haikuMetadata = {
      text: text,
      imageHash: imageMap[imageId],
      timestamp: new Date().toISOString()
    };

    const jsonUploadResponse = await pinata.pinJSONToIPFS(haikuMetadata, {
      pinataMetadata: { name: 'haiku_metadata.json' }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        haikuHash: jsonUploadResponse.IpfsHash,
        imageHash: imageMap[imageId]
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to upload haiku', details: error.message })
    };
  }
};