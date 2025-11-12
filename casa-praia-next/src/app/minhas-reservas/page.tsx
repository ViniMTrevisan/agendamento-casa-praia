import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/Header';
import { ReservasList } from '@/components/ReservasList';
import Link from 'next/link'; // <-- 1. Importar o Link

// (A importação 'Reservas' foi removida para compatibilidade com o CI)
// import type { Reservas } from '@prisma/client';

export default async function MinhasReservasPage() {
  // 1. Proteger a rota
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/login');
  }

  // 2. Buscar dados no servidor
  const reservas = await prisma.reservas.findMany({
    where: {
      usuario_id: session.user.id, // Filtra pelo usuário logado
    },
    orderBy: {
      data: 'asc', // Ordena da mais próxima para a mais distante
    },
  });

  return (
    <div className="min-h-screen">
      <Header user={session.user} />

      <main className="container p-4 mx-auto mt-8">
        {/* --- MUDANÇA AQUI: Adicionado 'flex' e o botão --- */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">
            Minhas Reservas
          </h2>

          <Link
            href="/" // Linka de volta para a Home (Calendário)
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-800 transition-colors bg-white rounded-md hover:bg-gray-200"
          >
            {/* Ícone simples de seta (opcional) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            Voltar ao Calendário
          </Link>
        </div>
        {/* --- FIM DA MUDANÇA --- */}

        {/* 3. Passar os dados para o Componente de Cliente */}
        <ReservasList initialReservas={reservas} />
      </main>
    </div>
  );
}