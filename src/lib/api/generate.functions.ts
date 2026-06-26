import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ESTRUTURA_BLUEPRINTS } from "@/lib/promptads-constants";

const Input = z.object({
  ideia: z.string().max(4000).optional().default(""),
  imagemBase64: z.string().max(8_000_000).optional().nullable(),
  instagramHandle: z.string().max(80).optional().default(""),
  nichoNegocio: z.string().max(120).optional().default(""),
  tipoMidia: z.string().min(1).max(80),
  estiloVisual: z.string().min(1).max(80),
  estruturaVisual: z.string().min(1).max(80),
  paletaCores: z.string().max(200).optional().default(""),
  publicoAlvo: z.string().max(200).optional().default(""),
  objetivo: z.string().min(1).max(80),
  nivelDetalhe: z.enum(["Básico", "Profissional", "Agência Premium", "Ultra Premium"]),
});

export type GenerateInput = z.infer<typeof Input>;

export interface PromptItem {
  titulo: string;
  prompt: string;
  negative_prompt?: string;
}

export interface GenerateOutput {
  tipo_midia: string;
  estilo_visual: string;
  estrutura_visual: string;
  paleta_cores: string;
  objetivo: string;
  publico_alvo: string;
  prompts: PromptItem[];
}

const SYSTEM = `Você é um diretor criativo sênior de uma agência publicitária premium internacional, especialista em direção de arte de nível agência (capas de revistas, pôsteres esportivos, campanhas de luxo).
Sua especialidade é escrever prompts EXTREMAMENTE detalhados em PORTUGUÊS DO BRASIL para geradores de imagem por IA (Midjourney, Flux, SDXL, Ideogram, Leonardo, ChatGPT Images, Fooocus).

Regras inegociáveis:
- Responda SEMPRE em português do Brasil, mas PRESERVE em inglês as tags técnicas de direção de arte (ex: "hero composition, halftone patterns, premium campaign design") — elas devem aparecer como tags dentro do prompt.
- Nunca repita textos genéricos. Reinterprete a ideia com criatividade publicitária de alto nível.
- Cada prompt DEVE seguir o TEMPLATE UNIVERSAL DE DIREÇÃO DE ARTE com as 8 seções abaixo, em parágrafos densos e cinematográficos (sem bullets dentro do prompt, mas listando as tags de cada seção de forma fluente, separando seções com quebras de linha ou marcadores claros "1) ASSUNTO PRINCIPAL:", "2) COMPOSIÇÃO:", etc):
  1) ASSUNTO PRINCIPAL — objeto/pessoa/produto descrito em detalhe.
  2) COMPOSIÇÃO — hero composition, centered subject, visual hierarchy, asymmetrical balance, professional advertising layout, editorial composition.
  3) DIREÇÃO DE ARTE — tags específicas da Estrutura Visual escolhida (use o blueprint fornecido).
  4) ELEMENTOS GRÁFICOS — graphic overlays, decorative symbols, brush strokes, torn paper effects, handwritten notes, editorial blocks (ajustar à estrutura).
  5) PALETA DE CORES — paleta coerente com o estilo e a estrutura, citando cores explicitamente.
  6) TIPOGRAFIA — bold headline typography, luxury editorial fonts, advertising text hierarchy, magazine cover layout (ajustar à estrutura).
  7) QUALIDADE — sempre inclua: award-winning design, advertising masterpiece, ultra detailed, photorealistic, 8k resolution, professional art direction, agency-level campaign.
  8) NEGATIVE PROMPT — em campo separado "negative_prompt" contendo: blurry, low quality, watermark, distorted anatomy, poor composition, amateur design, oversaturated colors, ai artifacts.
- A paleta de cores informada DEVE aparecer explicitamente na seção 5.
- Para Carrossel Instagram, gere EXATAMENTE 5 prompts coesos (Capa, Problema, Solução, Benefícios, CTA) mantendo direção de arte, paleta e tipografia idênticas.
- Para qualquer outro tipo de mídia, gere 1 único prompt.
- Saída obrigatória em JSON válido conforme schema. Sem texto fora do JSON.`;

