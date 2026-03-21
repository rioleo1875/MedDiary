router.post("/:userId", async (req, res) => {
  const { name, phone, relationship, email } = req.body;
  const userId = req.params.userId;

  try {
    await db.query(
      `INSERT INTO emergency_contacts 
      (user_id, name, emergency_phone, relationship, contact_email)
      VALUES (?, ?, ?, ?, ?)`,
      [userId, name, phone, relationship, email]
    );

    res.json({ message: "Contact added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add contact" });
  }
});

router.get("/access/:email", async (req, res) => {
  const email = req.params.email;

  try {
    const [rows] = await db.query(
      `SELECT user_id FROM emergency_contacts 
       WHERE contact_email = ?`,
      [email]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch access" });
  }
});