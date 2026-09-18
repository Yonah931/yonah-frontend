import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Bot, Search, Megaphone, Briefcase, Code, BarChart3, Send, Activity, User } from 'lucide-react';
import './App.css';

const agents = [
  { id: 'ceo', name: 'CEO', role: 'المنسق الرئيسي', icon: Crown, color: '#00d4ff', apiName: 'CEO' },
  { id: 'assistant', name: 'Assistant', role: 'الأسئلة العامة', icon: Bot, color: '#00ff88', apiName: 'Assistant' },
  { id: 'researcher', name: 'Researcher', role: 'بحث في الإنترنت', icon: Search, color: '#ff6b6b', apiName: 'Researcher' },
  { id: 'cmo', name: 'CMO', role: 'التسويق والمحتوى', icon: Megaphone, color: '#ffd93d', apiName: 'CMO' },
  { id: 'salesrep', name: 'SalesRep', role: 'المبيعات والعملاء', icon: Briefcase, color: '#a78bfa', apiName: 'SalesRep' },
  { id: 'dev', name: 'Dev', role: 'توليد وتنفيذ الأكواد', icon: Code, color: '#4ade80', apiName: 'Dev' },
  { id: 'dataanalyst', name: 'DataAnalyst', role: 'تحليل البيانات', icon: BarChart3, color: '#fb923c', apiName: 'DataAnalyst' },
];

const API_URL = '/api';

function App() {
  const [time, setTime] = useState(new Date());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);
  const [stats, setStats] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input, time: new Date().toLocaleTimeString('ar-EG') };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      const agent = agents.find(a => a.apiName === data.agent) || agents[1];
      setActiveAgent(agent.id);
      setTimeout(() => setActiveAgent(null), 3000);
      setStats(prev => ({ ...prev, [agent.id]: (prev[agent.id] || 0) + 1 }));
      
      const botMsg = {
        role: 'assistant',
        content: data.response,
        agent: agent.name,
        agentColor: agent.color,
        agentIcon: agent.icon,
        time: new Date().toLocaleTimeString('ar-EG'),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `خطأ في الاتصال: ${err.message}`,
        agent: 'System',
        agentColor: '#ff6b6b',
        agentIcon: Activity,
        time: new Date().toLocaleTimeString('ar-EG'),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.8, type: 'spring' }}>
          <Crown className="crown-icon" size={60} />
        </motion.div>
        <motion.h1 className="main-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          Yonah Ashkenaz
        </motion.h1>
        <motion.p className="subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          🤖 Agentic OS — نظام وكلاء الذكاء الاصطناعي لإدارة الشركة
        </motion.p>
      </div>

      <motion.div className="status-bar" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
        <div className="status-left">
          <Activity size={18} />
          <span>System: <strong>Operational</strong></span>
          <span className="status-dot"></span>
        </div>
        <div className="status-time">{time.toLocaleString('ar-EG')}</div>
      </motion.div>

      <div className="agents-grid">
        {agents.map((agent, i) => {
          const Icon = agent.icon;
          return (
            <motion.div
              key={agent.id}
              className={`agent-card ${activeAgent === agent.id ? 'active' : ''}`}
              style={{ '--agent-color': agent.color }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="agent-icon-wrap"><Icon size={28} /></div>
              <div className="agent-info">
                <div className="agent-name">{agent.name}</div>
                <div className="agent-role">{agent.role}</div>
              </div>
              {stats[agent.id] > 0 && <div className="agent-count">{stats[agent.id]}</div>}
            </motion.div>
          );
        })}
      </div>

      <div className="chat-window">
        {messages.length === 0 && (
          <div className="empty-chat">
            <Bot size={48} color="#00d4ff44" />
            <p>مرحباً! كيف يمكنني مساعدتك اليوم؟</p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, i) => {
            const Icon = msg.agentIcon || User;
            return (
              <motion.div
                key={i}
                className={`message ${msg.role}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={msg.agentColor ? { '--msg-color': msg.agentColor } : {}}
              >
                <div className="msg-avatar">
                  <Icon size={20} />
                </div>
                <div className="msg-body">
                  {msg.agent && <div className="msg-agent" style={{ color: msg.agentColor }}>{msg.agent}</div>}
                  <div className="msg-content">{msg.content}</div>
                  <div className="msg-time">{msg.time}</div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {loading && (
          <motion.div className="message assistant loading-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="msg-avatar"><Activity size={20} /></div>
            <div className="msg-body">
              <div className="msg-content">
                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-bar">
        <input
          type="text"
          placeholder="ما هي المهمة التي تريدها؟"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

export default App;
