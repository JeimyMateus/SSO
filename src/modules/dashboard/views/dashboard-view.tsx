"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDecorativeIcon,
  CardBadge,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/data-display";
import {
  Users,
  AppWindow,
  ShieldCheck,
  Layers,
  Key,
  AlertTriangle,
  ArrowRight,
  Clock,
  TrendingUp,
  Network,
  ChevronDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Link } from "@/routing";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendItem,
} from "@/components/ui/chart";

const ATTENTION_ITEMS = [
  {
    id: 1,
    title: "112 usuarios sin rol asignado",
    description: "Sin perfil de acceso configurado.",
    actionLabel: "Revisar usuarios",
    href: "/gestion-usuarios/usuarios",
    icon: Users,
  },
  {
    id: 2,
    title: "4 aplicaciones sin roles configurados",
    description: "Sin perfiles de acceso asociados.",
    actionLabel: "Revisar aplicaciones",
    href: "/aplicaciones",
    icon: AppWindow,
  },
  {
    id: 3,
    title: "2 roles sin recursos asociados",
    description: "Sin funciones ni recursos asignados.",
    actionLabel: "Revisar roles",
    href: "/roles",
    icon: ShieldCheck,
  },
  {
    id: 4,
    title: "210 usuarios sin ingresos recientes",
    description: "Sin ingresos en los últimos 30 días.",
    actionLabel: "Revisar actividad",
    href: "/gestion-usuarios/usuarios",
    icon: Clock,
  },
];

const APLICACIONES_OPTIONS = ["Sistema de Notas", "Portal Educativo", "Gestión de Personal"];

const RECENT_CHANGES_SUMMARY = [
  { id: "usuarios", group: "Usuarios", count: 8, lastTime: "10:24 AM", icon: Users, color: "bg-muted text-foreground border-border" },
  { id: "roles", group: "Roles", details: "Sistema de Notas", count: 5, lastTime: "09:40 AM", icon: ShieldCheck, color: "bg-info/10 text-info border-info/20" },
  { id: "recursos", group: "Recursos", details: "Sistema de Notas", count: 12, lastTime: "08:02 AM", icon: Layers, color: "bg-warning/10 text-warning border-warning/20" },
  { id: "asignaciones", group: "Asignaciones de acceso", count: 6, lastTime: "07:45 AM", icon: Network, color: "bg-success/10 text-success border-success/20" },
  { id: "permisos", group: "Permisos", count: 9, lastTime: "07:20 AM", icon: Key, color: "bg-success/10 text-success border-success/20" }
];

const MOCK_EVENTS = {
  usuarios: [
    { time: "10:24 AM", title: "Usuario desactivado", desc: "Lucía Toapanta fue marcada como inactiva." },
    { time: "09:50 AM", title: "Usuario actualizado", desc: "Se modificaron los datos del usuario Carlos Andrade." },
    { time: "08:35 AM", title: "Sede asignada", desc: "Se asignó Sede Central al usuario María López." }
  ],
  roles: [
    { time: "09:40 AM", title: "Rol actualizado", desc: "Se actualizaron los permisos del rol Rector." },
    { time: "09:15 AM", title: "Aplicación asociada", desc: "El rol fue asociado al Portal Educativo." },
    { time: "08:10 AM", title: "Rol creado", desc: "Se creó el rol de Asistente de Finanzas." }
  ],
  recursos: [
    { time: "08:02 AM", title: "Recurso creado", desc: "Se creó el recurso Módulo de Notas." },
    { time: "07:50 AM", title: "Recurso asociado a rol", desc: "El recurso fue asignado al rol Docente." },
    { time: "07:45 AM", title: "Recurso actualizado", desc: "Se modificaron las propiedades del Dashboard." }
  ],
  asignaciones: [
    { time: "07:45 AM", title: "Usuario asociado a aplicación", desc: "Se asignó Sistema de Notas al usuario Juan." },
    { time: "07:30 AM", title: "Rol asignado", desc: "Se asignó rol Docente en Sistema de Notas." },
    { time: "07:15 AM", title: "Asignación modificada", desc: "Se actualizó la vigencia de la asignación." }
  ],
  permisos: [
    { time: "07:20 AM", title: "Permiso de ver agregado", desc: "Se otorgó permiso de lectura en Módulo de Notas." },
    { time: "07:10 AM", title: "Permiso de eliminar retirado", desc: "Se removió acceso de eliminación en Reportes." },
    { time: "07:05 AM", title: "Permiso de crear agregado", desc: "Se otorgó acceso de escritura en Estudiantes." }
  ]
};


