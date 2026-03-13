"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0">
      <div className="max-w-md p-8 rounded-xl border border-soft bg-surface-1 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-primary mb-2">Algo salió mal</h2>
        <p className="text-secondary mb-6">
          Ocurrió un error inesperado. Por favor, intenta de nuevo.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary-dark transition-colors"
        >
          Reintentar
        </button>
        <div className="mt-6 text-xs text-tertiary">
          <details>
            <summary className="cursor-pointer">Detalles del error</summary>
            <pre className="mt-2 p-3 bg-surface-2 rounded text-left overflow-auto">
              {error.message || "Error desconocido"}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}