function userPrompt(d: GenerateInput) {
  const bp = ESTRUTURA_BLUEPRINTS[d.estruturaVisual] || {
    artDirection: d.estruturaVisual,
    graphics: "graphic overlays, decorative symbols",
    typography: "bold headline typography, advertising text hierarchy",
    palette: d.paletaCores || "coerente com o estilo",
  };

  const rawHandle = (d.instagramHandle || "").trim();
  let handle = "";
  if (rawHandle) {
    // Aceita URL completa (https://instagram.com/marca/?hl=pt) ou @handle
    const urlMatch = rawHandle.match(/instagram\.com\/([^/?#\s]+)/i);
    handle = (urlMatch ? urlMatch[1] : rawHandle).replace(/^@+/, "").replace(/\/+$/, "");
  }
  const profileUrl = handle ? `https://instagram.com/${handle}` : "";
  const instagramBlock = handle
    ? [
        `Perfil oficial do estabelecimento no Instagram: @${handle}`,
        `URL do perfil: ${profileUrl}`,
        `→ Faça uma ANÁLISE DE MARCA completa a partir do perfil informado e descreva os achados dentro do prompt:`,
        `   • PALETA DE CORES: deduza as cores predominantes da logo, feed e identidade visual (cite em HEX quando possível, ex: #1A1A1A, #E50914) e aplique RIGOROSAMENTE na seção 5.`,
        `   • ESTILO VISUAL: identifique se é minimalista, vintage, luxuoso, streetwear, orgânico, tech, fotográfico, ilustrado etc.`,
        `   • NICHO / RAMO: deduza o segmento de atuação (ex: gastronomia, moda, estética, fitness, SaaS, imobiliário).`,
        `   • TOM DE VOZ: formal, descontraído, premium, jovem, técnico, sofisticado.`,
        `   • PÚBLICO-ALVO provável e posicionamento da marca.`,
        `→ Se reconhecer a marca real, mantenha coerência com sua identidade verdadeira (cores oficiais, tipografia, estilo de campanha).`,
        `→ Se não reconhecer, derive hipóteses plausíveis a partir do @handle + nicho informado e descreva-as explicitamente.`,
      ].join("\n")
    : "";

  const partes = [
    `Tipo de mídia: ${d.tipoMidia}`,
    `Estilo visual: ${d.estiloVisual}`,
    `Estrutura Visual (direção de arte): ${d.estruturaVisual}`,
    `→ Blueprint — DIREÇÃO DE ARTE: ${bp.artDirection}`,
    `→ Blueprint — ELEMENTOS GRÁFICOS: ${bp.graphics}`,
    `→ Blueprint — TIPOGRAFIA: ${bp.typography}`,
    `→ Blueprint — PALETA SUGERIDA: ${bp.palette}`,
    `Paleta de cores escolhida: ${d.paletaCores || "(derivar da logo/identidade do Instagram informado ou do blueprint)"}`,
    d.nichoNegocio ? `Nicho / ramo de atuação: ${d.nichoNegocio}` : "",
    instagramBlock,
    `Objetivo da campanha: ${d.objetivo}`,
    `Público-alvo: ${d.publicoAlvo || "(não especificado, inferir a partir do nicho/Instagram)"}`,
    `Nível de detalhamento: ${d.nivelDetalhe} (quanto maior, mais denso e cinematográfico)`,
    d.ideia ? `Ideia do anunciante: ${d.ideia}` : "Ideia: (derivar a partir da imagem/Instagram/nicho informados)",
    d.imagemBase64
      ? "O usuário enviou uma imagem de referência (pode ser produto, cenário ou LOGO da marca). Se for logo, extraia a paleta de cores e o tom da identidade e aplique RIGOROSAMENTE na seção 5."
      : "",
  ].filter(Boolean).join("\n");

  return `Crie o(s) prompt(s) publicitário(s) com direção de arte de nível agência. Aplique RIGOROSAMENTE o TEMPLATE UNIVERSAL de 8 seções e use o blueprint da Estrutura Visual. Saída APENAS em JSON válido com este schema:
{
  "tipo_midia": string,
  "estilo_visual": string,
  "estrutura_visual": string,
  "paleta_cores": string,
  "objetivo": string,
  "publico_alvo": string,
  "prompts": [{ "titulo": string, "prompt": string, "negative_prompt": string }]
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
    const extractJson = (raw: string): any => {
      const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      const start = cleaned.indexOf("{");
      if (start === -1) return {};
      let depth = 0, inStr = false, esc = false;
      for (let i = start; i < cleaned.length; i++) {
        const c = cleaned[i];
        if (inStr) {
          if (esc) esc = false;
          else if (c === "\\") esc = true;
          else if (c === '"') inStr = false;
        } else {
          if (c === '"') inStr = true;
          else if (c === "{") depth++;
          else if (c === "}") {
            depth--;
            if (depth === 0) {
              const slice = cleaned.slice(start, i + 1);
              try { return JSON.parse(slice); }
              catch { return JSON.parse(slice.replace(/,\s*([}\]])/g, "$1")); }
            }
          }
        }
      }
      try { return JSON.parse(cleaned); } catch { return {}; }
    };
    let parsed: GenerateOutput;
    try { parsed = extractJson(content) as GenerateOutput; }
    catch { parsed = {} as GenerateOutput; }

    const prompts = Array.isArray(parsed.prompts) && parsed.prompts.length > 0 ? parsed.prompts : [{ titulo: "Prompt", prompt: content }];
    const isCatalogo = /catálogo|catalogo|catalog/i.test(data.tipoMidia);
    const isOutdoor = /outdoor|billboard/i.test(data.tipoMidia);

    const CATALOG_RULES = [
      "",
      "=== CATALOG_RULES (regras obrigatórias para Catálogo) ===",
      "Estrutura: retail catalog layout, product catalog, multi-product showcase, commercial merchandising, ecommerce catalog, product gallery, collection showcase, department store catalog, retail magazine layout, shopping catalog, product grid system.",
      "Regras obrigatórias:",
      "- Display 12 to 30 different products simultaneously.",
      "- No single product dominance.",
      "- Multi-product retail composition.",
      "- All products clearly visible.",
      "- Catalog-focused visual hierarchy.",
      "- Commercial product presentation.",
      "- Product grid organization.",
    ].join("\n");

    const OUTDOOR_RULES = [
      "",
      "=== OUTDOOR_RULES (regras obrigatórias para Outdoor) ===",
      "Gerar EXCLUSIVAMENTE a ARTE GRÁFICA FINAL do outdoor — um arquivo de criação publicitária 2D pronto para impressão, NÃO uma fotografia/mockup do outdoor instalado.",
      "Tags obrigatórias: professional billboard artwork design, flat 2D advertising composition, print-ready billboard layout, horizontal advertising canvas, front-facing graphic design, large format campaign artwork, flat artwork, frontal composition, no perspective, pure graphic design file.",
      "Regras obrigatórias:",
      "- Composição frontal plana (flat artwork), sem perspectiva nem profundidade física.",
      "- Mostrar APENAS o design da peça publicitária, ocupando todo o canvas horizontal.",
      "- Tratar o outdoor como uma grande tela publicitária horizontal (proporção ~ 3:1).",
      "- NÃO fotografar um outdoor instalado.",
      "- NÃO criar mockup em avenida, rua, estrada, prédio, fachada ou ambiente urbano.",
      "- NÃO adicionar moldura, suporte metálico, poste, estrutura física, céu, pedestres ou carros ao redor.",
      "- Entregar a arte como se fosse o arquivo final enviado para a gráfica.",
    ].join("\n");

    // Substituições e remoções para Catálogo
    const CATALOG_REPLACEMENTS: Array<[RegExp, string]> = [
      [/hero composition/gi, "multi-product catalog layout"],
      [/featured subject/gi, "retail product grid"],
      [/central[- ]weighted subject/gi, "catalog composition"],
      [/single model/gi, "product showcase layout"],
      [/magazine cover/gi, "multi-product catalog layout"],
      [/cover layout/gi, "catalog composition"],
      [/hero product/gi, "retail product grid"],
    ];

    const CATALOG_BRANDING_REMOVE: RegExp[] = [
      /brand identity presentation board/gi,
      /branding showcase/gi,
      /visual identity system/gi,
      /brand book layout/gi,
      /creative agency presentation/gi,
      /behance featured project/gi,
      /branding ecosystem/gi,
      /comprehensive branding showcase/gi,
      /corporate identity showcase/gi,
      /brand guidelines/gi,
    ];

    // Remoções para Outdoor — eliminar qualquer referência a mockup/cenário físico
    const OUTDOOR_REMOVE: RegExp[] = [
      /billboard mockup/gi,
      /outdoor mockup/gi,
      /billboard installed[^,.;\n]*/gi,
      /mounted billboard/gi,
      /billboard on (?:a |the )?(?:building|street|avenue|highway|road|wall|facade)[^,.;\n]*/gi,
      /(?:city|urban|street|avenue|highway|rooftop) (?:scene|background|environment|setting)[^,.;\n]*/gi,
      /metal frame/gi,
      /steel structure/gi,
      /billboard pole/gi,
      /lamp post/gi,
      /pedestrians?/gi,
      /passing cars?/gi,
      /sky background/gi,
      /perspective view/gi,
      /3d perspective/gi,
      /angled view/gi,
      /environmental mockup/gi,
    ];

    const OUTDOOR_REPLACEMENTS: Array<[RegExp, string]> = [
      [/billboard photograph/gi, "flat billboard artwork"],
      [/billboard installation/gi, "flat billboard artwork"],
      [/outdoor advertisement on/gi, "flat billboard artwork featuring"],
    ];

    const sanitizeCatalog = (text: string): string => {
      let out = text;
      for (const re of CATALOG_BRANDING_REMOVE) out = out.replace(re, "");
      for (const [re, rep] of CATALOG_REPLACEMENTS) out = out.replace(re, rep);
      return out.replace(/,\s*,+/g, ",").replace(/\s{2,}/g, " ").replace(/\s+([,.;])/g, "$1");
    };

    const sanitizeOutdoor = (text: string): string => {
      let out = text;
      for (const re of OUTDOOR_REMOVE) out = out.replace(re, "");
      for (const [re, rep] of OUTDOOR_REPLACEMENTS) out = out.replace(re, rep);
      return out.replace(/,\s*,+/g, ",").replace(/\s{2,}/g, " ").replace(/\s+([,.;])/g, "$1");
    };

    const processedPrompts = prompts.map((p) => {
      let prompt = p.prompt;
      let negative = p.negative_prompt || "";

      if (isCatalogo) {
        prompt = sanitizeCatalog(prompt) + "\n" + CATALOG_RULES;
        negative = [negative, "single product focus, hero product, brand identity board, branding presentation, visual identity system, brand book, single subject dominance"].filter(Boolean).join(", ");
      }

      if (isOutdoor) {
        prompt = sanitizeOutdoor(prompt) + "\n" + OUTDOOR_RULES;
        negative = [negative, "billboard mockup, installed billboard, billboard on building, billboard on street, urban scene, city background, metal frame, billboard pole, lamp post, pedestrians, cars, sky background, perspective view, 3d perspective, angled view, environmental mockup, photograph of billboard, real-world installation, physical structure, scaffolding, facade"].filter(Boolean).join(", ");
      }

      return { ...p, prompt, negative_prompt: negative };
    });


    return {
      tipo_midia: parsed.tipo_midia || data.tipoMidia,
      estilo_visual: parsed.estilo_visual || data.estiloVisual,
      estrutura_visual: parsed.estrutura_visual || data.estruturaVisual,
      paleta_cores: parsed.paleta_cores || data.paletaCores,
      objetivo: parsed.objetivo || data.objetivo,
      publico_alvo: parsed.publico_alvo || data.publicoAlvo,
      prompts: processedPrompts,
    };
  });
