# LexFlow - Plataforma SaaS de Gestión Legal

Plataforma SaaS multi-tenant para gestión legal dirigida a bufetes de abogados en Latinoamérica.

## Stack Tecnológico

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS 4
- **Backend:** Next.js API Routes + Server Actions
- **Database:** TursoDB (libSQL) + Drizzle ORM
- **Auth:** Clerk (multi-tenant)
- **Storage:** Cloudflare R2
- **Realtime:** Partykit (futuro)

## Requisitos

- Node.js 20+
- npm o pnpm
- Cuenta en Clerk
- Cuenta en TursoDB
- Cuenta en Cloudflare (para R2)

## Instalación

1. **Clonar y configurar variables de entorno:**
   ```bash
   cp .env.example .env.local
   ```

2. **Editar `.env.local` con tus credenciales:**
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
   CLERK_SECRET_KEY=sk_test_xxx
   
   # TursoDB
   TURSO_DATABASE_URL=libsql://your-db.turso.io
   TURSO_AUTH_TOKEN=your-token
   
   # Cloudflare R2
   R2_ACCOUNT_ID=your-account-id
   R2_ACCESS_KEY_ID=your-key
   R2_SECRET_ACCESS_KEY=your-secret
   R2_BUCKET_NAME=lexflow-docs
   ```

3. **Instalar dependencias:**
   ```bash
   npm install
   ```

4. **Ejecutar migraciones:**
   ```bash
   npm run db:push
   ```

5. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador:**
   - Landing: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard

## Estructura del Proyecto

```
web-nextjs/
├── app/
│   ├── (auth)/           # Páginas de autenticación
│   ├── (dashboard)/      # Dashboard y páginas protegidas
│   ├── (marketing)/      # Landing page y marketing
│   ├── api/              # API Routes
│   └── layout.tsx        # Layout raíz
├── components/
│   ├── ui/               # Componentes UI base (shadcn-style)
│   ├── layout/           # Layout components
│   └── shared/           # Componentes compartidos
├── lib/
│   ├── auth/             # Autenticación y permisos
│   ├── db/               # Schema y conexión DB
│   ├── utils.ts          # Utilidades
│   └── constants.ts      # Constantes
├── types/                # Tipos TypeScript
└── hooks/                # Custom hooks
```

## Roles y Permisos

| Rol | Permisos |
|-----|----------|
| super_admin | Acceso total a todas las organizaciones |
| admin | CRUD completo dentro de su organización |
| lawyer | CRUD de casos, clientes y documentos |
| client | Solo lectura de sus propios casos |

## Características Principales

- ✅ Gestión de casos legales con timeline
- ✅ Portal de clientes
- ✅ Gestión de documentos
- ✅ Calendario de audiencias
- ✅ Sistema de tareas
- ✅ Notificaciones
- ✅ Multi-tenant seguro
- ✅ RBAC (Control de acceso basado en roles)

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Linter ESLint |
| `npm run typecheck` | Verificación de tipos |
| `npm run db:push` | Push schema a TursoDB |
| `npm run db:generate` | Generar migraciones |
| `npm run db:studio` | Drizzle Studio |

## Próximos Pasos

1. Configurar credenciales en `.env.local`
2. Crear organización en Clerk
3. Configurar webhooks de Clerk para sincronización de usuarios
4. Configurar R2 para almacenamiento de documentos
5. (Opcional) Configurar Partykit para realtime

## Licencia

MIT