'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState, useMemo } from 'react';
import ChatMessage from '@/components/chat/ChatMessage';

const SUGGESTED_QUESTIONS = [
  '¿Qué opciones de apliques LED tenemos?',
  '¿Qué marcas de paneles LED manejamos?',
  '¿Qué productos tenemos para exterior?',
  '¿Qué líneas tiene Lucciola?',
  '¿Qué tiras LED manejamos?',
  '¿Qué opciones hay para iluminación comercial?',
];

export default function ChatPage() {
  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/chat' }), []);
  const { messages, sendMessage, status, error, setMessages } = useChat({ transport });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(text: string) {
    if (!text.trim() || isLoading) return;
    setInput('');
    sendMessage({ text: text.trim() });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSend(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  }

  function handleNewChat() {
    setMessages([]);
    setInput('');
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Consulta de Productos</h2>
          <p className="text-xs text-gray-500">Respuestas basadas exclusivamente en la documentación cargada</p>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              Nueva consulta
            </button>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className={`inline-block w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
            {isLoading ? 'Procesando' : 'Listo'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{backgroundColor: 'rgba(0,31,95,0.05)'}}>
              <svg className="w-8 h-8" style={{color: '#001F5F'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Asistente Iluminar</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-md">
              Consultá sobre productos de iluminación, especificaciones técnicas, comparaciones y alternativas. Solo respondo con información de los proveedores cargados.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl w-full">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <ChatMessage key={msg.id} role={msg.role as 'user' | 'assistant'} parts={msg.parts as Array<{type: string; text?: string}>} />
            ))}

            {status === 'submitted' && (
              <div className="mb-4 flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{backgroundColor: '#001F5F'}}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-500">Buscando en la base...</span>
                  </div>
                  <div className="flex gap-1.5 py-1">
                    <span className="loading-dot w-2 h-2 bg-gray-400 rounded-full" />
                    <span className="loading-dot w-2 h-2 bg-gray-400 rounded-full" />
                    <span className="loading-dot w-2 h-2 bg-gray-400 rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                Error: {error.message}. Verificá que la API key esté configurada correctamente.
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-6 py-4 bg-white">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Preguntá sobre productos de iluminación..."
            rows={1}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
            style={{ maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="text-white p-3 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            style={{backgroundColor: '#001F5F'}}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
