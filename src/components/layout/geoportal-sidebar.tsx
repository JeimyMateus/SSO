"use client";

/**
 * @component GeoportalSidebar
 * @description Menú de navegación lateral flotante (Sidebar) del Design System MINEDEC.
 * Basado al 100% en las especificaciones del UI Kit (sidebar-showcase).
 */

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  AppWindow,
  ChevronRight,
  PanelLeft,
  X,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  History,
  LogIn,
  Activity,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, Link } from "@/routing";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getAssetPath } from "@/lib/assets";

// ── Types ──────────────────────────────────────────────────────────────────
interface NavItemChild {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: NavItemChild[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Inicio",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Gestión de usuarios",
    items: [
      {
        label: "Usuarios",
        href: "/gestion-usuarios/usuarios",
        icon: Users,
      },
      {
        label: "Resumen de gestión",
        href: "/gestion/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Gestión de aplicaciones",
    items: [
      {
        label: "Aplicaciones",
        href: "/aplicaciones",
        icon: AppWindow,
      },
    ],
  },
  {
    title: "Auditoría",
    items: [
      {
        label: "Logs de gestión",
        href: "/auditoria/logs-gestion",
        icon: History,
      },
      {
        label: "Ingresos a aplicaciones",
        href: "/auditoria/ingresos-aplicaciones",
        icon: LogIn,
      },
      {
        label: "Actividad de usuarios",
        href: "/auditoria/actividad-usuarios",
        icon: Activity,
      },
    ],
  },
];

// ── Helper: Normalización de rutas ─────────────────────────────────────────
function normalizePath(p: string | null | undefined): string {
  if (!p) return "";
  let clean = p.split("?")[0].split("#")[0];
  clean = clean.replace(/^\/SSO(?=\/|$)/i, "");
  clean = clean.replace(/^\/(?:es|en)(?=\/|$)/i, "");
  clean = clean.replace(/\/+$/, "");
  return clean === "" ? "/" : clean;
}

function checkIsPathActive(currentPath: string | null | undefined, targetHref: string): boolean {
  const current = normalizePath(currentPath);
  const target = normalizePath(targetHref);

  if (target === "/dashboard") {
    return current === "/dashboard" || current === "/";
  }

  if (target === "/gestion/dashboard") {
    return current === "/gestion/dashboard" || current === "/gestion-usuarios/dashboard";
  }

  if (target === "/gestion-usuarios/usuarios") {
    return (
      current === "/gestion-usuarios/usuarios" ||
      current === "/usuarios"
    );
  }

  return current === target || current.startsWith(target + "/");
}

// ── Subcomponent: SidebarNavItem ───────────────────────────────────────────
function SidebarNavItem({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;

  const isChildActive = (href: string) => checkIsPathActive(pathname, href);

  const hasActiveChild = React.useMemo(
    () => item.children?.some((child) => isChildActive(child.href)) ?? false,
    [item.children, pathname]
  );

  const isParentActive = checkIsPathActive(pathname, item.href) || hasActiveChild;

  const [open, setOpen] = React.useState(hasActiveChild || isParentActive);

  React.useEffect(() => {
    if (hasActiveChild || isParentActive) {
      setOpen(true);
    }
  }, [hasActiveChild, isParentActive]);

  return (
    <li>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className={cn(
                  "w-full flex items-center transition-all duration-150 outline-none select-none",
                  collapsed
                    ? "justify-center p-2 rounded-lg size-8 mx-auto"
                    : "gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left",
                  isParentActive
                    ? "bg-primary/10 text-primary font-medium hover:bg-primary/15 hover:text-primary dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/25"
                    : "text-foreground/70 hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <Icon className={cn("size-4 shrink-0", isParentActive ? "text-primary dark:text-primary" : "")} />
                </div>
                {!collapsed && (
                  <>
                    <span className={cn("flex-1 truncate", isParentActive && "text-primary dark:text-primary")}>{item.label}</span>
                    <ChevronRight
                      className={cn(
                        "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ml-auto",
                        open && "rotate-90"
                      )}
                    />
                  </>
                )}
              </button>
            ) : (
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "w-full flex items-center transition-all duration-150 outline-none select-none",
                  collapsed
                    ? "justify-center p-2 rounded-lg size-8 mx-auto"
                    : "gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left",
                  isParentActive
                    ? "bg-primary/10 text-primary font-medium hover:bg-primary/15 hover:text-primary dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/25"
                    : "text-foreground/70 hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <Icon className={cn("size-4 shrink-0", isParentActive ? "text-primary dark:text-primary" : "")} />
                </div>
                {!collapsed && <span className={cn("flex-1 truncate", isParentActive && "text-primary dark:text-primary")}>{item.label}</span>}
              </Link>
            )}
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" align="center" className="z-[100]">
              {item.label}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {/* Sub-items */}
      {hasChildren && (open || collapsed) && (
        <ul
          className={cn(
            "mt-1 space-y-0.5",
            collapsed
              ? "flex flex-col items-center gap-1 w-full border-y border-border/50 py-1.5 my-1"
              : "ml-6 border-l border-border pl-3"
          )}
        >
          {item.children!.map((child) => {
            const ChildIcon = child.icon;
            const childActive = isChildActive(child.href);
            return (
              <li
                key={child.label}
                className={collapsed ? "w-full flex justify-center" : "w-full"}
              >
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={child.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center rounded-lg transition-all duration-150 outline-none select-none",
                          collapsed
                            ? "justify-center p-2 size-8 text-foreground/60 hover:text-foreground hover:bg-muted/50"
                            : "w-full gap-2 px-2.5 py-1.5 text-xs font-medium text-left",
                          childActive && collapsed
                            ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/25"
                            : "",
                          childActive && !collapsed
                            ? "bg-primary/10 text-primary font-medium hover:bg-primary/15 hover:text-primary dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/25"
                            : "",
                          !childActive && !collapsed
                            ? "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                            : ""
                        )}
                      >
                        <ChildIcon
                          className={cn(
                            "shrink-0",
                            collapsed ? "size-4" : "size-3.5",
                            childActive ? "text-primary dark:text-primary" : ""
                          )}
                        />
                        {!collapsed && (
                          <span className={cn("truncate", childActive && "text-primary dark:text-primary")}>{child.label}</span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" align="center" className="z-[100]">
                        {child.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export function GeoportalSidebar({
  variant = "navigation",
}: {
  variant?: "full" | "navigation";
}) {
  const { state, isMobile, setOpenMobile, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout } = useAuth();
  const router = useRouter();

  const showUser = variant === "full";
  const showBranding = variant === "full";

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Usuario";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  const handleLogout = async () => {
    await logout();
    router.push("/login-sso");
  };

  // Theme state
  const [theme, setTheme] = React.useState<Theme>("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const stored = getStoredTheme();
    const active = document.documentElement.getAttribute("data-theme") as Theme | null;
    setTheme(stored ?? active ?? "light");
  }, []);

  const handleTheme = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
  };

  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar variant="floating" collapsible="icon">
      {/* ── Header ── */}
      <SidebarHeader className="p-0 shrink-0">
        {showBranding ? (
          <>
            {/* Top bar azul institucional */}
            <div className="bg-primary w-full px-3 py-2 flex items-center justify-end min-h-9 lg:min-h-10 overflow-hidden">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={toggleSidebar}
                      className="hidden md:flex p-1 rounded-md text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors shrink-0"
                      aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
                    >
                      <PanelLeft className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" className="z-[100]">
                    {collapsed ? "Expandir menú" : "Colapsar menú"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Logo del GEOportal */}
            <div
              className={cn(
                "flex items-center px-4 py-2.5 lg:px-4 lg:py-3 border-b border-border shrink-0",
                collapsed ? "justify-center" : "justify-between"
              )}
            >
              <Link
                href="/dashboard"
                className="flex items-center gap-3 shrink-0 group focus-visible:outline-none"
              >
                {collapsed ? (
                  <>
                    <img
                      src={getAssetPath("/escudo-light.svg")}
                      alt="Símbolo Icon"
                      className="h-6 w-auto object-contain mx-auto dark:hidden"
                    />
                    <img
                      src={getAssetPath("/escudo-dark.svg")}
                      alt="Símbolo Icon"
                      className="h-6 w-auto object-contain mx-auto hidden dark:block"
                    />
                  </>
                ) : (
                  <>
                    <img
                      src={getAssetPath("/horizontal-light.svg")}
                      alt="Logo MINEDEC GEOportal"
                      className="h-5.5 w-auto object-contain dark:hidden"
                    />
                    <img
                      src={getAssetPath("/horizontal-dark.svg")}
                      alt="Logo MINEDEC GEOportal"
                      className="h-5.5 w-auto object-contain hidden dark:block"
                    />
                  </>
                )}
              </Link>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setOpenMobile(false)}
                  aria-label="Cerrar menú"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </>
        ) : (
          <div
            className={cn(
              "flex items-center p-3 border-b border-border min-h-12 shrink-0",
              collapsed ? "justify-center" : "justify-between"
            )}
          >
            {!collapsed && (
              <Link
                href="/dashboard"
                className="flex items-center shrink-0 focus-visible:outline-none"
                onClick={handleNavigate}
              >
                <img
                  src={getAssetPath("/horizontal-light.svg")}
                  alt="Logo MINEDEC"
                  className="h-5.5 w-auto object-contain dark:hidden"
                />
                <img
                  src={getAssetPath("/horizontal-dark.svg")}
                  alt="Logo MINEDEC"
                  className="h-5.5 w-auto object-contain hidden dark:block"
                />
              </Link>
            )}

            {isMobile ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setOpenMobile(false)}
                aria-label="Cerrar menú"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            ) : (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={toggleSidebar}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0 outline-none"
                      aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
                    >
                      <PanelLeft className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side={collapsed ? "right" : "bottom"} align="center" className="z-[100]">
                    {collapsed ? "Expandir menú" : "Colapsar menú"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent className="px-2 py-3 overflow-y-auto space-y-4">
        {navSections.map((section, idx) => (
          <div key={section.title} className="space-y-0.5">
            {!collapsed && (
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 mb-2">
                {section.title}
              </p>
            )}
            {collapsed && idx > 0 && (
              <div className="my-2 border-t border-border/60 mx-1" />
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarNavItem
                  key={item.label}
                  item={item}
                  collapsed={collapsed}
                  onNavigate={handleNavigate}
                />
              ))}
            </ul>
          </div>
        ))}
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="p-2 shrink-0 border-t border-border">
        {/* Theme toggle */}
        {mounted && (
          collapsed ? (
            <div className="flex justify-center py-1 w-full">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleTheme(theme === "dark" ? "light" : "dark")}
                      className="size-8 flex items-center justify-center rounded-lg text-foreground/70 hover:bg-muted/60 hover:text-foreground transition-colors outline-none"
                      aria-label="Alternar tema"
                    >
                      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center" className="z-[100]">
                    {theme === "dark" ? "Modo claro" : "Modo oscuro"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <div className="px-2 py-1 w-full">
              <div
                className={cn(
                  "relative flex w-full items-center p-1 rounded-full border border-border/60",
                  "bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors duration-300"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-background shadow-xs transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                    theme === "dark" ? "translate-x-full" : "translate-x-0"
                  )}
                />
                <button
                  type="button"
                  onClick={() => handleTheme("light")}
                  className={cn(
                    "relative z-10 flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs font-semibold transition-colors duration-200 outline-none",
                    theme !== "dark"
                      ? "text-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sun className="size-3.5" />
                  Claro
                </button>
                <button
                  type="button"
                  onClick={() => handleTheme("dark")}
                  className={cn(
                    "relative z-10 flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs font-semibold transition-colors duration-200 outline-none",
                    theme === "dark"
                      ? "text-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Moon className="size-3.5" />
                  Oscuro
                </button>
              </div>
            </div>
          )
        )}

        {/* User profile (only when variant === "full") */}
        {showUser && (
          <div className="flex items-center gap-2 px-2 py-2 mt-1 rounded-xl bg-muted/50">
            <div className="size-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">Administradora</p>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Cerrar sesión"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-danger hover:bg-danger/10 shrink-0"
              >
                <LogOut className="size-3.5" />
              </Button>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
