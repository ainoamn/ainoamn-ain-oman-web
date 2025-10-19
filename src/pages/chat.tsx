// src/pages/chat.tsx
// صفحة الدردشة مع الإدارة - محسنة للأداء الفائق ⚡

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import InstantLink from '@/components/InstantLink';
import { useInstantData } from '@/hooks/useInstantData';
import { toSafeText } from '@/components/SafeText';
import { FaPaperPlane, FaUser, FaArrowRight, FaPaperclip, FaImage, FaCheckDouble, FaCheck, FaClock } from 'react-icons/fa';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'admin' | 'system';
  message: string;
  timestamp: string;
  read: boolean;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

export default function ChatPage() {
  const router = useRouter();
  const { propertyId, type } = router.query;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تحميل الرسائل
  const { data: property } = useInstantData(
    propertyId ? `/api/properties/${propertyId}` : null,
    (url) => fetch(url).then(r => r.json()).then(d => d.item || d)
  );

  useEffect(() => {
    loadMessages();
    // Polling للرسائل الجديدة
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [propertyId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/messages?propertyId=${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          message: newMessage,
          type: type || 'general',
        }),
      });

      if (response.ok) {
        setNewMessage('');
        await loadMessages();
      }
    } catch (error) {
      console.error('Send message error:', error);
      alert('فشل في إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
  };
  
  // تحويل البيانات إلى نص آمن
  const safeTitle = property ? toSafeText(property.title, 'ar', 'العقار') : 'العقار';
  const safeType = property ? toSafeText(property.type, 'ar', '') : '';
  const safeAddress = property ? toSafeText(property.address, 'ar', '') : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>الدردشة - {safeTitle} | Ain Oman</title>
      </Head>

      <div className="max-w-5xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-md p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <InstantLink
              href={propertyId ? `/properties/${propertyId}` : '/properties'}
              className="text-gray-600 hover:text-gray-900"
            >
              <FaArrowRight className="text-xl" />
            </InstantLink>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {type === 'management' ? 'الدردشة مع الإدارة' : 'الدردشة'}
              </h1>
              {property && (
                <p className="text-sm text-gray-600">{safeTitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">متصل</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد رسائل بعد</p>
              <p className="text-sm text-gray-400 mt-2">ابدأ محادثة جديدة مع الإدارة</p>
            </div>
          )}

          {messages.map((msg) => {
            const isMyMessage = msg.senderType === 'user';
            const isAdmin = msg.senderType === 'admin';
            const isSystem = msg.senderType === 'system';

            return (
              <div
                key={msg.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-3 rounded-2xl ${
                    isMyMessage
                      ? 'bg-green-600 text-white rounded-br-none'
                      : isSystem
                      ? 'bg-blue-100 text-blue-900 rounded-bl-none'
                      : 'bg-white text-gray-900 shadow rounded-bl-none'
                  }`}
                >
                  {!isMyMessage && (
                    <p className="text-xs font-medium mb-1 opacity-75">
                      {msg.senderName}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.attachments.map((att, i) => (
                        <div key={i} className="text-xs opacity-75 flex items-center gap-1">
                          <FaPaperclip />
                          <a href={att.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {att.name}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs opacity-75">{formatTime(msg.timestamp)}</p>
                    {isMyMessage && (
                      msg.read ? (
                        <FaCheckDouble className="text-xs" />
                      ) : (
                        <FaCheck className="text-xs" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="إرفاق ملف"
            >
              <FaPaperclip className="text-xl" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                // معالجة رفع الملفات
                console.log('File selected:', e.target.files);
              }}
            />
            
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب رسالتك هنا..."
              rows={1}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              style={{ maxHeight: '120px' }}
            />
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPaperPlane className="text-xl" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            اضغط Enter للإرسال، Shift+Enter لسطر جديد
          </p>
        </div>
      </div>
    </div>
  );
}

