import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  ideia: z.string().max(4000).optional().default(""),
  imagemBase64: z.string().max(8_000_000).optional().nullable(),
  tipoMidia: z.string().min(1).max(80),
  estiloVisual: z.string().min(1).max(80),
  paletaCores: z.string().max(200).optional().default(""),
  publicoAlvo: z.string().max(200).optional().default(""),
  objetivo: z.string().min(1).max(80),
  nivelDetalhe: z.enum(["Básico", "Profissional", "Agência Premium", "Ultra Premium"]),
});

export type GenerateInput = z.infer<typeof Input>;

export interface PromptItem {
  titulo: string;
  prompt: string;
}

export interface GenerateOutput {
  tipo_midia: string;
  estilo_visual: string;
  paleta_cores: string;
  objetivo: string;
  publico_alvo: string;
  prompts: PromptItem[];
}

const SYSTEM = `Você é um diretor criativo sênior de uma agência publicitária premium internacional.
Sua especialidade é escrever prompts EXTREMAMENTE detalhados em PORTUGUÊS DO BRASIL para geradores de imagem por IA (Midjourney, Flux, SDXL, Ideogram, Leonardo, ChatGPT Images, Fooocus).

Regras inegociáveis:
- Responda SEMPRE em português do Brasil.
- Nunca repita textos genéricos. Reinterprete a ideia com criatividade publicitária de alto nível.
- Cada prompt deve cobrir: 1) Composição Visual (enquadramento, cenário, posição do produto, profundidade, elementos de apoio); 2) Direção de Arte (estilo, atmosfera, identidade da campanha); 3) Iluminação (luz principal, recorte, reflexos, sombras); 4) Fotografia (lente, profundidade de campo, hiper-realismo); 5) Copy integrada (headline, subheadline, CTA — em PT-BR, persuasiva); 6) Especificações da mídia (proporção e contexto); 7) Instruções de qualidade (hiper-realista, qualidade de agência, iluminação cinematográfica, alta conversão, acabamento profissional).
- Respeite a paleta de cores informada — ela DEVE aparecer explicitamente na descrição visual.
- Estilo de prompt deve ser fluente, descritivo, em parágrafos densos e cinematográficos — não use bullets dentro do prompt final.
- Para Carrossel Instagram, gere EXATAMENTE 5 prompts coesos: 1) Capa impactante, 2) Problema, 3) Solução, 4) Benefícios, 5) Chamada para ação — mantendo identidade visual, paleta e estilo idênticos em todos.
- Para qualquer outro tipo de mídia, gere 1 único prompt.
- Saída obrigatória em JSON válido conforme schema fornecido. Sem texto fora do JSON.`;

function userPrompt(d: GenerateInput) {
  const partes = [
    `Tipo de mídia: ${d.tipoMidia}`,
    `Estilo visual: ${d.estiloVisual}`,
    `Paleta de cores: ${d.paletaCores || "(escolher coerente com o estilo)"}`,
    `Objetivo da campanha: ${d.objetivo}`,
    `Público-alvo: ${d.publicoAlvo || "(não especificado, inferir)"}`,
    `Nível de detalhamento: ${d.nivelDetalhe} (quanto maior, mais detalhado, denso e cinematográfico)`,
    d.ideia ? `Ideia do anunciante: ${d.ideia}` : "Ideia: (derivar a partir da imagem enviada pelo usuário)",
    d.imagemBase64
      ? "O usuário enviou uma imagem de referência. Analise o produto/cenário e reinterprete em uma campanha premium, removendo qualquer aspecto amador e elevando para nível de agência."
      : "",
  ].filter(Boolean).join("\n");

  return `Crie o(s) prompt(s) publicitário(s) para a campanha abaixo. Saída APENAS em JSON válido com este schema:
{
  "tipo_midia": string,
  "estilo_visual": string,
  "paleta_cores": string,
  "objetivo": string,
  "publico_alvo": string,
  "prompts": [{ "titulo": string, "prompt": string }]
}

${partes}`;
}

export const gerarPrompts = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => Input.parse(v))
  .handler(async ({ data }): Promise<GenerateOutput> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY ausente no servidor.");

    const userContent: any[] = [{ type: "text", text: userPrompt(data) }];
    if (data.imagemBase64) {
      userContent.push({ type: "image_url", image_url: { url: data.imagemBase64 } });
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) throw new Error("Limite de requisições atingido. Tente novamente em instantes.");
    if (res.status === 402) throw new Error("Créditos de IA esgotados. Adicione créditos no workspace para continuar.");
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Falha na geração (${res.status}): ${txt.slice(0, 200)}`);
    }

    const json: any = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: GenerateOutput;
    try {
      parsed = JSON.parse(content);
    } catch {
      const m = content.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : ({} as GenerateOutput);
    }

    return {
      tipo_midia: parsed.tipo_midia || data.tipoMidia,
      estilo_visual: parsed.estilo_visual || data.estiloVisual,
      paleta_cores: parsed.paleta_cores || data.paletaCores,
      objetivo: parsed.objetivo || data.objetivo,
      publico_alvo: parsed.publico_alvo || data.publicoAlvo,
      prompts: Array.isArray(parsed.prompts) && parsed.prompts.length > 0 ? parsed.prompts : [{ titulo: "Prompt", prompt: content }],
    };
  });
