import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getSiteConfig } from "@/lib/cms";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

/** Only same-site admin paths are accepted as a post-login destination (prevents open redirects). */
const safeNext = (next?: string) => (next && /^\/admin(\/[\w\-/]*)?$/.test(next) && next !== "/admin/login" ? next : "/admin/dashboard");

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const admin = await getCurrentAdmin().catch(() => null);
  if (admin) redirect(safeNext(next));

  const { logo } = await getSiteConfig();
  const configured = Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32 && process.env.MONGODB_URI);

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <section className="grain relative hidden overflow-hidden bg-forest text-ivory lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden className="absolute -left-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald/60 blur-[120px]" />
        <p className="eyebrow relative text-gold">Goldenfalcone · Administration</p>
        <div className="relative">
          <Image src={logo} alt="Goldenfalcone emblem" width={220} height={220} className="h-52 w-52 object-contain" priority />
          <h1 className="mt-8 max-w-md text-5xl leading-[1.05]">
            One dashboard. <span className="italic text-champagne">Four businesses.</span>
          </h1>
        </div>
        <p className="relative text-xs uppercase tracking-[0.2em] text-champagne/60">Integrity · Loyalty · Respect · Strength · Legacy</p>
      </section>

      <section className="flex items-center justify-center bg-ivory px-5 py-16">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 lg:hidden">
            <Image src={logo} alt="" width={48} height={48} className="h-12 w-12 object-contain" />
            <span className="font-serif text-xl font-semibold tracking-[0.18em] text-forest">
              GOLDEN<span className="text-gold-dark">FALCONE</span>
            </span>
          </div>
          <h2 className="mt-8 text-4xl text-forest lg:mt-0">Sign in</h2>
          <p className="mt-2 text-sm text-muted">Access is restricted to authorised administrators.</p>

          {configured ? (
            <LoginForm next={safeNext(next)} />
          ) : (
            <div role="alert" className="mt-8 rounded-xl border border-gold/40 bg-champagne/25 p-4 text-sm leading-relaxed text-ink/80">
              Admin sign-in is not configured yet. Set <code className="font-mono text-xs">MONGODB_URI</code> and a{" "}
              <code className="font-mono text-xs">SESSION_SECRET</code> of at least 32 characters, then create an administrator
              with <code className="font-mono text-xs">npm run admin:create</code>.
            </div>
          )}

          <p className="mt-8 text-xs leading-relaxed text-muted">
            Forgotten your password? Ask the site owner to reset it with <code className="font-mono">npm run admin:reset-password</code>.
          </p>
        </div>
      </section>
    </main>
  );
}
