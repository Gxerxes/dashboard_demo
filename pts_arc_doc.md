HKEX Post Trade Frontend Platform - Architectural Design Document (ADD)
1. High-Level Architecture Diagram
This diagram describes the high-level request orchestration, securing the frontend client using the Backend-for-Frontend (BFF) pattern with Spring Boot 3.3+ acts as the OAuth2 Client.

{code:title=High-Level Architecture (C4 L2 System Context)}
+-----------------------------------------------------------------------------------------+
|                                     Client Browser                                      |
|  +---------------------------+              +----------------------------------------+  |
|  |    Business App (SPA)     | ------------ |   Post Trade Platform (Core/Hooks)     |  |
|  +---------------------------+              +----------------------------------------+  |
+-----------------------------------------------------------------------------------------+
|                                             ^
| HTTP Requests (Encrypted Cookies)           | State & UI Context
v                                             v
+-----------------------------------------------------------------------------------------+
|                                  Spring Boot BFF Proxy                                  |
|  +---------------------------+  +----------------------+  +--------------------------+  |
|  | OAuth2 Login & Token Mgmt |  | Reverse Proxy Filter |  | Audit Log & Opentelemetry|  |
|  +---------------------------+  +----------------------+  +--------------------------+  |
+-----------------------------------------------------------------------------------------+
|                               |                              |
| OIDC Protocol (Auth Code/PKCE)| Proxied API Requests         | Metrics / Logs
v                               v                              v
+-----------------------------+ +---------------------------+ +---------------------------+
|    OIDC Identity Provider   | |   Enterprise API Gateway  | |   Observability Stack     |
| (Okta / Azure AD / PingFeder)| | (Spring Cloud / Kong)    | | (ELK / Splunk / Grafana)  |
+-----------------------------+ +---------------------------+ +---------------------------+
|
v
+-----------------------+
|  Post Trade Microservices  |
| (Clearing / Settlement)  |
+-----------------------+
{code}

2. Frontend Layered Architecture
To prevent architectural drift and maintain a strict separation of concerns, the frontend stack follows a strict unidirectional dependency rule: layers can only depend on layers below them.

Layer Diagram
Plaintext
+-----------------------------------------------------------------------------------+
|               Layer 4: Business Applications (Clearing / Settlement)              |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|               Layer 3: Post Trade Platform (Department Platform Engine)           |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|               Layer 2: HUI Component Library (Company Design System)              |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|               Layer 1: Material UI (MUI Foundation Core)                          |
+-----------------------------------------------------------------------------------+
Layer Responsibility Matrix
|| Layer || Key Responsibility || Core Technologies || Allowed Dependencies ||
| Layer 4: Business Apps | Contains domain-specific business flows, forms, local states, and page structures. Strictly no core infrastructure setup. | React, TypeScript, TanStack Query | Layer 3, Layer 2 |
| Layer 3: Post Trade Platform | Orchestrates cross-cutting concerns: Auth context integration, enterprise layouts, global routing guards, state hydration, dynamic menus, error boundaries, monitoring integrations. | React Router v7, RTK, Axios, OpenTelemetry | Layer 2, Third-party packages (Axios, etc.) |
| Layer 2: HUI Design System | HKEX corporate brand identity. Provides highly polished, accessible (WCAG 2.1 AA), and standardized UI components. | React, TypeScript, Lit | Layer 1 |
| Layer 1: MUI Core | Low-level design primitives, CSS-in-JS engine, basic accessibility, responsive grids. | Material UI (MUI) | None |

3. Monorepo Project Structure
We implement a monorepo setup powered by pnpm workspaces and Turborepo to guarantee fast builds, high cache reuse, and decoupled versioning boundaries.

