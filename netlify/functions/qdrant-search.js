const { QdrantClient } = require('@qdrant/qdrant-client');

let qdrantClient;

// This function initializes the clients once per serverless function instance
const initializeClient = () => {
  if (!qdrantClient) {
    qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    console.log("Qdrant client initialized.");
  }
};

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  initializeClient();

  try {
    const { vector } = JSON.parse(event.body);

    // Search the Qdrant collection for the most relevant documents
    const searchResult = await qdrantClient.search(process.env.COLLECTION_NAME, {
      vector: vector,
      limit: 3, // Get the top 3 results
      with_payload: true,
    });

    // Return the search results to the front end
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
