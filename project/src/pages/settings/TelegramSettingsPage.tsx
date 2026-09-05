import { useState } from 'react';
import { Send, Check, Loader2, ExternalLink, MessageCircle } from 'lucide-react';

type TelegramState = 'disconnected' | 'connecting' | 'connected';

export function TelegramSettingsPage() {
  const [state, setState] = useState<TelegramState>('disconnected');
  const [sendingTest, setSendingTest] = useState(false);
  const [testSent, setTestSent] = useState(false);

  function handleConnect() {
    setState('connecting');
  }

  function handleContinue() {
    setTimeout(() => setState('connected'), 1500);
  }

  function handleSendTest() {
    setSendingTest(true);
    setTimeout(() => {
      setSendingTest(false);
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }, 1200);
  }

  function handleDisconnect() {
    setState('disconnected');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Telegram</h2>
        <p className="text-sm text-ink-500 mt-1">Receba alertas de validade diretamente pelo Telegram</p>
      </div>

      <div className="card p-6">
        {state === 'disconnected' && (
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center mb-4">
              <Send className="w-7 h-7 text-ink-400" />
            </div>
            <p className="text-sm font-medium text-ink-700">Telegram não conectado</p>
            <p className="text-xs text-ink-500 mt-1 max-w-sm">Conecte sua conta para receber alertas de validade automaticamente</p>
            <button onClick={handleConnect} className="btn-primary mt-4">
              <Send className="w-4 h-4" />
              Conectar Telegram
            </button>
          </div>
        )}

        {state === 'connecting' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
                <Send className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-800">Conecte sua conta do Telegram</p>
                <p className="text-xs text-ink-500 mt-0.5">Você será direcionado para o nosso bot oficial</p>
              </div>
            </div>
            <div className="rounded-lg bg-ink-50 border border-ink-200 p-4 text-sm text-ink-600">
              Após iniciar a conversa, sua conta será vinculada automaticamente. Você não precisa criar um bot ou inserir tokens.
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleContinue} className="btn-primary">
                <ExternalLink className="w-4 h-4" />
                Continuar para o Telegram
              </button>
              <button onClick={() => setState('disconnected')} className="btn-secondary">Cancelar</button>
            </div>
          </div>
        )}

        {state === 'connected' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
                <Check className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-800">Telegram conectado</p>
                <p className="text-xs text-ink-500 mt-0.5">Você receberá alertas neste chat</p>
              </div>
            </div>

            {/* Preview message */}
            <div className="rounded-lg bg-ink-50 border border-ink-200 p-4">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <div className="rounded-2xl bg-white border border-ink-200 px-3 py-2 text-sm text-ink-700 max-w-xs">
                  <p className="font-semibold text-error-600 text-xs">ALERTA DE VALIDADE</p>
                  <p className="font-medium mt-1">Ração Golden 15kg</p>
                  <p className="text-ink-600 text-xs">Lote ABC123</p>
                  <p className="mt-1">12 unidades vencem em 5 dias.</p>
                  <p className="mt-1 text-ink-600">Valor: R$ 1.080,00</p>
                  <p className="mt-1 text-ink-500 text-xs">Priorize a venda ou crie uma promoção.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleSendTest} disabled={sendingTest} className="btn-secondary">
                {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                {sendingTest ? 'Enviando...' : 'Enviar mensagem de teste'}
              </button>
              <button onClick={handleDisconnect} className="btn-ghost text-error-600 hover:bg-error-50">
                Desconectar
              </button>
              {testSent && (
                <span className="inline-flex items-center gap-1 text-sm text-success-600 font-medium">
                  <Check className="w-4 h-4" />
                  Mensagem enviada!
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
