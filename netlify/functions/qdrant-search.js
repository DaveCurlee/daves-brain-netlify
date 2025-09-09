import { QdrantClient } from '@qdrant/js-client-rest';

const qdrantUrl = process.env.QDRANT_URL;
const qdrantApiKey = process.env.QDRANT_API_KEY;
const collectionName = 'daves-brain-chunks';

const client = new QdrantClient({
  url: qdrantUrl,
  apiKey: qdrantApiKey,
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { vector } = JSON.parse(event.body);

    const searchResult = await client.query(collectionName, {
      using: {
        vector: vector,
      },
      with_payload: true,
      limit: 3,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(searchResult),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
    };
  }
};