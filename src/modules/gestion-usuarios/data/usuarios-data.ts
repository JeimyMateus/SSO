import type {
  Sede,
  Aplicacion,
  Rol,
  RolAplicacion,
  RolAplicacionSede,
  UsuarioSedeRolAplicacion,
  UsuarioSede,
  UsuarioItem,
} from "../types/usuario";

export * from "../types/usuario";

export const TIPOS_DOCUMENTO = ["Cédula"] as const;
export const ESTADOS_USUARIO = ["Activo", "Inactivo", "Pendiente"] as const;

export const SEDES_CATALOGO: Sede[] = [
  { id: "sede-pc", codigo: "PC-01", nombre: "Planta Central", tipo: "Planta Central" },
  { id: "sede-cz9", codigo: "CZ-09", nombre: "Coordinación Zonal 9", tipo: "Coordinación Zonal" },
  { id: "sede-cz6", codigo: "CZ-06", nombre: "Coordinación Zonal 6", tipo: "Coordinación Zonal" },
  { id: "sede-cz8", codigo: "CZ-08", nombre: "Coordinación Zonal 8", tipo: "Coordinación Zonal" },
  { id: "sede-d1701", codigo: "17D01", nombre: "Distrito 17D01", tipo: "Distrito" },
  { id: "sede-d0903", codigo: "09D03", nombre: "Distrito 09D03", tipo: "Distrito" },
  { id: "sede-d1101", codigo: "11D01", nombre: "Distrito 11D01", tipo: "Distrito" },
  { id: "sede-d1704", codigo: "17D04", nombre: "Distrito 17D04", tipo: "Distrito" },
];

export const SEDES_MINEDUC = SEDES_CATALOGO.map(s => s.nombre);

export const APLICACIONES_CATALOGO: Aplicacion[] = [
  { id: "app-gd", codigo: "SGD", nombre: "Gestión Docente", activo: true },
  { id: "app-sso", codigo: "SSO", nombre: "SSO", activo: true },
  { id: "app-sige", codigo: "SIGE", nombre: "SIGE", activo: true },
  { id: "app-geo", codigo: "GEOPORTAL", nombre: "Geoportal", activo: true },
  { id: "app-sae", codigo: "SAE", nombre: "SAE", activo: true },
  { id: "app-sgc", codigo: "SGC", nombre: "SGC", activo: true },
  { id: "app-tram", codigo: "TRAMITES", nombre: "Trámites", activo: true },
  { id: "app-inno", codigo: "INNOVACION", nombre: "Innovación", activo: true },
];

export const APLICACIONES_MINEDUC = APLICACIONES_CATALOGO.map(a => a.nombre);

export const ROLES_CONFIRMADOS_SGD = [
  "Administración financiera",
  "Administrador",
  "Contratos Planificación",
  "Docente",
  "Jefe de Talento Humano",
  "Registro y control",
  "Talento Humano",
  "Talento Humano Distrital",
] as const;

