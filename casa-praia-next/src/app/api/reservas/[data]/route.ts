import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

// Rota DELETE
export async function DELETE(
  req: Request,
  { params }: { params: { data: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const dataStr = params.data; // A data virá como 'YYYY-MM-DD'
    if (!dataStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return NextResponse.json({ error: 'Formato de data inválido' }, { status: 400 });
    }
    
    const data = new Date(`${dataStr}T00:00:00Z`);

    // 1. Verificar se a reserva existe
    const reserva = await prisma.reservas.findUnique({
      where: { data: data },
    });

    if (!reserva) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    // 2. Verificar se o usuário é o DONO da reserva
    if (reserva.usuario_id !== user.id) {
      return NextResponse.json(
        { error: 'Você só pode cancelar suas próprias reservas' },
        { status: 403 } // Forbidden
      );
    }

    // 3. Deletar a reserva
    await prisma.reservas.delete({
      where: { data: data },
    });

    return NextResponse.json({ message: 'Reserva cancelada com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}