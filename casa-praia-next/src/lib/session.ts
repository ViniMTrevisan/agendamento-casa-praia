import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * Pega a sessão do usuário logado do lado do servidor (para API Routes)
 * e garante que o usuário exista no banco.
 * @returns O usuário (do banco) ou null se não estiver autenticado.
 */
export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  // Opcional, mas boa prática: verificar se o usuário da sessão
  // ainda existe no banco de dados.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return null;
  }

  // Retorna o usuário (sem o hash da senha) e o ID da sessão
  const { password_hash, ...userWithoutPassword } = user;
  return { ...userWithoutPassword, sessionId: session.user.id };
}