Plaintext
hkex-posttrade-platform/
├── apps/                               # Business Applications (SPAs)
│   ├── clearing/                       # Clearing System Domain App
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── settlement/                     # Settlement System Domain App
│       ├── package.json
│       └── vite.config.ts
├── platform/                           # Department Platform Core Engine
│   └── core/                           # Shared Layouts, Guards, Hydrators, Bootstrapper
│       ├── package.json
│       └── src/
├── packages/                           # Internal Shared UI/UX & Engine modules
│   ├── ui/                             # Tailored PT Platform Components (Composite widgets)
│   ├── api-sdk/                        # Generated OpenAPI clients and base custom Axios instance
│   └── telemetry/                      # OpenTelemetry & Performance Logging wrappers
├── configs/                            # Centralized Developer Environment Configurations
│   ├── eslint-config/                  # Shared ESLint rules
│   ├── typescript-config/              # Shared tsconfig blueprints
│   └── vite-config/                    # Shared Vite environments
├── shared/                             # Zero-dependency utilities
│   └── utils/                          # Pure dates, formatters, financial calculations
├── scripts/                            # CI/CD automation and workspace scaffolding helpers
├── docs/                               # Developer Guides & Component Catalogues
├── package.json                        # Monorepo root settings
├── pnpm-workspace.yaml                 # Monorepo Workspace Definitions
└── turbo.json                          # Turborepo task pipeline configuration
Workspace Responsibility Definition
apps/: Self-contained, deployable single-page applications. They import shared workspace modules like npm packages but never cross-reference each other.

platform/: The standard orchestration kernel. It acts as the "framework" for the apps, ensuring that layout, token refreshment, and security context are initialized uniformly.

packages/: Domain-agnostic utility targets. For instance, @hkex-pt/api-sdk houses auto-generated API models.

configs/: Ensures complete stylistic consistency across the team.

4. Platform Internal Architecture
The Post Trade Platform Core (@hkex-pt/core) is divided into decoupled core modules communicating via strict contract interfaces.

Plaintext
@hkex-pt/core (Platform Module Architecture)
├── src/
│   ├── auth/          <--- Processes Session Hydration, Handshakes & User Context
│   ├── router/        <--- Routing Engine (React Router v7 config, Route Guards, History)
│   ├── layout/        <--- High-fidelity Master Layout (Header, Sider, Footer, Breadcrumbs)
│   ├── permission/    <--- RBAC/ABAC Evaluator engine
│   ├── notification/  <--- Global Message/Toast System Broker
│   ├── theme/         <--- Custom Post Trade skin overrides atop HUI
│   ├── api/           <--- Axios client orchestrator (Security headers, retry mechanisms)
│   ├── config/        <--- Decoupled environment & Feature Flag resolution
│   ├── state/         <--- Redux Toolkit slicing core & TanStack Query client configuration
│   └── monitoring/    <--- OpenTelemetry traces, metrics, web-vitals collectors
Core Interactions Flow
Bootstrap Phase: Application starts -> auth/ performs silent handshake with Spring Boot BFF -> state/ receives validated token scopes and userInfo.

Routing Phase: User transitions route -> router/ triggers permission/ validation -> Matches paths and flags before mount.

Execution Phase: Business code executes Axios request -> api/ hooks into response metrics -> monitoring/ pushes latency data.

5. Business Application Structure
A typical business single-page application (e.g., clearing) is kept lean, focusing strictly on business workflows and pages.

Plaintext
apps/clearing/
├── src/
│   ├── assets/               # Local static graphics (SVGs, isolated assets)
│   ├── domain/               # Domain-Driven Design blocks
│   │   ├── position/         # Domain context: Positions Info
│   │   │   ├── components/   # Position-specific components (e.g., PositionGrid.tsx)
│   │   │   ├── hooks/        # Local state fetching (e.g., usePositionsQuery.ts)
│   │   │   └── types.ts      # TypeScript interfaces
│   │   └── collateral/       # Domain context: Collateral Management
│   ├── pages/                # Top-level Routing View Containers
│   │   ├── Dashboard.tsx
│   │   └── PositionDetail.tsx
│   ├── main.tsx              # Platform Bootstrapper initialization hook
│   └── routes.tsx            # Domain Route manifest declared to Platform router
Consumption of Platform Capabilities
To inherit layouts, styles, and state contexts, the business application simply mounts the platform's orchestration kernel wrapper during main entry:

