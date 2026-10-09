import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon, Trash2, Loader2 } from 'lucide-react';
import { apiSendMessage, apiGetConversations, apiGetConversationMessages, apiDeleteConversation,
  type ChatMessageItemDto, type ChatConversationDto } from '@/lib/api';
import { useI18n, detectTextLang } from '@/lib/i18n';

interface ChatMsg {
  id: string;
  sender: 'user' | 'assistant';
  message: string;
}

const WELCOME_KEY = 'chat.welcome';

export default function AIChatbot() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([{ id: 'welcome', sender: 'assistant', message: t(WELCOME_KEY) }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);
  const [conversations, setConversations] = useState<ChatConversationDto[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [open, messages, scrollToBottom]);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{ id: 'welcome', sender: 'assistant', message: t(WELCOME_KEY) }];
      }
      return prev;
    });
  }, [lang, t]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMsg = { id: `u${Date.now()}`, sender: 'user', message: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const detectedLang = detectTextLang(text);
      const langPrefix = detectedLang === 'mr' ? '[marathi] ' : detectedLang === 'hi' ? '[hindi] ' : '';
      const reply = await apiSendMessage(langPrefix + text, conversationId);
      setConversationId(reply.conversationId);
      const aiMsg: ChatMsg = { id: `a${Date.now()}`, sender: 'assistant', message: reply.reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('chat.errResponse'));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([{ id: 'welcome', sender: 'assistant', message: t(WELCOME_KEY) }]);
    setConversationId(undefined);
    setError(null);
    setShowHistory(false);
  };

  const loadConversations = async () => {
    try {
      const convs = await apiGetConversations();
      setConversations(convs);
      setShowHistory(true);
    } catch {
      setError(t('chat.errLoadConversations'));
    }
  };

  const loadConversation = async (id: number) => {
    try {
      const conv = await apiGetConversationMessages(id);
      setConversationId(conv.id);
      const loaded: ChatMsg[] = (conv.messages || []).map((m: ChatMessageItemDto) => ({
        id: `db${m.id}`,
        sender: m.sender === 'user' ? 'user' : 'assistant',
        message: m.message,
      }));
      setMessages(loaded.length > 0 ? loaded : [{ id: 'welcome', sender: 'assistant', message: t(WELCOME_KEY) }]);
      setShowHistory(false);
    } catch {
      setError(t('chat.errLoadConversation'));
    }
  };

  const deleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiDeleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (conversationId === id) {
        handleNewChat();
      }
    } catch {
      setError(t('chat.errDelete'));
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-105"
        aria-label={t('chat.open')}
      >
        <Bot className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">{t('chat.title')}</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 w-[calc(100vw-2.5rem)] sm:w-96 h-[600px] max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-2xl">
        <div className="flex items-center gap-2 text-white">
          <Bot className="w-5 h-5" />
          <div>
            <p className="font-semibold text-sm">{t('chat.title')}</p>
            <p className="text-[10px] text-white/70">{t('chat.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={loadConversations} className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10" title={t('chat.history')}>
            <MessageCircle className="w-4 h-4" />
          </button>
          <button onClick={handleNewChat} className="px-2 py-1 text-[10px] text-white/70 hover:text-white rounded hover:bg-white/10" title={t('chat.new')}>
            {t('chat.new')}
          </button>
          <button onClick={() => setOpen(false)} className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10" title={t('chat.close')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      {showHistory ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">{t('chat.conversationHistory')}</p>
            <button onClick={() => setShowHistory(false)} className="text-xs text-gray-500 hover:text-gray-700">{t('chat.back')}</button>
          </div>
          {conversations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{t('chat.noConversations')}</p>
          ) : (
            conversations.map((c) => (
              <div key={c.id} onClick={() => loadConversation(c.id)}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.title || t('chat.untitled')}</p>
                  <p className="text-[10px] text-gray-400">{new Date(c.updatedAt).toLocaleString()}</p>
                </div>
                <button onClick={(e) => deleteConversation(c.id, e)}
                  className="p-1.5 text-gray-400 hover:text-rose-500 rounded" title={t('chat.delete')}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-gray-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                  msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'
                }`}>
                  {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                }`}>
                  {msg.message}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-gray-800 text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-3 py-2.5">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              </div>
            )}
            {error && (
              <div className="text-xs text-rose-500 text-center px-4 py-2 bg-rose-50 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.placeholder')}
                rows={1}
                className="flex-1 resize-none px-3 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-gray-700 max-h-24"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="flex-shrink-0 p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-40 transition-colors"
                aria-label={t('chat.placeholder')}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">{t('chat.footer')}</p>
          </div>
        </>
      )}
    </div>
  );
}
