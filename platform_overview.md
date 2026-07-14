1. Project Overview
1.1 Background and Objectives
The Hong Kong Exchanges and Clearing (HKEX) Post Trade department is establishing a department-level frontend platform foundation. This platform serves as a unified, enterprise-grade core designed to support all future single-page applications (SPAs) across the Clearing and Settlement domains over the next 5 to 10 years.

The primary objective is to break down existing technical fragmentation, accelerate delivery velocity, and guarantee a robust, highly secure, and compliant baseline across all post-trade systems.

1.2 Architectural Hierarchy Topology
To prevent architectural drift and ensure a strict separation of concerns, the ecosystem adopts a unidirectional layered topology:

Plaintext
+-----------------------------------------------------------------------------------+
|               Layer 4: Business Applications (Clearing / Settlement)              |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|               Layer 3: Post Trade Platform Core (Departmental Infrastructure)     |
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
Layer 1: MUI Core: Low-level styling primitives, flexbox/grid layout engines, and underlying digital accessibility mechanics.

Layer 2: HUI Design System: HKEX’s corporate design language, enforcing brand identity, standard colors, shared typography, and baseline component specifications compliant with WCAG 2.1 AA guidelines.

Layer 3: Post Trade Platform Core (The Kernel): The orchestration engine of this project. It abstracts technical complexities by packaging cross-cutting concerns (authentication, routing, telemetry, and security) and compound financial widgets (e.g., high-throughput data grids and risk-monitoring viewports).

Layer 4: Business Applications: Decoupled functional products (e.g., Clearing Operations, Settlement Instructions, Reporting Sinks). These applications feature "zero-infrastructure configuration", containing 100% pure business domain logic and views.

2. Technical Selection & Architecture Decision Records (ADRs)
To fulfill non-functional requirements (NFRs) regarding financial-grade resilience, data integrity, and deterministic state flows, the platform leverages the following architectural foundations:

2.1 Frontend Core Ecosystem
React 19 & TypeScript

Decision: Selected as the standardized programming language and UI library.

Rationale: Post-trade clearing and settlement platforms handle critical transactions where coding oversights introduce heavy regulatory and financial risks. TypeScript enforces compile-time type boundaries, deep static code analysis, and deterministic refactoring structures that significantly mitigate runtime errors.

Vite

Decision: Adopted as the primary build system and local development server, replacing legacy Webpack configurations.

Rationale: Large financial monoliths often suffer from sluggish hot-module replacement (HMR) and long compilation bottlenecks. Vite leverages native ECMAScript Modules (ESM) to deliver near-instant cold starts and lightning-fast HMR, vastly optimizing the developer experience (DX).

React Router v7

Decision: Implemented as the centralized cross-application routing broker.

Rationale: Its advanced nested routing capabilities and native Route Guards allow the platform to integrate seamlessly with the Permission Engine, blocking unauthorized route execution prior to component instantiation.

Redux Toolkit (RTK) + TanStack Query (React Query)

Decision: Enforced a Dual-State Architectural Model. Global UI/UX contexts are governed by RTK, whereas all server-side asynchronous data operations and state caching are delegated entirely to TanStack Query.

Rationale: Post-trade data streams are highly asynchronous and prone to volatility. Managing these pipelines via traditional global stores results in verbose boilerplate actions and redundant UI re-renders. TanStack Query simplifies this via declarative caching, "stale-while-revalidate" scheduling, and optimistic UI mutations, reducing API pressure while maintaining eventual consistency across financial data points.

2.2 Workspace Architecture & Build Engineering
pnpm Workspaces + Turborepo

Decision: Configured a highly optimized, unified Monorepo infrastructure.

Rationale:

Dependency Isolation: pnpm’s content-addressable storage model prevents "phantom dependencies" from polluting the global node_modules context, guaranteeing absolute reproducibility across localized applications.

Incremental Pipeline Execution: Turborepo analyzes workspace dependency graphs to cache build targets locally and remotely. Unchanged packages completely bypass pipeline execution steps (100% cache hit), shrinking CI/CD deployment cycles from minutes down to seconds.

2.3 Security Architecture & Backend-for-Frontend (BFF) Pattern
Spring Boot 3 + Spring Security + Redis

Decision: Absolute enforcement of the Backend-for-Frontend (BFF) pattern. The frontend application is strictly forbidden from directly managing, storing, or exposing raw OIDC access/refresh tokens within the browser space (e.g., LocalStorage or SessionStorage).

Rationale:

XSS and CSRF Mitigation: The Spring Boot BFF intercepts and manages the OIDC Authorization Code Grant flow paired with PKCE. It safely caches high-value JWTs within an encrypted server-side Redis instance. Communication between the browser client and the BFF is authenticated exclusively via encrypted session cookies configured with HttpOnly, Secure, and SameSite=Strict attributes. This eliminates token exfiltration risks via Cross-Site Scripting (XSS).

API Gateway and Context Aggregation: The BFF proxies outgoing API requests to backend microservices, transparently injecting authorization tokens while performing runtime schema validation and data clipping to optimize client payloads.

2.4 Observability and Quality Gates
OpenTelemetry + ELK / Splunk

Decision: Integrated native OpenTelemetry instrumentation across the network layout.

Rationale: In high-volume financial auditing, identifying whether a failed trade matching occurred at the browser tier, the BFF proxy, or a downstream microservice is crucial. The custom Axios engine automatically injects unified TraceId configurations within request headers, facilitating distributed tracing and full-stack transparency across logging sinks.

Jest + React Testing Library + Playwright

Decision: Constructed a three-tier automated testing matrix.

Rationale: Post-trade software demands a zero-fault tolerance strategy. Jest validates core deterministic utilities; React Testing Library executes behavioral assertions on UI elements without exposing implementation details; and Playwright drives end-to-end (E2E) automated trade flows. The CI/CD deployment gates strictly block release candidates if global code coverage drops below 85%.


|| Layer || Technology ||
| UI | MUI |
| Company Design System | HUI |
| Department Platform | React + TypeScript |
| State Management | Redux Toolkit (Global) + React Query/TanStack Query (Server State) |
| Router | React Router v7 |
| HTTP | Axios |
| OIDC | oidc-client-ts (Frontend-driven) or Unified Handling via Spring Boot BFF |
| Internationalization (i18n) | react-i18next |
| Monorepo | pnpm workspace + Turborepo |
| Testing | Jest + React Testing Library + Playwright |
| Build Tool | Vite |
| Backend Proxy | Spring Boot + Spring Security + OAuth2 Client |
| Observability | OpenTelemetry + ELK/Splunk + Prometheus/Grafana |


|| Capability || Owned by Platform || Functional Description ||
| *Login* | (/) | Manages user authentication session initialization, handshake verification, and secure termination. |
| *OIDC* | (/) | Coordinates OpenID Connect token negotiation, verification, and silent renewal utilizing Authorization Code Grant + PKCE via the BFF. |
| *Theme* | (/) | Customizes and applies design tokens (colors, typography, spacing) that extend corporate HUI specifications for Post Trade branding. |
| *Layout* | (/) | Outlines the master application viewport wrapper, establishing standardized responsive headers, sidebars, and fluid workspace grids. |
| *Menu* | (/) | Evaluates user permissions dynamically to render hierarchical, context-aware navigation sidebars. |
| *Breadcrumb* | (/) | Parses active routing paths automatically to generate and display the user's directional contextual trail. |
| *Notification* | (/) | Centralizes global message brokers to dispatch toast popups, alerts, and operational feedback modally via a unified state slice. |
| *Permission* | (/) | Enforces a hybrid RBAC + ABAC architecture at runtime through strict page route guards and conditional component rendering wrappers. |
| *Feature Toggle* | (/) | Incorporates remote runtime switches (e.g., Unleash) to safely rollout, test, or isolate platform functionalities without redeployment. |
| *Audit Log* | (/) | Records and persists immutable security-critical user activities and downstream API proxies at the BFF tier for strict compliance. |
| *API SDK* | (/) | Distributes strongly-typed client modules and service interfaces auto-generated directly from enterprise OpenAPI schemas. |
| *Axios Wrapper* | (/) | Orchestrates standardized HTTP client configurations, injecting trace context headers, retry loops, and global timeout baselines. |
| *Error Boundary* | (/) | Isolates runtime UI rendering crashes gracefully, preventing full-page failure while shipping crash forensics to telemetry sinks. |
| *Global Loading* | (/) | Provides non-blocking application-wide loading state indicators and abstract skeleton UI screens matched to async network states. |
| *Internationalization (i18n)* | (/) | Embeds localization frameworks (`react-i18next`) to support dynamic multi-lingual dictionaries and localized financial formatting. |
| *Logging (Log)* | (/) | Collects structured client-side runtime errors and warnings, piping them formatted into backend logging daemons. |
| *Monitoring* | (/) | Instruments OpenTelemetry agents to track Core Web Vitals, interaction performance metrics, and behavioral clickstreams. |
| *Plugin Mechanism* | (/) | Orchestrates an extensible architectural framework to dynamically load, register, or sand-box decoupled micro-modules at runtime. |