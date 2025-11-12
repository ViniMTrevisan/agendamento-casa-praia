import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import type { Reservas } from '@prisma/client';

// --- Rota GET (Listar Reservas) ---

export async function GET(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const reservas = await prisma.reservas.findMany({
      orderBy: { data: 'asc' },
    });

    const reservasMap: Record<string, any> = {};

    // --- CORREÇÃO 2: Adicionar o tipo '(reserva: Reservas)' ---
    reservas.forEach((reserva: Reservas) => {
      const dataKey = reserva.data.toISOString().split('T')[0];
      
      reservasMap[dataKey] = {
        nome_usuario: reserva.nome_usuario,
        usuario_id: reserva.usuario_id,
        is_owner: reserva.usuario_id === user.id,
      };
    });

    return NextResponse.json(reservasMap);
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// --- Rota POST (Criar Reservas Múltiplas) ---

const createReservasSchema = z.object({
  datas: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1),
});

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const validation = createReservasSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { datas } = validation.data;

    // --- CORREÇÃO 3: Adicionar o tipo '(dataStr: string)' ---
    const datasComoDate = datas.map((dataStr: string) => new Date(`${dataStr}T00:00:00Z`));

    // --- CORREÇÃO 4: Adicionar o tipo 'tx: Prisma.TransactionClient' ---
    const resultado = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      const conflitos = await tx.reservas.findMany({
        where: {
          data: { in: datasComoDate },
        },
      });

      if (conflitos.length > 0) {
        return {
          error: 'Datas já reservadas',
          // --- CORREÇÃO 5: Adicionar o tipo '(c: Reservas)' ---
          datas_ocupadas: conflitos.map((c: Reservas) => c.data.toISOString().split('T')[0]),
        };
      }

      const dadosParaCriar = datasComoDate.map((data) => ({
        data: data,
        usuario_id: user.id,
        nome_usuario: user.name || user.username || 'Usuário',
      }));

      await tx.reservas.createMany({
        data: dadosParaCriar,
      });

      return { success: true, count: dadosParaCriar.length };
    });

    if (resultado.error) {
      return NextResponse.json(
        { error: resultado.error, datas_ocupadas: resultado.datas_ocupadas },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json(
      { message: `${resultado.count} reservas criadas com sucesso` },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar reservas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}