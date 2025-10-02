const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config({ path: "./config/.env" });
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri) {
  throw new Error(
    "Veuillez ajouter votre MONGO URI au fichier .env s'il vous plait"
  );
}

let client;
let db;
let ready; // promesse de connexion (singleton)

async function connectDB() {
  if (db) return db; // déjà connecté
  if (!ready) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    ready = client.connect().then(async () => {
      db = client.db(dbName);
      await db.admin().command({ ping: 1 });
      console.log("[mongo] connected to", uri, "db:", dbName);
      return db;
    });
  }
  return ready;
}

function getDB() {
  if (!db) {
    throw new Error(
      "DB not initialized. Call connectDB() before using getDB()."
    );
  }
  return db;
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    ready = null;
    console.log("[mongo] disconnected");
  }
}

module.exports = { connectDB, getDB, closeDB };
