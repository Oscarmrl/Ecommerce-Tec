export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0">
      <div className="text-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-soft border-t-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-primary/20 animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-lg font-medium text-primary">Cargando TechStore...</p>
        <p className="mt-2 text-sm text-secondary">Preparando la mejor experiencia tecnológica</p>
      </div>
    </div>
  );
}