export const ROLES_APLICACION: RolAplicacion[] = [
  // Gestión Docente (Confirmados estrictamente en manuales)
  { id: "ra-gd-af", aplicacionId: "app-gd", aplicacionNombre: "Gestión Docente", rolId: "r-af", rolNombre: "Administración financiera", usuariosMaxPermitidos: 10 },
  { id: "ra-gd-adm", aplicacionId: "app-gd", aplicacionNombre: "Gestión Docente", rolId: "r-adm", rolNombre: "Administrador", usuariosMaxPermitidos: 5 },
  { id: "ra-gd-cp", aplicacionId: "app-gd", aplicacionNombre: "Gestión Docente", rolId: "r-cp", rolNombre: "Contratos Planificación", usuariosMaxPermitidos: 15 },
  { id: "ra-gd-doc", aplicacionId: "app-gd", aplicacionNombre: "Gestión Docente", rolId: "r-doc", rolNombre: "Docente" },
  { id: "ra-gd-jth", aplicacionId: "app-gd", aplicacionNombre: "Gestión Docente", rolId: "r-jth", rolNombre: "Jefe de Talento Humano", usuariosMaxPermitidos: 9 },
  { id: "ra-gd-rc", aplicacionId: "app-gd", aplicacionNombre: "Gestión Docente", rolId: "r-rc", rolNombre: "Registro y control", usuariosMaxPermitidos: 20 },
  { id: "ra-gd-th", aplicacionId: "app-gd", aplicacionNombre: "Gestión Docente", rolId: "r-th", rolNombre: "Talento Humano", usuariosMaxPermitidos: 30 },
  { id: "ra-gd-thd", aplicacionId: "app-gd", aplicacionNombre: "Gestión Docente", rolId: "r-thd", rolNombre: "Talento Humano Distrital", usuariosMaxPermitidos: 40 },

  // SSO
  { id: "ra-sso-sa", aplicacionId: "app-sso", aplicacionNombre: "SSO", rolId: "r-sso-sa", rolNombre: "Super Administrador", usuariosMaxPermitidos: 3 },
  { id: "ra-sso-aud", aplicacionId: "app-sso", aplicacionNombre: "SSO", rolId: "r-sso-aud", rolNombre: "Auditor de Seguridad", usuariosMaxPermitidos: 5 },
  { id: "ra-sso-gz", aplicacionId: "app-sso", aplicacionNombre: "SSO", rolId: "r-sso-gz", rolNombre: "Gestor Zonal de Usuarios", usuariosMaxPermitidos: 15 },
  { id: "ra-sso-ma", aplicacionId: "app-sso", aplicacionNombre: "SSO", rolId: "r-sso-ma", rolNombre: "Operador de Mesa de Ayuda", usuariosMaxPermitidos: 25 },

  // SIGE
  { id: "ra-sige-an", aplicacionId: "app-sige", aplicacionNombre: "SIGE", rolId: "r-sige-an", rolNombre: "Auditor Nacional", usuariosMaxPermitidos: 8 },
  { id: "ra-sige-mat", aplicacionId: "app-sige", aplicacionNombre: "SIGE", rolId: "r-sige-mat", rolNombre: "Operador Matriculación", usuariosMaxPermitidos: 50 },
  { id: "ra-sige-sop", aplicacionId: "app-sige", aplicacionNombre: "SIGE", rolId: "r-sige-sop", rolNombre: "Técnico de Soporte", usuariosMaxPermitidos: 20 },
];

export const ROLES_POR_APLICACION: Record<string, string[]> = {
  "Gestión Docente": [...ROLES_CONFIRMADOS_SGD],
  "SSO": ["Super Administrador", "Auditor de Seguridad", "Gestor Zonal de Usuarios", "Operador de Mesa de Ayuda"],
  "SIGE": ["Auditor Nacional", "Operador Matriculación", "Técnico de Soporte"],
  "Geoportal": ["Administrador de Capas", "Especialista SIG", "Consultor Territorial"],
  "SAE": ["Analista de Cupos", "Coordinador de Admisión"],
  "SGC": ["Director de Gestión Calidad", "Técnico de Soporte Calidad"],
  "Trámites": ["Gestor de Trámites", "Revisor Documental"],
  "Innovación": ["Evaluador de Proyectos", "Gestor Pedagógico"],
};

