const { QdrantClient } = require('@qdrant/qdrant-client');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { vector } = JSON.parse(event.body);

    const qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });

    const searchResult = await qdrantClient.search(process.env.COLLECTION_NAME, {
      vector: vector,
      limit: 3,
      with_payload: true,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(searchResult),
    };

  } catch (error) {
    console.error("Error in serverless function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process search query." }),
    };
  }
};
