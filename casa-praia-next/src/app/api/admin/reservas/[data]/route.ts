import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

// Rota DELETE (Somente Admin)
export async function DELETE(
  req: Request,
  { params }: { params: { data: string } }
) {
  // 1. (Defesa 1) O Middleware já rodou e verificou o token.
  
  // 2. (Defesa 2) Verificamos a role do usuário na API.
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const dataStr = params.data; // A data virá como 'YYYY-MM-DD'
    if (!dataStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return NextResponse.json({ error: 'Formato de data inválido' }, { status: 400 });
    }
    
    // Construímos um intervalo [startOfDay, nextDay) em UTC para evitar
    // problemas de comparação exata de Date (fuso horário / offsets).
    const startOfDay = new Date(`${dataStr}T00:00:00Z`);
    const nextDay = new Date(startOfDay);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    // 3. Deletar a(s) reserva(s) para aquele dia (qualquer usuário).
    // Usamos um range (gte/lt) em vez de igualdade direta para evitar
    // flakiness por causa de timezones/offsets na comparação.

    // DEBUG: verificar quantas reservas existem neste intervalo antes de deletar
    try {
      const found = await prisma.reservas.findMany({
        where: { data: { gte: startOfDay, lt: nextDay } },
      });
    } catch (e) {
      console.warn('Admin delete: erro ao listar reservas para debug', e);
    }

    const deleteResult = await prisma.reservas.deleteMany({
      where: {
        data: {
          gte: startOfDay,
          lt: nextDay,
        },
      },
    });

    // Se nada foi deletado, tentamos um fallback SQL que compara
    // diretamente com o tipo DATE do Postgres, já que às vezes a
    // comparação por Date/DateTime falha por causa de conversões.
    if (deleteResult.count === 0) {
      try {
        // Usamos $queryRaw com parâmetro para evitar injeção.
        const raw: any = await prisma.$queryRaw`
          DELETE FROM "Reservas" WHERE data = ${dataStr}::date RETURNING id
        `;

        if (!raw || raw.length === 0) {
          return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
        }
      } catch (err) {
        console.error('Fallback raw delete failed:', err);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'Reserva cancelada pelo Admin' });
  } catch (error) {
    console.error('Erro ao cancelar reserva (Admin):', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}