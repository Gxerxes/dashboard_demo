# HKEX Post Trade Frontend Platform - Project Overview

## 1. Project Overview

### 1.1 项目背景
香港交易所（HKEX）结算部（Post Trade）计划构建一个部门级前端平台，服务于以下业务领域：
- **Clearing**（结算）
- **Settlement**（交收）
- **Reporting**（报告）
- **Future Apps**（未来应用）

该平台作为所有未来结算相关应用的通用前端基础。

### 1.2 架构层次
```
Material UI (MUI)
    ↓
HUI (Company Design System - HKEX 设计系统)
    ↓
Post Trade Platform (Department Platform - 部门平台)
    ↓
Business Applications (业务应用: Clearing / Settlement / Reporting)
```

## 2. Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **UI Framework** | React + TypeScript | React 18.x + TS 5.x |
| **Build Tool** | Vite | 5.x |
| **Package Manager** | pnpm | 9.x |
| **Monorepo** | pnpm workspace + Turborepo | 1.x |
| **State Management (Global)** | Redux Toolkit | 2.x |
| **Server State** | TanStack Query (React Query) | 5.x |
| **Routing** | React Router | 6.x |
| **HTTP Client** | Axios | 1.x |
| **UI Library** | Material UI (MUI) | 5.x |
| **Design System** | HUI (HKEX Design System) | Custom |
| **OIDC Client** | oidc-client-ts | 3.x |
| **Internationalization** | react-i18next + i18next | 23.x / 14.x |
| **Notifications** | notistack | 3.x |
| **Date/Number Formatting** | dayjs | 1.x |
| **Validation** | zod | 3.x |
| **Testing (Unit)** | Jest + React Testing Library | 29.x |
| **Testing (E2E)** | Playwright | latest |
| **Linting** | ESLint | 8.x |
| **Formatting** | Prettier | 3.x |
| **Backend Proxy** | Spring Boot 3 + Spring Security + OAuth2 | Java 21 |

## 3. Project Structure

```
dashboard_demo/
├── apps/                              # 业务应用
│   ├── clearing/                      # 结算业务应用
│   │   ├── src/
│   │   │   ├── pages/Dashboard.tsx    # 结算仪表盘
│   │   │   ├── trade/                 # 交易管理模块
│   │   │   ├── config/routes.ts       # 业务路由配置
│   │   │   ├── App.tsx                # 应用入口
│   │   │   └── main.tsx               # React 启动入口
│   │   ├── vite.config.ts             # Vite 构建配置
│   │   └── index.html                 # HTML 模板
│   ├── settlement/                    # 交收业务应用
│   ├── reporting/                     # 报告业务应用
│   ├── storybook/                     # 组件库文档
│   └── docs/                          # 项目文档
│
├── packages/
│   └── platform/                      # ⭐ 核心平台 (20+ 模块)
│       ├── src/
│       │   ├── auth/                  # 认证模块 (OIDC PKCE)
│       │   ├── router/                # 路由管理 + 守卫
│       │   ├── layout/                # 布局组件 (Sidebar/Header/Content)
│       │   ├── theme/                 # 主题系统 (Light/Dark/High-Contrast)
│       │   ├── state/                 # Redux Store 配置
│       │   ├── api/                   # API SDK (Axios + 拦截器)
│       │   ├── permission/            # 权限管理 (RBAC + ABAC)
│       │   ├── logging/               # 日志系统 (控制台 + 远程)
│       │   ├── notification/          # 通知系统
│       │   ├── i18n/                  # 国际化
│       │   ├── hooks/                 # 6个自定义Hooks
│       │   ├── utils/                 # 工具函数
│       │   ├── components/            # 公共组件
│       │   ├── error-boundary/        # 错误边界
│       │   ├── loading/               # 全局加载
│       │   ├── config/                # 平台配置
│       │   ├── monitoring/            # 监控埋点
│       │   ├── feature-flags/         # 功能开关
│       │   └── plugin/                # 插件注册中心
│       ├── dist/                      # 构建产出 (CJS + ESM)
│       └── tsconfig.json
│   └── configs/                       # 共享配置包
│       ├── typescript-config/         # TS 配置
│       ├── eslint-config/             # ESLint 配置
│       ├── prettier-config/           # Prettier 配置
│       └── jest-config/               # Jest 测试配置
│
├── turbo.json                         # Turborepo 管道配置
├── pnpm-workspace.yaml                # pnpm 工作空间配置
└── package.json                       # 根包配置
```

