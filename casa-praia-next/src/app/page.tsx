import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { Calendar } from '@/components/Calendar';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    // REMOVEMOS o 'bg-gray-100' daqui
    <div className="min-h-screen">
      <Header user={session.user} />

      <main className="container p-4 mx-auto mt-8">
        {/*
          Vamos manter o título escuro por enquanto,
          pois o calendário (componente branco) está logo abaixo.
          Mudar para 'text-white' pode prejudicar a leitura.
        */}
        <h2 className="mb-6 text-2xl font-semibold text-white">
          Calendário de Reservas
        </h2>
        <Calendar />
      </main>
    </div>
  );
}