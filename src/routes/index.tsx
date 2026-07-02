import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Upload,
  Wand2,
  Copy,
  Download,
  FileJson,
  FileText,
  FileCode,
  Star,
  History,
  Trash2,
  Heart,
  Loader2,
  ImageIcon,
  X,
  Palette,
  Library,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

import { gerarPrompts, type GenerateOutput } from "@/lib/api/generate.functions";
import {
  TIPOS_MIDIA,
  ESTILOS_VISUAIS,
  ESTRUTURAS_VISUAIS,
  OBJETIVOS,
  NIVEIS,
  PALETAS_SUGERIDAS,
  TEMPLATES_NICHO,
} from "@/lib/promptads-constants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PromptAds AI — Prompts publicitários premium" },
      {
        name: "description",
        content:
          "Transforme uma ideia ou foto em prompts publicitários de alto padrão para Midjourney, Flux, SDXL, Ideogram, Leonardo e ChatGPT Images.",
      },
    ],
  }),
  component: Index,
});

type HistoryItem = {
  id: string;
  data: string;
  favorito: boolean;
  input: {
    ideia: string;
    tipoMidia: string;
    estiloVisual: string;
    estruturaVisual: string;
    paletaCores: string;
    publicoAlvo: string;
    objetivo: string;
    nivelDetalhe: string;
  };
  output: GenerateOutput;
};

const STORAGE_KEY = "promptads:history:v1";

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveHistory(items: HistoryItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100)));
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toMarkdown(o: GenerateOutput) {
  const meta = `# Campanha — ${o.tipo_midia}\n\n- **Estilo:** ${o.estilo_visual}\n- **Paleta:** ${o.paleta_cores}\n- **Objetivo:** ${o.objetivo}\n- **Público:** ${o.publico_alvo}\n\n---\n`;
  return (
    meta +
    o.prompts
      .map((p, i) => `## ${i + 1}. ${p.titulo}\n\n${p.prompt}\n`)
      .join("\n")
  );
}
function toTxt(o: GenerateOutput) {
  return o.prompts.map((p, i) => `### ${i + 1}. ${p.titulo}\n${p.prompt}`).join("\n\n");
}