## 4. 架构设计

### 4.1 High-Level Architecture
```
Browser
   │
   ▼
┌─────────────────────────────────────┐
│         React Platform              │
│  ┌───────┬──────┬──────┬──────┐    │
│  │ Auth  │Router│Layout│Theme │    │
│  ├───────┼──────┼──────┼──────┤    │
│  │ API   │State │Perm. │Log   │    │
│  ├───────┼──────┼──────┼──────┤    │
│  │ Notif │i18n  │Hooks │Utils │    │
│  └───────┴──────┴──────┴──────┘    │
│           Application Shell         │
└────────────────┬────────────────────┘
                 │ HTTPS / OIDC
                 ▼
┌─────────────────────────────────────┐
│     Spring Boot Proxy (BFF)        │
│  ┌──────┬──────┬──────┬──────┐     │
│  │OIDC  │Authz │Proxy │Audit │     │
│  ├──────┼──────┼──────┼──────┤     │
│  │Session│CORS  │Rate  │Cache │    │
│  └──────┴──────┴──────┴──────┘     │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│      OIDC Provider (Okta/Azure/Ping)│
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│       Backend Microservices        │
│  (Clearing / Settlement / Report)  │
└─────────────────────────────────────┘
```

### 4.2 认证流程 (OIDC Authorization Code + PKCE)
```
Browser          React            Spring Boot         OIDC Provider       Backend API
   │                │                  │                    │                  │
   │                │  1.Login Click  │                    │                  │
   │◄───────────────│                  │                    │                  │
   │                │─────────────────►│ 2.Auth Request     │                  │
   │◄───────────────│──────────────────│───────────────────►│                  │
   │                │                  │                    │                  │
   │ 3.Redirect to Login Page         │                    │                  │
   │◄───────────────│──────────────────│────────────────────│                  │
   │                │                  │                    │                  │
   │ 4.Authenticate │                  │                    │                  │
   │───────────────────────────────────│───────────────────►│                  │
   │                │                  │                    │                  │
   │ 5.Auth Code    │                  │                    │                  │
   │◄───────────────│──────────────────│────────────────────│                  │
   │                │                  │                    │                  │
   │ 6.Callback     │                  │                    │                  │
   │────────────────► 7.Code + PKCE   │                    │                  │
   │                │─────────────────►│───────────────────►│                  │
   │                │                  │                    │                  │
   │                │                  │ 8.Tokens           │                  │
   │                │                  │◄───────────────────│                  │
   │                │ 9.User Session  │                    │                  │
   │                │◄────────────────│                    │                  │
   │                │                  │                    │                  │
   │ 10.API Request │                  │                    │                  │
   │────────────────► Bearer Token    │                    │                  │
   │                │────────────────►│ Validate Token     │                  │
   │                │                  │───────────────────►│                  │
   │                │                  │◄───────────────────│                  │
   │                │                  │ Proxy Request      │                  │
   │                │                  │───────────────────►│─────────────────►│
   │                │                  │                    │                  │
   │◄───────────────│◄────────────────│◄───────────────────│◄────────────────│
```

## 5. 平台能力清单

### 5.1 Platform 层提供的功能
| 能力 | 模块 | 状态 | 说明 |
|------|------|------|------|
| **Authentication** | `auth/` | ✅ 已实现 | OIDC PKCE 流，Token 管理，会话监控 |
| **Authorization (RBAC/ABAC)** | `permission/` | ✅ 已实现 | 角色/权限/条件检查 |
| **Layout** | `layout/` | ✅ 已实现 | Sidebar, Header, ContentArea, Breadcrumbs, TabBar |
| **Navigation** | `router/` | ✅ 已实现 | 懒加载路由，路由守卫，面包屑 |
| **Theme** | `theme/` | ✅ 已实现 | Light/Dark/High-Contrast，颜色方案 |
| **Notification** | `notification/` | ✅ 已实现 | notistack 集成，成功/错误/警告/信息 |
| **Error Boundary** | `error-boundary/` | ✅ 已实现 | 错误捕获，恢复UI |
| **Global Loading** | `loading/` | ✅ 已实现 | 全局加载遮罩 |
| **Logging** | `logging/` | ✅ 已实现 | 结构化日志，批量远程发送 |
| **Monitoring** | `monitoring/` | ✅ 已实现 | 监控提供者接口 |
| **Feature Flags** | `feature-flags/` | ✅ 已实现 | 功能开关上下文 |
| **Internationalization (i18n)** | `i18n/` | ✅ 已实现 | react-i18next 集成 |
| **API SDK** | `api/` | ✅ 已实现 | Axios 封装，Token 注入，401 重试 |
| **State Management** | `state/` | ✅ 已实现 | Redux Store + Middleware |
| **Shared Hooks** | `hooks/` | ✅ 已实现 | 6个自定义 Hooks |
| **Shared Components** | `components/` | ✅ 已实现 | ProtectedElement, PermissionGate |
| **Common Utilities** | `utils/` | ✅ 已实现 | 格式化，字符串，对象工具 |
| **Plugin Architecture** | `plugin/` | ✅ 已实现 | 插件注册中心 |
| **Configuration** | `config/` | ✅ 已实现 | 平台默认配置 |
| **Audit Trail** | `logging/auditLogger` | ✅ 已实现 | 审计日志记录 |
| **Performance Monitoring** | `logging/performanceLogger` | ✅ 已实现 | 性能标记与测量 |

