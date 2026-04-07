
import Link from 'next/link';
import { NavBar } from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf } from 'lucide-react';

export default function LoginPage() {
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
            <CardTitle className="text-3xl font-bold tracking-tight">Вход в PRO Себя</CardTitle>
            <CardDescription className="text-base">
              Введите свои данные или используйте Google
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button variant="outline" className="w-full h-12 text-base font-medium border-muted-foreground/20 hover:bg-muted/50 transition-colors" type="button">
              <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Войти через Google
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Или по почте</span>
              </div>
            </div>

            <form className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@example.com" />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Пароль</Label>
                  <Link href="#" className="text-sm text-primary hover:underline">Забыли?</Link>
                </div>
                <Input id="password" type="password" />
              </div>
              <Button className="w-full h-12 text-lg bg-primary hover:bg-primary/90 font-bold" type="submit">
                Войти
              </Button>
            </form>
            
            <div className="text-center text-sm">
              Нет аккаунта?{' '}
              <Link href="/register" className="text-primary hover:underline font-semibold">
                Зарегистрироваться
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
