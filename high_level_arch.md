                                    +-----------------------------+
                                    |        OIDC Provider        |
                                |                EIDP     |
                                    +--------------+--------------+
                                                   ^
                                                   |
                                            OIDC Authorization
                                                   |
                      +----------------------------+---------------------------+
                      |                                                        |
                      |          Spring Boot API Gateway / Proxy               |
                      |--------------------------------------------------------|
                      |                                                        |
                      |  Authentication                                        |
                      |  Token Validation                                      |
                      |  Refresh Token                                         |
                      |  API Proxy                                             |
                      |  RBAC                                                  |
                      |  Audit Log                                             |
                      |  Rate Limit                                            |
                      +----------------------+---------------------------------+
                                             |
                              REST / GraphQL |
                                             |
          ---------------------------------------------------------------------
          |                         Backend Services                           |
          |--------------------------------------------------------------------|
          | Clearing Service | Settlement Service | Reporting | Notification   |
          ---------------------------------------------------------------------
                                             ^
                                             |
                                   HTTPS / JSON API
                                             |
+---------------------------------------------------------------------------------------+
|                           React Department Platform                                   |
|---------------------------------------------------------------------------------------|
|                                                                                       |
|  Platform Shell                                                                       |
|                                                                                       |
|   Login                                                                               |
|   Global Layout                                                                       |
|   Header                                                                              |
|   Left Menu                                                                           |
|   Notification                                                                        |
|   Breadcrumb                                                                          |
|   Theme                                                                               |
|   Error Boundary                                                                      |
|   Routing                                                                             |
|   Permission                                                                          |
|   Plugin Loader                                                                       |
|                                                                                       |
|---------------------------------------------------------------------------------------|
|                                                                                       |
|     Clearing Module        Settlement Module       Reporting Module                   |
|                                                                                       |
+---------------------------------------------------------------------------------------+
                                             ^
                                             |
                                      Department Platform
                                             ^
                                             |
                                     Company HUI Components
                                             ^
                                             |
                                      Material UI (MUI)



Business Apps
──────────────────────────────────

Clearing
Settlement
Reporting

──────────────────────────────────

Department Platform

Layout
Router
Permission
Theme
API SDK
Micro Frontend
Shared Hooks
State
Notification
Common Components

──────────────────────────────────

Company HUI

Button
Table
Form
Modal
Dialog
Tree
Theme
Icon
Charts

──────────────────────────────────

Material UI



