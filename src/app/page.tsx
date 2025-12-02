export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-4">Intercambio — Navidad</h1>
        <p className="text-lg text-muted mb-6">Bienvenido al panel de administración y sorteos de Amigo Secreto.</p>
        <div className="space-x-3">
          <a
            className="inline-block px-4 py-2 bg-foreground text-background rounded"
            href="/login"
          >
            Entrar
          </a>
          <a
            className="inline-block px-4 py-2 border rounded"
            href="/inicio"
          >
            Ver inicio
          </a>
        </div>
      </div>
    </main>
  );
}
