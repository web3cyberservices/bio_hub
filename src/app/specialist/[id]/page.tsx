'use client';

import { useParams, useRouter } from 'next/navigation';
import { SpecialistPublicProfile } from '@/components/specialist-public-profile';
import { NavBar } from '@/components/nav-bar';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview Публичная страница специалиста.
 * Позволяет просматривать профиль специалиста по прямой ссылке /specialist/[id]
 */
export default function SpecialistPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useUser();
  const id = params.id as string;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white overflow-x-hidden">
      <NavBar />
      <main className="container mx-auto pt-32 pb-20 px-4 md:px-6">
        <SpecialistPublicProfile 
          specialistId={id} 
          onBack={() => router.back()} 
          onStartChat={(chatId) => {
            // Если пользователь авторизован, переходим в чат на дашборде
            router.push(`/dashboard?activeChat=${chatId}`);
          }}
        />
      </main>
    </div>
  );
}