### 5.2 业务应用负责的（Clearing 示例）
| 能力 | 文件 | 说明 |
|------|------|------|
| **Dashboard** | `pages/Dashboard.tsx` | 清算操作仪表盘 |
| **Trade Management** | `trade/TradeManagement.tsx` | 交易管理表格 |
| **Business Routes** | `config/routes.ts` | 业务路由定义+权限 |

## 6. 数据流设计

### 6.1 请求生命周期
```
1. User Interaction (点击按钮)
       │
2. React Component 调用 useAuth / usePermission 检查权限
       │
3. Redux Dispatch (如果涉及全局状态变化)
       │
4. Axios Request (通过 API SDK)
       │       ├─ Request Interceptor: 注入 Token + Request ID
       │       └─ Token 过期? → TokenManager.refreshToken()
       │
5. Spring Boot Proxy 接收请求
       │       ├─ Security Filter: 验证 JWT Token
       │       ├─ Authorization: 检查 API 权限
       │       ├─ Audit: 记录审计日志
       │       └─ Proxy: 转发到后端服务
       │
6. Backend Service 处理业务逻辑
       │
       ▼
7. Response 反向返回
       │       └─ Response Interceptor: 统一错误处理
8. React Query 缓存更新 → UI 刷新
```

## 7. 权限模型

### RBAC + ABAC 架构
```
User
 ├── Roles (角色)
 │    ├── CLEARING_ADMIN → permissions: [clearing:*]
 │    ├── CLEARING_OPERATOR → permissions: [clearing:trade:read, clearing:trade:write]
 │    └── CLEARING_VIEWER → permissions: [clearing:trade:read]
 │
 ├── Attributes (属性) → ABAC 条件评估
 │    ├── department: "clearing"
 │    ├── region: "HK"
 │    └── clearance_level: 3
 │
 └── Permission Check
      ├── Menu Permissions (菜单级)
      ├── Page Permissions (页面级)
      ├── Button Permissions (按钮级)
      └── API Permissions (API级)
```

## 8. 环境配置

```env
# .env 文件
VITE_ENV=development
VITE_API_BASE_URL=/api
VITE_OIDC_AUTHORITY=https://your-oidc-provider.com
VITE_OIDC_CLIENT_ID=your-client-id
VITE_OIDC_REDIRECT_URI=http://localhost:3000/callback
```

## 9. 开发命令

```bash
# 安装依赖
pnpm install

# 构建平台包
cd packages/platform && pnpm build

# 启动清算应用开发服务器
cd apps/clearing && pnpm dev

# 运行所有测试
pnpm test

# 代码检查
pnpm lint

# 类型检查
pnpm typecheck

# 清理构建
pnpm clean
```

## 10. 未来扩展

- **Micro Frontends**: 平台支持 Module Federation 集成，可扩展为微前端架构
- **Plugin System**: 通过 PluginRegistry 支持第三方插件动态加载
- **Multiple Domains**: 架构支持 Clearing, Settlement, Reporting 等多个业务域
- **Event-Driven**: 通过 EventBus 支持跨模块事件通信
- **Cloud Deployment**: Vite 构建输出支持容器化部署 (Docker + K8s)
- **CI/CD**: Turborepo 管道支持增量构建和缓存