import { GoogleGenAI } from "@google/genai";

// Initialize the client. Under our Vite config, process.env.GEMINI_API_KEY is available.
// If not found, we will gracefully fall back to local responses.
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.warn("Unable to initialize Gemini API with process.env.GEMINI_API_KEY. Using local fallback chatbot.", e);
}

// System instructions to shape the chatbot behavior
const SYSTEM_INSTRUCTION = `
You are the compassionate, friendly, and expert AI Assistant for 'Care Concern Hospital Pvt Ltd' located in Serampore, Hooghly, West Bengal, India.
Your goals:
1. Provide warm, polite, reassuring, and professional responses.
2. Give helpful general answers, guidelines, and self-care tips.
3. ABSOLUTELY remind the user that you are an AI assistant and they should consult a physician for professional clinical diagnosis. In case of an emergency (chest pain, breathing trouble, severe bleeding, or unconsciousness), they should call our 24/7 hotline at +91 33 2662 4000 or report immediately to Care Concern Hospital Emergency department.
4. Recommend relevant Care Concern Hospital departments:
   - Sudden sharp left-side chest pain, palpitations, shortness of breath -> Cardiology
   - Joint pain, fractures, spine problems, sprains -> Orthopedics
   - Children, infant immunization, pediatric ailments -> Pediatrics
   - Pregnancy, prenatal care, women's reproductive health -> Gynecology
   - Common flu, fever, general wellness, chronic management (diabetes, pressure) -> General Medicine
   - Critical trauma, accident, high fever with breathing trouble -> 24/7 Emergency Care
5. Provide answers in concise, structured, bullet-pointed, and highly readable formats. Max 150 words.
6. Keep in mind the hospital location is Serampore (Hooghly, West Bengal), near landmark Serampore Court / Railway station.
`;