const ROLE_DISTRIBUTION = [
  { id: "docente", name: "Docente", count: 560, pct: 45, color: "var(--primary)", resources: 8, status: "Activo" },
  { id: "analista", name: "Analista de notas", count: 311, pct: 25, color: "var(--info)", resources: 12, status: "Activo" },
  { id: "rector", name: "Rector", count: 187, pct: 15, color: "var(--warning)", resources: 24, status: "Activo" },
  { id: "admin", name: "Administrador", count: 125, pct: 10, color: "var(--success)", resources: 45, status: "Activo" },
  { id: "otros", name: "Otros", count: 62, pct: 5, color: "var(--muted-foreground)", resources: 3, status: "Activo" },
];

const APP_CONFIG_DATA = [
  { id: "notas", name: "Sistema de Notas", roles: 8, recursos: 42, color: "var(--primary)" },
  { id: "portal", name: "Portal Educativo", roles: 5, recursos: 28, color: "var(--info)" },
  { id: "personal", name: "Gestión de Personal", roles: 6, recursos: 35, color: "var(--warning)" },
];

const ACCESS_HISTORY = [
  { day: "Lun", date: "29 Sep", value: 1820, change: null },
  { day: "Mar", date: "30 Sep", value: 2150, change: "+18%" },
  { day: "Mié", date: "01 Oct", value: 1980, change: "-8%" },
  { day: "Jue", date: "02 Oct", value: 2410, change: "+22%" },
  { day: "Vie", date: "03 Oct", value: 2290, change: "-5%" },
  { day: "Sáb", date: "04 Oct", value: 1750, change: "-24%" },
  { day: "Dom", date: "05 Oct", value: 1880, change: "+7%" },
];

