/* ==========================================================================
   EASY CONFIGURATION FILE
   Edit your links, resume path, and AI API settings right here!
   ========================================================================== */

window.PORTFOLIO_CONFIG = {
  // 1. Add your LinkedIn URL here (e.g., "https://www.linkedin.com/in/zahid-ahmed")
  //    Leave empty "" to hide the LinkedIn row until ready.
  linkedinUrl: "",

  // 2. Optional: Add your resume file path (e.g., "resume.pdf")
  //    If set, the top navbar button will download your resume instead of scrolling to Contact.
  resumeUrl: "",

  // 3. AI Chatbot API Settings:
  //    Using the Netlify Function keeps your GEMINI_API_KEY 100% hidden on Netlify's servers.
  apiEndpoint: "/.netlify/functions/chat",
  geminiApiKey: "",

  // System prompt sent when using live Gemini AI
  systemPrompt:
    "You are Zahid Ahmed's helpful portfolio assistant. Zahid is a BS IT graduate (QUEST Nawabshah, 2021-2026), Co-founder & Technical Manager of Al-Ilm Learning Site (https://ailslearning.com, FBR & SECP registered free online academy), and developer of Campus Core AI (FastAPI, Next.js, TypeScript, Tailwind CSS, Scikit-learn, Gemini API). Contact: techyexpert98@gmail.com, GitHub: https://github.com/zahid-ahmedk. Keep answers concise, accurate, and friendly."
};
