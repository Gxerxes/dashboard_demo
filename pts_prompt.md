Professional Architecture Prompt



Role
Act as a Principal Software Architect with over 15 years of experience designing enterprise platforms for global financial institutions such as HKEX, Nasdaq, LSEG, CME, Goldman Sachs, Morgan Stanley, and Fidelity.
You specialize in React platform engineering, Java Spring Boot, OAuth2/OIDC security, enterprise UI frameworks, and scalable microservice architecture.
--------------------------------------------------------------------------------
Background
The Hong Kong Exchanges and Clearing (HKEX) Post Trade department plans to build a department-level Frontend Platform.
The primary business domains are:
- Clearing
- Settlement
The platform should serve as the common frontend foundation for all future Post Trade applications.
The company already provides a design system called HUI, which is built on top of Material UI (MUI).
The department will build its own Platform layer on top of HUI.
The architecture hierarchy should be:
Material UI (MUI)
→ HUI (Company Design System)
→ Post Trade Platform (Department Platform)
→ Business Applications (Clearing / Settlement / Reporting / Future Apps)
--------------------------------------------------------------------------------
Technical Constraints
Frontend
- React
- TypeScript
- Vite
- React Router
- Redux Toolkit
- TanStack Query
- Axios
- HUI Components
- Material UI
- pnpm workspace
- Turborepo
- Jest
- Playwright
Backend Proxy
- Java 21
- Spring Boot 3
- Spring Security
- OAuth2 Client
- OIDC Authentication
- API Gateway / Backend-for-Frontend (BFF)
Authentication
OIDC Authorization Code + PKCE
Identity Provider could be
- Okta
- Azure AD
- Ping Identity
The Spring Boot Proxy should be responsible for:
- OIDC login
- Token validation
- Token refresh
- Session management
- API aggregation
- Authorization
- Audit logging
- Security headers
--------------------------------------------------------------------------------
Requirements
Design an enterprise-grade architecture that can support multiple Post Trade applications over the next 5–10 years.
The Platform should provide reusable capabilities including:
- Authentication
- Authorization (RBAC / ABAC)
- Layout
- Navigation
- Theme
- Notification
- Error Boundary
- Global Loading
- Logging
- Monitoring
- Feature Flags
- Internationalization (i18n)
- Shared Hooks
- Shared Components
- API SDK
- Configuration Management
- Plugin Architecture
- Route Management
- Common Utilities
Business applications should contain only business logic.
--------------------------------------------------------------------------------
Deliverables
Please provide the following sections.
1. High-Level Architecture Diagram
Include
Browser
↓
React Platform
↓
Spring Boot Proxy
↓
OIDC Provider
↓
Backend Services
Show all major components and interactions.
--------------------------------------------------------------------------------
2. Frontend Layered Architecture
Illustrate the relationship between
Material UI
↓
HUI
↓
Department Platform
↓
Business Applications
Explain responsibilities for each layer.
--------------------------------------------------------------------------------
3. Monorepo Project Structure
Design a scalable project structure using
pnpm workspace
and
Turborepo.
Include folders such as:
apps/
platform/
packages/
configs/
shared/
docs/
scripts/
Explain the responsibility of every folder.
--------------------------------------------------------------------------------
4. Platform Internal Architecture
Design internal modules including
auth/
router/
layout/
permission/
notification/
hooks/
theme/
api/
config/
plugin/
state/
monitoring/
logging/
utils/
Explain responsibilities and interactions.
--------------------------------------------------------------------------------
5. Business Application Structure
Design the recommended structure for applications like
Clearing
Settlement
Reporting
Describe how business applications consume Platform capabilities.
--------------------------------------------------------------------------------
6. Backend Proxy Architecture
Design the Spring Boot project structure.
Include
Security
OIDC
Controllers
Services
Filters
Interceptors
Audit
Configuration
Exception Handling
Proxy Layer
Explain request flow.
--------------------------------------------------------------------------------
7. Authentication Sequence Diagram
Show
Browser
↓
React
↓
Spring Boot
↓
OIDC Provider
↓
Backend APIs
Illustrate Authorization Code + PKCE flow.
--------------------------------------------------------------------------------
8. Runtime Request Flow
Describe the complete lifecycle of a request from browser to backend and back.
--------------------------------------------------------------------------------
9. Permission Model
Design RBAC + ABAC architecture.
Explain
Menu permissions
Page permissions
Button permissions
API permissions
Route Guards
--------------------------------------------------------------------------------
10. Platform Capability Matrix
Provide a table showing which layer owns each capability.
Example:
Authentication
Theme
Routing
API SDK
Layout
Notification
Logging
Monitoring
Feature Flags
Business Logic
--------------------------------------------------------------------------------
11. Future Scalability
Explain how the architecture can evolve to support:
Micro Frontends
Module Federation
Plugin Architecture
Event-driven communication
Shared SDKs
Multiple business domains
Cloud deployment
CI/CD
Observability
--------------------------------------------------------------------------------
12. Architecture Best Practices
Provide recommendations based on enterprise financial systems.
Include:
Scalability
Maintainability
Security
Performance
Developer Experience
Testing Strategy
Folder Organization
Coding Standards
Dependency Management
Monitoring
Logging
Deployment
Disaster Recovery
--------------------------------------------------------------------------------
Output Requirements
Please use:
- Mermaid diagrams
- ASCII architecture diagrams
- Sequence diagrams
- Layer diagrams
- Folder tree structures
- Tables
- Detailed explanations
The architecture should follow enterprise standards used by large financial institutions and should be suitable for technical design review and architecture governance.
这个 Prompt 已经接近大型公司的架构设计文档（Architecture Design Document，ADD）输入模板。
如果你希望 AI 输出质量进一步提升，还可以加入一些高级要求，例如：
- 遵循架构方法论：TOGAF、C4 Model、Arc42、Domain-Driven Design（DDD）、Clean Architecture。

- 非功能性需求（NFR）：可用性、性能、安全性、可维护性、可观测性、灾备要求等。

- 架构决策记录（ADR）：要求给出技术选型的理由，例如为什么选择 BFF、为什么采用 Monorepo、为什么使用 TanStack Query。

- 部署架构：要求补充 Kubernetes、Ingress、CI/CD、容器化、蓝绿发布等内容。

这样的 Prompt 能够引导 AI 输出接近企业级架构设计评审文档，而不仅仅是一个项目目录示例。