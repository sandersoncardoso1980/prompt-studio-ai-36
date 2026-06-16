export const TIPOS_MIDIA = [
  "Story Instagram (1080x1920)",
  "Feed Instagram (1080x1080)",
  "Feed Vertical (1080x1350)",
  "Carrossel Instagram",
  "Banner Website",
  "Facebook Ads",
  "Google Display",
  "Thumbnail YouTube",
  "Pinterest",
  "TikTok Cover",
  "WhatsApp Status",
  "Outdoor",
  "Catálogo de Produto",
  "Landing Page Hero",
] as const;

export const ESTILOS_VISUAIS = [
  "Premium Luxo",
  "Minimalista",
  "Cinematográfico",
  "Editorial de Revista",
  "Fashion",
  "Futurista",
  "Cyberpunk",
  "Vintage",
  "Retrô",
  "Dark Luxury",
  "Clean Moderno",
  "Corporativo",
  "Gourmet",
  "Imobiliário",
  "Fitness",
  "Tecnologia",
  "E-commerce",
  "Automotivo",
] as const;

export const ESTRUTURAS_VISUAIS = [
  "Editorial Magazine",
  "Sports Poster",
  "Luxury Advertisement",
  "Movie Poster",
  "Fashion Campaign",
  "Product Launch",
  "Corporate Branding",
  "Streetwear Poster",
  "Vintage Collage",
  "Premium Social Media Ad",
  "Editorial Collage (Premium)",
  "Hero Product Poster",
  "Cinematic Food Poster",
  "Floating Ingredients Poster",
  "Split Composition",
  "Streetwear Food Poster",
  "Luxury Food Poster",
] as const;

export const ESTRUTURA_BLUEPRINTS: Record<string, { artDirection: string; graphics: string; typography: string; palette: string }> = {
  "Editorial Magazine": {
    artDirection: "editorial magazine layout, refined visual hierarchy, premium print aesthetic, high-end art direction, clean grid composition",
    graphics: "editorial blocks, fine rule lines, page numbers, pull quotes, subtle paper grain",
    typography: "luxury editorial serif headlines, bold sans subheads, magazine cover hierarchy, refined kerning",
    palette: "off-white paper, deep ink black, accent burgundy, muted gold",
  },
  "Sports Poster": {
    artDirection: "sports editorial collage, grunge textures, paint strokes, halftone patterns, magazine cutouts, premium campaign design, dynamic composition",
    graphics: "torn paper edges, brush splashes, bold geometric overlays, stencil numbers, motion lines",
    typography: "ultra bold condensed display type, oversized numerals, stencil accents, aggressive headline hierarchy",
    palette: "high-contrast red, jet black, off-white, electric accent",
  },
  "Luxury Advertisement": {
    artDirection: "luxury branding, minimalist composition, premium visual identity, elegant typography, high-end advertising aesthetic",
    graphics: "subtle monogram, thin gold rules, delicate emblem, refined negative space",
    typography: "elegant high-fashion serif, wide tracking, restrained hierarchy",
    palette: "deep navy blue, matte black, metallic gold, off-white paper texture",
  },
  "Movie Poster": {
    artDirection: "cinematic movie poster, dramatic key art, hero composition, blockbuster campaign aesthetic, theatrical lighting",
    graphics: "title treatment block, credits ladder, tagline bar, lens flares",
    typography: "cinematic display title, condensed credits typography, dramatic hierarchy",
    palette: "deep teal, burnt orange, shadow black, highlight cream",
  },
  "Fashion Campaign": {
    artDirection: "high fashion campaign, editorial poise, runway atmosphere, couture art direction",
    graphics: "thin frame borders, brand wordmark, season tag, minimal labels",
    typography: "couture serif logotype, fine sans captions, fashion-house hierarchy",
    palette: "ivory, charcoal, blush, muted bronze",
  },
  "Product Launch": {
    artDirection: "hero product launch composition, centered subject, dramatic studio lighting, premium product photography, launch campaign layout",
    graphics: "feature callouts, subtle highlight bursts, product silhouette glow",
    typography: "bold launch headline, confident sans hierarchy, clean spec block",
    palette: "deep gradient backdrop, brand accent, polished metallic highlights",
  },
  "Corporate Branding": {
    artDirection: "corporate brand campaign, structured grid, confident professional layout, modern business aesthetic",
    graphics: "geometric brand shapes, line iconography, modular blocks",
    typography: "modern geometric sans, structured hierarchy, confident headline weight",
    palette: "corporate navy, fresh white, accent cyan, neutral graphite",
  },
  "Streetwear Poster": {
    artDirection: "streetwear poster, urban editorial collage, raw textures, drop campaign aesthetic, hype visual culture",
    graphics: "spray paint marks, sticker layers, barcode strips, handwritten tags, torn flyer scraps",
    typography: "bold streetwear display type, stencil accents, graffiti hand-lettering, oversized drop title",
    palette: "concrete gray, neon accent, jet black, washed cream",
  },
  "Vintage Collage": {
    artDirection: "vintage collage, retro magazine cutouts, analog paper textures, nostalgic art direction",
    graphics: "scissor-cut edges, tape pieces, halftone scans, aged paper grain, hand-drawn doodles",
    typography: "retro serif headlines, hand-set vintage type, pulp magazine hierarchy",
    palette: "sepia, mustard, faded teal, aged paper cream",
  },
  "Premium Social Media Ad": {
    artDirection: "premium social media ad, thumb-stopping composition, scroll-optimized hierarchy, conversion-driven layout",
    graphics: "bold CTA badge, contrast offer block, focal product highlight, subtle motion cues",
    typography: "ultra bold mobile-first headline, punchy subhead, clear CTA type",
    palette: "high-contrast brand colors, bold accent, clean negative space",
  },
  "Editorial Collage (Premium)": {
    artDirection: "mixed media collage, torn paper layers, halftone textures, magazine clipping style, paint splashes, brush strokes, graphic overlays, editorial typography, premium poster design, visual storytelling, luxury campaign aesthetic",
    graphics: "torn paper layers, magazine clippings, halftone patterns, paint splashes, brush strokes, handwritten notes, graphic overlays, decorative symbols",
    typography: "bold editorial headline typography, mixed serif and sans hierarchy, magazine cover layout, hand-lettered accents",
    palette: "rich editorial palette tuned to the chosen theme, layered with paper textures and ink accents",
  },
};

