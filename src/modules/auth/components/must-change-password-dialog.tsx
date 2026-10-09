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
import {
  InputGroup,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Eye, EyeOff, AlertCircle, ShieldAlert, Loader2 } from "lucide-react";
import { updateMyPasswordApi } from "@/modules/gestion-usuarios/services/client-usuarios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MustChangePasswordDialogProps {
  open: boolean;
  onSuccess?: () => void;
}

export function MustChangePasswordDialog({
  open,
  onSuccess,
}: MustChangePasswordDialogProps) {
  const router = useRouter();
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword.trim()) {
      nextErrors.newPassword = "Por favor ingresa tu nueva contraseña.";
    } else if (newPassword.length < 8) {
      nextErrors.newPassword = "La contraseña debe tener al menos 8 caracteres.";
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "Por favor confirma tu nueva contraseña.";
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
      await updateMyPasswordApi(newPassword);
      toast.success("Contraseña actualizada exitosamente", {
        description: "Tu nueva clave ha sido establecida. Ingresando al sistema...",
      });
      if (onSuccess) {
        onSuccess();
      } else {
        router.replace("/dashboard");
      }
    } catch (err: any) {
      console.error("Error al actualizar la contraseña obligatoria:", err);
      toast.error("Error al actualizar contraseña", {
        description: err.message || "No se pudo actualizar la contraseña.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        variant="default"
        className="sm:max-w-md bg-background"
        showCloseButton={false}
      >
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="size-9 rounded-full bg-warning/15 flex items-center justify-center text-warning shrink-0">
              <ShieldAlert className="size-5" />
            </div>
            <DialogTitle className="text-lg font-heading font-bold text-foreground">
              Cambio de clave obligatorio
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            El administrador ha requerido que actualices tu contraseña temporal antes de continuar al sistema.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-2" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nueva Contraseña */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nueva contraseña <span className="text-danger">*</span>
            </label>
            <InputGroup state={errors.newPassword ? "error" : "default"}>
              <InputGroupInput
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
                }}
                placeholder="Mínimo 8 caracteres"
                className="text-xs"
                disabled={isSubmitting}
              />
              <InputGroupButton
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar clave" : "Mostrar clave"}
                className="text-muted-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </InputGroupButton>
            </InputGroup>
            {errors.newPassword && (
              <p className="text-[11px] text-danger font-medium flex items-center gap-1.5 animate-in fade-in-50 duration-150">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{errors.newPassword}</span>
              </p>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Confirmar nueva contraseña <span className="text-danger">*</span>
            </label>
            <InputGroup state={errors.confirmPassword ? "error" : "default"}>
              <InputGroupInput
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                placeholder="Repite la nueva contraseña"
                className="text-xs"
                disabled={isSubmitting}
              />
              <InputGroupButton
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Ocultar clave" : "Mostrar clave"}
                className="text-muted-foreground"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </InputGroupButton>
            </InputGroup>
            {errors.confirmPassword && (
              <p className="text-[11px] text-danger font-medium flex items-center gap-1.5 animate-in fade-in-50 duration-150">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Guardando nueva contraseña...
                </span>
              ) : (
                "Establecer contraseña y continuar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
