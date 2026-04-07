import Link from 'next/link';
import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Leaf } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <NavBar />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="mx-auto w-full max-w-md shadow-2xl border-none">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-xl bg-primary p-3 shadow-lg shadow-primary/20">
                <Leaf className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Создать аккаунт</CardTitle>
            <CardDescription className="text-base">
              Начните свой путь к здоровью сегодня
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base">Тип профиля</Label>
                <RadioGroup defaultValue="user" className="flex gap-4">
                  <div className="flex items-center space-x-2 rounded-lg border p-3 w-full cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="user" id="user" />
                    <Label htmlFor="user" className="cursor-pointer font-medium">Пользователь</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border p-3 w-full cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="specialist" id="specialist" />
                    <Label htmlFor="specialist" className="cursor-pointer font-medium">Специалист</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input id="name" placeholder="Иван Иванов" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="name@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input id="password" type="password" />
                </div>
              </div>
              <Button className="w-full h-12 text-lg bg-primary hover:bg-primary/90 font-bold" type="submit">
                Зарегистрироваться
              </Button>
              <div className="text-center text-sm">
                Уже есть аккаунт?{' '}
                <Link href="/login" className="text-primary hover:underline font-semibold">
                  Войти
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
