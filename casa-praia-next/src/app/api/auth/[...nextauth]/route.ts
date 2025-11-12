import NextAuth from 'next-auth';
// Importa as opções do nosso novo arquivo
import { authOptions } from '@/lib/auth';

// (Toda a lógica foi movida para @/lib/auth)

// O arquivo agora só faz o handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };