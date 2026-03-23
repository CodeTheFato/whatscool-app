import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface GenerateHomeworkParams {
  subject: string
  grade: string
  topic: string
  difficulty?: "EASY" | "MEDIUM" | "HARD"
  format?: "EXERCISES" | "TEXT" | "RESEARCH" | "PROJECT"
}

interface GenerateHomeworkResult {
  title: string
  description: string
}

const DIFFICULTY_MAP: Record<string, string> = {
  EASY: "fácil, com exercícios simples e diretos",
  MEDIUM: "moderada, com exercícios que exigem raciocínio",
  HARD: "desafiadora, com exercícios que exigem pensamento crítico",
}

const FORMAT_MAP: Record<string, string> = {
  EXERCISES: "lista de exercícios práticos",
  TEXT: "produção de texto ou redação",
  RESEARCH: "pesquisa para o aluno realizar",
  PROJECT: "projeto prático ou trabalho em grupo",
}

export const AIService = {
  async generateHomework(params: GenerateHomeworkParams): Promise<GenerateHomeworkResult> {
    const { subject, grade, topic, difficulty = "MEDIUM", format = "EXERCISES" } = params

    const difficultyDesc = DIFFICULTY_MAP[difficulty] || DIFFICULTY_MAP.MEDIUM
    const formatDesc = FORMAT_MAP[format] || FORMAT_MAP.EXERCISES

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Crie uma lição de casa para alunos do ${grade}.

Disciplina: ${subject}
Tema: ${topic}
Dificuldade: ${difficultyDesc}
Formato: ${formatDesc}

Responda EXATAMENTE neste formato JSON, sem nenhum texto adicional:
{
  "title": "Título curto e claro da lição de casa (máximo 100 caracteres)",
  "description": "Descrição completa da lição de casa com instruções claras para o aluno. Inclua os exercícios ou orientações detalhadas. Use quebras de linha para organizar."
}

Regras:
- Use linguagem adequada para a faixa etária do ${grade}
- Seja claro e objetivo nas instruções
- A descrição deve ser completa o suficiente para o aluno fazer sem ajuda adicional
- Não inclua gabarito ou respostas
- Responda apenas o JSON, sem markdown ou texto extra`,
        },
      ],
      system:
        "Você é um assistente pedagógico especializado em educação brasileira (infantil e fundamental). Seu papel é ajudar professores a criar lições de casa claras, engajantes e adequadas à faixa etária. Sempre responda em português brasileiro. Responda APENAS com o JSON solicitado, sem texto adicional.",
    })

    const content = message.content[0]
    if (content.type !== "text") {
      throw new Error("Resposta inesperada da IA")
    }

    try {
      const parsed = JSON.parse(content.text) as GenerateHomeworkResult
      return {
        title: parsed.title,
        description: parsed.description,
      }
    } catch {
      throw new Error("Erro ao processar resposta da IA")
    }
  },
}
