import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, Bot, User, Clock, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

/**
 * Farmer Messages Page — Admin-to-Farmer Direct Messaging
 * Team Antigravity | Smart Farm Management System
 *
 * BUG FIX: Data now re-fetches on interval and after sending a message
 * so changes reflect immediately without requiring page reload.
 */
export default function FarmerMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [adminId, setAdminId] = useState(null);
  const chatEndRef = useRef(null);

  // BUG FIX: Fetch messages and auto-refresh every 15s so new messages appear immediately
  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/messages/inbox');
      setMessages(data);
      // Find the admin ID from messages (to know who to reply to)
      const adminMsg = data.find(m => m.senderRole === 'admin');
      if (adminMsg) setAdminId(adminMsg.senderId._id);
    } catch (err) {
      setError('Could not load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    if (!adminId) {
      setError('No admin to reply to yet. Wait for an admin to contact you first.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await api.post('/messages', { receiverId: adminId, content: reply });
      setReply('');
      await fetchMessages(); // Re-fetch immediately after sending — Bug Fix 2
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Sort messages chronologically for chat view
  const sortedMessages = [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="space-y-6 page-enter max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-700 to-blue-700 rounded-xl flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-white">Messages</h1>
          <p className="text-stone-400 mt-0.5">Direct communication with your land officer</p>
        </div>
        <div className="ml-auto text-xs text-stone-600 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live updates
        </div>
      </div>

      {error && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Chat Window */}
      <div className="glass-card flex flex-col" style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}>
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 flex-shrink-0">
          <div className="w-9 h-9 bg-amber-700/50 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-white font-semibold">Land Officer</div>
            <div className="text-stone-500 text-xs">SmartFarm Administration</div>
          </div>
          <div className="ml-auto">
            <span className="bg-leaf-900/60 border border-leaf-700/40 text-leaf-400 text-xs px-2.5 py-1 rounded-full">Official Channel</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 text-leaf-500 animate-spin" />
            </div>
          ) : sortedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-stone-800/60 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-stone-600" />
              </div>
              <h3 className="text-stone-400 font-semibold mb-2">No messages yet</h3>
              <p className="text-stone-600 text-sm max-w-xs">
                Your land officer will contact you here about your land verification, crop updates, or any other queries.
              </p>
              <div className="mt-4 bg-amber-900/20 border border-amber-700/30 rounded-xl px-4 py-3 text-xs text-amber-400 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Need help now? Use KisanBot (click the green button, bottom-right!) 🌾
              </div>
            </div>
          ) : (
            sortedMessages.map((msg) => {
              const isMyMessage = msg.senderId._id === user._id || msg.senderRole === 'farmer';
              return (
                <div
                  key={msg._id}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  style={{ animation: 'fadeUp 0.3s ease-out both' }}
                >
                  {!isMyMessage && (
                    <div className="w-8 h-8 bg-amber-700/50 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                      <User className="w-4 h-4 text-amber-400" />
                    </div>
                  )}
                  <div className="max-w-[70%]">
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isMyMessage
                        ? 'bg-leaf-700 text-white rounded-br-none'
                        : 'bg-white/8 border border-white/10 text-stone-200 rounded-bl-none'
                    }`}>
                      {msg.subject && <div className="text-xs font-bold mb-1 opacity-75">Re: {msg.subject}</div>}
                      {msg.content}
                    </div>
                    <div className={`flex items-center gap-1 mt-1 text-xs text-stone-600 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                      <Clock className="w-3 h-3" />
                      {new Date(msg.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      <span className="ml-1">· {isMyMessage ? 'You' : msg.senderId.name}</span>
                    </div>
                  </div>
                  {isMyMessage && (
                    <div className="w-8 h-8 bg-leaf-700/50 rounded-full flex items-center justify-center flex-shrink-0 ml-2 mt-1">
                      <span className="text-xs font-bold text-leaf-300">{user?.name?.charAt(0)}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Reply Box */}
        <div className="border-t border-white/5 p-4 flex-shrink-0">
          {!adminId && !loading && messages.length === 0 ? (
            <div className="text-center text-stone-600 text-sm py-2">
              Waiting for admin to initiate conversation...
            </div>
          ) : (
            <form onSubmit={handleSend} className="flex items-center gap-3">
              <input
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Type your reply to the land officer..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500/30"
                disabled={sending}
                id="farmer-msg-input"
              />
              <button
                type="submit"
                disabled={sending || !reply.trim()}
                className="btn-primary flex items-center gap-2 py-3 flex-shrink-0"
                id="farmer-msg-send"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="glass-card p-4 flex items-start gap-3">
        <Bot className="w-5 h-5 text-leaf-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-white text-sm font-semibold">KisanBot is always available!</div>
          <div className="text-stone-500 text-xs mt-0.5">
            For instant help with crop tips, scheme info, or platform guidance, click the green KisanBot button at the bottom-right of your screen.
            <br />Helpline: <span className="text-leaf-400 font-semibold">1800-180-1551</span> (Toll Free)
          </div>
        </div>
      </div>
    </div>
  );
}
