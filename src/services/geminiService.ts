import { GoogleGenAI, Type } from "@google/genai";
import { ICP_CRITERIA, METHODOLOGY } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface CompanyData {
  name: string;
  segment: string;
  employees: number;
  revenue: number;
  role: string;
  sdrCount: number;
  closerCount: number;
  description?: string;
}

export async function analyzeICP(company: CompanyData) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Chave de API do Gemini não encontrada. Por favor, configure-a no painel de Secrets (ícone de engrenagem -> Secrets).");
  }

  const prompt = `
    Você é um especialista em inteligência comercial da Valeur Consultoria.
    Analise se a seguinte empresa é um Perfil de Cliente Ideal (ICP) para a Valeur, baseando-se RIGOROSAMENTE nos filtros abaixo.
    
    CRITÉRIOS DE QUALIFICAÇÃO VALEUR:
    1. Segmentos Alvo: ${ICP_CRITERIA.segments.join(", ")}.
    2. RED FLAGS (DESQUALIFICAÇÃO IMEDIATA): ${ICP_CRITERIA.redFlags.join(", ")}.
    3. Tamanho da Empresa: Ideal entre ${ICP_CRITERIA.employeeRange.min} e ${ICP_CRITERIA.employeeRange.max} funcionários.
    4. Cargos Decisores: ${ICP_CRITERIA.roles.join(", ")}.
    5. Faturamento Mínimo: 
       - Geral: R$ 1.2M anual.
       - Energia Solar: R$ 3M anual.
    6. Estrutura Comercial Mínima:
       - Pelo menos ${ICP_CRITERIA.structure.minSDRs} SDRs/Pré-vendedores dedicados.
       - Pelo menos ${ICP_CRITERIA.structure.minClosers} Closer/Vendedor dedicado.
    
    DADOS DO PROSPECT:
    - Nome: ${company.name}
    - Segmento: ${company.segment}
    - Funcionários: ${company.employees}
    - Faturamento: R$ ${company.revenue}
    - Cargo do Contato: ${company.role}
    - Estrutura: ${company.sdrCount} SDRs e ${company.closerCount} Closers.
    - Descrição/Contexto: ${company.description || "N/A"}
    
    INSTRUÇÕES DE RETORNO:
    - Se o prospect tiver qualquer RED FLAG ou não atingir o faturamento/estrutura mínima, o score deve ser baixo e isICP deve ser false.
    - Retorne uma análise estruturada em JSON com:
      - score (0-100)
      - isICP (boolean)
      - reasons (array de strings justificando com base nos filtros)
      - recommendations (array de strings de próximos passos)
      - fitLevel (string: "Baixo", "Médio", "Alto", "Ideal")
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          isICP: { type: Type.BOOLEAN },
          reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          fitLevel: { type: Type.STRING }
        },
        required: ["score", "isICP", "reasons", "recommendations", "fitLevel"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function transcribeAndExtract(audioBase64: string, mimeType: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Chave de API do Gemini não encontrada. Por favor, configure-a no painel de Secrets (ícone de engrenagem -> Secrets).");
  }

  console.log("Iniciando processamento Gemini com MimeType:", mimeType);

  const prompt = `
    Você é um assistente de inteligência comercial sênior da Valeur Consultoria.
    Sua tarefa é analisar o arquivo de áudio/vídeo de uma call de vendas e extrair as informações para o "Formulário de Qualificação – Hunter".
    
    INSTRUÇÕES:
    1. Transcreva a conversa integralmente.
    2. Identifique os nomes dos participantes (Pré-vendedor, Closer, Prospect).
    3. Extraia os dados para o formulário abaixo. Se um dado não for mencionado, deixe como "Não identificado".
    4. Gere um resumo executivo focado em dores e próximos passos.

    CAMPOS DO FORMULÁRIO (Hunter):
    - preVendedor: Nome do pré-vendedor que agendou.
    - closer: Nome do closer responsável.
    - dataReuniao: Data agendada.
    - origemContato: Origem do lead (Outbound, Inbound, Indicação, etc).
    - nomeContato: Nome da pessoa contatada.
    - telefone: Telefone de contato.
    - email: E-mail de contato.
    - redesSociaisContato: LinkedIn/Instagram do contato.
    - nomeEmpresa: Nome da empresa.
    - segmentoEmpresa: Ramo de atuação.
    - redesSociaisEmpresa: LinkedIn/Instagram da empresa.
    - site: Site da empresa.
    - consultoriaAnterior: Se já contratou consultoria e como foi a experiência.
    - timeVendas: Estrutura atual do time de vendas (quantas pessoas, SDRs, Closers).
    - gestorDedicado: Se possui gestor comercial dedicado (Sim/Não).
    - geracaoDemanda: Como é feita a geração de demanda atual.
    - doresDesafios: Principais dores e desafios identificados na operação comercial.
    - decisoresNaReuniao: Se os tomadores de decisão estarão presentes na próxima reunião.
    - faturamentoAnual: Faturamento estimado da empresa.
    - qtdFuncionarios: Número total de colaboradores.
    - tempoDecisao: Prazo para decidir sobre a contratação da consultoria.
    - comentarioFinal: Observações relevantes e resumo do perfil.

    IMPORTANTE: O retorno deve ser um JSON válido.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: audioBase64
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcription: { type: Type.STRING },
            summary: { type: Type.STRING },
            formData: {
              type: Type.OBJECT,
              properties: {
                preVendedor: { type: Type.STRING },
                closer: { type: Type.STRING },
                dataReuniao: { type: Type.STRING },
                origemContato: { type: Type.STRING },
                nomeContato: { type: Type.STRING },
                telefone: { type: Type.STRING },
                email: { type: Type.STRING },
                redesSociaisContato: { type: Type.STRING },
                nomeEmpresa: { type: Type.STRING },
                segmentoEmpresa: { type: Type.STRING },
                redesSociaisEmpresa: { type: Type.STRING },
                site: { type: Type.STRING },
                consultoriaAnterior: { type: Type.STRING },
                timeVendas: { type: Type.STRING },
                gestorDedicado: { type: Type.STRING },
                geracaoDemanda: { type: Type.STRING },
                doresDesafios: { type: Type.STRING },
                decisoresNaReuniao: { type: Type.STRING },
                faturamentoAnual: { type: Type.STRING },
                qtdFuncionarios: { type: Type.STRING },
                tempoDecisao: { type: Type.STRING },
                comentarioFinal: { type: Type.STRING }
              }
            }
          },
          required: ["transcription", "formData", "summary"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("A IA não retornou nenhum conteúdo. Verifique se o arquivo é válido e tem áudio legível.");
    }
    
    console.log("Gemini Raw Response:", text);
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Erro detalhado no Gemini:", error);
    if (error.message?.includes("429")) {
      throw new Error("Limite de requisições atingido. Por favor, aguarde um momento e tente novamente.");
    }
    if (error.message?.includes("400")) {
      throw new Error("O arquivo enviado é inválido ou muito grande para ser processado diretamente.");
    }
    throw error;
  }
}

export async function generateDiagnostic(company: CompanyData, painPoints: string[]) {
  const prompt = `
    Você é um consultor sênior da Valeur Consultoria.
    Gere um diagnóstico comercial preliminar para a empresa ${company.name}.
    
    Metodologia Valeur:
    - 3 Pilares: ${METHODOLOGY.pillars.map(p => p.name).join(", ")}
    - Frameworks: ${METHODOLOGY.frameworks.map(f => f.name).join(", ")}
    
    Dores identificadas:
    ${painPoints.join("\n")}
    
    O diagnóstico deve ser profissional, direto e focado em resultados (previsibilidade e escala).
    Use o tom de voz da Valeur: Forte, Elegante, Inteligente.
    
    Retorne em Markdown.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });

  return response.text;
}
