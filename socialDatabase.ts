
import type { Conversation, Post } from './types';

export const initialConversations: Conversation[] = [
    {
        participantIds: ['u2', 'u3'], // Carlos and Luana
        messages: [
            { id: 'm1', senderId: 'u2', text: 'E aí Luana, tudo certo com o relatório?', timestamp: '2024-07-30T10:00:00Z' },
            { id: 'm2', senderId: 'u3', text: 'Opa, Carlos! Tudo sim, quase finalizando. Preciso só de mais uma informação do time de marketing.', timestamp: '2024-07-30T10:01:00Z' },
            { id: 'm3', senderId: 'u2', text: 'Beleza, se precisar de ajuda é só chamar!', timestamp: '2024-07-30T10:02:00Z' },
        ],
    },
    {
        participantIds: ['u2', 'u4'], // Carlos and Mari
        messages: [
            { id: 'm4', senderId: 'u4', text: 'Carlos, você viu o novo briefing do cliente X?', timestamp: '2024-07-29T14:30:00Z' },
        ],
    },
     {
        participantIds: ['u3', 'u4'], // Luana and Mari
        messages: [
            { id: 'm5', senderId: 'u3', text: 'Vamos almoçar juntas hoje?', timestamp: '2024-07-30T11:30:00Z' },
            { id: 'm6', senderId: 'u4', text: 'Vamos! Mesmo lugar de sempre?', timestamp: '2024-07-30T11:31:00Z' },
        ],
    },
];

export const initialPosts: Post[] = [
    {
        id: 'p1',
        authorId: 'u3', // Luana
        text: 'Animada para começar a semana com o novo projeto! 🚀 Acho que a nova funcionalidade vai ser um sucesso.',
        timestamp: '2024-08-01T09:15:00Z',
    },
    {
        id: 'p2',
        authorId: 'u4', // Mari
        text: 'Alguém tem indicação de um bom curso de React Avançado? Querendo me aprofundar nos Hooks.',
        timestamp: '2024-08-01T11:30:00Z',
    },
     {
        id: 'p3',
        authorId: 'u2', // Carlos
        text: 'Acabei de ler uma matéria sobre o futuro da IA generativa. Impressionante o que está por vir. Quem mais está acompanhando?',
        timestamp: '2024-08-01T14:00:00Z',
    },
];