import { Montserrat, Barlow } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/es.json";
import { getAssetPath } from "@/lib/assets";

/*
  TIPOGRAFÍAS
  ------------------------------------------------------------

  Montserrat:
  Se utiliza como tipografía principal para textos, formularios,
  tablas, botones, menús y navegación.

  Barlow:
  Se utiliza para títulos, subtítulos y encabezados institucionales.

  Las variables creadas aquí se conectan con las variables
  configuradas en globals.css:

  --font-heading: var(--font-barlow);
  --font-sans: var(--font-montserrat);
*/

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-barlow",

  /*
    Barlow no funciona como fuente variable en next/font,
    por eso debemos declarar los pesos que utilizaremos.

    500: títulos pequeños o destacados.
    600: subtítulos y encabezados.
    700: títulos principales.
  */
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "MINEDEC KIT UX / UI",
  description: "Base frontend y sistema de diseño de MINEDEC.",
  icons: [
    {
      url: getAssetPath("/favicon-light.svg"),
      href: getAssetPath("/favicon-light.svg"),
    }
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

import { AuthProvider } from "@/context/auth-context";

export default async function RootLayout({
  children,
}: RootLayoutProps) {
  // Exportación estática no permite cookies(). El script inyectado manejará el tema.
  const theme = "light";

  return (
    <html
      lang="es"
      data-theme={theme}
      className={cn(
        /*
          Se registran las dos variables tipográficas en el documento.
        */
        montserrat.variable,
        barlow.variable,

        /*
          Montserrat será la fuente predeterminada del proyecto.
        */
        "font-sans"
      )}
      suppressHydrationWarning
    >
      <body>
        <script
          id="theme-script"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem("glocation-theme");
                  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                  const theme = storedTheme || systemTheme;
                  document.documentElement.setAttribute("data-theme", theme);
                  if (!document.cookie.includes("glocation-theme=")) {
                    document.cookie = "glocation-theme=" + theme + "; path=/; max-age=31536000; SameSite=Lax";
                  }
                } catch (error) {}
              })();
            `,
          }}
        />
        <NextIntlClientProvider
          locale="es"
          messages={messages}
        >
          <AuthProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}