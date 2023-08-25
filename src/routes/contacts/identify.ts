import { Request, Response } from "express";
import db from "../../db";
import { createContactsTable, getLinkedContacts, routes } from "../../utils";

routes.post("/identify", async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  try {
    if (!req.app.locals.tableCreated) {
      await createContactsTable();
      req.app.locals.tableCreated = true;
    }

    if (!email && !phoneNumber) {
      return res
        .status(400)
        .json({ error: "Email or phoneNumber is required." });
    }

    const client = await db.connect();

    // Check if the contact already exists
    let query = `
      SELECT * FROM contacts 
      WHERE email = $1 OR phoneNumber = $2
    `;
    const result = await client.query(query, [email, phoneNumber]);

    let contactId: number | null = null;
    let linkPrecedence: string | null = null;
    let linkedContactId: number | null = null;

    if (result.rows.length) {
      // Use the existing contact
      contactId = result.rows[0].id;
      linkedContactId = result.rows[0].linkedid;
      linkPrecedence = "secondary";

      if (!(email === null || phoneNumber === null)) {
        // Check if this should be switched to a secondary contact
        if (
          (result.rows[0].linkprecedence === "primary" &&
            (email || phoneNumber) &&
            email !== result.rows[0].email) ||
          phoneNumber !== result.rows[0].phonenumber
        ) {
          // Update the existing contact to be a secondary contact
          query = `
          UPDATE contacts
          SET linkPrecedence = 'secondary', linkedId = $2
          WHERE id = $1
        `;
          result.rows
            .filter((_, index) => index !== 0)
            .map(
              async (item: { id: number }) =>
                await client.query(query, [item.id, contactId])
            );

          // Create a new secondary contact only if it doesn't already exist
          const existingSecondaryContactQuery = `
          SELECT * FROM contacts 
          WHERE (email = $1 OR phoneNumber = $2) AND linkedId = $3 AND linkPrecedence = 'secondary'
        `;

          const existingSecondaryContactResult = await client.query(
            existingSecondaryContactQuery,
            [email, phoneNumber, contactId]
          );

          if (!existingSecondaryContactResult.rows.length) {
            // Create a new secondary contact
            query = `
            INSERT INTO contacts (email, phoneNumber, linkedId, linkPrecedence)
            VALUES ($1, $2, $3, $4)
            RETURNING id, linkedid
          `;
            const secondaryContactResult = await client.query(query, [
              email,
              phoneNumber,
              contactId,
              linkPrecedence,
            ]);

            contactId = secondaryContactResult.rows[0].id;
            linkedContactId = secondaryContactResult.rows[0].linkedid;
          }
        }
      }
    } else {
      // Create a new primary contact
      linkPrecedence = "primary";
      query = `
        INSERT INTO contacts (email, phoneNumber, linkPrecedence)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
      const primaryContactResult = await client.query(query, [
        email,
        phoneNumber,
        linkPrecedence,
      ]);

      contactId = primaryContactResult.rows[0].id;
    }

    // Retrieve consolidated contact data
    const retrieveId = linkedContactId ? linkedContactId : contactId;
    const consolidatedContacts = await getLinkedContacts(client, retrieveId);

    const primaryContact = consolidatedContacts.find(
      (contact: { linkprecedence: string }) =>
        contact.linkprecedence === "primary"
    );

    const secondaryContacts = consolidatedContacts.filter(
      (contact: { linkprecedence: string }) =>
        contact.linkprecedence === "secondary"
    );

    const uniqueEmails = new Set([
      primaryContact?.email,
      ...secondaryContacts.map((c: { email: string }) => c.email),
    ]);
    const uniquePhoneNumbers = new Set([
      primaryContact?.phonenumber,
      ...secondaryContacts.map((c: { phonenumber: string }) => c.phonenumber),
    ]);

    const contactPayload = {
      contact: {
        primaryContatctId: primaryContact?.id,
        emails: Array.from(uniqueEmails),
        phoneNumbers: Array.from(uniquePhoneNumbers),
        secondaryContactIds: secondaryContacts.map((c: { id: number }) => c.id),
      },
    };

    res.status(200).json(contactPayload);

    client.release();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export { routes as identify };
