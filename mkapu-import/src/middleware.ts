import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isProtectedApi(pathname: string, method: string) {
  if (pathname === "/api/empresa") return method === "POST";
  if (pathname === "/api/upload") return method === "POST";
  if (pathname === "/api/descargar-pdf") return method === "GET";
  return false;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  const protectedApi = isProtectedApi(
    request.nextUrl.pathname,
    request.method
  );

  if (!isAdminPath && !protectedApi) return response;

  const isAdmin =
    !!user && (user.app_metadata as Record<string, unknown>)?.role === "admin";

  if (protectedApi) {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }
    return response;
  }

  if (!isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/empresa", "/api/upload", "/api/descargar-pdf"],
};
