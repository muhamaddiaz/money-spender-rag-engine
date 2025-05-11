import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

function connectToSupabase() {
    const { SUPABASE_API_KEY: privateKey, SUPABASE_URL: url, POSTGRE_DATABASE_URL: databaseUrl } = process.env;

    if (!privateKey || !url || !databaseUrl) throw new Error(`Expected env var SUPABASE_API_KEY, SUPABASE_URL & DATABASE_URL`);

    const pool = new pg.Pool({
        connectionString: databaseUrl,
        ssl: {
            rejectUnauthorized: false // You may need this in development
        }
    });

    const client = createClient(url, privateKey);

    return {
        client,
        pool
    };
}

export { connectToSupabase };