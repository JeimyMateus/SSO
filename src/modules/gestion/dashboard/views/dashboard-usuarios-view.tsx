"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MinedecSpinner } from "@/components/ui/minedec-spinner";
import { getAssetPath } from "@/lib/assets";
import {
  AlertTriangle,
  ShieldCheck,
  Building2,
  Landmark,
  School,
  LayoutGrid,
  GraduationCap,
  UsersRound,
  Database,
  MapPinned,
  ChevronRight,
  ChevronDown,
  UserX,
  ShieldAlert,
  User,
  Layers,
  Loader2,
  BookOpen,
  FileText,
  Headphones,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/routing";
import { cn } from "@/lib/utils";

import {
  ESTADO_USUARIOS_ACCESOS,
  COBERTURA_APLICACIONES,
  APLICACIONES_DATA,
  CASOS_REQUIEREN_ATENCION,
  type AppContextData,
  type SedeUsersDistribution,
} from "../data/dashboard-usuarios-data";

// ── Iconografía Lucide consistente para aplicaciones ─────────────────────────
const APP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "app-gd": GraduationCap,
  "app-th": UsersRound,
  "app-sige": Database,
  "app-sso": ShieldCheck,
  "app-geo": MapPinned,
  "app-sae": School,
  "app-bib": BookOpen,
  "app-tram": FileText,
  "app-ciud": Headphones,
};

// ── Paleta semántica armónica inspirada en el dashboard principal ───────────
const ROLE_COLORS = [
  "var(--primary)",
  "var(--info)",
  "var(--warning)",
  "var(--success)",
  "#818cf8", // Indigo
  "#f472b6", // Pink
];

// ── Componente Reutilizable SVG Donut Ring ───────────────────────────────────
interface DonutSlice {
  id: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
}

