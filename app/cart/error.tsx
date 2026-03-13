"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto p-8 rounded-xl border border-soft bg-surface-1 text-center">
        <div className="text-4xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-primary mb-2">Error al cargar el carrito</h2>
        <p className="text-secondary mb-6">
          No se pudo cargar tu carrito de compras. Revisa tu conexión e intenta nuevamente.
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