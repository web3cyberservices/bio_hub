import { useState } from 'react';
import Image from 'next/image';
import { GenerateRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, Utensils, Pill, Flame, Beef, Droplets, Wheat, Activity, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface RecommendationDisplayProps {
  data: GenerateRecommendationsOutput;
}

export function RecommendationDisplay({ data }: RecommendationDisplayProps) {
  const { recommendations, macros, mealPlan } = data;
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  const getMealImage = (imageId: string) => {
    return PlaceHolderImages.find(img => img.id === imageId) || PlaceHolderImages[0];
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Калории', value: macros.calories, unit: 'ккал', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Белки', value: macros.protein, unit: 'г', icon: Beef, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Жиры', value: macros.fat, unit: 'г', icon: Droplets, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Углеводы', value: macros.carbs, unit: 'г', icon: Wheat, color: 'text-blue-500', bg: 'bg-blue-50' },
        ].map((stat, i) => (
          <Card key={i} className="premium-card border-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`${stat.bg} p-4 rounded-2xl`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-3xl font-bold">{stat.value}<span className="text-sm ml-1 opacity-50">{stat.unit}</span></p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Meal Plan Slider */}
      {mealPlan && mealPlan.length > 0 && (
        <Card className="premium-card overflow-hidden">
          <CardHeader className="px-8 pt-10 flex flex-row items-center justify-between border-b pb-8">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Рацион питания</CardTitle>
                <CardDescription className="font-medium">Сбалансированное меню на каждый день</CardDescription>
              </div>
            </div>
            {mealPlan.length > 1 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" disabled={selectedDayIdx === 0} onClick={() => setSelectedDayIdx(p => p - 1)} className="rounded-full">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-bold uppercase tracking-widest px-4">{mealPlan[selectedDayIdx].day}</span>
                <Button variant="outline" size="icon" disabled={selectedDayIdx === mealPlan.length - 1} onClick={() => setSelectedDayIdx(p => p + 1)} className="rounded-full">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {mealPlan[selectedDayIdx].meals.map((meal, idx) => {
              const mealImg = getMealImage(meal.imageId);
              return (
                <div key={idx} className="group flex flex-col md:flex-row gap-8 p-6 rounded-3xl hover:bg-muted/30 transition-all border border-transparent hover:border-border">
                  <div className="relative w-full md:w-56 h-40 shrink-0 rounded-2xl overflow-hidden shadow-lg">
                    <Image src={mealImg.imageUrl} alt={meal.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" data-ai-hint={mealImg.imageHint} />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px]">
                        {meal.time}
                      </Badge>
                      <span className="font-bold text-muted-foreground">{meal.calories} ккал</span>
                    </div>
                    <h4 className="text-2xl font-bold tracking-tight">{meal.name}</h4>
                    <p className="text-muted-foreground leading-relaxed font-medium">{meal.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Narrative Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {[
          { title: 'ОБРАЗ ЖИЗНИ', icon: HeartPulse, color: 'text-primary', content: recommendations.lifestyle, bg: 'bg-primary/5' },
          { title: 'ПИТАНИЕ', icon: Utensils, color: 'text-secondary', content: recommendations.diet, bg: 'bg-secondary/5' },
          { title: 'ДОБАВКИ', icon: Pill, color: 'text-destructive', content: recommendations.supplements, bg: 'bg-destructive/5' },
        ].map((section, idx) => (
          <Card key={idx} className="premium-card flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4 border-b pb-6 px-8 pt-8">
              <div className={`${section.bg} p-3 rounded-xl`}>
                <section.icon className={`h-6 w-6 ${section.color}`} />
              </div>
              <CardTitle className="text-lg font-bold uppercase tracking-widest">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex-1">
              <p className="text-base leading-relaxed text-muted-foreground font-medium whitespace-pre-wrap">
                {section.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
