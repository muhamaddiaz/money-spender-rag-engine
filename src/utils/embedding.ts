import {VoyageAIClient} from 'voyageai';
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters";

const vo = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY })

export async function generateEmbedding(text: string, input_type: 'query' | 'document' = 'document') {
    const processedText = text
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');

    const result = await vo.embed({
        model: "voyage-3.5",
        input: processedText,
        outputDimension: 1024,
        inputType: input_type,
    });

    const embedding = result.data?.map(d => d.embedding)[0];
    return normalizeVector(embedding);
}

export async function rerankDocuments(query: string, documents: string[]) {
    try {
        if (!query || documents.length === 0) return [];

        const reranking = await vo.rerank({
            query,
            documents,
            model: "rerank-2",
            topK: 3,
            returnDocuments: true,
        });

        return reranking.data;
    } catch (error) {
        console.error("Error in reranking:", error);
        throw error;
    }
}

export async function chunkDocument(content: string) {
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
        separators: ["\n\n", "\n", ". ", "! ", "? ", ";", ":", " ", ""]
    });

    return await textSplitter.createDocuments([content]);
}

function normalizeVector(embedding?: number[]): number[] {
    if (!embedding) return [];

    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
}

export function arrayToVector(arr: number[]): string {
    return `[${arr.join(',')}]`;
}
