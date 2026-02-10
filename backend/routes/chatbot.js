const express = require("express");
const router = express.Router();
const chatbotRules = require("../chatbot/chatbotRules");

router.post("/chat", (req, res) => {
  const userMessage = req.body.message.toLowerCase();

  let reply = "Sorry, I didn’t understand that. Please try again.";

  for (let rule of chatbotRules) {
    for (let keyword of rule.keywords) {
      if (userMessage.includes(keyword)) {
        reply = rule.response;
        break;
      }
    }
  }

  res.json({ reply });
});

module.exports = router;

