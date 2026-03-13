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

   
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

  
    doc.fontSize(18).text("MedDiary", { align: "center" });
    doc.fontSize(22).text("Medical Summary", { align: "center" });
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
    doc.moveDown(2);

   
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

   
    doc.fontSize(16).text("Patient Details");
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown(0.5);
    doc.text(`Name: ${patient.name || "N/A"}`);
    doc.text(`Age: ${patient.age || "N/A"}`);
    doc.text(`Blood Group: ${patient.blood_group || "N/A"}`);
    doc.text(`Allergies: ${patient.allergies || "None"}`);
    doc.moveDown();

    
    doc.fontSize(16).text("Current Medications");
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown(0.5);
    if (medications.length === 0) {
      doc.text("None");
    } else {
      medications.forEach(m => {
        doc.text(`• ${m.med_name}`);
      });
    }
    doc.moveDown();

   
    doc.fontSize(16).text("Test Results");
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown(0.5);
    tests.forEach(t => {
      let color = "green";
      if (t.status === "moderate") color = "yellow";
      if (t.status === "abnormal") color = "red";
      
      doc.save();
      doc.circle(50, doc.y + 5, 5).fill(color);
      doc.restore();
      doc.text(t.test_name, 70, doc.y);
      doc.moveDown();
    });

    doc.end();
});

module.exports = router;  