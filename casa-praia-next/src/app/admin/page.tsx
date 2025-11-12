import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/Header';
import { AdminReservasList } from '@/components/AdminReservasList'; // <-- Novo
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminPage() {
  // 1. Proteger a rota (redundância com o middleware)
  const session = await getServerSession(authOptions);
  // Redireciona se não estiver logado OU se não for ADMIN
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/'); // Redireciona para a home se não for admin
  }

  // 2. Buscar TODOS os dados no servidor
  const todasReservas = await prisma.reservas.findMany({
    orderBy: {
      data: 'asc',
    },
    // Inclui os dados do usuário que fez a reserva
    include: {
      usuario: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen">
      <Header user={session.user} />

      <main className="container p-4 mx-auto mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">
            Painel de Administração
          </h2>
          <Link
            href="/"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-800 transition-colors bg-white rounded-md hover:bg-gray-200"
          >
            Voltar ao Calendário
          </Link>
        </div>
        
        {/* 3. Passar os dados para o Componente de Cliente */}
        <AdminReservasList initialReservas={todasReservas} />
      </main>
    </div>
  );
}