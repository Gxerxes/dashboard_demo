# HKEX Post Trade Frontend Platform - Overview (English)

## 1. Project Background

The Hong Kong Exchanges and Clearing (HKEX) Post Trade department is building a department-level Frontend Platform to serve the following business domains:

- **Clearing**
- **Settlement**
- **Reporting**
- **Future Applications**

The platform serves as the common frontend foundation for all future Post Trade applications.

## 2. Architecture Hierarchy

```
Material UI (MUI)
    ↓
HUI (Company Design System - HKEX)
    ↓
Post Trade Platform (Department Platform)
    ↓
Business Applications (Clearing / Settlement / Reporting)
```

## 3. Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **UI Framework** | React + TypeScript | React 18.x + TS 5.x |
| **Build Tool** | Vite | 5.x |
| **Package Manager** | pnpm | 9.x |
| **Monorepo** | pnpm workspace + Turborepo | 1.x |
| **Global State** | Redux Toolkit | 2.x |
| **Server State** | TanStack Query (React Query) | 5.x |
| **Routing** | React Router | 6.x |
| **HTTP Client** | Axios | 1.x |
| **UI Library** | Material UI (MUI) | 5.x |
| **Design System** | HUI (HKEX Design System) | Custom |
| **OIDC Client** | oidc-client-ts | 3.x |
| **i18n** | react-i18next + i18next | 23.x / 14.x |
| **Notifications** | notistack | 3.x |
| **Date/Number** | dayjs | 1.x |
| **Validation** | zod | 3.x |
| **Unit Testing** | Jest + React Testing Library | 29.x |
| **E2E Testing** | Playwright | latest |
| **Linting** | ESLint | 8.x |
| **Formatting** | Prettier | 3.x |
| **Backend Proxy** | Spring Boot 3 + Spring Security + OAuth2 | Java 21 |

## 4. Project Structure

```
dashboard_demo/
├── apps/                              # Business Applications
│   ├── clearing/                      # Clearing Application
│   │   ├── src/
│   │   │   ├── pages/Dashboard.tsx    # Clearing Dashboard
│   │   │   ├── trade/                 # Trade Management
│   │   │   ├── config/routes.ts       # Business Routes
│   │   │   ├── App.tsx                # App Shell
│   │   │   └── main.tsx               # React Entry Point
│   │   ├── vite.config.ts             # Vite Config
│   │   └── index.html                 # HTML Template
│   ├── settlement/                    # Settlement Application
│   ├── reporting/                     # Reporting Application
│   ├── storybook/                     # Component Documentation
│   └── docs/                          # Project Docs
│
├── packages/
│   └── platform/                      # ⭐ Core Platform (20+ Modules)
│       ├── src/
│       │   ├── auth/                  # OIDC Authentication
│       │   ├── router/                # Route Management + Guards
│       │   ├── layout/                # Layout Components
│       │   ├── theme/                 # Theme System
│       │   ├── state/                 # Redux Store
│       │   ├── api/                   # API SDK (Axios)
│       │   ├── permission/            # RBAC + ABAC
│       │   ├── logging/               # Structured Logging
│       │   ├── notification/          # Toast Notifications
│       │   ├── i18n/                  # Internationalization
│       │   ├── hooks/                 # Custom Hooks
│       │   ├── utils/                 # Utility Functions
│       │   ├── components/            # Shared Components
│       │   ├── error-boundary/        # Error Boundary
│       │   ├── loading/               # Global Loading
│       │   ├── config/                # Platform Config
│       │   ├── monitoring/            # Monitoring Provider
│       │   ├── feature-flags/         # Feature Toggles
│       │   └── plugin/                # Plugin Registry
│       ├── dist/                      # Build Output (CJS + ESM)
│       └── tsconfig.json
│   └── configs/                       # Shared Configs
│       ├── typescript-config/
│       ├── eslint-config/
│       ├── prettier-config/
│       └── jest-config/
│
├── turbo.json                         # Turborepo Pipeline
├── pnpm-workspace.yaml                # pnpm Workspace
└── package.json                       # Root Package
```

