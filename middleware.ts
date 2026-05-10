import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LANG_COOKIE = "apexpo_lang";

/** Same codes as marketing + onboarding pickers */
const VALID_LANGS = new Set(["en", "cs", "de", "pl", "es"]);

function hasLangCookie(request: NextRequest): boolean {
  const raw = request.cookies.get(LANG_COOKIE)?.value;
  return Boolean(raw && raw.trim());
}

function isStaticOrInternal(pathname: string): boolean {
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname.startsWith("/favicon")) return true;
  const last = pathname.split("/").pop() ?? "";
  if (last.includes(".")) return true;
  return false;
}

function isAllowedWithoutLang(pathname: string): boolean {
  if (pathname === "/onboarding/language") return true;
  const allowed = ["/signup", "/login", "/dashboard"] as const;
  return allowed.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const langParam = url.searchParams.get("lang");

  if (
    langParam &&
    VALID_LANGS.has(langParam) &&
    url.searchParams.has("lang")
  ) {
    url.searchParams.delete("lang");
    const cookieVal = request.cookies.get(LANG_COOKIE)?.value;

    if (cookieVal !== langParam) {
      const res = NextResponse.redirect(url);
      res.cookies.set(LANG_COOKIE, langParam, {
        path: "/",
        maxAge: 31536000,
        sameSite: "lax",
      });
      return res;
    }

    return NextResponse.redirect(url);
  }

  if (hasLangCookie(request)) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  if (isStaticOrInternal(pathname)) {
    return NextResponse.next();
  }

  if (isAllowedWithoutLang(pathname)) {
    return NextResponse.next();
  }

  const onboardUrl = request.nextUrl.clone();
  onboardUrl.pathname = "/onboarding/language";
  return NextResponse.redirect(onboardUrl);
}

export const config = {
  matcher: [
    /*
     * Include `/` and all non-_next paths. Static paths are filtered again in middleware
     * so extension-based public files skip the language gate.
     */
    "/",
    "/((?!_next/).*)",
  ],
};
