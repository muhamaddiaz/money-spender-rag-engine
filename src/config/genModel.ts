import {
    HarmBlockThreshold,
    HarmCategory,
    VertexAI
} from '@google-cloud/vertexai';

const { GCP_PROJECT, GCP_LOCATION, GCP_AI_MODEL_NAME } =
    process.env;

const project = GCP_PROJECT;
const location = GCP_LOCATION;
const modelName = GCP_AI_MODEL_NAME;

const vertexAI = new VertexAI({project: project, location: location});

function genModel() {
    if (!modelName) throw new Error('Missing model name');

    vertexAI.getGenerativeModel({
        model: modelName,
        safetySettings: [{
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }],
        generationConfig: { maxOutputTokens: 1024 },
    });
}


export { genModel };