export const getLinkedContacts = async (
  client: any,
  contactId: number | null
) => {
  const query = `
        SELECT * FROM contacts 
        WHERE id = $1 
        UNION
        SELECT * FROM contacts 
        WHERE linkedId = $1
    `;
  const result = await client.query(query, [contactId]);
  return result.rows;
};
