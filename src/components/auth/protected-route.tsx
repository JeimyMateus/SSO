"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { fetchCurrentAuthProfile } from "@/modules/gestion-usuarios/services/client-usuarios";
import { toast } from "sonner";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!loading) {
      if (!user) {
        setIsVerifying(false);
        router.replace("/login-sso");
      } else {
        fetchCurrentAuthProfile()
          .then((profile) => {
            if (isMounted) {
              if (profile.usuario && profile.usuario.active === false) {
                toast.error("Acceso denegado", {
                  description: "Tu usuario está inactivo. Contacta con el administrador.",
                });
                logout().then(() => router.replace("/login-sso"));
              } else {
                setIsVerifying(false);
              }
            }
          })
          .catch((err) => {
            if (isMounted) {
              const errMsg = err.message || "";
              if (errMsg.includes("verificación en dos pasos") || errMsg.includes("MFA_REQUIRED")) {
                toast.info("Verificación requerida", {
                  description: "Por favor, completa la verificación de dos pasos.",
                });
                router.replace("/doble-factor");
                return;
              }

              toast.error("Acceso denegado", {
                description: errMsg || "Tu usuario no tiene acceso al sistema.",
              });
              logout().then(() => router.replace("/login-sso"));
            }
          });
      }
    }

    return () => {
      isMounted = false;
    };
  }, [user, loading, router, logout]);

  if (loading || isVerifying) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
          <p className="text-body-sm font-medium text-muted-foreground animate-pulse">
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
