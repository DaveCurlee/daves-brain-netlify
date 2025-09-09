const { QdrantClient } = require('@qdrant/qdrant-client');
const { pipeline } = require('@xenova/transformers');
const BATCH_SIZE = 10;

let qdrantClient;
let pipelinePromise;

const initialize = () => {
  if (!qdrantClient) {
    qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    console.log("Qdrant client initialized.");
  }
  if (!pipelinePromise) {
    pipelinePromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  initialize();

  try {
    const { query } = JSON.parse(event.body);
    const extractor = await pipelinePromise;
    const output = await extractor(query, { pooling: 'mean', normalize: true });
    const vector = Array.from(output.data);

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