TypeScript
// apps/clearing/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { PostTradePlatformKernel } from '@hkex-pt/core';
import { routes } from './routes';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PostTradePlatformKernel routes={routes} appName="ClearingApp" />
  </React.StrictMode>
);
6. Backend Proxy (BFF) Architecture
The backend Spring Boot 3.3+ application serves as an Enterprise Security Gateway & Backend-for-Frontend (BFF). This pattern isolates the frontend completely from vulnerable JWTs or raw credentials by utilizing encrypted, HTTP-Only cookies (SessionId).

Spring Boot Directory Structure
Plaintext
hkex-pt-bff-proxy/
├── src/main/java/com/hkex/pt/bff/
│   ├── config/               # Security, WebClient & Redis Cache Blueprints
│   │   ├── SecurityConfig.java
│   │   ├── OidcConfig.java
│   │   └── ProxyConfig.java
│   ├── security/             # Custom Authentication Success Handlers & CORS Filters
│   ├── controller/           # Custom API aggregation controllers
│   ├── filter/               # Security Headers, Custom TraceId logging Filters
│   ├── proxy/                # Spring Cloud Gateway routing rules (or WebClient Proxy)
│   ├── audit/                # Persistent Security Auditing log generators
│   └── exception/            # Global RFC 7807 Exception Mapping engine
Request Flow
Client Browser issues standard request to BFF with Secure, HttpOnly cookie.

Spring Security Filter Chain decrypts & authenticates the Session ID (via shared Redis session mapping).

TraceId Filter appends a UUID to MDC logging context and outgoing trace headers.

Proxy Route Handler retrieves the access token from security context and forwards the request downstream to Post Trade Microservices, appending:

Authorization: Bearer <AccessToken>

X-Request-Id: <TraceId>

X-User-Permissions: <DecodedRoles>

7. Authentication Sequence Diagram
The following diagram illustrates the secure authentication lifecycle utilizing Authorization Code Grant with PKCE handled by the Spring Boot BFF.

