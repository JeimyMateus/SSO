"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  LogOut,
  ChevronDown,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Usuario";
  const displayEmail = user?.email || "usuario@mineduc.cl";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";
  const photoURL = user?.photoURL || undefined;

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.replace("/login-sso");
  };

  const TriggerButton = (
    <button className="group flex items-center gap-2.5 rounded-full outline-none pr-2 pl-1 py-1 hover:bg-transparent data-[state=open]:bg-transparent transition-all cursor-pointer">
      <Avatar className="size-10 cursor-pointer transition-all duration-200 group-hover:ring-2 group-hover:ring-primary-300 group-hover:ring-offset-2 group-hover:ring-offset-background">
        {photoURL && <AvatarImage src={photoURL} alt={displayName} />}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="hidden sm:flex items-center gap-2 text-foreground/80 transition-colors group-hover:text-foreground">
        <div className="flex flex-col text-left leading-tight">
          <span className="text-sm font-semibold text-foreground">{displayName}</span>
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <span className="text-primary font-bold text-xs leading-none">•</span> Autenticado
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-200 text-muted-foreground",
            open && "rotate-180"
          )}
          strokeWidth={2.5}
        />
      </div>
    </button>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <div onClick={() => setOpen(true)}>{TriggerButton}</div>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="rounded-t-[32px] p-0 border-none bg-background flex flex-col focus-visible:outline-none focus:outline-none"
        >
          <SheetTitle className="sr-only">Menú de usuario</SheetTitle>

          {/* Header Móvil */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-border/40 shrink-0 mt-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="-ml-2 rounded-full text-foreground hover:bg-surface-subtle transition-colors"
              aria-label="Volver"
            >
              <ChevronLeft className="size-6" strokeWidth={2} />
            </Button>
            <div className="size-10" />
          </div>

          <div className="px-6 pb-8 pt-6 overflow-y-auto max-h-[85vh]">
            {/* User Info Header */}
            <div className="flex items-center gap-4 mb-6 px-2">
              <Avatar className="size-16">
                {photoURL && <AvatarImage src={photoURL} alt={displayName} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-body font-bold text-foreground">{displayName}</span>
                <span className="text-caption text-muted-foreground mt-0.5 flex items-center gap-1">
                  <span className="text-primary font-bold text-xs leading-none">•</span> Autenticado
                </span>
                <span className="text-caption text-muted-foreground/80 mt-0.5">{displayEmail}</span>
              </div>
            </div>

            <div className="h-px bg-border/60 mx-2 mb-6" />

            <div className="flex flex-col gap-2">
              <MobileMenuItem icon={User} label="Perfil" onClick={() => setOpen(false)} />
              <div className="h-px bg-border my-1 mx-2" />
              <MobileMenuItem icon={LogOut} label="Cerrar sesión" isWarning onClick={handleLogout} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {TriggerButton}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        sideOffset={12}
        className={cn(
          "w-[270px] rounded-[24px] border border-border bg-surface p-3 shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98]",
          "data-[state=closed]:slide-out-to-top-1.5 data-[state=open]:slide-in-from-top-1.5",
          "duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
        )}
      >
        <div className="flex items-center gap-3 px-3 py-2 mb-1.5 bg-surface-subtle/50 rounded-xl border border-border/40">
          <Avatar className="size-9">
            {photoURL && <AvatarImage src={photoURL} alt={displayName} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-body-sm font-bold text-foreground truncate">{displayName}</span>
            <span className="text-caption text-muted-foreground flex items-center gap-1 truncate">
              <span className="text-primary font-bold text-xs leading-none">•</span> Autenticado
            </span>
          </div>
        </div>
        <DropdownMenuSeparator className="my-1.5 bg-border/50" />

        <div className="flex flex-col gap-1 px-1">
          <DesktopMenuItem icon={User} label="Perfil" onClick={() => setOpen(false)} />
          <DropdownMenuSeparator className="my-1.5 bg-border/50" />
          <DesktopMenuItem icon={LogOut} label="Cerrar sesión" isWarning onClick={handleLogout} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  isActive?: boolean;
  isWarning?: boolean;
  badge?: string;
  onClick?: () => void;
}

// ── Componentes Internos para Mobile/Desktop ──

function MobileMenuItem({
  icon: Icon,
  label,
  isActive,
  isWarning,
  badge,
  onClick
}: MenuItemProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "group relative flex w-full select-none items-center justify-start gap-4 rounded-xl px-4 py-4 h-auto text-body font-semibold outline-none transition-all duration-200",
        isActive
          ? "bg-primary-400/10 text-primary-400 hover:bg-primary-400/20 hover:text-primary-400"
          : isWarning
            ? "text-danger hover:bg-danger/10 hover:text-danger"
            : "text-foreground hover:bg-surface-subtle"
      )}
    >
      {isActive && (
        <div className="absolute -left-3 top-1/2 h-1/2 w-1 -translate-y-1/2 rounded-r-full bg-primary-400" />
      )}

      <Icon className={cn(
        "size-[22px] transition-colors duration-200",
        isActive
          ? "text-primary-400"
          : isWarning
            ? "text-danger"
            : "text-muted-foreground group-hover:text-foreground"
      )} strokeWidth={isActive ? 2.5 : 1.75} />

      <span className="flex-1 text-left">{label}</span>

      {badge && (
        <span className="rounded-full bg-primary-400/15 px-2.5 py-0.5 text-xs font-bold text-primary-400">
          {badge}
        </span>
      )}
    </Button>
  );
}

function DesktopMenuItem({
  icon: Icon,
  label,
  isActive,
  isWarning,
  badge,
  onClick
}: MenuItemProps) {
  return (
    <DropdownMenuItem
      onClick={onClick}
      className={cn(
        "group relative flex cursor-pointer select-none items-center gap-3 rounded-r-lg pl-5 pr-3 py-2.5 text-sm font-medium outline-none transition-all duration-200",
        isActive
          ? "bg-primary-400/10 text-primary-400"
          : isWarning
            ? "text-danger data-[highlighted]:bg-danger/10 data-[highlighted]:text-danger"
            : "text-foreground data-[highlighted]:bg-surface-subtle data-[highlighted]:text-foreground"
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 h-1/2 w-1 -translate-y-1/2 rounded-r-full bg-primary-400" />
      )}

      <Icon className={cn(
        "size-[18px] transition-colors duration-200",
        isActive
          ? "text-primary-400"
          : isWarning
            ? "text-danger"
            : "text-muted-foreground group-data-[highlighted]:text-foreground"
      )} />

      <span className="flex-1 text-left">{label}</span>

      {badge && (
        <span className="shrink-0 whitespace-nowrap rounded-full bg-primary-400/15 px-2 py-0.5 text-[10px] font-bold text-primary-400">
          {badge}
        </span>
      )}
    </DropdownMenuItem>
  );
}