export const OBJETIVOS = [
  "Vendas",
  "Leads",
  "Branding",
  "Lançamento",
  "Promoção",
  "Remarketing",
  "Captação Local",
  "Engajamento",
] as const;

export const NIVEIS = ["Básico", "Profissional", "Agência Premium", "Ultra Premium"] as const;

export const PALETAS_SUGERIDAS = [
  "Preto e dourado",
  "Azul marinho e branco",
  "Vermelho e preto",
  "Tons pastéis",
  "Roxo neon",
  "Verde esmeralda e bege",
  "Off-white e terracota",
  "Cinza grafite e laranja",
];

export const TEMPLATES_NICHO = [
  { nome: "Pizza Artesanal Premium", ideia: "Quero anunciar uma pizza artesanal premium feita em forno a lenha, massa de fermentação natural, ingredientes selecionados.", estilo: "Gourmet", paleta: "Preto e dourado" },
  { nome: "Perfume Masculino de Luxo", ideia: "Anúncio de perfume masculino de luxo, frasco escuro com detalhes dourados, sofisticação e poder.", estilo: "Dark Luxury", paleta: "Preto e dourado" },
  { nome: "Imóvel Alto Padrão", ideia: "Lançamento de apartamento alto padrão com vista panorâmica e acabamento sofisticado.", estilo: "Imobiliário", paleta: "Azul marinho e branco" },
  { nome: "Academia Premium", ideia: "Captação de alunos para academia premium com equipamentos de última geração e personal trainers.", estilo: "Fitness", paleta: "Vermelho e preto" },
  { nome: "SaaS de Tecnologia", ideia: "Lançamento de plataforma SaaS de automação para empresas.", estilo: "Tecnologia", paleta: "Roxo neon" },
  { nome: "Carro Esportivo", ideia: "Anúncio de carro esportivo de luxo, performance e design arrojado.", estilo: "Automotivo", paleta: "Cinza grafite e laranja" },
];
