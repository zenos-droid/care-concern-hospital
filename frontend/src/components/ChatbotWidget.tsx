import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, X, Shield, Phone, RefreshCw, User, HelpCircle, HeartPulse } from "lucide-react";
import { askGemini } from "../services/geminiService";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

const PRESET_QUERIES = [
  { label: "Book Appointment Steps", query: "How do I book an appointment online with a doctor?" },
  { label: "Emergency Ambulance Call", query: "Who do I contact for an emergency or ambulance?" },
  { label: "Cardiologist Doctor Hours", query: "What are Dr. S. K. Mukherjee's cabinet timings?" },
  { label: "Directions via Train & Station", query: "How do I reach the hospital from Serampore railway station?" },
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! Welcome to Care Concern Hospital Pvt Ltd, Serampore. I am your premium clinical assistant. How can I guide you with our facilities, departments, or surgeon schedules today?",
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);
    setErrorStatus(null);

    try {
      // Map history
      const history = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const reply = await askGemini(textToSend, history);
      
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setErrorStatus("Connection is unstable. Providing helpful diagnostic tips instantly below.");
      
      const fallbackMsg: Message = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "Please contact our front office directly at +91 33 2662 4001 or use the dynamic Book Appointment section above. For critical ambulance transfers, dial +91 33 2662 4000.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        sender: "bot",
        text: "Chat restarted. I'm ready to answer your questions about Care Concern Hospital, Serampore Hooghly.",
        timestamp: new Date()
      }
    ]);
    setErrorStatus(null);
  };

  return (
    <>
      {/* Floating activation button */}
      <button
        id="btn-chatbot"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-6 z-50 bg-sky-600 hover:bg-sky-700 text-white rounded-full p-3.5 shadow-2xl flex items-center gap-2 group transition-transform duration-300 hover:scale-105"
        title="Consult AI Assistant"
      >
        <MessageSquare className="w-6 h-6 animate-pulse group-hover:rotate-12 transition-transform" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-sm font-semibold whitespace-nowrap">
          Care AI Help
        </span>
      </button>

      {/* Floating Chat container */}
      {isOpen && (
        <div 
          id="chat-box-container"
          className="fixed bottom-6 right-6 z-50 w-full max-w-sm md:max-w-md h-[550px] bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-800 to-sky-600 p-4 text-white flex justify-between items-center shrink-0 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center border border-white/20">
                <HeartPulse className="w-5 h-5 text-cyan-200" />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight">Care Concern AI</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-sky-100">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                  <span>Serampore Medical Desk (Active)</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={clearChat}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded transition-colors"
                title="Reset conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="bg-amber-50 border-b border-amber-100 px-3 py-2 text-[11px] text-amber-800 flex items-start gap-1.5 leading-relaxed tracking-wider">
            <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Clinical Guard:</strong> This AI assistant provides informational routing support. For vital diagnoses, verify with Care Concern physicians.
            </span>
          </div>

          {/* Messages view */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div 
                  key={msg.id} 
                  className={`flex items-start gap-2 max-w-[85%] ${isBot ? "self-start" : "ml-auto flex-row-reverse"}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isBot ? "bg-sky-100 text-sky-700" : "bg-sky-600 text-white"}`}>
                    {isBot ? <HelpCircle className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className={`p-3 rounded-2xl text-xs md:text-sm leading-relaxed ${isBot ? "bg-white text-slate-800 shadow-sm border border-slate-150 rounded-tl-none whitespace-pre-line" : "bg-sky-600 text-white rounded-tr-none"}`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-start gap-2 max-w-[80%]">
                <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none text-xs text-slate-400 shadow-sm border border-slate-150">
                  Assistant is recalling medical layout...
                </div>
              </div>
            )}

            {errorStatus && (
              <div className="p-2 border border-red-200 bg-red-50 text-red-800 text-xs rounded-lg">
                {errorStatus}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Preset Buttons */}
          <div className="p-2 bg-slate-100 border-t border-slate-200 shrink-0 select-none overflow-x-auto whitespace-nowrap no-scrollbar flex gap-1.5 scrollbar-thin">
            {PRESET_QUERIES.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(item.query)}
                className="inline-block bg-white hover:bg-sky-50 text-sky-800 text-[10px] md:text-xs font-medium px-2.5 py-1.5 rounded-full border border-slate-200 transition-colors cursor-pointer shrink-0 shadow-sm"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Input text field container */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputVal);
            }}
            className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask about doctors, emergency, G.T. Road location..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 px-3.5 py-2.5 rounded-xl text-xs md:text-sm text-slate-800"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isTyping}
              className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white p-2.5 rounded-xl transition-colors cursor-pointer shadow-md shadow-sky-100 shrink-0"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
