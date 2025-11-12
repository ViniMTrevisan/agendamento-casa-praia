import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';
// --- CORREÇÃO 1: Remover a importação que falha ---
import { Prisma } from '@prisma/client';

// Schema de validação (Zod)
const registerSchema = z.object({
  username: z.string().min(3, "Username deve ter no mínimo 3 caracteres.").max(25),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres."),
  nome_completo: z.string().min(3, "Nome completo é obrigatório.").max(100),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validar o body
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Dados inválidos.';
      return new Response(
        JSON.stringify({ error: firstError }),
        { status: 400 }
      );
    }

    // Dados validados
    const { username, password, nome_completo, email } = validation.data;

    // 2. Verificar se o usuário OU o e-mail já existe
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { username: username },
          { email: email } 
        ] 
      },
    });

    if (existingUser) {
      const field = existingUser.username === username ? 'Username' : 'Email';
      return new Response(JSON.stringify({ error: `${field} já existe` }), {
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
        name: nome_completo, // 'name' é o campo no schema do NextAuth
        email: email,
      },
    });

    // 5. Retornar sucesso (sem o hash da senha)
    const { password_hash: _, ...userWithoutPassword } = newUser;

    return new Response(JSON.stringify(userWithoutPassword), { status: 201 });
    
  } catch (error) {
    
    // --- CORREÇÃO 2: Mudar o bloco CATCH ---
    // Usamos verificação de propriedade (type guard) em vez de 'instanceof'
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002' // P2002 é 'Unique constraint failed'
    ) {
      // O TS não sabe o tipo de 'meta', então usamos 'any' para ser pragmático
      const meta = (error as any).meta;
      const target = (meta?.target as string[]) || [];
      
      return new Response(
        JSON.stringify({
          error: `O campo '${target.join(', ')}' já está em uso.`,
        }),
        { status: 409 } // Conflict
      );
    }
    // --- FIM DA CORREÇÃO ---

    // 7. Erro genérico
    console.error('Erro no registro:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
    });
  }
}