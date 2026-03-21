const express = require("express");
const router = express.Router();
const db = require("../config/db");
const PDFDocument = require("pdfkit");

function getUserId(req) {
  return parseInt(req.headers["x-user-id"], 10);
}

async function buildSummaryPDF(memberId, doc) {
  const [tests] = await db.query(
    "SELECT * FROM test_results WHERE member_id = ? ORDER BY test_date DESC",
    [memberId]
  );

  const [patientRows] = await db.query(
    "SELECT name, age, blood_group, allergies FROM family_members WHERE member_id = ?",
    [memberId]
  );
  const patient = patientRows[0] || {};

  const [medications] = await db.query(
    "SELECT med_name FROM medications WHERE member_id = ?",
    [memberId]
  );

  // Border
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

  // Header
  doc.fontSize(18).text("MedDiary", { align: "center" });
  doc.fontSize(22).text("Medical Summary", { align: "center" });
  doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
  doc.moveDown(2);

  // Color guide
  doc.fontSize(16).text("Color Guide:");
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
  doc.moveDown(0.5);

  doc.save();
  doc.circle(50, doc.y + 5, 5).fill("green");
  doc.restore();
  doc.fontSize(12).text("Normal", 70, doc.y);
  doc.moveDown();

  doc.save();
  doc.circle(50, doc.y + 5, 5).fill("yellow");
  doc.restore();
  doc.text("Moderate", 70, doc.y);
  doc.moveDown();

  doc.save();
  doc.circle(50, doc.y + 5, 5).fill("red");
  doc.restore();
  doc.text("Abnormal", 70, doc.y);
  doc.moveDown();

  // Patient details
  doc.fontSize(16).text("Patient Details");
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Name: ${patient.name || "N/A"}`);
  doc.text(`Age: ${patient.age || "N/A"}`);
  doc.text(`Blood Group: ${patient.blood_group || "N/A"}`);
  doc.text(`Allergies: ${patient.allergies || "None"}`);
  doc.moveDown();

  // Medications
  doc.fontSize(16).text("Current Medications");
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fontSize(12);
  if (medications.length === 0) {
    doc.text("None");
  } else {
    medications.forEach((m) => doc.text(`• ${m.med_name}`));
  }
  doc.moveDown();

  // Test results
  doc.fontSize(16).text("Test Results");
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fontSize(12);
  if (tests.length === 0) {
    doc.text("No test results on record.");
  } else {
    tests.forEach((t) => {
      let color = "green";
      if (t.status === "moderate") color = "yellow";
      if (t.status === "abnormal") color = "red";

      doc.save();
      doc.circle(50, doc.y + 5, 5).fill(color);
      doc.restore();
      doc.text(
        `${t.test_name}: ${t.value}${t.unit ? " " + t.unit : ""} (${t.status})`,
        70,
        doc.y
      );
      doc.moveDown();
    });
  }
}

router.get("/generate/:memberId", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const memberId = req.params.memberId;

    // Verify the member belongs to this user
    const [ownerCheck] = await db.query(
      "SELECT member_id FROM family_members WHERE member_id = ? AND user_id = ?",
      [memberId, userId]
    );
    if (ownerCheck.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=summary_${memberId}.pdf`
    );
    doc.pipe(res);
    await buildSummaryPDF(memberId, doc);
    doc.end();
  } catch (err) {
    console.error("GET /summary/generate/:memberId error:", err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

router.get("/emergency/:targetUserId", async (req, res) => {
  try {
    const requestingUserId = getUserId(req);
    if (!requestingUserId) return res.status(401).json({ error: "Unauthorized" });

    const targetUserId = parseInt(req.params.targetUserId, 10);

    const [accessCheck] = await db.query(
      `SELECT contact_id FROM emergency_contacts
       WHERE user_id = ? AND emergency_user_id = ?`,
      [targetUserId, requestingUserId]
    );
    if (accessCheck.length === 0) {
      return res.status(403).json({
        error: "You are not registered as an emergency contact for this user",
      });
    }

    const [members] = await db.query(
      "SELECT member_id FROM family_members WHERE user_id = ?",
      [targetUserId]
    );
    if (members.length === 0) {
      return res.status(404).json({ error: "No family members found for this user" });
    }

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=emergency_summary_${targetUserId}.pdf`
    );
    doc.pipe(res);

    for (let i = 0; i < members.length; i++) {
      if (i > 0) doc.addPage(); // separate page per member
      await buildSummaryPDF(members[i].member_id, doc);
    }

    doc.end();
  } catch (err) {
    console.error("GET /summary/emergency/:targetUserId error:", err);
    res.status(500).json({ error: "Failed to generate emergency summary" });
  }
});

module.exports = router;