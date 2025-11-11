import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';

// Schema de validação com Zod
const registerSchema = z.object({
  username: z.string().min(3).max(25),
  password: z.string().min(6),
  nome_completo: z.string().min(3).max(100),
  email: z.string().email().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validar o body
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Dados inválidos', details: validation.error }),
        { status: 400 }
      );
    }

    const { username, password, nome_completo, email } = validation.data;

    // 2. Verificar se o usuário já existe
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: email || '' }] },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Username ou email já existe' }), {
        status: 409, // Conflict
      });
    }

    // 3. Hash da senha
    const password_hash = await hash(password, 12);

    // 4. Criar o usuário
    const newUser = await prisma.user.create({
      data: {
        username,
        password_hash,
        name: nome_completo,
        email: email || null,
      },
    });

    // Remover hash da resposta
    const { password_hash: _, ...userWithoutPassword } = newUser;

    return new Response(JSON.stringify(userWithoutPassword), { status: 201 });
  } catch (error) {
    console.error('Erro no registro:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
    });
  }
}