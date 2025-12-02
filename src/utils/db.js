const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://chakri:chakri@cluster0.yhuz2xd.mongodb.net/toys?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;

const connectDB = async () => {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect(); // In v5+ creation is enough, but connect verifies. 
        // The original code didn't explicitly await connect() before using, but it's safer to do so.
        // However, the original code just did `const client = ...` and then `client.db(...)`.
        // We will follow the pattern but ensure connection is established.

        await client.connect();
        db = client.db("Carz");
        console.log("Successfully connected to MongoDB!");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

const getDB = () => {
    if (!db) {
        throw new Error("Database not initialized. Call connectDB first.");
    }
    return db;
};

const getCollection = (collectionName) => {
    return getDB().collection(collectionName);
};

module.exports = { connectDB, getCollection, client };
