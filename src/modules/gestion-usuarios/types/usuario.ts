export interface PermisoRecurso {
  recursoCodigo: string;
  recursoNombre: string;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
}

export interface Aplicacion {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface Sede {
  id: string;
  codigo: string;
  nombre: string;
  tipo: "Planta Central" | "Coordinación Zonal" | "Distrito";
}

export interface RolAplicacion {
  id: string;
  aplicacionId: string;
  aplicacionNombre: string;
  rolId: string;
  rolNombre: string;
  usuariosMaxPermitidos?: number;
}

export interface RolAplicacionSede {
  sedeId: string;
  sedeNombre: string;
  rolAplicacionId: string;
  usuariosMaxPermitidos?: number;
}

export interface UsuarioSedeRolAplicacion {
  id: string;
  usuarioId: string;
  sedeId: string;
  sedeNombre: string;
  rolAplicacionId: string;
  aplicacionNombre: string;
  rolNombre: string;
  estado: "Activo" | "Inactivo";
  fechaAsignacion?: string;
  fechaFinalizacion?: string;
  permisos: PermisoRecurso[];
}

export type UsuarioAsignacion = UsuarioSedeRolAplicacion;

export interface UsuarioSede {
  sedeId: string;
  sedeNombre: string;
  asignaciones: UsuarioSedeRolAplicacion[];
}

export interface UsuarioItem {
  id: string;
  nombre: string;
  apellidos: string;
  avatar?: string;
  tipoDocumento: "Cédula";
  documentoIdentificacion: string;
  email: string;
  identificacion?: string;
  correo?: string;
  telefono?: string;
  cargo?: string;
  estado: "Activo" | "Inactivo" | "Pendiente";
  fechaCreacion: string;
  sedes: UsuarioSede[];
  createdAt?: number;
  updatedAt?: number;
}