## 5. Architecture Design

### 5.1 High-Level Architecture Diagram

```
Browser
   │
   ▼
┌─────────────────────────────────────────┐
│          React Platform                 │
│  ┌───────┬──────┬──────┬──────────┐    │
│  │ Auth  │Router│Layout│ Theme    │    │
│  ├───────┼──────┼──────┼──────────┤    │
│  │ API   │State │Perm. │ Logging  │    │
│  ├───────┼──────┼──────┼──────────┤    │
│  │ Notif │i18n  │Hooks │ Utils    │    │
│  └───────┴──────┴──────┴──────────┘    │
│           Application Shell            │
└────────────────┬────────────────────────┘
                 │ HTTPS / OIDC
                 ▼
┌─────────────────────────────────────────┐
│      Spring Boot Proxy (BFF)           │
│  ┌──────┬──────┬──────┬──────────┐     │
│  │OIDC  │Authz │Proxy │ Audit    │     │
│  ├──────┼──────┼──────┼──────────┤     │
│  │Session│CORS │Rate  │ Cache    │     │
│  └──────┴──────┴──────┴──────────┘     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    OIDC Provider (Okta / Azure / Ping) │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│       Backend Microservices            │
│  (Clearing / Settlement / Reporting)   │
└─────────────────────────────────────────┘
```

### 5.2 Authentication Sequence (OIDC Authorization Code + PKCE)

```
Browser          React            Spring Boot         OIDC Provider       Backend API
   │                │                  │                    │                  │
   │                │  1. User clicks Login                │                  │
   │◄───────────────│                  │                    │                  │
   │                │─────────────────►│ 2. Auth Request    │                  │
   │                │                  │──────────────────►│                  │
   │                │                  │                    │                  │
   │ 3. Redirect to OIDC Login Page   │                    │                  │
   │◄───────────────│──────────────────│────────────────────│                  │
   │                │                  │                    │                  │
   │ 4. User Authenticates            │                    │                  │
   │───────────────────────────────────│───────────────────►│                  │
   │                │                  │                    │                  │
   │ 5. Auth Code returned            │                    │                  │
   │◄───────────────│──────────────────│────────────────────│                  │
   │                │                  │                    │                  │
   │ 6. Redirect to /callback         │                    │                  │
   │────────────────► 7. Code + PKCE  │                    │                  │
   │                │─────────────────►│───────────────────►│                  │
   │                │                  │                    │                  │
   │                │                  │ 8. Tokens returned │                  │
   │                │                  │◄───────────────────│                  │
   │                │ 9. User Session  │                    │                  │
   │                │◄────────────────│                    │                  │
   │                │                  │                    │                  │
   │ 10. API Request with Bearer Token │                    │                  │
   │────────────────►                  │                    │                  │
   │                │────────────────►│ Token Validation   │                  │
   │                │                  │───────────────────►│                  │
   │                │                  │◄───────────────────│                  │
   │                │                  │ Proxy Request      │                  │
   │                │                  │───────────────────►│─────────────────►│
   │                │                  │                    │                  │
   │◄───────────────│◄────────────────│◄───────────────────│◄────────────────│
```

## 6. Platform Capability Matrix