function SvgDonut({
  slices,
  centerValue,
  centerLabel,
  size = 110,
  strokeWidth = 14,
}: {
  slices: DonutSlice[];
  centerValue: string | number;
  centerLabel?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <div
      className="relative shrink-0 flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Pista de fondo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          className="opacity-30"
        />
        {slices.map((slice) => {
          if (slice.percentage <= 0) return null;
          const strokeDash = (slice.percentage / 100) * circumference;
          const strokeOffset = (accumulatedPercentage / 100) * circumference;
          // eslint-disable-next-line react-hooks/immutability
          accumulatedPercentage += slice.percentage;

          return (
            <circle
              key={slice.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
              strokeDashoffset={-strokeOffset}
              className="transition-all duration-300 hover:opacity-85"
            >
              <title>{`${slice.label}: ${slice.value} (${slice.percentage}%)`}</title>
            </circle>
          );
        })}
      </svg>
      {/* Texto central */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-base sm:text-lg font-heading font-extrabold text-foreground tabular-nums leading-none">
          {centerValue}
        </span>
        {centerLabel && (
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mt-1 leading-none">
            {centerLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export function DashboardUsuariosView() {
  // ── Estado de la aplicación seleccionada y simulación de carga ─────────────
  const [selectedAppId, setSelectedAppId] = React.useState<string>(APLICACIONES_DATA[0].id);
  const [isLoadingApp, setIsLoadingApp] = React.useState<boolean>(false);
  const loadingTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSelectApp = (appId: string) => {
    if (appId === selectedAppId) return;
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }
    setIsLoadingApp(true);
    setSelectedAppId(appId);
    loadingTimerRef.current = setTimeout(() => {
      setIsLoadingApp(false);
    }, 500);
  };

  React.useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  // ── Aplicaciones visibles (6 principales) y adicionales ('Ver más') ────────
  const visibleApps = React.useMemo(() => APLICACIONES_DATA.slice(0, 6), []);
  const extraApps = React.useMemo(() => APLICACIONES_DATA.slice(6), []);
  const isExtraAppSelected = React.useMemo(
    () => extraApps.some((a) => a.id === selectedAppId),
    [extraApps, selectedAppId]
  );
  const selectedExtraApp = React.useMemo(
    () => extraApps.find((a) => a.id === selectedAppId),
    [extraApps, selectedAppId]
  );

  // ── Estado para la fotografía personalizada ───────────────────────────────
  const [userPhoto, setUserPhoto] = React.useState<string | null>("/fondo-usuarios.png");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUserPhoto(imageUrl);
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  // Aplicación activa
  const currentApp: AppContextData = React.useMemo(() => {
    return APLICACIONES_DATA.find((a) => a.id === selectedAppId) || APLICACIONES_DATA[0];
  }, [selectedAppId]);

  // Icono para la aplicación activa
  const CurrentAppIcon = APP_ICONS[currentApp.id] || GraduationCap;

  // Slices para Donut de Estado y Accesos
  const estadoSlices: DonutSlice[] = React.useMemo(() => {
    return ESTADO_USUARIOS_ACCESOS.map((item) => ({
      id: item.id,
      label: item.titulo,
      value: item.cantidad,
      percentage: item.porcentaje,
      color: item.colorBar,
    }));
  }, []);

  // Slices para Donut de Roles de la aplicación activa
  const roleSlices: DonutSlice[] = React.useMemo(() => {
    return currentApp.roles.map((rol, idx) => ({
      id: rol.id,
      label: rol.nombre,
      value: rol.usuarios,
      percentage: rol.porcentaje,
      color: ROLE_COLORS[idx % ROLE_COLORS.length],
    }));
  }, [currentApp]);

  // Icono para sede
  const getSedeIcon = (tipo: SedeUsersDistribution["tipo"]) => {
    switch (tipo) {
      case "Planta Central":
        return Landmark;
      case "Coordinación Zonal":
        return Building2;
      case "Distrito":
      default:
        return School;
    }
  };

  return (
    <div className="w-full pb-6">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* CONTENEDOR PRINCIPAL: ENGLOBA FOTO Y TARJETAS                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="w-full border border-border rounded-2xl bg-surface p-4 md:p-5 shadow-xs flex flex-col lg:flex-row gap-4 items-stretch">
        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 1. CONTENEDOR LATERAL IZQUIERDO: EXCLUSIVAMENTE PARA FOTO          */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="w-full lg:w-[340px] xl:w-[400px] 2xl:w-[440px] shrink-0 self-stretch rounded-xl border border-border/80 bg-muted/10 overflow-hidden relative group min-h-[460px] lg:min-h-full flex flex-col">
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={handleTriggerUpload}
            className="w-full h-full flex-1 cursor-pointer relative flex items-center justify-center bg-muted/20 overflow-hidden"
            title="Colocar foto"
          >
            {userPhoto ? (
              <img
                src={getAssetPath(userPhoto)}
                alt="Resumen de gestión"
                className="absolute inset-0 w-full h-full object-cover object-left-top"
                onError={() => setUserPhoto(null)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-muted/30 to-muted/10 p-6">
                <div className="size-20 rounded-2xl bg-surface border border-border/60 shadow-xs flex items-center justify-center text-muted-foreground/40 group-hover:text-primary transition-colors">
                  <User className="size-10 stroke-[1.2]" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* 2. ÁREA CENTRAL / DERECHA: DASHBOARD ANALÍTICO Y OPERATIVO          */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* ── BLOQUE SUPERIOR: RESUMEN GENERAL (3 TARJETAS COMPACTAS) ─────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 2.1 Estado de usuarios (Donut Ring + Leyenda compacta) */}
            <Card
              variant="panel"
              className="flex flex-col border border-border shadow-2xs overflow-hidden"
            >
              <CardHeader className="items-start text-left gap-1 p-4 md:p-5 pb-3 border-b border-border/50">
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="text-base md:text-lg font-heading font-bold text-primary dark:text-primary-300 h-auto">
                    Estado de usuarios
                  </CardTitle>
                  <Badge appearance="soft" tone="neutral" size="sm" className="font-semibold text-xs">
                    1.245 usuarios
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground line-clamp-1">
                  Resumen de usuarios según su estado y acceso.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 md:p-5 flex flex-col sm:flex-row items-center gap-4 flex-1 justify-center">
                {/* Gráfico Donut/Anillo generoso */}
                <SvgDonut
                  slices={estadoSlices}
                  centerValue="1.245"
                  centerLabel="Usuarios"
                  size={106}
                  strokeWidth={14}
                />

                {/* Leyenda con tipografía legible y colores alineados */}
                <div className="flex flex-col gap-2 flex-1 min-w-0 justify-center w-full">
                  {ESTADO_USUARIOS_ACCESOS.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.colorBar }}
                        />
                        <span className="text-xs font-semibold text-foreground truncate">
                          {item.titulo}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-bold text-foreground tabular-nums">
                          {item.cantidad}
                        </span>
                        <span className="text-[11px] font-semibold text-muted-foreground w-8 text-right tabular-nums">
                          {item.porcentaje}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 2.2 Requieren atención (Lista accionable de alertas con suave warning) */}
            <Card
              variant="panel"
              className="flex flex-col border border-warning/35 bg-warning/[0.025] dark:bg-warning/[0.05] shadow-2xs overflow-hidden"
            >
              <CardHeader className="items-start text-left gap-1 p-4 md:p-5 pb-3 border-b border-warning/20">
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="text-base md:text-lg font-heading font-bold text-warning flex items-center gap-2 h-auto">
                    <AlertTriangle className="size-5 shrink-0" />
                    Requieren atención
                  </CardTitle>
                  <Badge
                    appearance="soft"
                    tone="warning"
                    size="sm"
                    className="font-bold text-xs"
                  >
                    4 alertas
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground line-clamp-1">
                  Usuarios que requieren revisión.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-3 md:p-4 flex flex-col justify-between flex-1 gap-1.5">
                {CASOS_REQUIEREN_ATENCION.map((caso) => {
                  const CasoIcon =
                    caso.id === "sin-rol"
                      ? ShieldAlert
                      : caso.id === "activos-sin-acceso"
                        ? UserX
                        : caso.id === "inactivos-vigentes"
                          ? AlertTriangle
                          : Building2;

                  return (
                    <Link
                      key={caso.id}
                      href={caso.href}
                      className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg hover:bg-warning/10 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CasoIcon
                          className={cn(
                            "size-4 shrink-0",
                            caso.tipo === "danger"
                              ? "text-danger"
                              : caso.tipo === "warning"
                                ? "text-warning"
                                : "text-warning-500"
                          )}
                        />
                        <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {caso.titulo}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={cn(
                            "text-xs font-bold tabular-nums px-2 py-0.5 rounded",
                            caso.tipo === "danger"
                              ? "text-danger bg-danger/10"
                              : "text-warning bg-warning/15"
                          )}
                        >
                          {caso.cantidad}
                        </span>
                        <ChevronRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            {/* 2.3 Aplicaciones por usuario (Barra horizontal apilada + Categorías) */}
            <Card
              variant="panel"
              className="flex flex-col border border-border shadow-2xs overflow-hidden"
            >
              <CardHeader className="items-start text-left gap-1 p-4 md:p-5 pb-3 border-b border-border/50">
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="text-base md:text-lg font-heading font-bold text-primary dark:text-primary-300 flex items-center gap-2 h-auto">
                    <LayoutGrid className="size-5 shrink-0" />
                    Aplicaciones por usuario
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground line-clamp-1">
                  Cantidad de aplicaciones asignadas por usuario.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 md:p-5 flex flex-col justify-between flex-1 gap-3">
                {/* Barra horizontal apilada (Stacked Bar) */}
                <div className="w-full h-3.5 bg-muted/40 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-border/40">
                  {COBERTURA_APLICACIONES.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        width: `${item.porcentaje}%`,
                        backgroundColor: item.color,
                      }}
                      className="h-full rounded-xs transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                      title={`${item.rango}: ${item.usuarios} usuarios (${item.porcentaje}%)`}
                    />
                  ))}
                </div>

                {/* 4 Categorías con cantidades y porcentajes */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                  {COBERTURA_APLICACIONES.map((item) => (
                    <div key={item.id} className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-medium text-muted-foreground truncate">
                          {item.rango}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5 pl-3.5">
                        <span className="text-sm font-bold text-foreground tabular-nums">
                          {item.usuarios}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                          ({item.porcentaje}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── SELECTOR: USUARIOS POR APLICACIÓN ─────────────────────────────── */}
          <Card
            variant="panel"
            className="border border-border shadow-xs p-5 md:p-6 flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-lg md:text-xl font-heading font-bold text-primary dark:text-primary-300 flex items-center gap-2.5 h-auto">
                <div className="relative inline-flex items-center justify-center size-5 shrink-0 text-primary dark:text-primary-300">
                  <User className="size-4.5" />
                  <LayoutGrid className="size-2.5 absolute -bottom-0.5 -right-1 text-primary dark:text-primary-300 bg-card dark:bg-surface rounded-xs" />
                </div>
                Usuarios por aplicación
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Selecciona una aplicación para consultar sus usuarios, roles y sedes.
              </CardDescription>
            </div>

            {/* Selector interactivo de aplicaciones tipo tabs: 6 principales + desplegable 'Ver más' al lado de SAE */}
            <div className="flex items-center gap-2.5 overflow-x-auto py-2 my-2 md:my-3 w-full scrollbar-none">
              {visibleApps.map((app) => {
                const IconComp = APP_ICONS[app.id] || GraduationCap;
                const isSelected = app.id === selectedAppId;

                return (
                  <button
                    type="button"
                    key={app.id}
                    onClick={() => handleSelectApp(app.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shrink-0 cursor-pointer outline-none border",
                      isSelected
                        ? "bg-primary text-white border-primary shadow-xs font-bold"
                        : "bg-surface border-border text-foreground hover:bg-muted/70 hover:border-border/80"
                    )}
                  >
                    {isSelected && isLoadingApp ? (
                      <Loader2 className="size-3.5 animate-spin text-white" />
                    ) : (
                      <IconComp
                        className={cn(
                          "size-3.5",
                          isSelected ? "text-white" : "text-primary dark:text-primary-300"
                        )}
                      />
                    )}
                    <span>{app.nombre}</span>
                    <span
                      className={cn(
                        "text-[11px] tabular-nums px-1.5 py-0.2 rounded font-bold",
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {app.usuarios}
                    </span>
                  </button>
                );
              })}

              {/* Menú desplegable 'Ver más' al lado de SAE */}
              {extraApps.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shrink-0 cursor-pointer outline-none border",
                        isExtraAppSelected
                          ? "bg-primary text-white border-primary shadow-xs font-bold"
                          : "bg-surface border-border text-foreground hover:bg-muted/70 hover:border-border/80"
                      )}
                    >
                      {isExtraAppSelected && isLoadingApp ? (
                        <Loader2 className="size-3.5 animate-spin text-white" />
                      ) : isExtraAppSelected && selectedExtraApp ? (
                        (() => {
                          const ExtraIcon = APP_ICONS[selectedExtraApp.id] || Layers;
                          return <ExtraIcon className="size-3.5 text-white" />;
                        })()
                      ) : (
                        <Layers className="size-3.5 text-primary dark:text-primary-300" />
                      )}
                      <span>
                        {isExtraAppSelected && selectedExtraApp
                          ? selectedExtraApp.nombre
                          : "Ver más"}
                      </span>
                      {isExtraAppSelected && selectedExtraApp ? (
                        <span className="text-[11px] tabular-nums px-1.5 py-0.2 rounded font-bold bg-white/20 text-white">
                          {selectedExtraApp.usuarios}
                        </span>
                      ) : (
                        <span className="text-[10px] tabular-nums px-1.5 py-0.2 rounded font-medium bg-muted text-muted-foreground">
                          +{extraApps.length}
                        </span>
                      )}
                      <ChevronDown className="size-3.5 opacity-70" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-1">
                    <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-2 py-1.5">
                      Otras aplicaciones ({extraApps.length})
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {extraApps.map((app) => {
                      const AppIcon = APP_ICONS[app.id] || Layers;
                      const isSelected = app.id === selectedAppId;
                      return (
                        <DropdownMenuItem
                          key={app.id}
                          onClick={() => handleSelectApp(app.id)}
                          className={cn(
                            "flex items-center justify-between gap-2 px-2.5 py-2 text-xs rounded-md cursor-pointer",
                            isSelected && "bg-primary text-white font-bold"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <AppIcon
                              className={cn(
                                "size-3.5",
                                isSelected ? "text-white" : "text-primary dark:text-primary-300"
                              )}
                            />
                            <span>{app.nombre}</span>
                          </div>
                          <span
                            className={cn(
                              "text-[11px] tabular-nums px-1.5 py-0.2 rounded font-medium",
                              isSelected
                                ? "bg-white/20 text-white font-bold"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {app.usuarios}
                          </span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* ── CONTENEDOR INTERNO: APLICACIÓN SELECCIONADA (ENCABEZADO + ROLES Y SEDES) ── */}
            <div className="relative border border-border/80 rounded-xl overflow-hidden shadow-2xs flex flex-col bg-card">
              {/* Overlay institucional de carga (MINEDEC UI Kit) */}
              {isLoadingApp && (
                <div
                  className="absolute inset-0 z-20 bg-surface/80 dark:bg-background/80 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-150"
                  aria-live="polite"
                  aria-busy="true"
                >
                  <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-card/95 dark:bg-surface/95 border border-border/80 shadow-lg animate-in zoom-in-95 duration-150">
                    <MinedecSpinner
                      size="sm"
                      label={`Cargando ${currentApp.nombre}...`}
                    />
                  </div>
                </div>
              )}

              <div
                className={cn(
                  "transition-all duration-300 ease-out flex flex-col flex-1",
                  isLoadingApp
                    ? "opacity-30 scale-[0.995] filter blur-[0.5px]"
                    : "opacity-100 scale-100"
                )}
              >
                <div className="px-5 py-4 border-b border-primary-100 dark:border-primary-900/50 bg-primary-50/75 dark:bg-primary-900/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary/10 dark:bg-primary-900/50 border border-primary/20 dark:border-primary-800/60 flex items-center justify-center text-primary dark:text-primary-300 shrink-0">
                      <CurrentAppIcon className="size-4.5" />
                    </div>
                    <span className="font-heading font-bold text-primary dark:text-primary-300 text-base sm:text-lg">
                      {currentApp.nombre}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
                    <span className="text-foreground font-semibold tabular-nums">
                      {currentApp.usuarios} usuarios
                    </span>
                    <span className="text-muted-foreground/40 font-bold">·</span>
                    <span className="text-foreground font-semibold tabular-nums">
                      {currentApp.rolesCount} roles
                    </span>
                    <span className="text-muted-foreground/40 font-bold">·</span>
                    <span className="text-foreground font-semibold tabular-nums">
                      {currentApp.sedesCount} sedes
                    </span>
                  </div>
                </div>

                {/* Lo que sostiene roles y sedes: Composición 45/55 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 md:p-6 bg-muted/15 flex-1">
                  {/* 2.4 Roles (45% -> lg:col-span-5) Donut + Lista ordenada */}
                  <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-border/80 bg-surface p-4 md:p-5 shadow-2xs">
                    <div className="flex flex-col gap-1 pb-3 border-b border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="size-4.5 text-primary dark:text-primary-300" />
                          <span className="text-sm md:text-base font-heading font-bold text-primary dark:text-primary-300">
                            Roles
                          </span>
                        </div>
                        <Badge appearance="soft" tone="primary" size="sm" className="font-bold text-xs uppercase">
                          {currentApp.rolesCount} ROLES
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Distribución calculada sobre los {currentApp.usuarios} usuarios de la aplicación seleccionada.
                      </p>
                    </div>

                    {/* Donut generoso + Lista ordenada de roles */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 py-4 flex-1 justify-center">
                      {/* Donut de roles */}
                      <SvgDonut
                        slices={roleSlices}
                        centerValue={currentApp.usuarios}
                        centerLabel="USUARIOS"
                        size={110}
                        strokeWidth={15}
                      />

                      {/* Lista ordenada de roles con tipografía visible */}
                      <div className="flex flex-col gap-2 flex-1 min-w-0 justify-center w-full">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-1 border-b border-border/40">
                          <span>Rol</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="w-12 text-right">Usuarios</span>
                            <span className="w-9 text-right">%</span>
                          </div>
                        </div>

                        {currentApp.roles.map((rol, idx) => (
                          <div
                            key={rol.id}
                            className="flex items-center justify-between gap-2 text-xs py-0.5"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="size-2.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor: ROLE_COLORS[idx % ROLE_COLORS.length],
                                }}
                              />
                              <span className="text-xs sm:text-[13px] font-semibold text-foreground truncate">
                                {rol.nombre}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 pl-1">
                              <span className="text-xs sm:text-sm font-bold text-foreground tabular-nums w-12 text-right">
                                {rol.usuarios}
                              </span>
                              <span className="text-xs font-semibold text-muted-foreground w-9 text-right tabular-nums">
                                {rol.porcentaje}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 2.5 Sedes (55% -> lg:col-span-7) Barras horizontales comparativas */}
                  <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-border/80 bg-surface p-4 md:p-5 shadow-2xs">
                    <div className="flex flex-col gap-1 pb-3 border-b border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="size-4.5 text-primary dark:text-primary-300" />
                          <span className="text-sm md:text-base font-heading font-bold text-primary dark:text-primary-300">
                            Sedes
                          </span>
                        </div>
                        <Badge appearance="soft" tone="neutral" size="sm" className="font-semibold text-xs uppercase">
                          {currentApp.sedesCount} SEDES
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Distribución calculada sobre los {currentApp.usuarios} usuarios de la aplicación seleccionada.
                      </p>
                    </div>

                    {/* Lista de sedes con icono y barras horizontales comparativas al estilo Dashboard */}
                    <div className="flex flex-col justify-center gap-3 py-3 flex-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-1 border-b border-border/40">
                        <span>Sede</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="w-12 text-right">Usuarios</span>
                          <span className="w-9 text-right">%</span>
                        </div>
                      </div>

                      {currentApp.sedes.map((sede) => {
                        const SedeIcon = getSedeIcon(sede.tipo);
                        const maxSedeUsers = Math.max(...currentApp.sedes.map((s) => s.usuarios));
                        const barWidthPercent = (sede.usuarios / maxSedeUsers) * 100;

                        return (
                          <div key={sede.id} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <SedeIcon className="size-4 text-primary dark:text-primary-300 shrink-0" />
                                <span className="text-xs sm:text-[13px] font-semibold text-foreground truncate">
                                  {sede.nombre}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
                                  ({sede.codigo})
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs sm:text-sm font-bold text-foreground tabular-nums w-12 text-right">
                                  {sede.usuarios}
                                </span>
                                <span className="text-xs font-semibold text-muted-foreground w-9 text-right tabular-nums">
                                  {sede.porcentaje}%
                                </span>
                              </div>
                            </div>
                            {/* Barra de comparación horizontal (2.5 de altura como en Dashboard) */}
                            <div className="w-full h-2.5 bg-muted/40 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500 bg-primary"
                                style={{ width: `${barWidthPercent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
