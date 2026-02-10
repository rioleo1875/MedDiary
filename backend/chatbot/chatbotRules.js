const chatbotRules = [
  {
    keywords: ["hello", "hi", "hey"],
    response: "Hi! I’m MedDiary assistant. How can I help you?"
  },
  {
    keywords: ["add family", "family member", "family profile"],
    response: "You can add a family member from the Family section in the app."
  },
  {
    keywords: ["add medicine", "medication"],
    response: "Go to Medications and tap Add to enter medicine details."
  },
  {
    keywords: ["test results", "lab test"],
    response: "You can add lab test results from the Test Results section."
  },
  {
    keywords: ["emergency", "qr"],
    response: "Use the QR code for emergency access to critical medical info."
  },
  {
    keywords: ["doctor", "consult", "pain", "sick", "diagnosis", "treatment"],
    response: "I’m not able to provide medical advice. Please consult a qualified doctor."
  }
];

module.exports = chatbotRules;