function Index() {
  const gerar = useServerFn(gerarPrompts);

  const [ideia, setIdeia] = useState("");
  const [imagemBase64, setImagemBase64] = useState<string | null>(null);
  const [designSystem, setDesignSystem] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [nichoNegocio, setNichoNegocio] = useState("");
  const [tipoMidia, setTipoMidia] = useState<string>(TIPOS_MIDIA[1]);
  const [estiloVisual, setEstiloVisual] = useState<string>(ESTILOS_VISUAIS[0]);
  const [estruturaVisual, setEstruturaVisual] = useState<string>(ESTRUTURAS_VISUAIS[0]);
  const [paletaCores, setPaletaCores] = useState("Preto e dourado");
  const [publicoAlvo, setPublicoAlvo] = useState("");
  const [objetivo, setObjetivo] = useState<string>(OBJETIVOS[0]);
  const [nivelIdx, setNivelIdx] = useState<number>(2);
  const [useReferenceImage, setUseReferenceImage] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("ideia");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<GenerateOutput | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const nivelLabel = NIVEIS[nivelIdx];

  const isCarrossel = tipoMidia === "Carrossel Instagram";

  function handleFile(file: File) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 5MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImagemBase64(reader.result as string);
    reader.readAsDataURL(file);
  }

  const isDesignTab = activeTab === "design";

  async function onGenerate() {
    if (isDesignTab) {
      if (!designSystem.trim()) {
        toast.error("Descreva o Design System para gerar o prompt.");
        return;
      }
    } else if (!ideia.trim() && !imagemBase64 && !instagramHandle.trim() && !nichoNegocio.trim()) {
      toast.error("Informe uma ideia, imagem, @instagram ou nicho.");
      return;
    }
    setLoading(true);
    setResultado(null);
    try {
      const out = await gerar({
        data: {
          ideia,
          imagemBase64,
          designSystem,
          instagramHandle,
          nichoNegocio,
          tipoMidia,
          estiloVisual,
          estruturaVisual,
          paletaCores,
          publicoAlvo,
          objetivo,
          nivelDetalhe: nivelLabel,
          useReferenceImage,
        },
      });
      setResultado(out);
      const item: HistoryItem = {
        id: crypto.randomUUID(),
        data: new Date().toISOString(),
        favorito: false,
        input: { ideia, tipoMidia, estiloVisual, estruturaVisual, paletaCores, publicoAlvo, objetivo, nivelDetalhe: nivelLabel },
        output: out,
      };
      const next = [item, ...history];
      setHistory(next);
      saveHistory(next);
      toast.success("Prompts gerados com sucesso!");
    } catch (e: any) {
      toast.error(e?.message || "Falha ao gerar prompts.");
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    if (!resultado) return;
    navigator.clipboard.writeText(toTxt(resultado));
    toast.success("Prompts copiados!");
  }

  function applyTemplate(t: (typeof TEMPLATES_NICHO)[number]) {
    setIdeia(t.ideia);
    setEstiloVisual(t.estilo);
    setPaletaCores(t.paleta);
    toast.success(`Template "${t.nome}" aplicado.`);
  }

  function toggleFav(id: string) {
    const next = history.map((h) => (h.id === id ? { ...h, favorito: !h.favorito } : h));
    setHistory(next);
    saveHistory(next);
  }
  function removeHistory(id: string) {
    const next = history.filter((h) => h.id !== id);
    setHistory(next);
    saveHistory(next);
  }
  function duplicarHistorico(h: HistoryItem) {
    setIdeia(h.input.ideia);
    setTipoMidia(h.input.tipoMidia);
    setEstiloVisual(h.input.estiloVisual);
    setEstruturaVisual(h.input.estruturaVisual || ESTRUTURAS_VISUAIS[0]);
    setPaletaCores(h.input.paletaCores);
    setPublicoAlvo(h.input.publicoAlvo);
    setObjetivo(h.input.objetivo);
    setNivelIdx(Math.max(0, NIVEIS.indexOf(h.input.nivelDetalhe as any)));
    setResultado(h.output);
    toast.success("Projeto duplicado para edição.");
  }

  return (
    <div className="min-h-screen">
      <Header history={history} onPick={duplicarHistorico} onFav={toggleFav} onRemove={removeHistory} />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <Hero />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_minmax(0,1.1fr)]">
          {/* LEFT: form */}
          <Card className="border-border/60 bg-card/60 p-5 backdrop-blur">
            <Tabs defaultValue="ideia" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                <TabsTrigger value="ideia" className="gap-2">
                  <Wand2 className="h-4 w-4" /> Descrever ideia
                </TabsTrigger>
                <TabsTrigger value="imagem" className="gap-2">
                  <ImageIcon className="h-4 w-4" /> Enviar imagem
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ideia" className="mt-4">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Sua ideia</Label>
                <Textarea
                  value={ideia}
                  onChange={(e) => setIdeia(e.target.value)}
                  rows={5}
                  placeholder={'Ex: "Quero anunciar uma pizza artesanal premium" ou "Anúncio de perfume masculino de luxo"'}
                  className="mt-2 resize-none bg-background/50"
                />
              </TabsContent>

              <TabsContent value="imagem" className="mt-4">
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleFile(f);
                  }}
                  className="group relative flex h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-background/40 text-center transition hover:border-primary/60 hover:bg-background/60"
                >
                  {imagemBase64 ? (
                    <>
                      <img src={imagemBase64} alt="Pré-visualização" className="h-full w-full rounded-lg object-contain p-2" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImagemBase64(null); }}
                        className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-foreground/80 hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="h-7 w-7 text-muted-foreground transition group-hover:text-primary" />
                      <p className="mt-2 text-sm text-foreground">Clique ou arraste uma imagem</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG ou WEBP — até 5MB</p>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Você também pode combinar imagem + descrição abaixo.
                </p>
                <Textarea
                  value={ideia}
                  onChange={(e) => setIdeia(e.target.value)}
                  rows={3}
                  placeholder="Descreva contexto adicional sobre a imagem (opcional)"
                  className="mt-3 resize-none bg-background/50"
                />
              </TabsContent>
            </Tabs>

            <div className="mt-5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Design System (opcional)
              </Label>
              <Textarea
                value={designSystem}
                onChange={(e) => setDesignSystem(e.target.value)}
                rows={4}
                placeholder={'Ex: Tokens de cor (#0F172A bg, #E50914 accent), tipografia (Inter Bold headline / Inter Regular body), grid 12 col, radius 16px, sombras suaves, iconografia line, tom minimalista Apple-like...'}
                className="mt-2 resize-none bg-background/50 font-mono text-xs"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Descreva tokens, tipografia, grid, componentes, mood e regras visuais que a IA deve seguir rigorosamente.
              </p>
            </div>

            <div className="my-5 h-px bg-border/60" />

            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <Field label="Link do Instagram do estabelecimento (opcional)">
                <Input
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  placeholder="https://instagram.com/suamarca  ou  @suamarca"
                  className="bg-background/50"
                  inputMode="url"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Cole o link do perfil — a IA analisa paleta da logo, estilo visual, nicho, tom de voz e identidade da marca.
                </p>
              </Field>
              <Field label="Nicho / ramo (opcional)">
                <Input
                  value={nichoNegocio}
                  onChange={(e) => setNichoNegocio(e.target.value)}
                  placeholder="Ex: Pizzaria artesanal, Clínica estética, SaaS B2B"
                  className="bg-background/50"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tipo de mídia">
                <SelectInput value={tipoMidia} onChange={setTipoMidia} options={[...TIPOS_MIDIA]} />
              </Field>
              <Field label="Estilo visual">
                <SelectInput value={estiloVisual} onChange={setEstiloVisual} options={[...ESTILOS_VISUAIS]} />
              </Field>
              <Field label="Estrutura visual (direção de arte)">
                <SelectInput value={estruturaVisual} onChange={setEstruturaVisual} options={[...ESTRUTURAS_VISUAIS]} />
              </Field>
              <Field label="Paleta de cores">
                <Input
                  value={paletaCores}
                  onChange={(e) => setPaletaCores(e.target.value)}
                  placeholder="Ex: Preto e dourado"
                  className="bg-background/50"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PALETAS_SUGERIDAS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPaletaCores(p)}
                      className="rounded-full border border-border/60 bg-background/40 px-2.5 py-0.5 text-xs text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Público-alvo (opcional)">
                <Input
                  value={publicoAlvo}
                  onChange={(e) => setPublicoAlvo(e.target.value)}
                  placeholder="Ex: Mulheres 30+, Empresários"
                  className="bg-background/50"
                />
              </Field>
              <Field label="Objetivo da campanha">
                <SelectInput value={objetivo} onChange={setObjetivo} options={[...OBJETIVOS]} />
              </Field>
              <Field label={`Nível de detalhamento — ${nivelLabel}`}>
                <Slider
                  value={[nivelIdx]}
                  onValueChange={(v) => setNivelIdx(v[0])}
                  min={0}
                  max={3}
                  step={1}
                  className="py-3"
                />
                <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                  {NIVEIS.map((n) => (
                    <span key={n}>{n}</span>
                  ))}
            </div>

            <div className="mt-4 flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-background/40 p-3">
              <div className="min-w-0">
                <Label htmlFor="ref-image-toggle" className="text-sm font-medium">
                  Usar imagem de referência na IA geradora de imagem
                </Label>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Quando ativado, o prompt inclui instruções para Midjourney (--cref), Flux Kontext, ChatGPT Images e Ideogram preservarem composição, produto, pessoa e estilo da imagem de referência.
                </p>
              </div>
              <Switch
                id="ref-image-toggle"
                checked={useReferenceImage}
                onCheckedChange={setUseReferenceImage}
              />
            </div>
              </Field>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                onClick={onGenerate}
                disabled={loading}
                className="h-11 flex-1 bg-gradient-brand text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-95"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando…</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Gerar {isCarrossel ? "5 prompts (carrossel)" : "prompt"}</>
                )}
              </Button>

              <TemplatesDialog onPick={applyTemplate} />
            </div>
          </Card>

          {/* RIGHT: result */}
          <div className="space-y-4">
            {!resultado && !loading && <EmptyResult />}
            {loading && <LoadingResult />}
            {resultado && (
              <ResultBlock
                resultado={resultado}
                onCopy={copyAll}
                onTxt={() => download("promptads.txt", toTxt(resultado), "text/plain")}
                onJson={() => download("promptads.json", JSON.stringify(resultado, null, 2), "application/json")}
                onMd={() => download("promptads.md", toMarkdown(resultado), "text/markdown")}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        PromptAds AI · Prompts publicitários premium para criativos de alta conversão
      </footer>
    </div>
  );
}

