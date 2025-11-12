import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Header } from '@/components/Header';
import { ProfileForm } from '@/components/ProfileForm';
import { PasswordForm } from '@/components/PasswordForm';
import Link from 'next/link';

export default async function PerfilPage() {
  // 1. Proteger a rota
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <Header user={session.user} />

      <main className="container p-4 mx-auto mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">Meu Perfil</h2>
          <Link
            href="/" // Linka de volta para a Home (Calendário)
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-800 transition-colors bg-white rounded-md hover:bg-gray-200"
          >
            {/* Ícone (copiado do PR #9) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            Voltar ao Calendário
          </Link>
        </div>
        
        {/* Grid para os formulários */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* 2. Formulário de Perfil (passa o usuário) */}
          <ProfileForm user={session.user} />

          {/* 3. Formulário de Senha */}
          <PasswordForm />
        </div>
      </main>
    </div>
  );
}