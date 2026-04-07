"use client";

import { useState } from 'react';
import { NavBar } from '@/components/nav-bar';
import { RecommendationForm } from '@/components/recommendation-form';
import { RecommendationDisplay } from '@/components/recommendation-display';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Button } from '@/components/ui/button';
import { RefreshCw, History, UserCircle, Settings } from 'lucide-react';

export default function DashboardPage() {
  const [result, setResult] = useState<GenerateRecommendationsOutput | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FBFA]">
      <NavBar />
      <main className="container mx-auto flex-1 px-4 py-8 lg:py-12">
        <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              {result ? 'Ваш результат' : 'Дашборд'}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              {result ? 'Мы проанализировали ваши данные с помощью ИИ' : 'Заполните форму для получения персонального плана'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" className="rounded-2xl border-2 font-bold gap-2">
              <History className="h-5 w-5" /> История
            </Button>
            {result && (
              <Button 
                variant="default" 
                size="lg"
                onClick={() => setResult(null)}
                className="rounded-2xl bg-secondary font-bold gap-2 shadow-lg shadow-secondary/20"
              >
                <RefreshCw className="h-5 w-5" /> Изменить данные
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-12">
          {/* Левая панель - Форма */}
          <div className={`${result ? 'lg:col-span-4' : 'lg:col-span-12 max-w-4xl mx-auto w-full'} transition-all duration-500`}>
            <div className="sticky top-24">
              <RecommendationForm onResult={setResult} />
            </div>
          </div>

          {/* Правая панель - Результат */}
          {result && (
            <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
              <RecommendationDisplay data={result} />
            </div>
          )}
        </div>
      </main>
      
      <footer className="mt-20 border-t py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground font-medium">PRO Себя — ИИ-платформа для управления здоровьем.</p>
        </div>
      </footer>
    </div>
  );
}