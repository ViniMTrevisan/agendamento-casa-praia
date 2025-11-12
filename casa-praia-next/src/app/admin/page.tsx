import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/Header';
import { AdminReservasList } from '@/components/AdminReservasList';
import Link from 'next/link';
import { format, isBefore, startOfToday, parseISO } from 'date-fns'; // <-- Importar 'format', 'isBefore' e 'parseISO'
import { ptBR } from 'date-fns/locale'; // <-- Importar locale

// Força a página a NUNCA usar cache (corrige o bug da "reserva fantasma")
export const revalidate = 0;

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    redirect('/'); 
  }

  // --- CORREÇÃO 1: REMOVER O FILTRO 'where' ---
  // Agora buscamos TODAS as reservas
  const todasReservas = await prisma.reservas.findMany({
    orderBy: {
      data: 'asc',
    },
    include: {
      usuario: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const today = startOfToday(); // Pega o início do dia em UTC (no servidor)

  // --- CORREÇÃO 2: PRÉ-FORMATAR DATAS NO SERVIDOR ---
  // Evita problemas de fuso horário convertendo a data UTC para string antes de formatar
  const reservasFormatadas = todasReservas.map(reserva => {
    // Pega a string ISO da data (ex: "2025-11-15T00:00:00.000Z")
    const dataISO = reserva.data.toISOString();
    // Extrai apenas a parte da data YYYY-MM-DD
    const dataStr = dataISO.split('T')[0]; // ex: "2025-11-15"
    // Parseia como data UTC para formatar corretamente
    const dataUTC = parseISO(dataStr);
    
    return {
      id: reserva.id,
      data_raw: dataISO, // A string UTC (para a API de delete)
      data_formatada: format(dataUTC, 'EEEE, dd/MM/yyyy', { locale: ptBR }), // A string de exibição
      isPast: isBefore(dataUTC, today), // O servidor checa se é passado
      usuario: reserva.usuario,
      usuario_id: reserva.usuario_id,
      nome_usuario: reserva.nome_usuario,
    };
  });
  // --- FIM DAS CORREÇÕES ---

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
        
        {/* Passa as reservas já formatadas e completas */}
        <AdminReservasList initialReservas={reservasFormatadas} />
      </main>
    </div>
  );
}