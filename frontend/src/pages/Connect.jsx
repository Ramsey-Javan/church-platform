import ConnectForm from '../components/ConnectForm';

export default function Connect() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <section className="max-w-2xl mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--color-sage)' }}>
          We’d love to hear from you
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight" style={{ color: 'var(--color-ink)' }}>
          Connect with the church
        </h1>
        <p className="mt-4 text-lg" style={{ color: 'var(--color-ink)', opacity: 0.78 }}>
          Share a prayer request, ask a question, or let us know how we can help.
        </p>
      </section>

      <ConnectForm />
    </main>
  );
}
