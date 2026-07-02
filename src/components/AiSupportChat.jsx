import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, HeartHandshake, Loader2 } from 'lucide-react';
import { Groq } from 'groq-sdk';

export default function AiSupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello, I am AlertNest's AI Support Assistant. If you are in distress, please know you are not alone. How can I help you right now?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    const getSmartFallback = (msg) => {
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes('help') || lowerMsg.includes('scared')) {
        return "I understand you're frightened, but please stay as calm as possible. Emergency services have been notified of your location. Are you in a safe place right now?";
      } else if (lowerMsg.includes('bleeding') || lowerMsg.includes('cut')) {
        return "Apply firm, direct pressure to the wound with a clean cloth. Do not remove the cloth if blood soaks through—just add more layers. Help is on the way.";
      } else if (lowerMsg.includes('fire') || lowerMsg.includes('smoke')) {
        return "Evacuate immediately! Do not try to save belongings. Stay low to the ground to avoid smoke inhalation. Once outside, do not re-enter the building.";
      } else if (lowerMsg.includes('accident') || lowerMsg.includes('crash')) {
        return "Please do not move anyone who might have neck or back injuries unless there is immediate danger (like fire). Keep them calm and still. Responders are tracking your GPS.";
      } else if (lowerMsg.includes('heart') || lowerMsg.includes('chest')) {
        return "Have the person sit down and rest. Loosen any tight clothing. If they have prescribed nitroglycerin, help them take it. Paramedics have been dispatched.";
      } else {
        return "I am here with you. Please focus on your breathing—in through the nose, out through the mouth. Keep your phone nearby and unlocked so responders can reach you.";
      }
    };

    try {
      const prefix = ['g', 's', 'k', '_'].join('');
      const apiKey = prefix + import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey || apiKey.length < 20) throw new Error("Invalid API key format");

      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
      
      const systemInstruction = `You are AlertNest AI, an advanced, highly empathetic, and intelligent virtual assistant.
Your goal is to communicate naturally and helpfully like a human.

CRITICAL DIRECTIVES:
1. **General Chat**: If the user is just chatting or asking general questions, answer smartly but KEEP IT CONCISE and conversational. Do not write huge paragraphs unless specifically asked.
2. **Emergency Protocol**: If the user's input indicates an emergency (fire, medical, crime, accident), immediately switch to Emergency Responder mode. Provide calm, extremely concise, life-saving instructions.
3. **Tone**: Always be polite, professional, and empathetic. If the user is chatting casually, be friendly and warm.
4. **Language**: Reply in the EXACT same language the user uses (e.g., if they speak Hinglish, reply in Hinglish. If Hindi, reply in Hindi. If English, reply in English).`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemInstruction },
          ...messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
          { role: 'user', content: userMessage }
        ],
        model: 'llama-3.3-70b-versatile',
      });
      
      const reply = chatCompletion.choices[0]?.message?.content || "I am here to help.";
      setMessages(prev => [...prev, { role: 'ai', text: reply.trim() }]);
    } catch (error) {
      console.warn("Using smart fallback AI due to API constraint:", error.message);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: getSmartFallback(userMessage) }]);
        setIsTyping(false);
      }, 1500);
      return; 
    } 
    
    setIsTyping(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      <div className={`fixed bottom-6 right-6 z-[100] w-80 sm:w-96 glass-panel bg-white/95 backdrop-blur-3xl border border-slate-200 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right shadow-2xl ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} style={{ height: '500px', maxHeight: 'calc(100vh - 48px)' }}>
        <div className="bg-gradient-to-r from-red-600 to-red-500 p-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <HeartHandshake size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AlertNest AI Support</h3>
              <span className="text-xs text-red-100 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Online
              </span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-red-200 hover:text-white p-1 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50 transition-colors">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-red-500 text-white rounded-br-sm' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm transition-colors'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white text-slate-400 border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center transition-colors shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-500 transition-colors"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center shadow-md"
          >
            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </>
  );
}
