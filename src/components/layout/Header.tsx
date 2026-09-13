"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-border">
      <div className="container mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight text-lg">
            Geek
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/rankings" className="hover:text-foreground transition-colors">
              Rankings
            </Link>
            {session && (
              <>
                <Link href="/watchlist" className="hover:text-foreground transition-colors">
                  Watchlist
                </Link>
                <Link href="/diary" className="hover:text-foreground transition-colors">
                  Diario
                </Link>
                <Link href="/lists" className="hover:text-foreground transition-colors">
                  Listas
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href={`/profile/${session.user?.id}`}
                className="text-sm text-muted-foreground hidden sm:inline hover:text-foreground"
              >
                {session.user?.name}
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sair
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Cadastrar</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
