"use client";

import { useState } from 'react';
import { NavBar } from '@/components/nav-bar';
import { RecommendationForm } from '@/components/recommendation-form';
import { RecommendationDisplay } from '@/components/recommendation-display';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Button } from '@/components/ui/button';
import { RefreshCw, FileText, History, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const [result, setResult] = useState<GenerateRecommendationsOutput | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavBar />
      <main className="container mx-auto flex-1 px-4 py-12">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Дашборд здоровья</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {result ? 'Просмотрите ваши персонализированные рекомендации' : 'Введите ваши данные для получения анализа'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2 border-primary text-primary hover:bg-primary/5">
              <History className="h-4 w-4" /> История
            </Button>
            {result && (
              <Button 
                variant="default" 
                onClick={() => setResult(null)}
                className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <RefreshCw className="h-4 w-4" /> Новый анализ
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-12 items-start">
          <div className={`${result ? 'lg:col-span-4' : 'lg:col-span-12 max-w-4xl mx-auto'}`}>
            <RecommendationForm onResult={setResult} />
            
            {!result && (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-3">
                  <div className="bg-primary/10 w-fit p-3 rounded-xl">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-bold">Точный анализ</h4>
                  <p className="text-sm text-muted-foreground">ИИ учитывает ваш рост, вес и возраст для ИМТ</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-3">
                  <div className="bg-secondary/10 w-fit p-3 rounded-xl">
                    <RefreshCw className="h-6 w-6 text-secondary" />
                  </div>
                  <h4 className="font-bold">Адаптивность</h4>
                  <p className="text-sm text-muted-foreground">Рекомендации меняются в зависимости от ваших целей</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-3">
                  <div className="bg-accent/10 w-fit p-3 rounded-xl">
                    <Sparkles className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h4 className="font-bold">Умные БАДы</h4>
                  <p className="text-sm text-muted-foreground">Подбор добавок на основе ваших лабораторных данных</p>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className="lg:col-span-8">
              <RecommendationDisplay data={result} />
            </div>
          )}
        </div>
      </main>
      <footer className="border-t py-12 bg-white/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 PRO Себя. Ваши данные защищены шифрованием.</p>
        </div>
      </footer>
    </div>
  );
}