export const ROL_APLICACION_SEDE: RolAplicacionSede[] = [
  // Gestión Docente roles por sedes
  { sedeId: "sede-cz9", sedeNombre: "Coordinación Zonal 9", rolAplicacionId: "ra-gd-th", usuariosMaxPermitidos: 5 },
  { sedeId: "sede-cz9", sedeNombre: "Coordinación Zonal 9", rolAplicacionId: "ra-gd-jth", usuariosMaxPermitidos: 1 },
  { sedeId: "sede-d1701", sedeNombre: "Distrito 17D01", rolAplicacionId: "ra-gd-thd", usuariosMaxPermitidos: 4 },
  { sedeId: "sede-d1701", sedeNombre: "Distrito 17D01", rolAplicacionId: "ra-gd-doc", usuariosMaxPermitidos: 100 },
  { sedeId: "sede-cz6", sedeNombre: "Coordinación Zonal 6", rolAplicacionId: "ra-gd-jth", usuariosMaxPermitidos: 1 },
  { sedeId: "sede-cz6", sedeNombre: "Coordinación Zonal 6", rolAplicacionId: "ra-gd-th", usuariosMaxPermitidos: 5 },
  { sedeId: "sede-d0903", sedeNombre: "Distrito 09D03", rolAplicacionId: "ra-gd-rc", usuariosMaxPermitidos: 3 },
  { sedeId: "sede-pc", sedeNombre: "Planta Central", rolAplicacionId: "ra-gd-af", usuariosMaxPermitidos: 4 },
  { sedeId: "sede-pc", sedeNombre: "Planta Central", rolAplicacionId: "ra-gd-cp", usuariosMaxPermitidos: 6 },
  { sedeId: "sede-pc", sedeNombre: "Planta Central", rolAplicacionId: "ra-gd-adm", usuariosMaxPermitidos: 2 },
  { sedeId: "sede-pc", sedeNombre: "Planta Central", rolAplicacionId: "ra-sso-sa", usuariosMaxPermitidos: 2 },
  { sedeId: "sede-d1101", sedeNombre: "Distrito 11D01", rolAplicacionId: "ra-gd-doc", usuariosMaxPermitidos: 80 },
];

export const FUNCIONES_INSTITUCIONALES = [
  "Coordinador Zonal",
  "Director Distrital",
  "Funcionario de Talento Humano",
  "Docente",
  "Analista de Planta Central",
] as const;

