"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, EyeOff, AlertCircle, Info, Loader2 } from "lucide-react";
import { UsuarioItem } from "../data/usuarios-data";
import { changeUserPasswordApi } from "../services/client-usuarios";
import { toast } from "sonner";

interface UsuarioPasswordDialogProps {
  usuario: UsuarioItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (usuarioId: string) => void;
}

export function UsuarioPasswordDialog({
  usuario,
  open,
  onOpenChange,
  onSuccess,
}: UsuarioPasswordDialogProps) {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [requireResetNextLogin, setRequireResetNextLogin] = React.useState(true);
  const [sendEmailNotification, setSendEmailNotification] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  React.useEffect(() => {
    if (open) {
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open]);

  if (!usuario) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword.trim()) {
      nextErrors.newPassword = "Por favor completa este campo.";
    } else if (newPassword.length < 8) {
      nextErrors.newPassword = "La contraseña debe tener al menos 8 caracteres.";
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "Por favor completa este campo.";
    } else if (newPassword && newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "Las contraseñas no coinciden.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await changeUserPasswordApi(usuario.id, newPassword, requireResetNextLogin);
      onSuccess(usuario.id);
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error al actualizar contraseña:", err);
      toast.error("Error al actualizar contraseña", {
        description: err.message || "No se pudo actualizar la contraseña en Firebase Auth.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="default" className="sm:max-w-md bg-background">
        <TooltipProvider delayDuration={150}>
          <DialogHeader>
            <DialogTitle className="text-lg font-heading font-bold text-foreground">
              Cambiar clave de usuario
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Restablece o define una nueva contraseña para este usuario.
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-3.5" />

          {/* Resumen estructurado del usuario */}
          <div className="rounded-lg border border-border bg-card p-3 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-muted-foreground font-medium">Usuario objetivo</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h4 className="text-sm font-semibold text-foreground leading-tight truncate cursor-default">
                      {usuario.nombre} {usuario.apellidos}
                    </h4>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{usuario.nombre} {usuario.apellidos}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Badge
                appearance="soft"
                tone={usuario.estado === "Activo" ? "success" : "neutral"}
                size="sm"
                className="text-[11px] shrink-0"
              >
                {usuario.estado}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block">Identificación</span>
                <span className="font-mono font-medium text-foreground">
                  {usuario.tipoDocumento || "C.I."} {usuario.identificacion}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-muted-foreground block">Correo institucional</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-foreground truncate block font-medium cursor-default">
                      {usuario.correo}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{usuario.correo}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Formulario con validación UX/UI */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 mt-1">
            {/* Nueva Contraseña */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  Nueva contraseña <span className="text-danger">*</span>
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label="Requisitos de contraseña"
                      className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded focus-visible:outline-none"
                    >
                      <Info className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Mínimo 8 caracteres, alfanumérico con mayúsculas y símbolos</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <InputGroup
                size="sm"
                state={errors.newPassword ? "error" : "default"}
                rightIcon={
                  <InputGroupButton
                    size="icon-xs"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar clave" : "Mostrar clave"}
                  >
                    {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </InputGroupButton>
                }
              >
                <InputGroupInput
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa la nueva contraseña"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) {
                      setErrors((prev) => ({ ...prev, newPassword: undefined }));
                    }
                  }}
                  aria-invalid={!!errors.newPassword}
                />
              </InputGroup>

              {errors.newPassword ? (
                <p className="text-[11px] text-danger font-medium flex items-center gap-1.5 animate-in fade-in-50 duration-150">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{errors.newPassword}</span>
                </p>
              ) : (
                <span className="text-[11px] text-muted-foreground">
                  Mínimo 8 caracteres, alfanumérico con mayúsculas y símbolos.
                </span>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                Confirmar nueva contraseña <span className="text-danger">*</span>
              </label>
              <InputGroup
                size="sm"
                state={errors.confirmPassword ? "error" : "default"}
                rightIcon={
                  <InputGroupButton
                    size="icon-xs"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Ocultar clave" : "Mostrar clave"}
                  >
                    {showConfirmPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </InputGroupButton>
                }
              >
                <InputGroupInput
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Vuelve a ingresar la contraseña"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  aria-invalid={!!errors.confirmPassword}
                />
              </InputGroup>

              {errors.confirmPassword && (
                <p className="text-[11px] text-danger font-medium flex items-center gap-1.5 animate-in fade-in-50 duration-150">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>

          {/* Opciones de seguridad */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-border/50 text-xs">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <Checkbox
                checked={requireResetNextLogin}
                onCheckedChange={(checked) => setRequireResetNextLogin(Boolean(checked))}
                className="mt-0.5"
              />
              <span className="text-muted-foreground leading-snug">
                Exigir al usuario cambiar su clave en el próximo inicio de sesión.
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer select-none">
              <Checkbox
                checked={sendEmailNotification}
                onCheckedChange={(checked) => setSendEmailNotification(Boolean(checked))}
                className="mt-0.5"
              />
              <span className="text-muted-foreground leading-snug">
                Enviar notificación con enlace seguro a <strong className="text-foreground font-medium">{usuario.correo}</strong>.
              </span>
            </label>
          </div>

          {/* Botones verticales apilados a ancho completo */}
          <div className="flex flex-col gap-2.5 w-full pt-3 border-t border-border mt-1">
            <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Actualizando contraseña...
                </span>
              ) : (
                "Actualizar contraseña"
              )}
            </Button>
            <Button
              type="button"
              variant="neutral"
              className="w-full"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}