代码段
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant BFF as Spring Boot BFF
    participant IdP as Identity Provider (Okta/Azure)
    participant Core as PT Microservices

    User->>BFF: 1. Request Protected Resource (Unauthenticated)
    BFF-->>User: 2. Redirect (302) to IdP /authorize (Code Challenge + State)
    User->>IdP: 3. Redirected Request + Authentication
    IdP-->>User: 4. Prompt credentials & MFA
    User->>IdP: 5. Submits valid Credentials
    IdP-->>User: 6. Redirect (302) back to BFF with Auth Code
    User->>BFF: 7. Deliver Auth Code to BFF /login/oauth2/code/*
    BFF->>IdP: 8. POST /oauth2/token (Auth Code + Code Verifier)
    IdP-->>BFF: 9. Returns ID, Access & Refresh Tokens
    BFF->>BFF: 10. Persist Tokens in Secure Session (Redis-backed)
    BFF-->>User: 11. Establish Secure, HttpOnly Session Cookie & Redirect to SPA
    User->>BFF: 12. GET /api/clearing/positions (Session Cookie)
    BFF->>BFF: 13. Map Cookie to Session -> Hydrate JWT
    BFF->>Core: 14. Proxy Request with Bearer Token + Trace ID
    Core-->>BFF: 15. JSON Response
    BFF-->>User: 16. JSON Payload
8. Runtime Request Flow
Below is the step-by-step lifecycle of a typical application transaction (such as submitting a clearing settlement instruction):

Plaintext
[ Browser ] -> [ HTTP POST /api/v1/settlement ] -> Encrypted Session Cookie
                                                          │
                                                          ▼
                                            [ Cloud Ingress Controller ] -> TLS Term, Rate Limiter
                                                          │
                                                          ▼
                                              [ Spring Boot BFF Proxy ]
                                             ┌─────────────────────────┐
                                             │ 1. Validate Session ID  │
                                             │ 2. Fetch JWT from Cache │
                                             │ 3. Inject Trace Headers │
                                             │ 4. Log Audit Trail      │
                                             └─────────────────────────┘
                                                          │
                                                          ▼
                                             [ Enterprise API Gateway ] -> Core Router
                                                          │
                                                          ▼
                                             [ Settlement Microservice ] -> Performs write action
                                                          │
                                                          ▼
                                            [ Spring Boot BFF Proxy ] <- Formats payload/errors
                                                          │
                                                          ▼
[ Browser UI ] <- [ Web App Interceptor ] <- Resolves toast & UI feedback
9. Permission Model: Hybrid RBAC + ABAC Architecture
For compliance and governance under clearing house requirements, a hierarchical authorization mechanism controls access down to the interactive UI widget level.

Plaintext
                 +--------------------------------------+
                 |          User Principal              |
                 +--------------------------------------+
                                    │
                  Has assigned roles & contextual attributes
                                    │
                                    ▼
                 +--------------------------------------+
                 |      Platform Permission Guard       |
                 +--------------------------------------+
                   /                │                 \
                  /                 │                  \
                 v                  v                   v
      [ Route Guard ]       [ Render Evaluator ]    [ ABAC Context Engine ]
     (Path Validation)    (Button/Widget Hiding)  (Dynamic Policy Control)
            │                       │                       │
     User has page-level?   User has write-perm?    Is user clearing member of
                                                    the target account?
Menu / Page Permissions (RBAC): Defined via high-level security profiles. Routes are filtered and menus are dynamically rendered based on structural permissions.

Button / Component Permissions: Granular conditional rendering engine:

TypeScript
<Authorized allowedPermissions={['settlement:write']}>
  <Button onClick={submitSettlement}>Approve Settlement</Button>
</Authorized>
Attribute-Based Access Control (ABAC): Evaluates dynamic context (e.g., "Is the user designated for Clearing House ID CH1024?"). It validates contextual claims embedded within the token scope during state transitions.

10. Platform Capability Matrix
The architectural ownership model establishes a clear boundary of technical responsibilities.

|| Platform Capability || Owner Layer || Primary Implementation Mechanism ||
| Authentication (OIDC) | Platform Layer / BFF | BFF negotiates OAuth2 authorization; Client Hydrator stores session metadata in client context. |
| Theme / Branding | HUI Library | Centralized corporate token configuration (CSS Variables, theme providers). |
| Routing | Platform Core Engine | Centralized Routing Registry wrapper utilizing React Router. |
| API SDK (Clients) | Platform Workspace Core | Auto-generated via OpenAPI schema compiler into @hkex-pt/api-sdk. |
| Layout (Nav / Sider) | Platform Core Layer | Central master wrapper with unified menu, profile menus and layout containers. |
| Toast Notifications | Platform Core Core | Central RTK Slice broker allowing simple global hook access useNotify(). |
| Trace Logging | Platform Workspace | OpenTelemetry client pushing log traces with traceId metadata directly to BFF logging sink. |
| Feature Toggles | Platform Core Layer | Unleash/LaunchDarkly integration hydrated via BFF configs down to client guards. |
| Business Domain Forms| Business Application | Pure domain forms built utilizing custom hooks. Platform enforces standard API payloads. |

11. Future Scalability
To guarantee a minimum 5–10 year operational lifecycle, the platform is designed to scale and adapt smoothly to the following technologies:

Micro Frontends via Module Federation: While initial applications are built as decoupled apps in the monorepo workspace, the platform layers are isolated so they can be bundled via Rspack/Webpack Module Federation. This allows teams to deploy Clearing and Settlement apps at different times without rebuilding the entire workspace.

Pluggable Architecture: Feature extensions (such as reporting tools) can be loaded at runtime dynamically as visual widgets through standardized manifest files.

High Observability Ready: Built natively using the standardized OpenTelemetry specification. Metrics can be easily exported to Datadog, Prometheus, or Grafana with zero architectural modifications.

12. Architecture Best Practices
Zero Direct State Mutation: Maintain complete unidirectional state flow utilizing React Signals and Redux Toolkit selectors.

Strict ESM Resolution: Enforce ESM modules across the Turborepo workspace.

Security Resilience: Implement strict Content Security Policy (CSP), prevent CSRF by enforcing SameSite=Strict cookie models, and secure clients against XSS by forbidding inline script tags.

Automated Quality Gates: Block release candidate branches if test coverage falls below 85% (Jest for unit files, Playwright for end-to-end user flows).