"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserPlus, Download, ChevronDown, FileText, FileSpreadsheet, ImageIcon, Loader2 } from "lucide-react";
import { Link } from "@/routing";
import { toast } from "sonner";


import {
  UsuarioItem,
} from "../data/usuarios-data";
import { UsuariosFilterBar } from "../components/usuarios-filter-bar";
import { UsuariosTable } from "../components/usuarios-table";
import { UsuarioModalDetail } from "../components/usuario-modal-detail";
import { UsuarioPasswordDialog } from "../components/usuario-password-dialog";
import { UsuarioModalForm } from "../components/usuario-modal-form";
import { UsuarioModalAccess } from "../components/usuario-modal-access";
import {
  UsuariosSummaryCards,
  SummaryFilterType,
} from "../components/usuarios-summary-cards";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchUsuarios,
  createUsuarioApi,
  updateUsuarioApi,
  deleteUsuarioApi,
} from "../services/client-usuarios";

export function UsuariosView() {
  const { user, loading: authLoading } = useAuth();
  const [usuarios, setUsuarios] = React.useState<UsuarioItem[]>([]);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  // Cargar usuarios desde Firestore
  const loadUsuarios = React.useCallback(async () => {
    setIsLoadingData(true);
    try {
      const data = await fetchUsuarios();
      setUsuarios(data);
    } catch (error: any) {
      console.error("Error al obtener usuarios desde Firestore:", error);
      toast.error("Error al cargar usuarios", {
        description: error.message || "No se pudo conectar con Firestore Emulator.",
      });
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  React.useEffect(() => {
    if (user) {
      loadUsuarios();
    } else if (!authLoading) {
      setIsLoadingData(false);
    }
  }, [user, authLoading, loadUsuarios]);

  // Filtros
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedSede, setSelectedSede] = React.useState("Todas");
  const [selectedApp, setSelectedApp] = React.useState("Todas");
  const [selectedRol, setSelectedRol] = React.useState("Todos");
  const [selectedEstado, setSelectedEstado] = React.useState("Todos");
  const [filterSinAccesos, setFilterSinAccesos] = React.useState(false);

  // Métricas operacionales para Cards resumen
  const totalCount = usuarios.length;
  const activeCount = React.useMemo(
    () => usuarios.filter((u) => u.estado === "Activo").length,
    [usuarios]
  );
  const inactiveCount = React.useMemo(
    () => usuarios.filter((u) => u.estado === "Inactivo").length,
    [usuarios]
  );
  const sinAccesosCount = React.useMemo(
    () =>
      usuarios.filter((u) => {
        const totalAsig = u.sedes?.reduce(
          (acc, s) => acc + (s.asignaciones?.length || 0),
          0
        ) || 0;
        return totalAsig === 0;
      }).length,
    [usuarios]
  );

  // Filtro activo reflejado en Cards
  const activeSummaryFilter = React.useMemo<SummaryFilterType | null>(() => {
    if (filterSinAccesos) return "sin-accesos";
    if (selectedEstado === "Activo") return "activos";
    if (selectedEstado === "Inactivo") return "inactivos";
    if (selectedEstado === "Todos" && !filterSinAccesos) return "total";
    return null;
  }, [filterSinAccesos, selectedEstado]);

  const handleSelectSummaryFilter = (filter: SummaryFilterType) => {
    if (filter === "total") {
      setSelectedEstado("Todos");
      setFilterSinAccesos(false);
    } else if (filter === "activos") {
      if (activeSummaryFilter === "activos") {
        setSelectedEstado("Todos");
        setFilterSinAccesos(false);
      } else {
        setSelectedEstado("Activo");
        setFilterSinAccesos(false);
      }
    } else if (filter === "inactivos") {
      if (activeSummaryFilter === "inactivos") {
        setSelectedEstado("Todos");
        setFilterSinAccesos(false);
      } else {
        setSelectedEstado("Inactivo");
        setFilterSinAccesos(false);
      }
    } else if (filter === "sin-accesos") {
      if (activeSummaryFilter === "sin-accesos") {
        setFilterSinAccesos(false);
      } else {
        setFilterSinAccesos(true);
        setSelectedEstado("Todos");
      }
    }
  };

  // Modales y Drawers
  const [detailUser, setDetailUser] = React.useState<UsuarioItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const [passwordUser, setPasswordUser] = React.useState<UsuarioItem | null>(null);
  const [isPasswordOpen, setIsPasswordOpen] = React.useState(false);

  const [formUser, setFormUser] = React.useState<UsuarioItem | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const [accessUser, setAccessUser] = React.useState<UsuarioItem | null>(null);
  const [isAccessOpen, setIsAccessOpen] = React.useState(false);

  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "success" | "danger" | "warning" | "info";
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    confirmText: "Confirmar",
    cancelText: "Cerrar",
    variant: "warning",
    onConfirm: () => { },
  });

  // Filtrado reactivo
  const filteredUsuarios = React.useMemo(() => {
    return usuarios.filter((user) => {
      // 0. Usuarios sin accesos
      if (filterSinAccesos) {
        const totalAsig = user.sedes?.reduce(
          (acc, s) => acc + (s.asignaciones?.length || 0),
          0
        ) || 0;
        if (totalAsig > 0) return false;
      }

      // 1. Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const fullName = `${user.nombre} ${user.apellidos}`.toLowerCase();
        const matchesName = fullName.includes(query);
        const idDoc = user.documentoIdentificacion || user.identificacion || "";
        const matchesId = idDoc.toLowerCase().includes(query);
        const emailStr = (user.email || user.correo || "").toLowerCase();
        const matchesEmail = emailStr.includes(query);
        if (!matchesName && !matchesId && !matchesEmail) return false;
      }

      // 2. Sede
      if (selectedSede !== "Todas") {
        if (!user.sedes?.some((s) => s.sedeNombre === selectedSede)) return false;
      }

      // 3. Aplicación
      if (selectedApp !== "Todas") {
        const hasApp = user.sedes?.some((s) =>
          s.asignaciones?.some((a) => a.aplicacionNombre === selectedApp)
        );
        if (!hasApp) return false;
      }

      // 4. Rol
      if (selectedRol !== "Todos") {
        const hasRol = user.sedes?.some((s) =>
          s.asignaciones?.some((a) => a.rolNombre === selectedRol)
        );
        if (!hasRol) return false;
      }

      // 5. Estado
      if (selectedEstado !== "Todos" && user.estado !== selectedEstado) {
        return false;
      }

      return true;
    });
  }, [
    usuarios,
    searchTerm,
    selectedSede,
    selectedApp,
    selectedRol,
    selectedEstado,
    filterSinAccesos,
  ]);

  // Handlers
  const handleOpenDetail = (usuario: UsuarioItem) => {
    setDetailUser(usuario);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (usuario: UsuarioItem) => {
    setFormUser(usuario);
    setIsFormOpen(true);
  };

  const handleOpenCreate = () => {
    setFormUser(null);
    setIsFormOpen(true);
  };

  const handleOpenAccess = (usuario: UsuarioItem) => {
    setAccessUser(usuario);
    setIsAccessOpen(true);
  };

  const handleOpenChangePassword = (usuario: UsuarioItem) => {
    setPasswordUser(usuario);
    setIsPasswordOpen(true);
  };

  const handleSaveUser = async (savedUser: UsuarioItem) => {
    try {
      const exists = usuarios.some((u) => u.id === savedUser.id);
      if (exists && savedUser.id) {
        // Actualizar usuario existente en Firestore
        const updated = await updateUsuarioApi(savedUser.id, savedUser);
        setUsuarios((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        if (formUser?.id === updated.id) setFormUser(updated);
        if (accessUser?.id === updated.id) setAccessUser(updated);
        if (detailUser?.id === updated.id) setDetailUser(updated);
      } else {
        // Crear nuevo usuario en Firestore
        const { id, ...dataToCreate } = savedUser;
        const created = await createUsuarioApi(dataToCreate);
        setUsuarios((prev) => [created, ...prev]);
      }
    } catch (error: any) {
      console.error("Error al guardar usuario:", error);
      toast.error("Error al guardar usuario", {
        description: error.message || "No se pudo guardar el usuario en Firestore.",
      });
    }
  };

  const handlePasswordSuccess = (usuarioId: string) => {
    const user = usuarios.find((u) => u.id === usuarioId);
    toast.success("Contraseña actualizada", {
      description: `Se restableció la clave de ${user?.nombre || "el usuario"}.`,
    });
  };

  const handleToggleStatus = (usuario: UsuarioItem) => {
    const isCurrentlyActive = usuario.estado === "Activo";
    const nextStatus = isCurrentlyActive ? "Inactivo" : "Activo";
    const nombreCompleto = `${usuario.nombre} ${usuario.apellidos}`.trim();

    if (isCurrentlyActive) {
      setConfirmDialog({
        open: true,
        variant: "warning",
        title: "¿Inactivar usuario?",
        description: `Estás a punto de inactivar a este usuario. Esta acción suspenderá su acceso a todas las aplicaciones asignadas.`,
        confirmText: "Inactivar",
        cancelText: "Cerrar",
        onConfirm: async () => {
          try {
            const updated = await updateUsuarioApi(usuario.id, { estado: "Inactivo" });
            setUsuarios((prev) =>
              prev.map((u) => (u.id === usuario.id ? updated : u))
            );
            toast.info("Usuario inactivado correctamente", {
              description: `${nombreCompleto} ha pasado a estado Inactivo.`,
            });
          } catch (error: any) {
            console.error("Error al inactivar usuario:", error);
            toast.error("Error al cambiar estado", {
              description: error.message || "No se pudo inactivar el usuario en Firestore.",
            });
          }
        },
      });
    } else {
      setConfirmDialog({
        open: true,
        variant: "success",
        title: "¿Activar usuario?",
        description: `Estás a punto de activar a este usuario. Esta acción restablecerá su acceso a todas las aplicaciones asignadas.`,
        confirmText: "Activar",
        cancelText: "Cerrar",
        onConfirm: async () => {
          try {
            const updated = await updateUsuarioApi(usuario.id, { estado: "Activo" });
            setUsuarios((prev) =>
              prev.map((u) => (u.id === usuario.id ? updated : u))
            );
            toast.success("Usuario activado correctamente", {
              description: `${nombreCompleto} ha pasado a estado Activo.`,
            });
          } catch (error: any) {
            console.error("Error al activar usuario:", error);
            toast.error("Error al activar usuario", {
              description: error.message || "No se pudo activar el usuario en Firestore.",
            });
          }
        },
      });
    }
  };

  const [isExportingImage, setIsExportingImage] = React.useState(false);

  // Exportar captura de imagen (foto) de la tabla
  const handleExportTableImage = async () => {
    setIsExportingImage(true);
    toast.info("Generando captura de la tabla...", {
      description: "Preparando imagen PNG en alta resolución.",
    });

    try {
      const container = document.getElementById("usuarios-table-container");
      if (!container) {
        throw new Error("Contenedor de tabla no encontrado.");
      }

      // Generar snapshot canvas con diseño institucional nítido
      const width = Math.max(container.scrollWidth || 1200, 1100);
      const rowHeight = 44;
      const headerHeight = 110;
      const displayedUsers = filteredUsuarios.slice(0, 15);
      const totalHeight = headerHeight + displayedUsers.length * rowHeight + 60;

      const canvas = document.createElement("canvas");
      canvas.width = width * 2; // retina 2x
      canvas.height = totalHeight * 2;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("No se pudo inicializar el contexto de imagen.");
      }

      ctx.scale(2, 2);

      // Fondo blanco institucional
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, totalHeight);

      // Barra superior institucional
      ctx.fillStyle = "#024a87"; // Primary brand
      ctx.fillRect(0, 0, width, 8);

      // Encabezado institucional
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 18px Inter, system-ui, sans-serif";
      ctx.fillText("Ministerio de Educación — Reporte de Usuarios", 24, 40);

      ctx.fillStyle = "#64748b";
      ctx.font = "12px Inter, system-ui, sans-serif";
      const fechaStr = new Date().toLocaleDateString("es-EC", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      ctx.fillText(`Generado el: ${fechaStr} | Total registros filtrados: ${filteredUsuarios.length}`, 24, 62);

      // Cabecera de la tabla
      const yHeader = 85;
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(20, yHeader, width - 40, 36);

      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 11px Inter, system-ui, sans-serif";
      const colX = {
        user: 32,
        docTipo: 240,
        docNum: 350,
        email: 470,
        accesos: 670,
        estado: 880,
        fecha: 980,
      };

      ctx.fillText("USUARIO", colX.user, yHeader + 22);
      ctx.fillText("TIPO DOC", colX.docTipo, yHeader + 22);
      ctx.fillText("N.º DOCUMENTO", colX.docNum, yHeader + 22);
      ctx.fillText("CORREO ELECTRÓNICO", colX.email, yHeader + 22);
      ctx.fillText("SEDES / ACCESOS", colX.accesos, yHeader + 22);
      ctx.fillText("ESTADO", colX.estado, yHeader + 22);
      ctx.fillText("FECHA REGISTRO", colX.fecha, yHeader + 22);

      // Filas
      let yRow = yHeader + 36;
      displayedUsers.forEach((usr, idx) => {
        // Fondo alterno suave
        if (idx % 2 === 1) {
          ctx.fillStyle = "#f8fafc";
          ctx.fillRect(20, yRow, width - 40, rowHeight);
        }

        // Borde inferior sutil
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(20, yRow + rowHeight);
        ctx.lineTo(width - 20, yRow + rowHeight);
        ctx.stroke();

        const textY = yRow + 26;

        // Usuario
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 11px Inter, system-ui, sans-serif";
        const nom = `${usr.nombre} ${usr.apellidos}`;
        ctx.fillText(nom.length > 25 ? nom.slice(0, 24) + "…" : nom, colX.user, textY);

        // Tipo doc
        ctx.fillStyle = "#475569";
        ctx.font = "11px Inter, system-ui, sans-serif";
        ctx.fillText(usr.tipoDocumento || "Cédula", colX.docTipo, textY);

        // Num doc
        ctx.fillText(usr.documentoIdentificacion || usr.identificacion || "—", colX.docNum, textY);

        // Email
        const email = usr.email || usr.correo || "—";
        ctx.fillText(email.length > 28 ? email.slice(0, 27) + "…" : email, colX.email, textY);

        // Accesos resumen
        const sedesTotal = usr.sedes?.length || 0;
        const appsTotal = usr.sedes?.reduce((acc, s) => acc + (s.asignaciones?.length || 0), 0) || 0;
        const accesosTxt = appsTotal > 0 ? `${sedesTotal} sedes (${appsTotal} apps)` : "Sin accesos";
        ctx.fillStyle = appsTotal > 0 ? "#0369a1" : "#d97706";
        ctx.fillText(accesosTxt, colX.accesos, textY);

        // Estado badge pill
        const isActivo = usr.estado === "Activo";
        ctx.fillStyle = isActivo ? "#ecfdf5" : "#f1f5f9";
        const badgeX = colX.estado;
        const badgeY = textY - 14;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, 60, 20, 10);
        ctx.fill();

        ctx.fillStyle = isActivo ? "#10b981" : "#94a3b8";
        ctx.beginPath();
        ctx.arc(badgeX + 10, badgeY + 10, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isActivo ? "#065f46" : "#475569";
        ctx.font = "bold 10px Inter, system-ui, sans-serif";
        ctx.fillText(usr.estado, badgeX + 18, textY);

        // Fecha
        ctx.fillStyle = "#64748b";
        ctx.font = "11px Inter, system-ui, sans-serif";
        ctx.fillText(usr.fechaCreacion || "—", colX.fecha, textY);

        yRow += rowHeight;
      });

      // Pie de foto institucional
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px Inter, system-ui, sans-serif";
      ctx.fillText(
        displayedUsers.length < filteredUsuarios.length
          ? `* Vista preliminar de ${displayedUsers.length} de ${filteredUsuarios.length} usuarios exportados en formato PNG institucional.`
          : `* Exportación completa de ${displayedUsers.length} usuarios en formato PNG institucional.`,
        24,
        yRow + 28
      );

      // Descarga de archivo PNG
      const link = document.createElement("a");
      link.download = `reporte-usuarios-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success("Foto de la tabla descargada", {
        description: "Se guardó correctamente la imagen en formato PNG.",
      });
    } catch (err) {
      console.error(err);
      toast.error("Error al exportar imagen", {
        description: "No se pudo generar la foto de la tabla.",
      });
    } finally {
      setIsExportingImage(false);
    }
  };

  // Exportar CSV
  const handleExportCSV = () => {
    try {
      const headers = ["Usuario", "Tipo Documento", "N.º Documento", "Correo", "Sedes", "Apps Asignadas", "Estado", "Fecha Creación"];
      const rows = filteredUsuarios.map((u) => [
        `"${u.nombre} ${u.apellidos}"`,
        `"${u.tipoDocumento || "Cédula"}"`,
        `"${u.documentoIdentificacion || u.identificacion || ""}"`,
        `"${u.email || u.correo || ""}"`,
        `"${u.sedes?.length || 0}"`,
        `"${u.sedes?.reduce((acc, s) => acc + (s.asignaciones?.length || 0), 0) || 0}"`,
        `"${u.estado}"`,
        `"${u.fechaCreacion || ""}"`,
      ]);

      const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte-usuarios-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("CSV descargado exitosamente", {
        description: `${filteredUsuarios.length} usuarios exportados.`,
      });
    } catch {
      toast.error("Error al exportar CSV");
    }
  };

  // Exportar XLSX
  const handleExportXLSX = () => {
    // Al ser descarga en cliente sin dependencias pesadas, entregamos archivo CSV compatible con Excel
    handleExportCSV();
  };

  // Exportar PDF
  const handleExportPDF = () => {
    // Imprimir o descargar formato institucional
    toast.info("Generando reporte PDF...", {
      description: "Preparando documento institucional para descarga.",
    });
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full pb-4">
      <div className="flex flex-col gap-6 w-full h-full">
        {/* Main User Container */}
        <div className="border border-border rounded-xl bg-surface p-6 shadow-sm flex flex-col gap-6">

          {/* Cabecera */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary dark:text-white">
                Usuarios
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                Administra los usuarios, sus sedes y accesos a las aplicaciones institucionales.
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
              {/* Menú de Exportación según UI Kit */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 flex-1 sm:flex-none text-xs">
                    {isExportingImage ? (
                      <Loader2 className="size-4 animate-spin text-primary" />
                    ) : (
                      <Download className="size-4" />
                    )}
                    Exportar
                    <ChevronDown className="size-3.5 opacity-60 ml-0.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-3 space-y-2">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">Menú de Exportación</p>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      Menú desplegable de selección rápida de formatos según permisos institucionales.
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleExportTableImage}
                      disabled={isExportingImage}
                      className="flex items-center justify-start gap-2 p-2.5 rounded-xl border border-border bg-muted/30 hover:bg-primary/10 hover:border-primary/40 transition-all text-xs font-semibold h-auto"
                    >
                      <ImageIcon className="size-4 text-primary shrink-0" />
                      <div className="text-left">
                        <span className="block leading-none">Foto / PNG</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Tabla visual</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleExportPDF}
                      className="flex items-center justify-start gap-2 p-2.5 rounded-xl border border-border bg-muted/30 hover:bg-primary/10 hover:border-primary/40 transition-all text-xs font-semibold h-auto"
                    >
                      <FileText className="size-4 text-danger shrink-0" />
                      <div className="text-left">
                        <span className="block leading-none">PDF</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Documento</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleExportCSV}
                      className="flex items-center justify-start gap-2 p-2.5 rounded-xl border border-border bg-muted/30 hover:bg-primary/10 hover:border-primary/40 transition-all text-xs font-semibold h-auto"
                    >
                      <FileSpreadsheet className="size-4 text-success shrink-0" />
                      <div className="text-left">
                        <span className="block leading-none">CSV</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Datos planos</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleExportXLSX}
                      className="flex items-center justify-start gap-2 p-2.5 rounded-xl border border-border bg-muted/30 hover:bg-primary/10 hover:border-primary/40 transition-all text-xs font-semibold h-auto"
                    >
                      <FileSpreadsheet className="size-4 text-success shrink-0" />
                      <div className="text-left">
                        <span className="block leading-none">XLSX</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Excel libro</span>
                      </div>
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="primary" onClick={handleOpenCreate} className="gap-2 flex-1 sm:flex-none text-xs">
                <UserPlus className="size-4" /> Crear usuario
              </Button>
            </div>
          </div>

          {/* Cards resumen operativo */}
          <UsuariosSummaryCards
            total={totalCount}
            activos={activeCount}
            inactivos={inactiveCount}
            sinAccesos={sinAccesosCount}
            activeFilter={activeSummaryFilter}
            onSelectFilter={handleSelectSummaryFilter}
          />

          {/* Separador entre resumen y filtros */}
          <Separator />

          {/* Filtros */}
          <UsuariosFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedEstado={selectedEstado}
            onEstadoChange={(est) => {
              setSelectedEstado(est);
              if (filterSinAccesos) setFilterSinAccesos(false);
            }}
            selectedSede={selectedSede}
            onSedeChange={setSelectedSede}
            selectedApp={selectedApp}
            onAppChange={setSelectedApp}
            selectedRol={selectedRol}
            onRolChange={setSelectedRol}
            filterSinAccesos={filterSinAccesos}
            onFilterSinAccesosChange={setFilterSinAccesos}
          />

          {/* Tabla */}
          <UsuariosTable
            usuarios={filteredUsuarios}
            isLoading={isLoadingData}
            onViewDetail={handleOpenDetail}
            onEdit={handleOpenEdit}
            onManageAccess={handleOpenAccess}
            onChangePassword={handleOpenChangePassword}
            onToggleStatus={handleToggleStatus}
          />
        </div>

        {/* Modales */}
        <UsuarioModalDetail
          usuario={detailUser}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onEdit={(u) => {
            setIsDetailOpen(false);
            handleOpenEdit(u);
          }}
        />

        <UsuarioModalForm
          usuarioToEdit={formUser}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSave={handleSaveUser}
        />

        <UsuarioModalAccess
          usuario={accessUser}
          allUsuarios={usuarios}
          open={isAccessOpen}
          onOpenChange={setIsAccessOpen}
          onSave={handleSaveUser}
        />

        <UsuarioPasswordDialog
          usuario={passwordUser}
          open={isPasswordOpen}
          onOpenChange={setIsPasswordOpen}
          onSuccess={handlePasswordSuccess}
        />

        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
        />

      </div>
    </div>
  );
}
