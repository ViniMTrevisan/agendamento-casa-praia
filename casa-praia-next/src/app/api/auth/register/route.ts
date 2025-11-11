import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Schema de validação (Zod)
// E-mail agora é obrigatório
const registerSchema = z.object({
  username: z.string().min(3, "Username deve ter no mínimo 3 caracteres.").max(25),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres."),
  nome_completo: z.string().min(3, "Nome completo é obrigatório.").max(100),
  
  // E-mail é obrigatório e deve ser um e-mail válido
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validar o body
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      // Retorna a primeira mensagem de erro do Zod
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
      // Retorna qual campo está em conflito
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
    // 6. Tratamento de Erro (se o 'findFirst' falhar - race condition)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // 'P2002' é o código para 'Unique constraint failed'
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[]) || [];
        return new Response(
          JSON.stringify({
            error: `O campo '${target.join(', ')}' já está em uso.`,
          }),
          { status: 409 } // Conflict
        );
      }
    }

    // 7. Erro genérico
    console.error('Erro no registro:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
    });
  }
}