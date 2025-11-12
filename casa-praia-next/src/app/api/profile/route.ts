import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { hash, compare } from 'bcryptjs';

// Schema para atualizar o nome
const profileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
});

// Schema para atualizar a senha
const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Senha antiga é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
});

export async function PATCH(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user || !user.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await req.json();

  // --- Cenário 1: Atualizar o Nome ---
  if ('name' in body) {
    const validation = profileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: validation.data.name },
      });
      return NextResponse.json({ message: 'Nome atualizado com sucesso' });
    } catch (error) {
      return NextResponse.json(
        { error: 'Erro ao atualizar o nome' },
        { status: 500 }
      );
    }
  }

  // --- Cenário 2: Atualizar a Senha ---
  if ('oldPassword' in body && 'newPassword' in body) {
    const validation = passwordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { oldPassword, newPassword } = validation.data;

    try {
      // 1. Pega o hash da senha atual do banco
      const userFromDb = await prisma.user.findUnique({
        where: { id: user.id },
      });
      
      if (!userFromDb?.password_hash) {
        return NextResponse.json({ error: 'Conta não configurada para login com senha' }, { status: 400 });
      }

      // 2. Compara a senha antiga
      const isOldPasswordValid = await compare(
        oldPassword,
        userFromDb.password_hash
      );

      if (!isOldPasswordValid) {
        return NextResponse.json({ error: 'Senha antiga incorreta' }, { status: 401 });
      }

      // 3. Hash da nova senha
      const newPasswordHash = await hash(newPassword, 12);

      // 4. Salva a nova senha
      await prisma.user.update({
        where: { id: user.id },
        data: { password_hash: newPasswordHash },
      });

      return NextResponse.json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
      return NextResponse.json(
        { error: 'Erro ao atualizar a senha' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 });
}