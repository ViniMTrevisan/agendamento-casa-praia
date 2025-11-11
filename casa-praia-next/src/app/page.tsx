import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header'; // Criaremos este
import { Calendar } from '@/components/Calendar'; // Criaremos este

export default async function HomePage() {
  // 1. Obter a sessão no Servidor
  // Esta é a forma moderna e segura de obter a sessão no App Router
  const session = await getServerSession(authOptions);

  // 2. Proteger a rota
  if (!session || !session.user) {
    // Se não houver sessão, redireciona para a página de login
    redirect('/login');
  }

  // 3. Se a sessão existe, renderiza a página
  // Passamos o usuário para o Header
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Componente de Header (Server Component) */}
      <Header user={session.user} />

      {/* Conteúdo Principal */}
      <main className="container p-4 mx-auto mt-8">
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">
          Calendário de Reservas
        </h2>
        {/* Componente do Calendário (Client Component) */}
        <Calendar />
      </main>
    </div>
  );
}