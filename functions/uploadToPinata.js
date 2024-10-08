const pinataSDK = require('@pinata/sdk');
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { text, selectedImage, userId, displayName, photoURL, tags } = JSON.parse(event.body);

    console.log('Uploading haiku:', { text, userId, displayName, tags });

    const haikuData = {
      text,
      image: selectedImage, // This will be the base64 encoded image or the image identifier
      timestamp: Date.now(),
      userId,
      displayName,
      photoURL,
      tags: tags.join(','),
      likes: 0
    };

    const pinataOptions = {
      pinataMetadata: {
        name: 'haiku_metadata.json'
      }
    };

    const result = await pinata.pinJSONToIPFS(haikuData, pinataOptions);

    console.log('Pinata upload result:', result);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        pinataUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        message: "Haiku uploaded successfully"
      })
    };
  } catch (error) {
    console.error('Error uploading haiku:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to upload haiku', details: error.message })
    };
  }
};