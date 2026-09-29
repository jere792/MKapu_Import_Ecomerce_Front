import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

type ServerClient = Awaited<ReturnType<typeof createServerSupabase>>;

type AuthResult = {
  user: User | null;
  isAdmin: boolean;
  supabase: ServerClient;
};

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // silencioso en Server Components de solo lectura
          }
        },
      },
    }
  );
}

export async function getServerSession(): Promise<AuthResult> {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, isAdmin: false, supabase };

  const meta = (user.app_metadata ?? {}) as Record<string, unknown>;

  return {
    user,
    isAdmin: meta.role === "admin",
    supabase,
  };
}

export async function requireAdmin(): Promise<AuthResult | null> {
  const session = await getServerSession();

  if (!session.user || !session.isAdmin) return null;

  return session;
}