| Capability | Module | Status | Description |
|-----------|--------|--------|-------------|
| **Authentication** | `auth/` | ✅ Done | OIDC PKCE flow, Token management, Session monitoring |
| **Authorization** | `permission/` | ✅ Done | RBAC + ABAC, Role/Permission/Condition checking |
| **Layout** | `layout/` | ✅ Done | Sidebar, Header, ContentArea, Breadcrumbs, TabBar |
| **Navigation** | `router/` | ✅ Done | Lazy loading, Route guards, Breadcrumb generation |
| **Theme** | `theme/` | ✅ Done | Light/Dark/High-Contrast, Multiple color schemes |
| **Notification** | `notification/` | ✅ Done | notistack integration, Success/Error/Warning/Info |
| **Error Boundary** | `error-boundary/` | ✅ Done | Error capture, Recovery UI |
| **Global Loading** | `loading/` | ✅ Done | Loading backdrop overlay |
| **Logging** | `logging/` | ✅ Done | Structured logging, Console + Remote batching |
| **Monitoring** | `monitoring/` | ✅ Done | Monitoring provider interface |
| **Feature Flags** | `feature-flags/` | ✅ Done | Feature toggle context provider |
| **i18n** | `i18n/` | ✅ Done | react-i18next integration |
| **API SDK** | `api/` | ✅ Done | Axios wrapper, Token injection, 401 retry |
| **State Management** | `state/` | ✅ Done | Redux store + middleware configuration |
| **Shared Hooks** | `hooks/` | ✅ Done | 6 custom React hooks |
| **Shared Components** | `components/` | ✅ Done | ProtectedElement, PermissionGate |
| **Utilities** | `utils/` | ✅ Done | Formatters, String/Object utilities |
| **Plugin System** | `plugin/` | ✅ Done | Plugin registry with lifecycle management |
| **Configuration** | `config/` | ✅ Done | Default platform configuration |
| **Audit Trail** | `logging/auditLogger` | ✅ Done | Audit event logging |
| **Performance** | `logging/perfLogger` | ✅ Done | Performance marks and measurements |

## 7. Request Lifecycle

```
1. User Interaction (button click, navigation)
       │
2. React component → useAuth / usePermission check
       │
3. Redux dispatch (if global state change)
       │
4. Axios request (through API SDK)
       │   ├─ Request Interceptor: Inject Bearer Token + Request ID
       │   └─ Token expired? → TokenManager.refreshToken()
       │
5. Spring Boot Proxy receives request
       │   ├─ Security Filter: Validate JWT token
       │   ├─ Authorization: Check API permissions
       │   ├─ Audit: Log audit trail
       │   └─ Proxy: Forward to backend service
       │
6. Backend Service processes business logic
       │
       ▼
7. Response flows back
       │   └─ Response Interceptor: Unified error handling
8. React Query cache update → UI refresh
```

## 8. Permission Model (RBAC + ABAC)

```
User
 ├── Roles
 │    ├── CLEARING_ADMIN    → permissions: [clearing:*]
 │    ├── CLEARING_OPERATOR → permissions: [clearing:trade:read, clearing:trade:write]
 │    └── CLEARING_VIEWER   → permissions: [clearing:trade:read]
 │
 ├── Attributes → ABAC condition evaluation
 │    ├── department: "clearing"
 │    ├── region: "HK"
 │    └── clearance_level: 3
 │
 └── Permission Check Levels
      ├── Menu Permissions
      ├── Page Permissions
      ├── Button Permissions
      └── API Permissions
```

## 9. Configuration

```env
# .env file
VITE_ENV=development
VITE_API_BASE_URL=/api
VITE_OIDC_AUTHORITY=https://your-oidc-provider.com
VITE_OIDC_CLIENT_ID=your-client-id
VITE_OIDC_REDIRECT_URI=http://localhost:3000/callback
```

## 10. Development Commands

```bash
# Install dependencies
pnpm install

# Build platform package
cd packages/platform && pnpm build

# Start Clearing application dev server
cd apps/clearing && pnpm dev

# Run all tests
pnpm test

# Lint code
pnpm lint

# Type check
pnpm typecheck

# Clean build output
pnpm clean
```

## 11. Future Scalability

| Area | Approach |
|------|----------|
| **Micro Frontends** | Platform supports Module Federation integration |
| **Plugin System** | PluginRegistry enables dynamic third-party plugin loading |
| **Multiple Domains** | Architecture supports Clearing, Settlement, Reporting |
| **Event-Driven** | EventBus enables cross-module communication |
| **Cloud Deployment** | Vite output supports Docker + Kubernetes |
| **CI/CD** | Turborepo pipeline enables incremental builds and caching |
| **Observability** | OpenTelemetry + ELK/Splunk + Prometheus/Grafana |