import { Pool } from "pg";
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";

// Parse connection string manually if needed
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ 
  connectionString,
  ssl: false // set to true if using remote DB
});

export async function initVectorStore() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      content TEXT,
      source TEXT,
      year TEXT,
      embedding vector(1536)
    )
  `);
  
  // Create index only if table has data
  try {
    await pool.query(`
      CREATE INDEX IF NOT EXISTS documents_embedding_idx 
      ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
    `);
  } catch (e) {
    console.log("Index will be created after data is added");
  }
}

export async function insertDocument(id: string, content: string, source: string, year: string) {
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: content,
  });

  await pool.query(
    `INSERT INTO documents (id, content, source, year, embedding) 
     VALUES ($1, $2, $3, $4, $5) 
     ON CONFLICT (id) DO UPDATE SET content=$2, source=$3, year=$4, embedding=$5`,
    [id, content, source, year, JSON.stringify(embedding)]
  );
}

export async function searchDocuments(query: string, limit = 5) {
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: query,
  });

  const result = await pool.query(
    `SELECT content, source, year, 1 - (embedding <=> $1) as score
     FROM documents
     ORDER BY embedding <=> $1
     LIMIT $2`,
    [JSON.stringify(embedding), limit]
  );

  return result.rows;
}