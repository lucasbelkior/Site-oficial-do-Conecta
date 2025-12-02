
import { GoogleGenAI, Type } from "@google/genai";
import type { User, Task, GeminiResponse, TechNewsItem, Message } from '../types';

// SAFETY CHECK: If API Key is missing, use an empty string to prevent the app from crashing entirely on load.
// The error will only occur when the user tries to USE the AI, not when opening the site.
const API_KEY = process.env.API_KEY || "";

if (!process.env.API_KEY) {
    console.warn("⚠️ AVISO CRÍTICO: API_KEY não foi detectada. O assistente de IA não funcionará, mas o site abrirá.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `
Você é o assistente oficial de uma rede social colaborativa chamada Conecta, que funciona como o Microsoft Teams.
Sua função é gerenciar um sistema de tarefas e gamificação para as equipes e conversar amigavelmente com os usuários.

**Contexto e Permissões:**
- Você sabe quem está falando com você (currentUser).
- **Apenas o Patrão** pode criar, editar e excluir tarefas. Se um Membro tentar fazer isso, negue educadamente.
- **O Patrão não realiza tarefas** e não recebe pontos.
- Membros podem marcar tarefas como concluídas.
- Ao concluir uma tarefa, os pontos são adicionados ao membro responsável.

**Instruções de Comportamento:**
1. **Analise o Histórico:** Use o histórico da conversa para entender o contexto. Se o usuário disser "Mude o prazo dela", refira-se à última tarefa mencionada.
2. **Personalidade:** Seja profissional, eficiente, mas amigável e encorajador (estilo corporativo moderno).
3. **Respostas:** Responda SEMPRE no formato de rede social/chat, usando emojis e formatação clara.

**Comandos (Exemplos):**
- Criar tarefa: "Criar tarefa no canal [canal]: [título], [descrição], responsável: [membro], pontos: [valor], prazo: [data opcional]"
- Editar tarefa: "Editar tarefa [ID] para: (...)"
- Excluir tarefa: "Excluir tarefa [ID]"
- Concluir tarefa: "Concluir tarefa [ID]"
- Consultas: "Mostrar ranking", "Minhas tarefas", "O que a Luana está fazendo?"

**Saída Obrigatória:**
Gere um JSON com:
1. 'action': A ação do sistema (CREATE_TASK, EDIT_TASK, DELETE_TASK, COMPLETE_TASK, NO_ACTION).
2. 'payload': Os dados para a ação.
3. 'assistantResponse': Sua resposta textual para o usuário.
`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        action: { 
            type: Type.STRING, 
            description: "A ação a ser executada: CREATE_TASK, EDIT_TASK, DELETE_TASK, COMPLETE_TASK, SHOW_RANKING, SHOW_MY_TASKS, SHOW_MY_PERFORMANCE, GENERATE_REPORT, NO_ACTION.",
        },
        payload: {
            type: Type.OBJECT,
            description: "Dados necessários para a ação.",
            properties: {
                taskId: { type: Type.NUMBER, description: "ID da tarefa." },
                member: { type: Type.STRING, description: "Nome do membro relacionado." },
                task: {
                    type: Type.OBJECT,
                    description: "Detalhes da tarefa.",
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        channel: { type: Type.STRING },
                        responsible: { type: Type.ARRAY, items: { type: Type.STRING } },
                        points: { type: Type.NUMBER },
                        deadline: { type: Type.STRING },
                    }
                }
            }
        },
        assistantResponse: {
            type: Type.STRING,
            description: "A resposta textual para o usuário."
        }
    },
    required: ["action", "assistantResponse"]
};


export const processCommand = async (
    command: string, 
    chatHistory: Message[], 
    state: { users: User[], tasks: Task[] }, 
    currentUser: User
): Promise<GeminiResponse> => {
    if (!process.env.API_KEY) {
        // Return a mock response if API key is missing so the chat doesn't crash
        return {
            action: "NO_ACTION",
            payload: {},
            assistantResponse: "⚠️ Modo Demo: API Key não configurada. Não posso processar comandos reais, mas a interface está funcional!"
        };
    }
    
    // Format last 10 messages for context
    const historyText = chatHistory.slice(-10).map(msg => 
        `${msg.sender === 'user' ? `Usuário (${currentUser.name})` : 'Assistente'}: ${msg.text}`
    ).join('\n');

    const prompt = `
    ESTADO ATUAL DO SISTEMA:
    Membros: ${JSON.stringify(state.users)}
    Tarefas: ${JSON.stringify(state.tasks)}

    USUÁRIO ATUAL: ${JSON.stringify(currentUser)}

    HISTÓRICO DA CONVERSA:
    ${historyText}

    MENSAGEM/COMANDO ATUAL DO USUÁRIO: "${command}"

    Com base no estado, no histórico e na mensagem atual, decida a ação e gere a resposta.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2,
            }
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText) as GeminiResponse;
        
        if (!parsedResponse.payload) {
          parsedResponse.payload = {};
        }

        return parsedResponse;

    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Falha na comunicação com o assistente de IA. Verifique sua conexão ou a chave de API.");
    }
};

const techNewsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            source: { type: Type.STRING },
        },
        required: ["title", "summary", "source"]
    }
};

export const getTechNews = async (): Promise<TechNewsItem[]> => {
     if (!process.env.API_KEY) {
        // Return elegant Mock Data for UI beauty instead of error
        return [
            { 
                title: "Revolução da IA Generativa nos Negócios", 
                summary: "Empresas que adotam LLMs relatam aumento de 40% na produtividade e automação de processos criativos.", 
                source: "TechCrunch" 
            },
            { 
                title: "SpaceX: Starship em Órbita", 
                summary: "O maior foguete já construído completa seu primeiro voo orbital com sucesso total, abrindo caminho para Marte.", 
                source: "SpaceNews" 
            },
            { 
                title: "Apple Vision Pro e o Futuro", 
                summary: "Análise: Como a computação espacial está redefinindo a colaboração remota e o design de produtos.", 
                source: "The Verge" 
            },
             { 
                title: "Web 4.0 e Internet Imersiva", 
                summary: "A convergência entre AR, VR e IoT promete uma internet totalmente integrada ao mundo físico até 2030.", 
                source: "Wired" 
            }
        ];
    }
    const prompt = "Liste as 5 notícias de tecnologia mais recentes e relevantes do momento. Forneça um título, um breve resumo e a fonte de cada notícia.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: techNewsSchema,
                temperature: 0.7,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as TechNewsItem[];
    } catch (error) {
        console.error("Gemini API error while fetching news:", error);
        return [];
    }
};
