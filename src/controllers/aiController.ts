import path from 'path';

import {NextFunction, Request, Response} from "express";
import {arrayToVector, generateEmbedding, rerankDocuments} from "../utils/embedding";
import { readFileSync } from "fs";
import {trainProcess} from "../models/aiDocument";
import {connectToSupabase} from "../config/supabase";

export const postTrainModel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filePath = path.join(__dirname, '..', 'constants', 'dataTrain.txt');
        const rawData = readFileSync(filePath, "utf-8");
        const content = rawData.toString();

        const result = await trainProcess(content);

        res.status(201).json({ data: result });
    } catch (error) {
        next(error);
    }
};

export const getEmbeddings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const generated = await generateEmbedding('hello world');

        res.status(200).json(generated);
    } catch (error) {
        next(error);
    }
}

export const postSearch = async (req: Request, res: Response, next: NextFunction) => {
    let client;
    try {
        const { query, limit = 3, threshold = 0.4 } = req.body;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Query must be a non-empty string' });
        }

        const numLimit = Number(limit);
        const numThreshold = Number(threshold);

        if (isNaN(numLimit) || numLimit < 1 || numLimit > 100) {
            return res.status(400).json({ error: 'Limit must be a number between 1 and 100' });
        }

        if (isNaN(numThreshold) || numThreshold < 0 || numThreshold > 1) {
            return res.status(400).json({ error: 'Threshold must be a number between 0 and 1' });
        }

        const input = query.slice(0, 1000).replace(/\n/g, ' '); // Limit input length
        const embed = await generateEmbedding(input, 'query');

        if (!embed) {
            return res.status(422).json({
                error: 'Failed to generate embedding'
            });
        }

        const { pool } = connectToSupabase();
        client = await pool.connect();

        const result = await client.query(`
          SELECT 
            id, 
            content, 
            1 - (embedding <=> $1) as similarity
          FROM documents 
          WHERE 1 - (embedding <=> $1) > $2
          ORDER BY similarity DESC
          LIMIT $3
        `, [arrayToVector(embed), numThreshold, numLimit]);

        const rerankedDocs = await rerankDocuments(input, result.rows.map(row => row.content))

        res.json({
            data: rerankedDocs,
            message: 'Success'
        });
    } catch (error) {
        console.error('Search error:', error);
        next(error instanceof Error ? error : new Error('Unknown error occurred'));
    } finally {
        if (client) {
            client.release();
        }
    }
}