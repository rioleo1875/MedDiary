const chatbotRules = [
  {
    keywords: ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"],
    response: "Hello! I'm your MedDiary assistant. I can help you with managing medications, family members, test results, and general app questions. How can I assist you today?"
  },
  {
    keywords: ["add family", "family member", "family profile", "add person", "add relative"],
    response: "To add a family member: 1) Go to the Family tab, 2) Tap the '+' button, 3) Enter their name, age, blood group, and allergies, 4) Save the profile. Each member will have their own medical records."
  },
  {
    keywords: ["add medicine", "medication", "add drug", "new medicine", "prescription"],
    response: "You can add medications in two ways: 1) Go to Medications tab and tap 'Add Medication', or 2) Go to Edit Medications for detailed entry. Include name, dosage, frequency, and whether it's regular or temporary. The app will check for drug interactions automatically!"
  },
  {
    keywords: ["test results", "lab test", "upload report", "medical test", "lab results"],
    response: "For test results: 1) Go to Tests tab, 2) Tap 'Upload Report', 3) Select PDF or image file, 4) The app will automatically extract and parse the data. You can also manually add test results with values and units."
  },
  {
    keywords: ["emergency", "emergency contact", "emergency access", "medical emergency"],
    response: "In the Emergency section, you can set up emergency contacts and create emergency summaries. This allows quick access to critical medical information for healthcare providers in emergency situations."
  },
  {
    keywords: ["summary", "medical summary", "pdf", "download summary", "health report"],
    response: "Generate a comprehensive medical summary PDF from the Summary tab. It includes patient details, current medications, and all test results with color-coded status indicators. Perfect for doctor visits or sharing with healthcare providers."
  },
  {
    keywords: ["immunization", "vaccination", "vaccine", "immunization record", "shots"],
    response: "Manage immunizations in the Immunizations tab. Add vaccine names and dates to keep track of your vaccination history. This is especially important for school requirements and travel documentation."
  },
  {
    keywords: ["reminder", "medicine reminder", "medication reminder", "dose reminder"],
    response: "Set up medication reminders to help you stay on track with your prescriptions. Go to the Reminders section to configure timing and frequency for each medication. You'll receive notifications when it's time to take your medicine."
  },
  {
    keywords: ["ddi", "drug interaction", "medicine interaction", "interaction warning"],
    response: "The app automatically checks for drug-drug interactions when you add medications. If a potential interaction is detected, you'll see a red warning box with details. You can choose to consult your doctor or proceed with caution."
  },
  {
    keywords: ["backup", "data backup", "save data", "export data", "sync"],
    response: "Your medical data is automatically saved to our secure servers. You can export summaries as PDFs for personal records. Always keep copies of important medical documents for your personal health records."
  },
  {
    keywords: ["help", "support", "how to", "tutorial", "guide"],
    response: "I'm here to help! You can ask me about: adding family members, managing medications, uploading test results, generating summaries, setting reminders, immunizations, emergency features, or general app usage. What would you like to know more about?"
  },
  {
    keywords: ["account", "profile", "settings", "login", "otp"],
    response: "Your account is secured with OTP-based authentication. Go to Settings to manage your profile and preferences. Your medical data is private and only accessible to you and your designated emergency contacts."
  },
  {
    keywords: ["doctor", "consult", "pain", "sick", "diagnosis", "treatment", "medical advice", "symptoms"],
    response: "I'm not a medical professional and cannot provide medical advice, diagnosis, or treatment recommendations. Please consult a qualified healthcare provider for any medical concerns. I can help you manage your health records and app features."
  },
  {
    keywords: ["delete", "remove", "clear data", "reset"],
    response: "You can delete individual records like medications, test results, or family members from their respective sections. For account-related concerns or data deletion requests, please check the app settings or contact support."
  },
  {
    keywords: ["offline", "no internet", "connection", "sync"],
    response: "The app works best with an internet connection for real-time sync. Some features like PDF generation and OCR processing require connectivity. Your data is automatically synced when you're back online."
  },
  {
    keywords: ["security", "privacy", "data protection", "hipaa"],
    response: "Your health data is encrypted and protected with industry-standard security measures. Only you and your authorized emergency contacts can access your medical information. We comply with healthcare data protection standards."
  },
  {
    keywords: ["thank", "thanks", "awesome", "great", "helpful"],
    response: "You're welcome! I'm glad I could help. Remember to keep your medical records updated and consult healthcare professionals for any medical concerns. Have a healthy day!"
  },
  {
    keywords: ["bye", "goodbye", "exit", "close"],
    response: "Goodbye! Take care of your health. Remember to take your medications on time and keep your medical records updated. I'm here whenever you need assistance with MedDiary!"
  }
];

module.exports = chatbotRules;
