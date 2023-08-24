import db from "../../db";

async function createContactsTable() {
  const createContactsTableQuery = `
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        phoneNumber VARCHAR,
        email VARCHAR,
        linkedId INTEGER,
        linkPrecedence VARCHAR,
        createdAt TIMESTAMP,
        updatedAt TIMESTAMP,
        deletedAt TIMESTAMP
      );
    `;

  try {
    const client = await db.connect();
    await client.query(createContactsTableQuery);
    client.release();
  } catch (error) {
    console.error("Error creating contacts table:", error);
  }
}

export { createContactsTable };
