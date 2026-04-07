import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, Utensils, Pill, Sparkles, CheckCircle2, Flame, Beef, Droplets, Wheat } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface RecommendationDisplayProps {
  data: GenerateRecommendationsOutput;
}

export function RecommendationDisplay({ data }: RecommendationDisplayProps) {
  const { recommendations, macros } = data;

  const chartData = [
    { name: 'Белки', value: macros.protein, fill: 'hsl(var(--primary))' },
    { name: 'Жиры', value: macros.fat, fill: 'hsl(var(--secondary))' },
    { name: 'Углеводы', value: macros.carbs, fill: 'hsl(var(--accent-foreground))' },
  ];

  const chartConfig = {
    value: {
      label: 'Граммы',
    },
    protein: {
      label: 'Белки',
      color: 'hsl(var(--primary))',
    },
    fat: {
      label: 'Жиры',
      color: 'hsl(var(--secondary))',
    },
    carbs: {
      label: 'Углеводы',
      color: 'hsl(var(--accent-foreground))',
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header Info */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="bg-primary/10 rounded-full p-4 shadow-inner">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">Анализ завершен</h2>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Мы рассчитали ваши показатели и подготовили пошаговый план для достижения вашей цели.
          </p>
        </div>
      </div>

      {/* Macros Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Flame, label: 'Калории', value: macros.calories, unit: 'ккал', color: 'text-orange-600', bg: 'bg-orange-50' },
          { icon: Beef, label: 'Белки', value: macros.protein, unit: 'г', color: 'text-primary', bg: 'bg-primary/5' },
          { icon: Droplets, label: 'Жиры', value: macros.fat, unit: 'г', color: 'text-secondary', bg: 'bg-secondary/5' },
          { icon: Wheat, label: 'Углеводы', value: macros.carbs, unit: 'г', color: 'text-accent-foreground', bg: 'bg-accent/10' },
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className={`${item.bg} p-3 rounded-2xl`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{item.label}</p>
                <p className="text-2xl font-black">{item.value}{item.unit !== 'ккал' && <span className="text-sm ml-0.5">{item.unit}</span>}</p>
                {item.unit === 'ккал' && <p className="text-[10px] text-muted-foreground font-medium">в сутки</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid gap-6">
        {/* Chart Card */}
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-muted/30 border-b px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">Баланс нутриентов</CardTitle>
                <CardDescription>Оптимальное соотношение для вашего организма</CardDescription>
              </div>
              <Badge variant="outline" className="h-8 px-4 border-primary/20 text-primary font-bold">График БЖУ</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[280px] w-full">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fontSize: 13, fontWeight: 600, fill: 'hsl(var(--foreground))' }}
                      width={100}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip cursor={{ fill: 'transparent' }} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={45}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} className="opacity-90 hover:opacity-100 transition-opacity" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Text Recommendations */}
        <div className="space-y-6">
          {[
            { 
              title: 'Образ жизни', 
              content: recommendations.lifestyle, 
              icon: HeartPulse, 
              color: 'text-primary', 
              bg: 'bg-primary/10',
              badge: 'Сон и активность'
            },
            { 
              title: 'Питание', 
              content: recommendations.diet, 
              icon: Utensils, 
              color: 'text-secondary', 
              bg: 'bg-secondary/10',
              badge: 'Рацион'
            },
            { 
              title: 'Витамины и БАДы', 
              content: recommendations.supplements, 
              icon: Pill, 
              color: 'text-destructive', 
              bg: 'bg-destructive/10',
              badge: 'Поддержка'
            }
          ].map((section, idx) => (
            <Card key={idx} className="border-none shadow-xl overflow-hidden">
              <CardHeader className="bg-white border-b px-8 py-6 flex flex-row items-center gap-5">
                <div className={`${section.bg} p-3.5 rounded-2xl shadow-sm`}>
                  <section.icon className={`h-8 w-8 ${section.color}`} />
                </div>
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-2xl font-bold tracking-tight">{section.title}</CardTitle>
                  <Badge variant="secondary" className="w-fit font-medium text-[10px] uppercase tracking-wider">{section.badge}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 bg-white/50">
                <div className="prose prose-slate max-w-none">
                  <p className="text-[17px] leading-[1.7] text-foreground/80 whitespace-pre-wrap font-medium">
                    {section.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-primary/5 rounded-3xl p-10 text-center border-2 border-dashed border-primary/20 space-y-4">
        <div className="flex justify-center">
          <div className="bg-white rounded-full p-3 shadow-sm border border-primary/10">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="font-bold text-xl text-foreground">Персональный план готов к исполнению</h4>
          <p className="text-muted-foreground max-xl mx-auto leading-relaxed">
            Помните, что данные рекомендации носят информационный характер. Перед внесением радикальных изменений в свой образ жизни обязательно проконсультируйтесь со специалистом.
          </p>
        </div>
      </div>
    </div>
  );
}
