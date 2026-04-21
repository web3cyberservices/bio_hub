/**
 * @fileOverview Точка входа для Genkit Developer UI.
 * Здесь регистрируются все ИИ-потоки приложения для тестирования.
 */
import { config } from 'dotenv';
config();

// Импортируем все потоки, чтобы они стали доступны в Genkit UI
import '@/ai/flows/generate-personalized-recommendations.ts';
import '@/ai/flows/analyze-meal.ts';
import '@/ai/flows/ai-specialist-chat.ts';

console.log('--- BioTech AI Hub: Потоки зарегистрированы и готовы к работе ---');
