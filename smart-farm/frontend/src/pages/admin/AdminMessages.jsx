import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle, Send, Loader2, User, Users, Search,
  Clock, CheckCircle, Plus, X, AlertCircle
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

/**
 * Admin Messages — Direct contact with farmers
 * Team Antigravity | Smart Farm Management System
 *
 * Admin can view all farmers, select one, and send/view messages.
 * BUG FIX: Re-fetches thread after every send for immediate reflection.
 */
export default function AdminMessages() {
  const { user } = useAuth();
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [thread, setThread] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const chatEndRef = useRef(null);

  // Load farmers and all messages
  useEffect(() => {
    const loadData = async () => {
      try {
        const [farmerRes, msgRes] = await Promise.all([
          api.get('/admin/farmers'),
          api.get('/messages/inbox'),
        ]);
        setFarmers(farmerRes.data);
        setAllMessages(msgRes.data);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Get message thread when farmer is selected
  const loadThread = async (farmerId) => {
    setThreadLoading(true);
    try {
      const { data } = await api.get(`/messages/thread/${farmerId}`);
      setThread(data);
    } catch {}
    finally { setThreadLoading(false); }
  };

  useEffect(() => {
    if (selectedFarmer) {
      loadThread(selectedFarmer._id);
      // Auto-refresh thread every 10s
      const interval = setInterval(() => loadThread(selectedFarmer._id), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedFarmer]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedFarmer) return;
    setSending(true);
    setError('');
    try {
      await api.post('/messages', {
        receiverId: selectedFarmer._id,
        content: message,
        subject: subject || undefined,
      });
      setMessage('');
      setSubject('');
      await loadThread(selectedFarmer._id); // BUG FIX: Re-fetch thread immediately
      // Also refresh inbox
      const { data } = await api.get('/messages/inbox');
      setAllMessages(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Get last message for a farmer (for sidebar preview)
  const getLastMsg = (farmerId) => {
    const msgs = allMessages.filter(m => m.farmerId?._id === farmerId || m.farmerId === farmerId);
    if (!msgs.length) return null;
    return msgs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  };

  const filteredFarmers = farmers.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-700 to-blue-700 rounded-xl flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-white">Farmer Messages</h1>
          <p className="text-stone-400">Direct communication with registered farmers</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="flex gap-5 h-[calc(100vh-260px)] min-h-[500px]">
        {/* Farmer Sidebar */}
        <div className="w-72 flex-shrink-0 glass-card flex flex-col">
          <div className="p-4 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="text-white font-semibold text-sm">Farmers ({farmers.length})</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search farmers..."
                className="input-field pl-9 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
            ) : filteredFarmers.length === 0 ? (
              <div className="text-stone-600 text-sm text-center p-8">No farmers found</div>
            ) : (
              filteredFarmers.map(farmer => {
                const lastMsg = getLastMsg(farmer._id);
                const isSelected = selectedFarmer?._id === farmer._id;
                return (
                  <button
                    key={farmer._id}
                    onClick={() => setSelectedFarmer(farmer)}
                    className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${isSelected ? 'bg-indigo-900/30 border-l-2 border-l-indigo-500' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-leaf-700 to-emerald-700 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                        {farmer.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-semibold truncate">{farmer.name}</div>
                        {lastMsg ? (
                          <div className="text-stone-500 text-xs truncate">{lastMsg.content}</div>
                        ) : (
                          <div className="text-stone-600 text-xs">No messages yet</div>
                        )}
                      </div>
                      {lastMsg && (
                        <div className="text-stone-600 text-xs flex-shrink-0">
                          {new Date(lastMsg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 glass-card flex flex-col min-w-0">
          {!selectedFarmer ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-indigo-900/30 border border-indigo-700/30 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-white font-bold text-xl mb-2">Select a Farmer</h3>
              <p className="text-stone-500 text-sm max-w-xs">
                Choose a farmer from the list to view your conversation or send a new message.
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 flex-shrink-0">
                <div className="w-9 h-9 bg-gradient-to-br from-leaf-700 to-emerald-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  {selectedFarmer.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">{selectedFarmer.name}</div>
                  <div className="text-stone-500 text-xs">{selectedFarmer.email} · {selectedFarmer.phone}</div>
                </div>
                <div className="text-xs text-stone-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Live chat
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
                {threadLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  </div>
                ) : thread.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Plus className="w-12 h-12 text-stone-700 mb-3" />
                    <p className="text-stone-500 text-sm">No messages yet. Send the first message to this farmer.</p>
                  </div>
                ) : (
                  thread.map(msg => {
                    const isAdmin = msg.senderRole === 'admin';
                    return (
                      <div key={msg._id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        {!isAdmin && (
                          <div className="w-8 h-8 bg-leaf-700/50 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1 text-xs font-bold text-leaf-300">
                            {selectedFarmer.name.charAt(0)}
                          </div>
                        )}
                        <div className="max-w-[70%]">
                          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            isAdmin
                              ? 'bg-indigo-700 text-white rounded-br-none'
                              : 'bg-white/8 border border-white/10 text-stone-200 rounded-bl-none'
                          }`}>
                            {msg.subject && <div className="text-xs font-bold mb-1 opacity-75">Subject: {msg.subject}</div>}
                            {msg.content}
                            {msg.read && isAdmin && <div className="text-right mt-1"><CheckCircle className="w-3 h-3 inline text-indigo-300 opacity-60" /></div>}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 text-xs text-stone-600 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                            <Clock className="w-3 h-3" />
                            {new Date(msg.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="w-8 h-8 bg-indigo-700/50 rounded-full flex items-center justify-center flex-shrink-0 ml-2 mt-1 text-xs font-bold text-indigo-300">
                            A
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Compose */}
              <div className="border-t border-white/5 p-4 flex-shrink-0 space-y-3">
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Subject (optional)..."
                  className="input-field py-2 text-sm"
                />
                <form onSubmit={handleSend} className="flex items-center gap-3">
                  <input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={`Send message to ${selectedFarmer.name}...`}
                    className="flex-1 input-field py-3 text-sm"
                    disabled={sending}
                    id="admin-msg-input"
                  />
                  <button type="submit" disabled={sending || !message.trim()} className="btn-primary flex items-center gap-2 py-3 flex-shrink-0" id="admin-msg-send">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? '...' : 'Send'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