function Header({
  history,
  onPick,
  onFav,
  onRemove,
}: {
  history: HistoryItem[];
  onPick: (h: HistoryItem) => void;
  onFav: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const favoritos = useMemo(() => history.filter((h) => h.favorito), [history]);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-brand shadow-lg shadow-primary/30">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-semibold tracking-tight">PromptAds <span className="text-primary">AI</span></h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Prompts publicitários premium</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <HistoryDialog
            title="Favoritos"
            icon={<Heart className="h-4 w-4" />}
            items={favoritos}
            onPick={onPick}
            onFav={onFav}
            onRemove={onRemove}
            emptyLabel="Sem favoritos ainda."
          />
          <HistoryDialog
            title="Histórico"
            icon={<History className="h-4 w-4" />}
            items={history}
            onPick={onPick}
            onFav={onFav}
            onRemove={onRemove}
            emptyLabel="Seu histórico aparece aqui."
          />
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="text-center">
      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
        Para Midjourney · Flux · SDXL · Ideogram · Leonardo
      </Badge>
      <h2 className="mt-4 bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
        Crie Prompts Publicitários Premium com IA
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground">
        Transforme uma ideia simples ou uma foto comum em campanhas visuais de nível profissional.
      </p>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-background/50">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function EmptyResult() {
  return (
    <Card className="flex h-full min-h-[420px] flex-col items-center justify-center border-dashed border-border/60 bg-card/40 p-8 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand shadow-xl shadow-primary/30">
        <Sparkles className="h-6 w-6 text-primary-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-medium">Seus prompts aparecerão aqui</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Descreva sua ideia ou envie uma imagem, configure a campanha e gere prompts publicitários de nível de agência.
      </p>
    </Card>
  );
}

function LoadingResult() {
  return (
    <Card className="flex h-full min-h-[420px] flex-col items-center justify-center border-border/60 bg-card/60 p-8 text-center">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <p className="mt-3 text-sm text-muted-foreground">Compondo direção de arte, iluminação e copy…</p>
    </Card>
  );
}

function ResultBlock({
  resultado,
  onCopy,
  onTxt,
  onJson,
  onMd,
}: {
  resultado: GenerateOutput;
  onCopy: () => void;
  onTxt: () => void;
  onJson: () => void;
  onMd: () => void;
}) {
  const [view, setView] = useState<"visual" | "json">("visual");
  return (
    <Card className="border-border/60 bg-card/60 p-5 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{resultado.tipo_midia}</Badge>
          <Badge variant="secondary">{resultado.estilo_visual}</Badge>
          {resultado.estrutura_visual && <Badge variant="outline" className="border-primary/40 text-primary">{resultado.estrutura_visual}</Badge>}
          {resultado.paleta_cores && <Badge variant="secondary">{resultado.paleta_cores}</Badge>}
          {resultado.objetivo && <Badge variant="secondary">{resultado.objetivo}</Badge>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant={view === "visual" ? "default" : "secondary"} onClick={() => setView("visual")}><FileText className="mr-1.5 h-3.5 w-3.5" />Visual</Button>
          <Button size="sm" variant={view === "json" ? "default" : "secondary"} onClick={() => setView("json")}><FileJson className="mr-1.5 h-3.5 w-3.5" />JSON</Button>
          <Button size="sm" variant="secondary" onClick={onCopy}><Copy className="mr-1.5 h-3.5 w-3.5" />Copiar</Button>
          <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(JSON.stringify(resultado, null, 2)); toast.success("JSON copiado!"); }}><FileJson className="mr-1.5 h-3.5 w-3.5" />Copiar JSON</Button>
          <Button size="sm" variant="secondary" onClick={onTxt}><FileText className="mr-1.5 h-3.5 w-3.5" />TXT</Button>
          <Button size="sm" variant="secondary" onClick={onJson}><FileJson className="mr-1.5 h-3.5 w-3.5" />JSON</Button>
          <Button size="sm" variant="secondary" onClick={onMd}><FileCode className="mr-1.5 h-3.5 w-3.5" />MD</Button>
        </div>
      </div>

      {view === "json" ? (
        <div className="mt-5 rounded-lg border border-border/60 bg-black/80 p-4">
          <pre className="overflow-x-auto text-xs leading-relaxed text-green-400">
            <code>{JSON.stringify(resultado, null, 2)}</code>
          </pre>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {resultado.prompts.map((p, i) => (
            <PromptCard key={i} index={i + 1} titulo={p.titulo} prompt={p.prompt} negative={p.negative_prompt} />
          ))}
        </div>
      )}
    </Card>
  );
}

