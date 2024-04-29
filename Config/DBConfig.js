const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { config } = require("dotenv");
require("dotenv"), config();

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.bqlxg6k.mongodb.net/?retryWrites=true&w=majority`;
const dbName = "gadgetSpot";

let client;
let db;

async function connectToDatabase() {
      if (!client) {
            client = new MongoClient(uri);
            await client.connect();
            db = client.db(dbName);
            console.log('connect to DB')
      }
}

function getCollection(collectionName) {
      if (!db) {
            throw new Error(
                  "Database not initialized. Call connectToDatabase() first."
            );
      }
      return db.collection(collectionName);
}

module.exports = { connectToDatabase, getCollection };
