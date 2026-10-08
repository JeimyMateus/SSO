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

export function LoginSSOForm({ className }: { className?: string }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Redirigir a dashboard si ya existe una sesión activa en Firebase
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

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
      router.replace('/dashboard');
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

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      showValidationToast();
      return;
    }

    setIsLoading(true);
    setGlobalError(null);

    // Simular validación frontend y backend mock
    setTimeout(() => {
      setIsLoading(false);
      router.push('/doble-factor');
    }, 1500);
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
          {isGoogleLoading ? "Procesando..." : "Continuar con Google"}
        </Button>

        <div className="flex items-center gap-4 text-xs">
          <span className="flex-1 border-t border-border" />
          <span className="text-muted-foreground font-sans">
            O iniciar sesión con credenciales
          </span>
          <span className="flex-1 border-t border-border" />
        </div>

        <form onSubmit={handleCredentialsLogin} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="font-sans text-body-sm font-medium text-foreground"
            >
              Correo institucional
            </label>
            <InputGroup state={touched.email ? (emailErrorMsg ? "error" : "success") : "default"}>
              <InputGroupAddon>
                <InputGroupText>
                  <Mail className="size-4" />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                placeholder="ejemplo@mineduc.cl"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                onBlur={() => handleBlur("email")}
                disabled={isLoading || isGoogleLoading}
                aria-invalid={touched.email && !!emailErrorMsg}
                aria-errormessage={touched.email && emailErrorMsg ? "email-error" : undefined}
                required
              />
            </InputGroup>
            {touched.email && emailErrorMsg && (
              <p id="email-error" className="text-body-sm text-danger mt-1 font-sans font-medium">
                {emailErrorMsg}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="font-sans text-body-sm font-medium text-foreground"
            >
              Contraseña
            </label>
            <InputGroup state={touched.password ? (passwordErrorMsg ? "error" : "success") : "default"}>
              <InputGroupAddon>
                <InputGroupText>
                  <Lock className="size-4" />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                onBlur={() => handleBlur("password")}
                disabled={isLoading || isGoogleLoading}
                aria-invalid={touched.password && !!passwordErrorMsg}
                aria-errormessage={touched.password && passwordErrorMsg ? "password-error" : undefined}
                required
              />
              <InputGroupAddon align="inline-end">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InputGroupButton
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        disabled={isLoading || isGoogleLoading}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
    </div>
  );
}