function PromptCard({ index, titulo, prompt, negative }: { index: number; titulo: string; prompt: string; negative?: string }) {
  function copy() {
    navigator.clipboard.writeText(prompt);
    toast.success(`Prompt ${index} copiado!`);
  }
  function copyNeg() {
    if (!negative) return;
    navigator.clipboard.writeText(negative);
    toast.success(`Negative ${index} copiado!`);
  }
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-brand text-xs font-medium text-primary-foreground">
            {index}
          </span>
          <h4 className="text-sm font-medium">{titulo}</h4>
        </div>
        <Button size="sm" variant="ghost" onClick={copy}>
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="mt-3 rounded-lg border border-border/40 bg-black/70 p-3">
        <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed text-green-400">
          <code>{prompt}</code>
        </pre>
      </div>
      {negative && (
        <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-destructive">Negative prompt</p>
            <Button size="sm" variant="ghost" onClick={copyNeg} className="h-6 px-2 text-xs">
              <Copy className="mr-1 h-3 w-3" /> Copiar
            </Button>
          </div>
          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-xs text-muted-foreground">
            <code>{negative}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

function TemplatesDialog({ onPick }: { onPick: (t: (typeof TEMPLATES_NICHO)[number]) => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11">
          <Library className="mr-2 h-4 w-4" /> Templates por nicho
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Templates prontos por nicho</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          {TEMPLATES_NICHO.map((t) => (
            <button
              key={t.nome}
              onClick={() => onPick(t)}
              className="rounded-lg border border-border/60 bg-background/40 p-3 text-left transition hover:border-primary/60"
            >
              <p className="text-sm font-medium">{t.nome}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.ideia}</p>
              <div className="mt-2 flex gap-1.5">
                <Badge variant="secondary" className="text-[10px]">{t.estilo}</Badge>
                <Badge variant="secondary" className="text-[10px]"><Palette className="mr-1 h-3 w-3" />{t.paleta}</Badge>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HistoryDialog({
  title,
  icon,
  items,
  onPick,
  onFav,
  onRemove,
  emptyLabel,
}: {
  title: string;
  icon: React.ReactNode;
  items: HistoryItem[];
  onPick: (h: HistoryItem) => void;
  onFav: (id: string) => void;
  onRemove: (id: string) => void;
  emptyLabel: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          {icon} <span className="hidden sm:inline">{title}</span>
          {items.length > 0 && (
            <span className="rounded-full bg-primary/20 px-1.5 text-[10px] text-primary">{items.length}</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            {items.map((h) => (
              <div key={h.id} className="rounded-lg border border-border/60 bg-background/40 p-3">
                <div className="flex items-start justify-between gap-2">
                  <button onClick={() => onPick(h)} className="flex-1 text-left">
                    <p className="line-clamp-1 text-sm font-medium">
                      {h.input.ideia || "(a partir de imagem)"}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-[10px]">{h.input.tipoMidia}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{h.input.estiloVisual}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{h.input.objetivo}</Badge>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(h.data).toLocaleString("pt-BR")} · {h.output.prompts.length} prompt(s)
                    </p>
                  </button>
                  <div className="flex flex-col gap-1">
                    <Button size="icon" variant="ghost" onClick={() => onFav(h.id)} className="h-7 w-7">
                      <Star className={`h-3.5 w-3.5 ${h.favorito ? "fill-primary text-primary" : ""}`} />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onRemove(h.id)} className="h-7 w-7">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