// Direct local rules for instantaneous fallback. Covers typical queries with rich realistic answers.
const FALLBACK_RULES = [
  {
    keywords: ["appointment", "book", "schedule", "register", "timing"],
    response: `You can secure an appointment online immediately using the **Book Appointment** section above!
Simply select your required department (Cardiology, Orthopedics, Pediatrics, Gynecology, General Medicine), choose your preferred specialist doctor, choose a convenient date and time, and complete the patient details.
You can also call our reception desk at **+91 33 2662 4001** for manual bookings.`
  },
  {
    keywords: ["emergency", "icu", "accident", "trauma", "critical", "ambulance"],
    response: `🚨 **IMPORTANT EMERGENCY PROTOCOL:**
Care Concern Hospital in Serampore operates a state-of-the-art **24/7 Emergency and ICCU Unit**.
- For immediate ambulance dispatch, call: **+91 33 2662 4000** or **+91 98300 XXXXX**.
- Our trauma surgeons, cardiologists, and emergency medical officers are on-duty round-the-clock.
- Please report directly to our emergency triage on the ground floor.`
  },
  {
    keywords: ["chest pain", "heart", "cardio", "palpitation", "cardiology"],
    response: `❤️ **Cardiology Guidance:**
A sudden, tight chest squeezing feeling that radiates to your left arm or jaw can indicate a cardiac concern.
1. **Action:** Please do not wait. Call our Emergency Line immediately at **+91 33 2662 4000**.
2. **Services:** Care Concern features high-precision ECG, Echocardiography, and round-the-clock cardiac screening supervised by Dr. S. K. Mukherjee (FACC, Senior Consultant Cardiologist).
3. **Appointment:** If it's a routine check-up, you can book Dr. Mukherjee through our appointment panel.`
  },
  {
    keywords: ["bone", "fracture", "joint", "ortho", "knee", "spine", "pain", "arthritis"],
    response: `🦴 **Orthopedics Department:**
For fractures, spine care, joint replacement, or severe back:
- **Our Specialist:** Dr. Anirban Sengupta, MS (Ortho) - Senior Orthopedic & Joint Replacement Surgeon.
- **Accouterments:** High-frequency X-Ray, advanced physiotherapy unit, and computerized bone densitometry.
- **Booking:** You can consult Dr. Sengupta on Mon, Wed, Fri (4:00 PM - 7:00 PM). Schedule your slot above under Orthopedics.`
  },
  {
    keywords: ["baby", "child", "pediatric", "vaccine", "fever kid", "kids"],
    response: `👶 **Pediatrics Department:**
Compassionate care for infants, toddlers, and young adults:
- **Our Specialist:** Dr. Priya Banerjee, MD (Pediatrics) - 15+ years experience.
- **Services:** Regular checkups, adolescent health coaching, and full immunization schedules.
- **ICU:** Dedicated Pediatric care beds.
- **Booking:** Book an evening appointment with Dr. Banerjee above (Tue, Thu, Sat, 5:00 PM - 8:00 PM).`
  },
  {
    keywords: ["pregnant", "pregnancy", "delivery", "gynecologist", "period", "women", "gynae"],
    response: `🤰 **Gynecology & Obstetrics Department:**
A highly secure, supportive clinic for mother and newborn care:
- **Our Specialist:** Dr. Rupa Ray, MS (OBG) - Eminent Gynecologist & Laparoscopic Surgeon.
- **Facilities:** Premium labor room, 4D ultrasound level II screening, and painless delivery options.
- **Booking:** Secure a priority slot with Dr. Rupa Ray above (Mon-Fri, 10:00 AM - 1:00 PM).`
  },
  {
    keywords: ["fever", "cough", "diabetes", "pressure", "thyroid", "headache", "cold", "general"],
    response: `🩺 **General Medicine Department:**
Comprehensive management of life-style diseases, infectious fevers, and chronic disorders:
- **Our Specialists:** Dr. Amitabha Ghosh, MD (Medicine) - expert consultant physician.
- **Diagnostics:** Comprehensive 24/7 pathology lab reporting.
- **Support:** Regular lifestyle consulting, thyroid tracking, and diabetic disease therapy plans.`
  },
  {
    keywords: ["address", "location", "landmark", "how to reach", "map", "station"],
    response: `📍 **Care Concern Hospital Location:**
Address: 12, Grand Trunk Rd, Serampore, Hooghly, West Bengal - 712201 (Near Serampore Court).
- **By Train:** Just 5 mins auto/rickshaw ride from **Serampore Railway Station** (Howrah line).
- **By Road:** Strategically located directly on G.T. Road, highly accessible from Baidyabati, Rishra, and Konnagar.
- We have dedicated multi-level parking for visitor vehicles.`
  }
];

// Handles general quick response logic locally
function matchLocalQuery(query: string): string | null {
  const norm = query.toLowerCase();
  for (const rule of FALLBACK_RULES) {
    for (const key of rule.keywords) {
      if (norm.includes(key)) {
        return rule.response;
      }
    }
  }
  return null;
}

export async function askGemini(query: string, chatHistory: { sender: "user" | "bot"; text: string }[]): Promise<string> {
  // Try Gemini API first if configured
  if (ai) {
    try {
      // Map history to proper Gemini format
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: "system", parts: [{ text: SYSTEM_INSTRUCTION }] },
          ...chatHistory.map(item => ({
            role: item.sender === "user" ? "user" : "model",
            parts: [{ text: item.text }]
          })),
          { role: "user", parts: [{ text: query }] }
        ],
        config: {
          temperature: 0.7,
        }
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (error) {
      console.warn("Gemini API error. Switching to local diagnostic response.", error);
    }
  }

  // Fallback to local high-precision rule engine
  const matched = matchLocalQuery(query);
  if (matched) {
    return matched;
  }

  // General compassionate default fallback answer
  return `Thank you for contacting Care Concern Hospital Assistant. I understand your query. 
  
To provide accurate advice:
- For appointments, please choose an available slot in the **Book Appointment** form on our page.
- For emergency trauma or severe complaints, call **+91 33 2662 4000** immediately or report to our Serampore hospital gate 24/7.
- If you're consulting for general wellness/diagnostics, we suggest a visit to our outpatient department (OPD) functioning daily 9 AM - 8 PM.

*Please note: I am an AI guidance tool; consult Dr. Amitabha Ghosh or our specialists for precise clinical diagnosis.*`;
}
