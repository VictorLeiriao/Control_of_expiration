import { useState, useRef, useEffect } from 'react';
import { assistantService } from '@/services';
import type { AssistantMessage } from '@/types';
import { PageHeader } from '@/components/layouts/PageHeader';
import { Bot, Send, User as UserIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

const quickActions = [
  'O que vence esta semana?',
  'Quanto tenho em risco?',
  'Quais produtos devo vender primeiro?',
  'Quais produtos estão parados?',
  'Quanto perdi com vencimentos?',
];

const initialMessage: AssistantMessage = {
  id: 'init',
  role: 'assistant',
  content: 'Olá! Sou seu assistente de estoque.\n\nPosso ajudar você a identificar produtos próximos do vencimento, entender riscos e tomar decisões sobre seu estoque.',
  timestamp: new Date().toISOString(),
};

export function AssistantPage() {
  const [messages, setMessages] = useState<AssistantMessage[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function handleAsk(question: string) {
    if (!question.trim() || loading) return;

    const userMsg: AssistantMessage = {
      id: `u${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const response = await assistantService.ask(question);

    const assistantMsg: AssistantMessage = {
      id: `a${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setLoading(false);
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto h-full flex flex-col">
      <PageHeader title="Assistente" description="Seu assistente inteligente de estoque" />

      <div className="card flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                msg.role === 'assistant' ? 'bg-brand-100' : 'bg-ink-100'
              )}>
                {msg.role === 'assistant' ? <Bot className="w-4.5 h-4.5 text-brand-600" /> : <UserIcon className="w-4.5 h-4.5 text-ink-600" />}
              </div>
              <div className={cn(
                'rounded-2xl px-4 py-3 max-w-[80%] whitespace-pre-line text-sm',
                msg.role === 'assistant' ? 'bg-ink-50 text-ink-800' : 'bg-brand-600 text-white'
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4.5 h-4.5 text-brand-600" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-ink-50">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        {messages.length <= 1 && (
          <div className="px-5 py-3 border-t border-ink-100">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleAsk(action)}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium hover:bg-brand-100 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-ink-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAsk(input); }}
              placeholder="Pergunte alguma coisa..."
              className="input-field flex-1"
              disabled={loading}
            />
            <button
              onClick={() => handleAsk(input)}
              disabled={loading || !input.trim()}
              className="btn-primary px-3"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
