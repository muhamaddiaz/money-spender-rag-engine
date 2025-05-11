import {chunkDocument, generateEmbedding, arrayToVector} from "../utils/embedding";
import {connectToSupabase} from "../config/supabase";

async function trainProcess(content: string) {
    const chunks = await chunkDocument(content);

    const { pool } = connectToSupabase();
    const client = await pool.connect();

    const docs = await Promise.all(
        chunks.map(async (chunk) => {
            const embedding = await generateEmbedding(chunk.pageContent);

            return {
                content: chunk.pageContent,
                embedding: embedding
            };
        })
    )

    try {
        await client.query("TRUNCATE TABLE documents");

        for (const doc of docs) {
            if (!doc.embedding) {
                console.warn(`Skipping document with missing embedding: ${doc.content.substring(0, 50)}...`);
                continue;
            }

            await client.query(
                "INSERT INTO documents (content, embedding) VALUES ($1, $2) RETURNING id",
                [doc.content, arrayToVector(doc.embedding)]
            );
        }
    } catch (error) {
        console.error('Error inserting documents:', error);
        throw error;
    } finally {
        client.release();
    }

    return docs;
}

export { trainProcess };