export function DashboardView() {
  const [openCategoryId, setOpenCategoryId] = React.useState<string | null>(null);
  const [hoveredRoleId, setHoveredRoleId] = React.useState<string | null>(null);
  const [hoveredAppIdx, setHoveredAppIdx] = React.useState<number | null>(null);
  const [hoveredDayIdx, setHoveredDayIdx] = React.useState<number | null>(null);
  const [activeFilter, setActiveFilter] = React.useState("Hoy");
  const [activeAppRoleFilter, setActiveAppRoleFilter] = React.useState(APLICACIONES_OPTIONS[0]);

  const filterMultiplier = activeFilter === "Hoy" ? 1 : activeFilter === "Ayer" ? 0.8 : activeFilter === "Esta semana" ? 4.5 : activeFilter === "Semana anterior" ? 5.2 : 18.4;

  const appMultiplier = activeAppRoleFilter === "Sistema de Notas" ? 1 : activeAppRoleFilter === "Portal Educativo" ? 0.7 : 0.4;
  const currentRoles = ROLE_DISTRIBUTION.map(r => ({
    ...r,
    count: Math.floor(r.count * appMultiplier)
  })).slice(0, activeAppRoleFilter === "Sistema de Notas" ? 5 : activeAppRoleFilter === "Portal Educativo" ? 4 : 3);

  const totalUsers = currentRoles.reduce((acc, r) => acc + r.count, 0);

  const activeRole = ROLE_DISTRIBUTION.find((r) => r.id === hoveredRoleId);

  const lineMaxVal = 2600;
  const lineMinVal = 1400;
  const linePoints = ACCESS_HISTORY.map((item, idx) => {
    const x = 20 + idx * ((280 - 40) / 6);
    const normalizedY = (item.value - lineMinVal) / (lineMaxVal - lineMinVal);
    const y = 80 - normalizedY * 65;
    return { ...item, x, y };
  });

  const linePathData =
    `M ${linePoints[0].x} ${linePoints[0].y} ` +
    linePoints
      .slice(1)
      .map((p, i) => {
        const prev = linePoints[i];
        const cx = (prev.x + p.x) / 2;
        return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
      })
      .join(" ");

  const lineAreaData = `${linePathData} L ${linePoints[linePoints.length - 1].x} 88 L ${linePoints[0].x} 88 Z`;

  return (
    <div className="flex flex-col gap-4 w-full pb-4">
      {/* 0. Card destacada de bienvenida */}
      <Card
        variant="primary"
        className="relative overflow-hidden border-primary/40 dark:!border-border dark:!bg-surface shadow-xs transition-colors"
        innerClassName="justify-center py-6 md:py-7 px-6 md:px-8"
      >
        <div className="flex flex-col justify-center gap-2 w-full z-10 my-auto">
          <CardBadge className="bg-white/15 !text-white border border-white/20 dark:bg-muted/50 dark:!text-muted-foreground dark:border-border backdrop-blur-xs w-fit text-xs font-semibold px-3 py-1 transition-colors">
            Hola, Paula Rozo 👋
          </CardBadge>
          <CardTitle className="text-2xl md:text-3xl font-heading font-bold !text-white dark:!text-white tracking-tight h-auto transition-colors">
            Bienvenida a Conecta MINEDUC
          </CardTitle>
          <CardDescription className="text-sm md:text-base !text-white/90 dark:!text-muted-foreground font-normal transition-colors">
            Supervisa y gestiona usuarios, aplicaciones, roles y accesos institucionales desde un solo lugar.
          </CardDescription>
        </div>

        <CardDecorativeIcon className="opacity-15 dark:opacity-35 !text-white dark:!text-primary-300 right-4 -bottom-8 pointer-events-none z-0 transition-colors">
          <Network className="size-48 md:size-56 stroke-[1.2]" />
        </CardDecorativeIcon>
      </Card>

      {/* Contenedor del Tablero Estratégico */}
      <div className="bg-surface border border-border shadow-xs rounded-xl p-4 md:p-6 flex flex-col gap-6 w-full">
        {/* Encabezado contextual */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary dark:text-primary-300">
            Tablero estratégico
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Vista general del estado y actividad de Conecta MINEDUC.
          </p>
        </div>

        {/* 1. Indicadores principales */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <KpiCard
              label="Aplicaciones"
              value="8"
              color="primary"
              comparison="6 activas · 2 inactivas"
              icon={<AppWindow />}
            />
            <KpiCard
              label="Usuarios"
              value="1.245"
              color="neutral"
              comparison="1.058 activos · 187 inactivos"
              icon={<Users />}
            />
            <KpiCard
              label="Roles"
              value="12"
              color="info"
              comparison="Perfiles configurados"
              icon={<ShieldCheck />}
            />
            <KpiCard
              label="Recursos"
              value="340"
              color="warning"
              comparison="Elementos configurados"
              icon={<Layers />}
            />
            <KpiCard
              label="Asignaciones de acceso"
              value="8.421"
              color="success-400"
              comparison="Relaciones usuario, sede, rol y aplicación"
              icon={<Key />}
            />
          </div>
        </section>

        {/* 2. Operación y Gestión: Requiere atención y Últimos cambios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 2.1 Requiere atención */}
          <Card variant="panel" className="relative flex flex-col h-full bg-surface shadow-none transition-colors overflow-hidden border-0">

            {/* Relleno sutil animado de alerta */}
            <div className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden">
              <div className="absolute inset-0 bg-warning/[0.08] animate-[pulse_3s_ease-in-out_infinite]" />
            </div>

            {/* Borde dinámico rotatorio con máscara perfecta (más lento: 8s) */}
            <div
              className="absolute inset-0 pointer-events-none rounded-[inherit]"
              style={{
                padding: "2px",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude"
              }}
            >
              <div
                className="absolute left-1/2 top-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2 animate-[spin_8s_linear_infinite]"
                style={{ background: 'conic-gradient(from 0deg, transparent 0 250deg, var(--warning) 360deg)' }}
              />
            </div>

            <CardHeader className="relative z-10 items-start text-left gap-1 p-6 pb-3 border-b border-warning/20">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-lg md:text-xl font-heading font-bold text-warning flex items-center gap-2 h-auto">
                  <AlertTriangle className="size-5 shrink-0" />
                  Requiere atención
                </CardTitle>
                <Badge variant="warning" size="sm" className="font-bold dark:text-white">
                  {ATTENTION_ITEMS.length} avisos
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Situaciones detectadas que podrían requerir revisión o gestión.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 px-6 py-4 flex-1">
              <div className="flex flex-col gap-3">
                {ATTENTION_ITEMS.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3 bg-surface border border-warning/20 rounded-xl shadow-2xs hover:border-warning/40 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-9 rounded-lg flex items-center justify-center shrink-0 border bg-warning/10 text-warning border-warning/20">
                          <ItemIcon className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-foreground leading-snug truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="warning"
                        size="sm"
                        className="shrink-0 h-8 px-3 text-xs font-bold !text-white hover:bg-warning/90 shadow-2xs gap-1"
                        asChild
                      >
                        <Link href={item.href}>
                          {item.actionLabel}
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="relative z-10 py-4 px-6 border-t border-warning/20 mt-auto flex justify-center items-center w-full">
              <Link
                href="/gestion-usuarios/usuarios"
                className="text-sm font-semibold text-foreground hover:text-warning transition-colors flex items-center gap-1.5 group/link"
              >
                Ver todos los avisos <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-0.5" />
              </Link>
            </CardFooter>
          </Card>

          {/* 2.2 Últimos cambios de gestión */}
          <Card variant="panel" className="flex flex-col h-full">
            <CardHeader className="items-start text-left gap-4 p-6 pb-3 border-b border-border/50">
              <div className="flex flex-col gap-1 w-full">
                <CardTitle className="text-lg md:text-xl font-heading font-bold text-primary h-auto">
                  Últimos cambios de gestión
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Resumen de la actividad administrativa reciente.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full no-scrollbar">
                {["Hoy", "Ayer", "Esta semana", "Semana anterior", "Último mes"].map((filter) => (
                  <Badge
                    key={filter}
                    tone={activeFilter === filter ? "primary" : "neutral"}
                    appearance={activeFilter === filter ? "solid" : "soft"}
                    className={cn(
                      "cursor-pointer whitespace-nowrap shadow-none transition-all duration-300 dark:text-white dark:hover:text-white",
                      activeFilter !== filter && "hover:bg-primary-200 hover:text-primary dark:hover:bg-primary-900/40 border-transparent"
                    )}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="px-6 py-4 flex-1">
              <div className="flex flex-col gap-3">
                {RECENT_CHANGES_SUMMARY.map((change) => {
                  const Icon = change.icon;
                  const displayCount = Math.max(1, Math.floor(change.count * filterMultiplier));
                  const datePrefix = activeFilter === "Esta semana" ? "02 Oct, " : activeFilter === "Semana anterior" ? "24 Sep, " : activeFilter === "Último mes" ? "10 Sep, " : "";

                  return (
                    <div
                      key={change.id}
                      className={cn(
                        "flex flex-col rounded-xl border transition-all duration-300 bg-surface text-left overflow-hidden",
                        openCategoryId === change.id ? "border-border shadow-sm" : "border-border/60 shadow-2xs hover:bg-muted/30 hover:border-border"
                      )}
                    >
                      {/* Cabecera / Trigger */}
                      <button
                        className="flex items-center justify-between gap-3 p-3 w-full text-left outline-none cursor-pointer"
                        onClick={() => setOpenCategoryId(openCategoryId === change.id ? null : change.id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn("size-9 rounded-lg flex items-center justify-center shrink-0 border", change.color)}>
                            <Icon className="size-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h4 className="text-sm font-bold text-foreground leading-snug truncate">
                              {change.group}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5 truncate">
                              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                {displayCount} cambios
                              </span>
                              {change.details && (
                                <>
                                  <span className="text-muted-foreground/40 text-[10px] shrink-0">•</span>
                                  <span className="text-xs text-muted-foreground truncate">{change.details}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                            {activeFilter === "Hoy" || activeFilter === "Ayer" ? `Último: ${change.lastTime}` : `Último: ${datePrefix}${change.lastTime}`}
                          </span>
                          <span className={cn(
                            "text-[11px] font-bold transition-colors hover:underline flex items-center gap-0.5",
                            openCategoryId === change.id ? "text-muted-foreground" : "text-primary"
                          )}>
                            {openCategoryId === change.id ? "Ocultar detalle ↑" : "Ver detalle ↓"}
                          </span>
                        </div>
                      </button>

                      {/* Contenido Expandido */}
                      <div
                        className={cn(
                          "transition-all duration-300 ease-in-out bg-surface",
                          openCategoryId === change.id ? "max-h-[500px] opacity-100 border-t border-border/50" : "max-h-0 opacity-0 border-transparent"
                        )}
                      >
                        <div className="p-4 flex flex-col gap-4">
                          {(MOCK_EVENTS[change.id as keyof typeof MOCK_EVENTS] || []).slice(0, displayCount).map((ev, i) => (
                            <div key={i} className="flex gap-4 items-start">
                              <div className={cn("shrink-0 text-left pt-0.5", activeFilter === "Hoy" || activeFilter === "Ayer" ? "w-14" : "w-24")}>
                                <span className="font-mono text-[10px] font-medium text-muted-foreground">
                                  {activeFilter === "Hoy" || activeFilter === "Ayer" ? ev.time : `${datePrefix}${ev.time}`}
                                </span>
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-xs font-bold text-foreground leading-snug truncate">{ev.title}</span>
                                <span className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{ev.desc}</span>
                              </div>
                            </div>
                          ))}

                          {displayCount > 3 && (
                            <div className="text-[11px] text-muted-foreground font-medium pl-18 pt-1">
                              + {displayCount - 3} cambios anteriores
                            </div>
                          )}

                          <div className="pt-3 mt-1 border-t border-border/40 pl-18">
                            <Link href="/auditoria" className="text-[11px] font-bold text-primary hover:text-primary-300 transition-colors flex items-center gap-1 group/link w-fit">
                              Ver todos los cambios de {change.group.toLowerCase()} <ArrowRight className="size-3 transition-transform group-hover/link:translate-x-0.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="relative z-10 py-4 px-6 border-t border-border/50 mt-auto flex justify-center items-center w-full">
              <Link
                href="/auditoria"
                className="text-sm font-semibold text-foreground hover:text-primary-300 transition-colors flex items-center gap-1.5 group/link"
              >
                Ver auditoría completa <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-0.5" />
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* 3. Información analítica: Roles, Aplicaciones e Ingresos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 3.1 Usuarios por rol - DONUT CHART */}
          <Card variant="panel" className="flex flex-col h-full border border-border shadow-2xs">
            <CardHeader className="items-start text-left gap-4 p-6 pb-3 border-b border-border/50 min-h-[76px] flex flex-col justify-center">
              <div className="flex flex-col gap-1 w-full">
                <CardTitle className="text-lg md:text-xl font-heading font-bold text-primary h-auto">
                  Usuarios por rol
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                  Distribución de usuarios según los roles asignados en una aplicación.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full no-scrollbar">
                {APLICACIONES_OPTIONS.map((opt) => (
                  <Badge
                    key={opt}
                    tone={activeAppRoleFilter === opt ? "primary" : "neutral"}
                    appearance={activeAppRoleFilter === opt ? "solid" : "soft"}
                    className={cn(
                      "cursor-pointer whitespace-nowrap shadow-none transition-all duration-300 dark:text-white dark:hover:text-white",
                      activeAppRoleFilter !== opt && "hover:bg-primary-200 hover:text-primary dark:hover:bg-primary-900/40 border-transparent"
                    )}
                    onClick={() => setActiveAppRoleFilter(opt)}
                  >
                    {opt}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border/50 text-xs font-semibold text-muted-foreground flex items-center gap-1.5 w-full">
                <span className="text-foreground font-bold">{totalUsers}</span> usuarios asociados
                <span className="text-muted-foreground/40">•</span>
                <span className="text-foreground font-bold">{currentRoles.length}</span> roles
              </div>
            </CardHeader>
            <CardContent className="flex flex-col p-6 flex-1 min-h-[260px] justify-center">
              <div className="flex flex-col gap-4 w-full">
                {currentRoles.map((role, idx) => {
                  const isHovered = hoveredRoleId === role.id;
                  const isDimmed = hoveredRoleId !== null && !isHovered;
                  // Calcular el porcentaje real en base al total simulado
                  const pct = Math.round((role.count / totalUsers) * 100);

                  return (
                    <div
                      key={role.id}
                      className="flex flex-col gap-1.5 w-full relative group"
                      onMouseEnter={() => setHoveredRoleId(role.id)}
                      onMouseLeave={() => setHoveredRoleId(null)}
                    >
                      {/* Tooltip on Hover */}
                      {isHovered && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                          <ChartTooltip active={true}>
                            <ChartTooltipContent
                              title={role.name}
                              label="Usuarios"
                              value={role.count}
                              indicatorColor="var(--primary)"
                              subvalue={`${pct}% del total asignado`}
                            />
                          </ChartTooltip>
                        </div>
                      )}

                      <div className={cn("flex justify-between items-end", isDimmed && "opacity-50 transition-opacity")}>
                        <span className="text-[13px] font-semibold text-foreground truncate pr-2">{role.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-foreground">{role.count}</span>
                          <span className="text-[11px] font-semibold text-muted-foreground w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-muted/40 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isDimmed ? "bg-primary/30" : "bg-primary",
                            idx === 0 && !isDimmed ? "bg-primary" : idx === 1 && !isDimmed ? "bg-primary/80" : idx === 2 && !isDimmed ? "bg-primary/60" : !isDimmed ? "bg-primary/40" : ""
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="relative z-10 py-4 px-6 border-t border-border/50 mt-auto flex justify-center items-center w-full">
              <Link
                href="/roles"
                className="text-sm font-semibold text-foreground hover:text-primary-300 transition-colors flex items-center gap-1.5 group/link"
              >
                Ver detalle de roles <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-0.5" />
              </Link>
            </CardFooter>
          </Card>

          {/* 3.2 Configuración por aplicación - GROUPED BAR CHART */}
          <Card variant="panel" className="flex flex-col h-full border border-border shadow-2xs">
            <CardHeader className="items-start text-left gap-1 p-6 pb-3 border-b border-border/50 min-h-[76px] flex flex-col justify-center">
              <CardTitle className="text-lg md:text-xl font-heading font-bold text-primary h-auto">
                Configuración por aplicación
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground line-clamp-1">
                Comparación de roles y recursos configurados en cada aplicación.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 flex-1 min-h-[260px]">
              <ChartContainer minHeight={180} className="relative flex flex-col justify-end w-full max-w-[280px]">
                {/* Chart Area */}
                <div className="relative h-36 w-full mt-4">
                  {/* Y-Axis Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-b border-border/40 w-full flex text-[10px] text-muted-foreground/70 font-mono -translate-y-1/2">
                      <span className="w-8 text-right pr-2 bg-surface">50</span>
                    </div>
                    <div className="border-b border-border/40 w-full flex text-[10px] text-muted-foreground/70 font-mono -translate-y-1/2">
                      <span className="w-8 text-right pr-2 bg-surface">25</span>
                    </div>
                    <div className="border-b border-border/40 w-full flex text-[10px] text-muted-foreground/70 font-mono -translate-y-1/2">
                      <span className="w-8 text-right pr-2 bg-surface">0</span>
                    </div>
                  </div>

                  {/* Bars */}
                  <div className="absolute inset-0 flex items-end justify-between gap-1 z-10 pl-8 pr-2">
                    {APP_CONFIG_DATA.map((app, idx) => {
                      const rolesHeight = (app.roles / 50) * 100;
                      const recursosHeight = (app.recursos / 50) * 100;
                      const isHovered = hoveredAppIdx === idx;
                      const isDimmed = hoveredAppIdx !== null && !isHovered;

                      return (
                        <div
                          key={app.id}
                          className="flex-1 flex flex-col items-center h-full justify-end relative cursor-pointer group px-1"
                          onMouseEnter={() => setHoveredAppIdx(idx)}
                          onMouseLeave={() => setHoveredAppIdx(null)}
                          tabIndex={0}
                          role="button"
                          aria-label={`${app.name}: ${app.roles} roles, ${app.recursos} recursos`}
                        >
                          {isHovered && (
                            <ChartTooltip
                              active={true}
                              className="absolute -top-16 left-1/2 -translate-x-1/2 min-w-[160px] z-20"
                            >
                              <ChartTooltipContent
                                title={app.name}
                                label=""
                                value=""
                                indicatorColor={app.color}
                                subvalue={`${app.roles} roles · ${app.recursos} recursos configurados`}
                              />
                            </ChartTooltip>
                          )}

                          <div className={cn("flex items-end gap-1.5 w-full h-full justify-center", isDimmed && "opacity-45")}>
                            <div
                              className={cn(
                                "w-3.5 rounded-t-sm transition-all duration-200",
                                isHovered ? "scale-y-[1.03] shadow-xs" : "opacity-90 hover:opacity-100",
                              )}
                              style={{
                                height: `${rolesHeight}%`,
                                backgroundColor: "var(--info)",
                              }}
                            />
                            <div
                              className={cn(
                                "w-3.5 rounded-t-sm transition-all duration-200",
                                isHovered ? "scale-y-[1.03] shadow-xs" : "opacity-90 hover:opacity-100",
                              )}
                              style={{
                                height: `${recursosHeight}%`,
                                backgroundColor: "var(--warning)",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* X-Axis labels */}
                <div className="flex justify-between gap-1 text-[11px] font-semibold text-muted-foreground pt-4 pl-8 pr-2">
                  {APP_CONFIG_DATA.map((app, idx) => (
                    <div key={app.id} className="flex-1 flex justify-center">
                      <span
                        className={cn(
                          "transition-colors text-center leading-tight px-1",
                          hoveredAppIdx === idx ? "text-primary font-bold" : ""
                        )}
                        title={app.name}
                      >
                        {app.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <ChartLegend alignment="center" className="gap-4 pt-4 w-full justify-center">
                  <ChartLegendItem label="Roles" color="var(--info)" active={true} />
                  <ChartLegendItem label="Recursos" color="var(--warning)" active={true} />
                </ChartLegend>
              </ChartContainer>
            </CardContent>
            <CardFooter className="relative z-10 py-4 px-6 border-t border-border/50 mt-auto flex justify-center items-center w-full">
              <Link
                href="/gestion-aplicaciones"
                className="text-sm font-semibold text-foreground hover:text-primary-300 transition-colors flex items-center gap-1.5 group/link"
              >
                Ver configuración de aplicaciones <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-0.5" />
              </Link>
            </CardFooter>
          </Card>

          {/* 3.3 Ingresos a aplicaciones - LINE CHART */}
          <Card variant="panel" className="flex flex-col h-full md:col-span-2 lg:col-span-1 border border-border shadow-2xs">
            <CardHeader className="items-start text-left gap-1 p-6 pb-3 border-b border-border/50 min-h-[76px] flex flex-col justify-center">
              <CardTitle className="text-lg md:text-xl font-heading font-bold text-primary h-auto">
                Ingresos a aplicaciones
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground line-clamp-1">
                Actividad de inicio de sesión registrada durante los últimos 7 días.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 flex-1 min-h-[260px]">
              <div className="w-full max-w-[280px] flex flex-col justify-center">
                <div className="flex items-start justify-between gap-3 mb-4 px-1">
                  <div className="flex flex-col">
                    <div className="text-2xl font-heading font-bold text-foreground leading-none">
                      14.280
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium mt-1">
                      Ingresos registrados
                    </p>
                    <div className="text-[11px] text-success font-semibold mt-1.5 flex items-center gap-1">
                      <TrendingUp className="size-3" /> 12 % vs. 7 días anteriores
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="text-2xl font-heading font-bold text-foreground leading-none">
                      98,5 %
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium mt-1">
                      Ingresos exitosos
                    </p>
                  </div>
                </div>

                {/* Line Chart */}
                <ChartContainer minHeight={130} className="relative flex flex-col justify-end pt-1 w-full">
                  {/* Grid lines */}
                  <div className="absolute inset-x-0 top-1 bottom-6 flex flex-col justify-between pointer-events-none opacity-40">
                    <div className="border-b border-border/60 w-full flex justify-between text-[9px] text-muted-foreground font-mono">
                      <span>2.600</span>
                    </div>
                    <div className="border-b border-border/60 w-full flex justify-between text-[9px] text-muted-foreground font-mono">
                      <span>2.000</span>
                    </div>
                    <div className="border-b border-border/60 w-full flex justify-between text-[9px] text-muted-foreground font-mono">
                      <span>1.400</span>
                    </div>
                  </div>

                  {/* SVG Curve */}
                  <div className="relative w-full h-24">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 280 90" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="accessFillGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Area Fill */}
                      <path d={lineAreaData} fill="url(#accessFillGradient)" />

                      {/* Stroke Line */}
                      <path
                        d={linePathData}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Vertical crosshair line for hovered item */}
                      {hoveredDayIdx !== null && (
                        <line
                          x1={linePoints[hoveredDayIdx].x}
                          y1={0}
                          x2={linePoints[hoveredDayIdx].x}
                          y2={88}
                          stroke="var(--primary)"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                          className="opacity-70"
                        />
                      )}

                      {/* Data points */}
                      {linePoints.map((p, idx) => {
                        const isHovered = hoveredDayIdx === idx;
                        return (
                          <circle
                            key={idx}
                            cx={p.x}
                            cy={p.y}
                            r={isHovered ? 5 : 3.5}
                            fill={isHovered ? "var(--primary)" : "var(--background)"}
                            stroke="var(--primary)"
                            strokeWidth="2"
                            className="cursor-pointer transition-all duration-150"
                            onMouseEnter={() => setHoveredDayIdx(idx)}
                            onMouseLeave={() => setHoveredDayIdx(null)}
                          />
                        );
                      })}
                    </svg>

                    {/* Floating Chart Tooltip */}
                    {hoveredDayIdx !== null && (
                      <div
                        className="absolute -top-16 -translate-x-1/2 pointer-events-none transition-all duration-150 z-20"
                        style={{
                          left: `${(linePoints[hoveredDayIdx].x / 280) * 100}%`,
                        }}
                      >
                        <ChartTooltip active={true}>
                          <ChartTooltipContent
                            title={`${ACCESS_HISTORY[hoveredDayIdx].day} · ${ACCESS_HISTORY[hoveredDayIdx].date}`}
                            label="Ingresos"
                            value={ACCESS_HISTORY[hoveredDayIdx].value.toLocaleString()}
                            indicatorColor="var(--primary)"
                            trend={
                              ACCESS_HISTORY[hoveredDayIdx].change?.startsWith("+")
                                ? "up"
                                : ACCESS_HISTORY[hoveredDayIdx].change?.startsWith("-")
                                  ? "down"
                                  : "neutral"
                            }
                            trendValue={
                              ACCESS_HISTORY[hoveredDayIdx].change
                                ? `${ACCESS_HISTORY[hoveredDayIdx].change} vs anterior`
                                : "Base sem."
                            }
                          />
                        </ChartTooltip>
                      </div>
                    )}
                  </div>

                  {/* X-Axis labels */}
                  <div className="flex justify-between text-[10px] font-semibold text-muted-foreground pt-2 px-2">
                    {ACCESS_HISTORY.map((d, i) => (
                      <span
                        key={d.day}
                        className={cn(
                          "transition-colors",
                          hoveredDayIdx === i ? "text-primary font-bold" : ""
                        )}
                      >
                        {d.day}
                      </span>
                    ))}
                  </div>
                </ChartContainer>
              </div>
            </CardContent>
            <CardFooter className="relative z-10 py-4 px-6 border-t border-border/50 mt-auto flex justify-center items-center w-full">
              <Link
                href="/auditoria"
                className="text-sm font-semibold text-foreground hover:text-primary-300 transition-colors flex items-center gap-1.5 group/link"
              >
                Ver trazabilidad de ingresos <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-0.5" />
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
