"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getAssetPath } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton, InputGroupText } from "@/components/ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fetchCurrentAuthProfile } from "@/modules/gestion-usuarios/services/client-usuarios";
import { MustChangePasswordDialog } from "./must-change-password-dialog";

export function LoginSSOForm({ className }: { className?: string }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showMustChangePassword, setShowMustChangePassword] = useState(false);

  // Redirigir a dashboard si ya existe una sesión activa en Firebase y no requiere cambio de clave
  useEffect(() => {
    if (!authLoading && user && !showMustChangePassword) {
      fetchCurrentAuthProfile()
        .then((profile) => {
          if (profile.debeCambiarPassword) {
            setShowMustChangePassword(true);
          } else {
            router.replace("/dashboard");
          }
        })
        .catch(() => {
          router.replace("/dashboard");
        });
    }
  }, [user, authLoading, showMustChangePassword, router]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Validaciones locales
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailEmpty = formData.email.trim() === "";
  const isEmailValidFormat = emailRegex.test(formData.email);
  const emailErrorMsg = isEmailEmpty
    ? "Ingresa tu correo electrónico."
    : (!isEmailValidFormat ? "Ingresa un correo válido." : null);

  const isPasswordEmpty = formData.password === "";
  const isPasswordShort = formData.password.length > 0 && formData.password.length < 8;
  const passwordErrorMsg = isPasswordEmpty
    ? "Ingresa tu contraseña."
    : (isPasswordShort ? "La contraseña debe tener mínimo 8 caracteres." : null);

  const hasErrors = !!emailErrorMsg || !!passwordErrorMsg;
  const isFormValid = !isEmailEmpty && !isPasswordEmpty && !hasErrors;

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setGlobalError(null);
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase/client");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

      toast.success("Sesión iniciada con éxito");
      router.replace("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error("Error en Google Login", {
        description: error.message || "No se pudo iniciar sesión con Google.",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const showValidationToast = () => {
    setTouched({ email: true, password: true });
    let msg = "Por favor, completa los datos solicitados para continuar.";
    if (isEmailEmpty && isPasswordEmpty) {
      msg = "Por favor, ingresa tu correo institucional y contraseña para continuar.";
    } else if (isEmailEmpty) {
      msg = "Por favor, ingresa tu correo institucional para continuar.";
    } else if (isPasswordEmpty) {
      msg = "Por favor, ingresa tu contraseña para continuar.";
    } else if (hasErrors) {
      msg = "Por favor, corrige los errores del formulario para continuar.";
    }
    toast.warning("Datos incompletos", { description: msg });
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      showValidationToast();
      return;
    }

    setIsLoading(true);
    setGlobalError(null);

    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase/client");
      await signInWithEmailAndPassword(
        auth,
        formData.email.trim().toLowerCase(),
        formData.password
      );

      // Verificar si requiere cambio de clave en primer login
      const profile = await fetchCurrentAuthProfile().catch(() => null);

      if (profile?.debeCambiarPassword) {
        setShowMustChangePassword(true);
        toast.info("Cambio de contraseña requerido", {
          description: "Debes actualizar tu contraseña temporal antes de continuar.",
        });
      } else {
        toast.success("Sesión iniciada con éxito");
        router.replace("/dashboard");
      }
    } catch (error: any) {
      console.error("Error al autenticar credenciales:", error);
      let errorMsg = "Correo institucional o contraseña incorrectos.";
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-email"
      ) {
        errorMsg = "Correo institucional o contraseña incorrectos.";
      } else if (error.code === "auth/too-many-requests") {
        errorMsg = "Demasiados intentos fallidos. Por favor, intenta más tarde.";
      } else if (error.code === "auth/user-disabled") {
        errorMsg = "Esta cuenta de usuario ha sido desactivada por el administrador.";
      }
      setGlobalError(errorMsg);
      toast.error("Error al iniciar sesión", {
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "relative z-10 w-full max-w-lg min-h-[550px] sm:min-h-[650px] flex flex-col justify-center rounded-xl border border-border bg-card p-6 sm:p-10 shadow-lg text-card-foreground",
        className
      )}
    >
      <div className="mb-6 flex items-center justify-between">
        <Image
          src={getAssetPath("/horizontal-light.svg")}
          alt="Logo Conecta MINEDUC"
          width={180}
          height={45}
          className="dark:hidden"
          unoptimized
        />
        <Image
          src={getAssetPath("/horizontal-dark.svg")}
          alt="Logo Conecta MINEDUC"
          width={180}
          height={45}
          className="hidden dark:block"
          unoptimized
        />
        <ThemeToggle />
      </div>

      <Separator className="mb-6" />

      <div className="mb-8 text-center sm:text-left">
        <h1 className="sr-only font-heading text-h2 font-bold">Conecta MINEDUC</h1>
        <h2 className="font-heading text-h2 font-semibold mb-2 text-primary-500 dark:text-primary-300">Iniciar sesión</h2>
        <p className="font-sans text-body-sm text-muted-foreground text-balance">
          Conecta MINEDUC centraliza la administración de accesos y permisos a las aplicaciones y recursos institucionales.
        </p>
      </div>

      <div className="space-y-6">
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
          leftIcon={
            isGoogleLoading ? (
              <span className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
            )
          }
        >
          {isGoogleLoading ? "Conectando con Google..." : "Iniciar sesión con Google"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground font-sans font-medium">O continúa con tu cuenta</span>
          </div>
        </div>

        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          {globalError && (
            <div className="p-3 bg-danger-100 border border-danger-200 text-danger-700 text-body-sm rounded-lg font-sans">
              {globalError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-body-sm font-semibold font-sans text-foreground" htmlFor="email">
              Correo institucional <span className="text-danger">*</span>
            </label>
            <InputGroup state={touched.email && emailErrorMsg ? "error" : "default"}>
              <InputGroupAddon align="inline-start">
                <InputGroupText>
                  <Mail className="h-5 w-5" />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                name="email"
                placeholder="usuario@educacion.gob.ec"
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, email: e.target.value }));
                  if (globalError) setGlobalError(null);
                }}
                onBlur={() => handleBlur("email")}
                disabled={isLoading || isGoogleLoading}
                aria-invalid={touched.email && !!emailErrorMsg}
                aria-describedby={touched.email && emailErrorMsg ? "email-error" : undefined}
                required
              />
            </InputGroup>
            {touched.email && emailErrorMsg && (
              <p id="email-error" className="text-body-sm text-danger mt-1 font-sans font-medium">
                {emailErrorMsg}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-body-sm font-semibold font-sans text-foreground" htmlFor="password">
                Contraseña <span className="text-danger">*</span>
              </label>
            </div>
            <InputGroup state={touched.password && passwordErrorMsg ? "error" : "default"}>
              <InputGroupAddon align="inline-start">
                <InputGroupText>
                  <Lock className="h-5 w-5" />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, password: e.target.value }));
                  if (globalError) setGlobalError(null);
                }}
                onBlur={() => handleBlur("password")}
                disabled={isLoading || isGoogleLoading}
                aria-invalid={touched.password && !!passwordErrorMsg}
                aria-describedby={touched.password && passwordErrorMsg ? "password-error" : undefined}
                required
              />
              <InputGroupAddon align="inline-end">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InputGroupButton
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </InputGroupButton>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </InputGroupAddon>
            </InputGroup>
            {touched.password && passwordErrorMsg && (
              <p id="password-error" className="text-body-sm text-danger mt-1 font-sans font-medium">
                {passwordErrorMsg}
              </p>
            )}
          </div>

          <div
            className="w-full"
            onClick={(e) => {
              if (!isFormValid) {
                e.preventDefault();
                showValidationToast();
              }
            }}
          >
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={!isFormValid || isLoading || isGoogleLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </div>
        </form>
      </div>

      <MustChangePasswordDialog
        open={showMustChangePassword}
        onSuccess={() => {
          setShowMustChangePassword(false);
          router.replace("/dashboard");
        }}
      />
    </div>
  );
}
