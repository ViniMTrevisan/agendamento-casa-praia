'use client';

// Este é um STUB (esqueleto) por enquanto.
// A lógica real será implementada no PR #7.

export function Calendar() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <button className="px-3 py-1 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300">
          &lt; Anterior
        </button>
        <h3 className="text-xl font-semibold">Novembro 2025</h3>
        <button className="px-3 py-1 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300">
          Próximo &gt;
        </button>
      </div>

      {/* Placeholder da Grade do Calendário */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {/* Dias da semana */}
        <div className="font-semibold text-gray-500">Dom</div>
        <div className="font-semibold text-gray-500">Seg</div>
        <div className="font-semibold text-gray-500">Ter</div>
        <div className="font-semibold text-gray-500">Qua</div>
        <div className="font-semibold text-gray-500">Qui</div>
        <div className="font-semibold text-gray-500">Sex</div>
        <div className="font-semibold text-gray-500">Sáb</div>

        {/* Dias (placeholder) */}
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-center h-16 border border-gray-200 rounded-md"
          >
            {i + 1}
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-gray-500">
        (Lógica completa de reservas será implementada no PR #7)
      </p>
    </div>
  );
}