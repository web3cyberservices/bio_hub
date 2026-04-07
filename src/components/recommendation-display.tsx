import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, Utensils, Pill, Sparkles, CheckCircle2 } from 'lucide-react';

interface RecommendationDisplayProps {
  data: GenerateRecommendationsOutput;
}

export function RecommendationDisplay({ data }: RecommendationDisplayProps) {
  const { recommendations } = data;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <div className="bg-accent/20 rounded-full p-4">
          <Sparkles className="h-10 w-10 text-secondary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ваши рекомендации готовы</h2>
        <p className="text-muted-foreground max-w-lg">
          На основе ваших параметров, образа жизни и анализов ИИ подготовил индивидуальный план.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Lifestyle */}
        <Card className="border-none shadow-lg overflow-hidden group">
          <CardHeader className="bg-primary/5 flex flex-row items-center gap-4 py-6 border-b transition-colors group-hover:bg-primary/10">
            <div className="bg-primary/20 p-3 rounded-xl">
              <HeartPulse className="h-8 w-8 text-primary" />
            </div>
            <div className="flex flex-col">
              <CardTitle className="text-2xl font-bold">Образ жизни</CardTitle>
              <Badge variant="secondary" className="w-fit mt-1">Активность и сон</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {recommendations.lifestyle}
            </p>
          </CardContent>
        </Card>

        {/* Diet */}
        <Card className="border-none shadow-lg overflow-hidden group">
          <CardHeader className="bg-secondary/5 flex flex-row items-center gap-4 py-6 border-b transition-colors group-hover:bg-secondary/10">
            <div className="bg-secondary/20 p-3 rounded-xl">
              <Utensils className="h-8 w-8 text-secondary" />
            </div>
            <div className="flex flex-col">
              <CardTitle className="text-2xl font-bold">Питание</CardTitle>
              <Badge variant="secondary" className="w-fit mt-1 bg-secondary/20 text-secondary hover:bg-secondary/30">Рацион и продукты</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {recommendations.diet}
            </p>
          </CardContent>
        </Card>

        {/* Supplements */}
        <Card className="border-none shadow-lg overflow-hidden group">
          <CardHeader className="bg-destructive/5 flex flex-row items-center gap-4 py-6 border-b transition-colors group-hover:bg-destructive/10">
            <div className="bg-destructive/20 p-3 rounded-xl">
              <Pill className="h-8 w-8 text-destructive" />
            </div>
            <div className="flex flex-col">
              <CardTitle className="text-2xl font-bold">Витамины и БАДы</CardTitle>
              <Badge variant="destructive" className="w-fit mt-1">Добавки и здоровье</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {recommendations.supplements}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-primary/5 rounded-2xl p-8 text-center border-2 border-dashed border-primary/20">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h4 className="font-bold text-xl mb-2">Важное примечание</h4>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Данные рекомендации сформированы искусственным интеллектом. Пожалуйста, проконсультируйтесь с лечащим врачом перед началом приема любых добавок или радикальным изменением образа жизни.
        </p>
      </div>
    </div>
  );
}
