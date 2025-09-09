    const { QdrantClient } = require('@qdrant/qdrant-client');
    const { SentenceTransformer } = require('sentence-transformers');

    let qdrantClient;
    let model;

    // This function initializes the clients once per serverless function instance
    const initializeClients = async () => {
      if (!qdrantClient) {
        qdrantClient = new QdrantClient({
          url: process.env.QDRANT_URL,
          apiKey: process.env.QDRANT_API_KEY,
        });
        console.log("Qdrant client initialized.");
      }
      if (!model) {
        model = new SentenceTransformer('Xenova/all-MiniLM-L6-v2');
        await model.ready();
        console.log("SentenceTransformer model loaded.");
      }
    };

    exports.handler = async (event, context) => {
      // Only allow POST requests
      if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
      }

      await initializeClients();

      try {
        const { query } = JSON.parse(event.body);

        // Convert the user's query into a vector
        const vector = await model.encode(query);

        // Search the Qdrant collection for the most relevant documents
        const searchResult = await qdrantClient.search(process.env.COLLECTION_NAME, {
          vector: vector.data,
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
    