export const mockUsuariosData: UsuarioItem[] = [
  {
    id: "usr-01",
    nombre: "María Fernanda",
    apellidos: "Gómez Andrade",
    avatar: "https://i.pravatar.cc/150?u=usr-01",
    tipoDocumento: "Cédula",
    documentoIdentificacion: "1719874563",
    email: "maria.gomez@mineduc.gob.ec",
    identificacion: "1719874563",
    correo: "maria.gomez@mineduc.gob.ec",
    telefono: "+593 99 111 2222",
    cargo: "Funcionario de Talento Humano",
    estado: "Activo",
    fechaCreacion: "15/09/2026",
    sedes: [
      {
        sedeId: "sede-cz9",
        sedeNombre: "Coordinación Zonal 9",
        asignaciones: [
          {
            id: "usra-01-1",
            usuarioId: "usr-01",
            sedeId: "sede-cz9",
            sedeNombre: "Coordinación Zonal 9",
            rolAplicacionId: "ra-gd-th",
            aplicacionNombre: "Gestión Docente",
            rolNombre: "Talento Humano",
            estado: "Activo",
            fechaAsignacion: "15/09/2026",
            permisos: [
              { recursoCodigo: "EXP-DOC", recursoNombre: "Expediente Docente", puedeVer: true, puedeCrear: true, puedeEditar: true, puedeEliminar: false },
              { recursoCodigo: "MOV-PERS", recursoNombre: "Movimientos de Personal", puedeVer: true, puedeCrear: true, puedeEditar: false, puedeEliminar: false },
            ]
          },
          {
            id: "usra-01-2",
            usuarioId: "usr-01",
            sedeId: "sede-cz9",
            sedeNombre: "Coordinación Zonal 9",
            rolAplicacionId: "ra-sige-mat",
            aplicacionNombre: "SIGE",
            rolNombre: "Operador Matriculación",
            estado: "Activo",
            fechaAsignacion: "15/09/2026",
            permisos: [
              { recursoCodigo: "MAT-ALUM", recursoNombre: "Matriculación de Alumnos", puedeVer: true, puedeCrear: true, puedeEditar: false, puedeEliminar: false }
            ]
          },
          {
            id: "usra-01-3",
            usuarioId: "usr-01",
            sedeId: "sede-cz9",
            sedeNombre: "Coordinación Zonal 9",
            rolAplicacionId: "ra-sso-ma",
            aplicacionNombre: "SSO",
            rolNombre: "Operador de Mesa de Ayuda",
            estado: "Activo",
            fechaAsignacion: "15/09/2026",
            permisos: [
              { recursoCodigo: "USR-CONS", recursoNombre: "Consulta de Usuarios", puedeVer: true, puedeCrear: false, puedeEditar: false, puedeEliminar: false }
            ]
          }
        ]
      },
      {
        sedeId: "sede-pc",
        sedeNombre: "Planta Central",
        asignaciones: [
          {
            id: "usra-01-4",
            usuarioId: "usr-01",
            sedeId: "sede-pc",
            sedeNombre: "Planta Central",
            rolAplicacionId: "ra-gd-adm",
            aplicacionNombre: "Gestión Docente",
            rolNombre: "Administrador",
            estado: "Activo",
            fechaAsignacion: "15/09/2026",
            permisos: [
              { recursoCodigo: "EXP-DOC", recursoNombre: "Expediente Docente", puedeVer: true, puedeCrear: true, puedeEditar: true, puedeEliminar: true }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "usr-02",
    nombre: "Carlos Eduardo",
    apellidos: "Mendoza Viteri",
    avatar: "https://i.pravatar.cc/150?u=usr-02",
    tipoDocumento: "Cédula",
    documentoIdentificacion: "1715896324",
    email: "carlos.mendoza@mineduc.gob.ec",
    identificacion: "1715896324",
    correo: "carlos.mendoza@mineduc.gob.ec",
    telefono: "+593 99 222 3333",
    cargo: "Funcionario de Talento Humano",
    estado: "Activo",
    fechaCreacion: "02/08/2026",
    sedes: [
      {
        sedeId: "sede-d1701",
        sedeNombre: "Distrito 17D01",
        asignaciones: [
          {
            id: "usra-02-1",
            usuarioId: "usr-02",
            sedeId: "sede-d1701",
            sedeNombre: "Distrito 17D01",
            rolAplicacionId: "ra-gd-thd",
            aplicacionNombre: "Gestión Docente",
            rolNombre: "Talento Humano Distrital",
            estado: "Activo",
            fechaAsignacion: "02/08/2026",
            permisos: [
              { recursoCodigo: "EXP-DOC", recursoNombre: "Expediente Docente", puedeVer: true, puedeCrear: true, puedeEditar: true, puedeEliminar: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "usr-03",
    nombre: "Lucía Gabriela",
    apellidos: "Paredes Roldán",
    avatar: "https://i.pravatar.cc/150?u=usr-03",
    tipoDocumento: "Cédula",
    documentoIdentificacion: "0104567892",
    email: "lucia.paredes@mineduc.gob.ec",
    identificacion: "0104567892",
    correo: "lucia.paredes@mineduc.gob.ec",
    telefono: "+593 99 333 4444",
    cargo: "Coordinador Zonal",
    estado: "Activo",
    fechaCreacion: "21/07/2026",
    sedes: [
      {
        sedeId: "sede-cz6",
        sedeNombre: "Coordinación Zonal 6",
        asignaciones: [
          {
            id: "usra-03-1",
            usuarioId: "usr-03",
            sedeId: "sede-cz6",
            sedeNombre: "Coordinación Zonal 6",
            rolAplicacionId: "ra-gd-jth",
            aplicacionNombre: "Gestión Docente",
            rolNombre: "Jefe de Talento Humano",
            estado: "Activo",
            fechaAsignacion: "21/07/2026",
            permisos: [
              { recursoCodigo: "EXP-DOC", recursoNombre: "Expediente Docente", puedeVer: true, puedeCrear: true, puedeEditar: true, puedeEliminar: true },
              { recursoCodigo: "MOV-PERS", recursoNombre: "Movimientos de Personal", puedeVer: true, puedeCrear: true, puedeEditar: true, puedeEliminar: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "usr-04",
    nombre: "Juan Pablo",
    apellidos: "Ortiz Noboa",
    avatar: "https://i.pravatar.cc/150?u=usr-04",
    tipoDocumento: "Cédula",
    documentoIdentificacion: "0923456781",
    email: "juan.ortiz@mineduc.gob.ec",
    identificacion: "0923456781",
    correo: "juan.ortiz@mineduc.gob.ec",
    telefono: "+593 99 444 5555",
    cargo: "Director Distrital",
    estado: "Activo",
    fechaCreacion: "05/06/2026",
    sedes: [
      {
        sedeId: "sede-d0903",
        sedeNombre: "Distrito 09D03",
        asignaciones: [
          {
            id: "usra-04-1",
            usuarioId: "usr-04",
            sedeId: "sede-d0903",
            sedeNombre: "Distrito 09D03",
            rolAplicacionId: "ra-gd-rc",
            aplicacionNombre: "Gestión Docente",
            rolNombre: "Registro y control",
            estado: "Activo",
            fechaAsignacion: "05/06/2026",
            permisos: [
              { recursoCodigo: "REG-ASIS", recursoNombre: "Registro y Asistencia", puedeVer: true, puedeCrear: true, puedeEditar: true, puedeEliminar: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "usr-05",
    nombre: "Diana Carolina",
    apellidos: "Villacís Mora",
    avatar: "https://i.pravatar.cc/150?u=usr-05",
    tipoDocumento: "Cédula",
    documentoIdentificacion: "1720145896",
    email: "diana.villacis@mineduc.gob.ec",
    identificacion: "1720145896",
    correo: "diana.villacis@mineduc.gob.ec",
    telefono: "+593 99 555 6666",
    cargo: "Analista de Planta Central",
    estado: "Activo",
    fechaCreacion: "14/05/2026",
    sedes: [
      {
        sedeId: "sede-pc",
        sedeNombre: "Planta Central",
        asignaciones: [
          {
            id: "usra-05-1",
            usuarioId: "usr-05",
            sedeId: "sede-pc",
            sedeNombre: "Planta Central",
            rolAplicacionId: "ra-gd-af",
            aplicacionNombre: "Gestión Docente",
            rolNombre: "Administración financiera",
            estado: "Activo",
            fechaAsignacion: "14/05/2026",
            permisos: [
              { recursoCodigo: "NOM-REM", recursoNombre: "Nómina y Remuneraciones", puedeVer: true, puedeCrear: true, puedeEditar: true, puedeEliminar: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "usr-06",
    nombre: "Verónica Patricia",
    apellidos: "Almeida Carrera",
    avatar: "https://i.pravatar.cc/150?u=usr-06",
    tipoDocumento: "Cédula",
    documentoIdentificacion: "1714523698",
    email: "veronica.almeida@mineduc.gob.ec",
    identificacion: "1714523698",
    correo: "veronica.almeida@mineduc.gob.ec",
    telefono: "+593 99 666 7777",
    cargo: "Analista de Planta Central",
    estado: "Activo",
    fechaCreacion: "28/04/2026",
    sedes: [
      {
        sedeId: "sede-pc",
        sedeNombre: "Planta Central",
        asignaciones: [
          {
            id: "usra-06-1",
            usuarioId: "usr-06",
            sedeId: "sede-pc",
            sedeNombre: "Planta Central",
            rolAplicacionId: "ra-gd-cp",
            aplicacionNombre: "Gestión Docente",
            rolNombre: "Contratos Planificación",
            estado: "Activo",
            fechaAsignacion: "28/04/2026",
            permisos: [
              { recursoCodigo: "PLAN-CONT", recursoNombre: "Planificación de Contratos", puedeVer: true, puedeCrear: true, puedeEditar: true, puedeEliminar: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "usr-07",
    nombre: "Andrés Felipe",
    apellidos: "Salazar",
    avatar: "https://i.pravatar.cc/150?u=usr-07",
    tipoDocumento: "Cédula",
    documentoIdentificacion: "1720567812",
    email: "andres.salazar@mineduc.gob.ec",
    identificacion: "1720567812",
    correo: "andres.salazar@mineduc.gob.ec",
    telefono: "+593 99 777 8888",
    cargo: "Analista de Planta Central",
    estado: "Activo",
    fechaCreacion: "10/03/2026",
    sedes: [
      {
        sedeId: "sede-pc",
        sedeNombre: "Planta Central",
        asignaciones: [
          {
            id: "usra-07-1",
            usuarioId: "usr-07",
            sedeId: "sede-pc",
            sedeNombre: "Planta Central",
            rolAplicacionId: "ra-gd-adm",
            aplicacionNombre: "Gestión Docente",
            rolNombre: "Administrador",
            estado: "Activo",
            fechaAsignacion: "10/03/2026",
            permisos: [
              { recursoCodigo: "EXP-DOC", recursoNombre: "Expediente Docente", puedeVer: true, puedeCrear: true, puedeEditar: true, puedeEliminar: true },
              { recursoCodigo: "DIS-TRAB", recursoNombre: "Distributivo de Trabajo", puedeVer: true, puedeCrear: true, puedeEditar: true, puedeEliminar: true },
              { recursoCodigo: "PLAN-CONT", recursoNombre: "Planificación de Contratos", puedeVer: true, puedeCrear: true, puedeEditar: true, puedeEliminar: true },
              { recursoCodigo: "REG-ASIS", recursoNombre: "Registro y Asistencia", puedeVer: true, puedeCrear: true, puedeEditar: true, puedeEliminar: true },
            ]
          },
          {
            id: "usra-07-2",
            usuarioId: "usr-07",
            sedeId: "sede-pc",
            sedeNombre: "Planta Central",
            rolAplicacionId: "ra-sso-sa",
            aplicacionNombre: "SSO",
            rolNombre: "Super Administrador",
            estado: "Activo",
            fechaAsignacion: "10/03/2026",
            permisos: [
              { recursoCodigo: "ALL-SEC", recursoNombre: "Seguridad y Auditoría Global", puedeVer: true, puedeCrear: true, puedeEditar: true, puedeEliminar: true }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "usr-08",
    nombre: "Sofía Alejandra",
    apellidos: "Torres",
    avatar: "https://i.pravatar.cc/150?u=usr-08",
    tipoDocumento: "Cédula",
    documentoIdentificacion: "1103567894",
    email: "sofia.torres@mineduc.gob.ec",
    identificacion: "1103567894",
    correo: "sofia.torres@mineduc.gob.ec",
    telefono: "+593 99 888 9999",
    cargo: "Docente",
    estado: "Inactivo",
    fechaCreacion: "18/01/2026",
    sedes: [
      {
        sedeId: "sede-d1101",
        sedeNombre: "Distrito 11D01",
        asignaciones: [
          {
            id: "usra-08-1",
            usuarioId: "usr-08",
            sedeId: "sede-d1101",
            sedeNombre: "Distrito 11D01",
            rolAplicacionId: "ra-gd-doc",
            aplicacionNombre: "Gestión Docente",
            rolNombre: "Docente",
            estado: "Inactivo",
            fechaAsignacion: "18/01/2026",
            fechaFinalizacion: "30/08/2026",
            permisos: [
              { recursoCodigo: "DIS-TRAB", recursoNombre: "Distributivo de Trabajo", puedeVer: true, puedeCrear: false, puedeEditar: false, puedeEliminar: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "usr-09",
    nombre: "Gabriel Antonio",
    apellidos: "Morales Silva",
    avatar: "https://i.pravatar.cc/150?u=usr-09",
    tipoDocumento: "Cédula",
    documentoIdentificacion: "1718902341",
    email: "gabriel.morales@mineduc.gob.ec",
    identificacion: "1718902341",
    correo: "gabriel.morales@mineduc.gob.ec",
    telefono: "+593 99 900 1122",
    cargo: "Docente",
    estado: "Pendiente",
    fechaCreacion: "01/10/2026",
    sedes: []
  },
  {
    id: "usr-10",
    nombre: "Elena Rocío",
    apellidos: "Cárdenas Vaca",
    avatar: "https://i.pravatar.cc/150?u=usr-10",
    tipoDocumento: "Cédula",
    documentoIdentificacion: "1724567819",
    email: "elena.cardenas@mineduc.gob.ec",
    identificacion: "1724567819",
    correo: "elena.cardenas@mineduc.gob.ec",
    telefono: "+593 99 911 2233",
    cargo: "Analista de Planta Central",
    estado: "Inactivo",
    fechaCreacion: "25/09/2026",
    sedes: [
      {
        sedeId: "sede-pc",
        sedeNombre: "Planta Central",
        asignaciones: []
      }
    ]
  }
];
