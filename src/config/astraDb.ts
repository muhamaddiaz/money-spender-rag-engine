import { DataAPIClient, Db, Collection } from "@datastax/astra-db-ts";

/**
 * Connects to a DataStax Astra database.
 * This function retrieves the database endpoint and application token from the
 * environment variables `API_ENDPOINT` and `APPLICATION_TOKEN`.
 *
 * @returns An instance of the connected database.
 * @throws Will throw an error if the environment variables
 * `API_ENDPOINT` or `APPLICATION_TOKEN` are not defined.
 */

interface AstraDb {
    database: Db;
    collection: Collection;
}

export function connectToDatabase(): AstraDb {
    const { API_ENDPOINT: endpoint, APPLICATION_TOKEN: token, ASTRA_DB_COLLECTION_NAME: collectionName } =
        process.env;

    if (!token || !endpoint || !collectionName) {
        throw new Error(
            "Environment variables API_ENDPOINT, APPLICATION_TOKEN and ASTRA_DB_COLLECTION_NAME must be defined.",
        );
    }

    const client = new DataAPIClient();

    const database = client.db(endpoint, { token });
    const collection = database.collection(collectionName);

    console.log(`Connected to database ${database.id}`);

    return { database, collection };
}