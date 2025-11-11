import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

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

    // O frontend antigo esperava um objeto (mapa)
    // Vamos replicar esse formato para facilitar o PR #7
    const reservasMap: Record<string, any> = {};

    reservas.forEach((reserva) => {
      // Formata a data para 'YYYY-MM-DD' (fuso UTC)
      const dataKey = reserva.data.toISOString().split('T')[0];
      
      reservasMap[dataKey] = {
        nome_usuario: reserva.nome_usuario,
        usuario_id: reserva.usuario_id,
        // Adiciona o campo 'is_owner' que o script.js original usava
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

// Schema de validação (Zod)
const createReservasSchema = z.object({
  // Espera um array de strings de data (YYYY-MM-DD)
  datas: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1),
  // O nome do usuário não é mais necessário, pegamos da sessão
});

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 1. Validar o body
    const validation = createReservasSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { datas } = validation.data;

    // Converte as strings de data (YYYY-MM-DD) para objetos Date (UTC)
    const datasComoDate = datas.map(dataStr => new Date(`${dataStr}T00:00:00Z`));

    // 2. Usar uma Transação do Prisma
    // Isso garante que ou TODAS as reservas são criadas, ou NENHUMA.
    const resultado = await prisma.$transaction(async (tx) => {
      // 2a. Verificar se alguma data já está reservada
      const conflitos = await tx.reservas.findMany({
        where: {
          data: { in: datasComoDate },
        },
      });

      if (conflitos.length > 0) {
        // Se houver conflito, cancele a transação
        return {
          error: 'Datas já reservadas',
          datas_ocupadas: conflitos.map(c => c.data.toISOString().split('T')[0]),
        };
      }

      // 2b. Preparar os dados para inserção
      const dadosParaCriar = datasComoDate.map(data => ({
        data: data,
        usuario_id: user.id,
        nome_usuario: user.name || user.username || 'Usuário', // Pega o nome da sessão
      }));

      // 2c. Criar todas as reservas
      await tx.reservas.createMany({
        data: dadosParaCriar,
      });

      return { success: true, count: dadosParaCriar.length };
    });

    // 3. Tratar o resultado da transação
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