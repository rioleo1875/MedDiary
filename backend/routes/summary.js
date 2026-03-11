const express = require("express");
const router = express.Router();
const db = require("../config/db");
const PDFDocument = require("pdfkit");

router.get("/generate/:memberId", async (req, res) => {
  const  memberId  = req.params.memberId;
  const [tests]= await db.query(
    "SELECT * FROM test_results WHERE member_id = ? ORDER BY test_date DESC",
    [memberId]
  );    
    // lookup patient details and medications
    const [patientRows] = await db.query(
      "SELECT name, age, blood_group, allergies FROM family_members WHERE member_id = ?",
      [memberId]
    );
    const patient = patientRows[0] || {};

    const [medications] = await db.query(
      "SELECT med_name FROM medications WHERE member_id = ?",
      [memberId]
    );

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=summary_${memberId}.pdf`);
    doc.pipe(res);

    // title
    doc.fontSize(22).text("Medical Summary", { align: "center" });
    doc.moveDown();

    // Patient info
    doc.fontSize(16).text("Patient Details");
    doc.text(`Name: ${patient.name || "N/A"}`);
    doc.text(`Age: ${patient.age || "N/A"}`);
    doc.text(`Blood Group: ${patient.blood_group || "N/A"}`);
    doc.text(`Allergies: ${patient.allergies || "None"}`);
    doc.moveDown();

    // Medications
    doc.fontSize(16).text("Current Medications");
    if (medications.length === 0) {
      doc.text("None");
    } else {
      medications.forEach(m => {
        doc.text(`• ${m.med_name}`);
      });
    }
    doc.moveDown();

    // Test results
    doc.fontSize(16).text("Test Results");
    tests.forEach(t => {
      let label = "Normal";
      if (t.status === "moderate") label = "Moderate";
      if (t.status === "abnormal") label = "Abnormal";
      doc.text(`${t.test_name} – ${label}`);
    });

    doc.end();
});

module.exports = router;  