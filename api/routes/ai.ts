import { Router } from 'express'
import OpenAI from 'openai'
import { supabase } from '../lib/supabase'
import { withTenant } from '../middleware/tenant.ts'

const router = Router()

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY não configurada.')
  return new OpenAI({ apiKey: key })
}

const SYSTEM_PROMPTS: Record<string, string> = {
  suggest_reply: `Você é um assistente de atendimento ao cliente para uma organização religiosa/pastoral.
Analise as mensagens da conversa e sugira uma resposta profissional, empática e acolhedora em português do Brasil.
Seja breve e objetivo. Responda apenas com o texto da mensagem sugerida, sem introduções ou explicações.`,

  summarize: `Você é um assistente especializado em sumarizar conversas de atendimento.
Analise as mensagens e crie um resumo conciso em português do Brasil com:
- Motivo do contato
- Pontos principais discutidos
- Status atual / próximos passos
Máximo 5 linhas.`,

  sentiment: `Você é um especialista em análise de sentimento.
Analise as mensagens do cliente na conversa e retorne em português do Brasil:
- Sentimento predominante: [Positivo/Neutro/Negativo/Misto]
- Intensidade: [Alto/Médio/Baixo]
- Resumo em 1-2 frases sobre o estado emocional do contato.`,

  pastoral_reply: `Você é um assistente pastoral experiente de uma organização cristã.
Analise a conversa e elabore uma resposta pastoral em português do Brasil: acolhedora, baseada em princípios bíblicos, encorajadora e prática.
Seja genuíno e compassivo. Responda apenas com o texto da mensagem pastoral, sem introduções.`,
}

// POST /api/ai/assist
router.post('/assist', ...withTenant(), async (req, res) => {
  try {
    const { conversation_id, action } = req.body as { conversation_id?: string; action?: string }

    if (!conversation_id || !action) {
      return res.status(400).json({ success: false, error: 'conversation_id e action são obrigatórios.' })
    }

    const systemPrompt = SYSTEM_PROMPTS[action]
    if (!systemPrompt) {
      return res.status(400).json({ success: false, error: `Ação desconhecida: ${action}` })
    }

    // Fetch last 30 messages from the conversation
    const { data: messages, error: msgErr } = await supabase
      .from('messages')
      .select('content, direction, created_at')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })
      .limit(30)

    if (msgErr) throw msgErr

    if (!messages || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Conversa sem mensagens.' })
    }

    // Format conversation for the AI
    const conversationText = messages
      .map(m => `[${m.direction === 'inbound' ? 'Cliente' : 'Atendente'}]: ${m.content}`)
      .join('\n')

    const openai = getOpenAI()

    const completion = await openai.chat.completions.create({
      model:       'gpt-4o-mini',
      max_tokens:  600,
      temperature: 0.7,
      messages: [
        { role: 'system',    content: systemPrompt },
        { role: 'user',      content: `Conversa:\n${conversationText}` },
      ],
    })

    const result = completion.choices[0]?.message?.content?.trim() ?? ''
    res.json({ success: true, result })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno.'
    console.error('[ai/assist]', message)
    res.status(500).json({ success: false, error: message })
  }
})

export default router
