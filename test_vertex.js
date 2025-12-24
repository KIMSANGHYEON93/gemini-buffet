const { GoogleGenAI } = require("@google/genai");

// Qwiklabs details
const projectId = "qwiklabs-gcp-01-f76706108806";
const location = "us-central1"; // Common for Qwiklabs
const dataStoreId = "33ee2c39a44a605e77a300552e708cdd19a857b2accfc520650a92188dd";

const client = new GoogleGenAI({ vertexAI: { project: projectId, location: location } });

async function testVertex() {
  console.log("Testing Vertex AI connection...");
  try {
    const model = "gemini-2.0-flash";
    
    // Construct Data Store resource name
    // Common pattern: projects/{project}/locations/{location}/collections/default_collection/dataStores/{data_store_id}
    // Location for Data Store might be 'global' even if model is 'us-central1'.
    const dataStoreResource = `projects/${projectId}/locations/global/collections/default_collection/dataStores/${dataStoreId}`;
    
    console.log("Using Data Store:", dataStoreResource);

    const result = await client.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: "What is in the shareholder letters about Apple?" }] }],
      config: {
        tools: [{
            googleSearchRetrieval: {
                dynamicRetrievalConfig: {
                    mode: "mode_dynamic",
                    dynamicThreshold: 0.7
                }
            }
        }] 
        // Note: Connecting to specific Data Store via @google/genai might require different config.
        // For now, let's just test BASIC Vertex AI generation to confirm auth works.
      }
    });

    console.log("Vertex AI Response:", result.text);
  } catch (e) {
    console.error("Vertex AI Test Failed:", e);
  }
}

testVertex();
