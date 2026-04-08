import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, Utensils, Pill, Sparkles, Flame, Beef, Droplets, Wheat, Activity, Info, Camera, ScanBarcode, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { UnifiedDataEntry } from '@/components/unified-data-entry';

interface RecommendationDisplayProps {
  data: GenerateRecommendationsOutput;
}

export function RecommendationDisplay({ data }: RecommendationDisplayProps) {
  const { recommendations, macros } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* Central Calorie Ring Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <Card className="border-none shadow-xl bg-white overflow-hidden p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-primary/5 p-4 rounded-3xl">
            <Utensils className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-black text-primary">{macros.calories}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Прием (ккал)</p>
          </div>
        </Card>

        <div className="relative flex flex-col items-center justify-center py-10">
          <div className="w-64 h-64 rounded-full border-[16px] border-muted flex flex-col items-center justify-center relative">
            <svg className="absolute inset-0 -rotate-90 w-full h-full">
              <circle
                cx="128"
                cy="128"
                r="112"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="16"
                strokeDasharray="703"
                strokeDashoffset="140"
                strokeLinecap="round"
                className="opacity-20"
              />
            </svg>
            <div className="text-center z-10">
              <p className="text-5xl font-black">{macros.calories}</p>
              <p className="text-sm font-bold text-muted-foreground">/ {macros.calories + 500} ккал</p>
              <Badge className="mt-4 bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full font-black">
                85% Цели
              </Badge>
            </div>
            <div className="absolute top-0 right-0 p-2 bg-white rounded-full shadow-lg border">
              <Info className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white overflow-hidden p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-secondary/10 p-4 rounded-3xl">
            <Activity className="h-8 w-8 text-secondary" />
          </div>
          <div>
            <p className="text-3xl font-black text-secondary">520</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Активность (ккал)</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex justify-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-white max-w-md mx-auto">
        <UnifiedDataEntry>
          <Button variant="ghost" size="icon" className="w-14 h-14 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 transition-all">
            <Camera className="h-6 w-6" />
          </Button>
        </UnifiedDataEntry>
        <Button variant="ghost" size="icon" className="w-14 h-14 rounded-2xl bg-muted/50 hover:bg-muted transition-all">
          <ScanBarcode className="h-6 w-6" />
        </Button>
        <UnifiedDataEntry>
          <Button variant="ghost" size="icon" className="w-14 h-14 rounded-2xl bg-muted/50 hover:bg-muted transition-all">
            <Plus className="h-6 w-6" />
          </Button>
        </UnifiedDataEntry>
        <Button variant="ghost" size="icon" className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary hover:bg-secondary/20 transition-all">
          <Activity className="h-6 w-6" />
        </Button>
      </div>

      {/* Detailed Nutrients */}
      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <CardHeader className="px-8 pt-8 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black">Нутриенты</CardTitle>
            <CardDescription className="font-medium">Ваше идеальное БЖУ</CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold text-[10px] tracking-widest">Анализ ИИ</Badge>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { label: 'Белки', value: macros.protein, target: macros.protein + 20, unit: 'г', icon: Beef, color: 'hsl(var(--primary))', bg: 'bg-primary/10' },
              { label: 'Углеводы', value: macros.carbs, target: macros.carbs + 50, unit: 'г', icon: Wheat, color: 'hsl(var(--secondary))', bg: 'bg-secondary/10' },
              { label: 'Жиры', value: macros.fat, target: macros.fat + 10, unit: 'г', icon: Droplets, color: 'hsl(var(--accent-foreground))', bg: 'bg-accent/20' },
            ].map((macro, i) => (
              <div key={i} className="flex flex-col items-center space-y-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="absolute inset-0 -rotate-90 w-full h-full">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                      className="opacity-50"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke={macro.color}
                      strokeWidth="8"
                      strokeDasharray="351"
                      strokeDashoffset={351 - (351 * (macro.value / macro.target))}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="text-center">
                    <p className="text-2xl font-black">{macro.value}<span className="text-xs ml-0.5">{macro.unit}</span></p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{macro.label}</p>
                  </div>
                </div>
                <div className="text-center w-full">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase mb-2">
                    <span>Текущее</span>
                    <span>Цель {macro.target}{macro.unit}</span>
                  </div>
                  <Progress value={(macro.value / macro.target) * 100} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Sections */}
      <div className="grid gap-6">
        {[
          { 
            title: 'Образ жизни', 
            content: recommendations.lifestyle, 
            icon: HeartPulse, 
            color: 'text-primary', 
            bg: 'bg-primary/5',
            badge: 'Сон и активность'
          },
          { 
            title: 'Питание', 
            content: recommendations.diet, 
            icon: Utensils, 
            color: 'text-secondary', 
            bg: 'bg-secondary/5',
            badge: 'Рацион'
          },
          { 
            title: 'Витамины и БАДы', 
            content: recommendations.supplements, 
            icon: Pill, 
            color: 'text-destructive', 
            bg: 'bg-destructive/5',
            badge: 'Поддержка'
          }
        ].map((section, idx) => (
          <Card key={idx} className="border-none shadow-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="bg-white border-b px-8 py-6 flex flex-row items-center gap-5">
              <div className={`${section.bg} p-4 rounded-3xl transition-transform group-hover:scale-110`}>
                <section.icon className={`h-8 w-8 ${section.color}`} />
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-2xl font-black tracking-tight">{section.title}</CardTitle>
                <Badge variant="secondary" className="w-fit font-bold text-[10px] uppercase tracking-widest bg-muted/50">{section.badge}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 bg-white/50">
              <p className="text-[17px] leading-[1.8] text-foreground/80 whitespace-pre-wrap font-medium">
                {section.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
