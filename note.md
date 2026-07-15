前端react，后端bff，bff实现oidc，前端api跟后端交互session 过期，token过期，一共要处理多少种情况
在 React + BFF（Backend For Frontend）+ OIDC 架构里，前端通常不直接持有 OIDC Token，而是通过 BFF 作为安全代理。此时需要处理的认证状态主要分为：
- 浏览器侧 Session（BFF Session）
- BFF 到 Identity Provider（IdP）的 Token（Access Token / Refresh Token）
- 前端 API 调用状态
实际项目里，一般需要考虑 6～10 类场景。下面按完整企业级设计拆开。
--------------------------------------------------------------------------------

1. 正常登录流程（Happy Path）
React
 |
 | GET /api/user
 |
BFF
 |
 | Access Token
 |
OIDC Provider

状态：
组件状态React有页面状态BFF Session有效Access Token有效Refresh Token有效

结果：
200 OK
返回业务数据

无需特殊处理。
--------------------------------------------------------------------------------

第一类：BFF Session 过期
这是最常见的。
例如：
BFF Session TTL = 30 min

用户打开页面 1 小时。
--------------------------------------------------------------------------------

Case 1：前端调用 API
React
 |
 | GET /api/accounts
 |
BFF

BFF 查 session：
session not found

返回：
401 Unauthorized

{
  "code":"SESSION_EXPIRED"
}

--------------------------------------------------------------------------------

React处理：
if(response.status===401){
   redirect("/login")
}

重新走：
/oauth2/authorize

OIDC 登录。
--------------------------------------------------------------------------------

第二类：Access Token 过期
BFF session 还有效。
但是：
access_token expired

例如：
access token:
30 minutes

session:
8 hours

流程：
React
 |
 | API
 |
BFF
 |
 | access token expired
 |
OIDC

BFF发现：
401 from resource server

--------------------------------------------------------------------------------

Case 2：BFF 自动 Refresh
推荐设计。
BFF保存：
session
 |
 |-- user
 |-- access_token
 |-- refresh_token

执行：
refresh_token
        |
        v
OIDC Provider
        |
 new access_token

然后重新请求：
Resource API

用户无感。
结果：
200 OK

--------------------------------------------------------------------------------

第三类：Refresh Token 过期
这是第二种升级情况。
例如：
access_token:
30 min

refresh_token:
8 hours

用户：
10小时没有操作

然后：
React
 |
API
 |
BFF
 |
refresh token expired

OIDC返回：
invalid_grant

--------------------------------------------------------------------------------

BFF：
删除session
session.invalidate()

返回：
401

{
 code:"LOGIN_REQUIRED"
}

React：
跳转登录：
/login

--------------------------------------------------------------------------------

第四类：用户主动退出
Logout。
流程：
React
 |
 /logout
 |
BFF

BFF：
删除：
session
access_token
refresh_token

然后：
OIDC logout:
/end_session_endpoint

返回：
login page

--------------------------------------------------------------------------------

第五类：多设备 / Session 被踢
企业系统经常需要。
例如：
用户：
Chrome 登录

然后：
管理员强制logout

或者：
新设备登录

旧session失效。
--------------------------------------------------------------------------------

API:
React
 |
BFF

BFF发现：
session revoked

返回：
401 SESSION_REVOKED

React:
清空状态
跳登录

--------------------------------------------------------------------------------

第六类：OIDC Provider 不可用
比如：
Okta / Azure AD / Keycloak 挂了。
情况：
BFF
 |
OIDC

refresh失败：
timeout
500
503

--------------------------------------------------------------------------------

处理：
不要立即logout。
例如：
retry 3 times

失败：
返回：
503 AUTH_SERVICE_UNAVAILABLE

前端：
显示：
Authentication service temporarily unavailable

--------------------------------------------------------------------------------

第七类：权限变化
Session有效。
Token有效。
但是：
用户权限变化。
例如：
上午：
Trader

下午：
Viewer

--------------------------------------------------------------------------------

API:
GET /trade/order

返回：
403 Forbidden

--------------------------------------------------------------------------------

区别：
401:

你是谁？


403:

你是谁，但是没权限。


React:
401:
重新登录

403:
显示无权限页面

--------------------------------------------------------------------------------

第八类：并发 Refresh Token 问题（高级）
非常容易踩坑。
例如：
页面同时发送：
GET /account
GET /portfolio
GET /orders

三个请求同时发现：
access token expired

三个线程：
refresh_token
refresh_token
refresh_token

可能：
refresh token reuse detected

--------------------------------------------------------------------------------

解决：
BFF实现：
Token Refresh Lock

例如：
Java:
synchronized(refreshToken){
   refresh();
}

或者：
Redis distributed lock:
token-refresh:user123

--------------------------------------------------------------------------------

第九类：API Session Timeout
例如：
用户打开页面：
session还有5分钟

正在提交：
POST /transfer

执行超过：
30秒

session过期。
结果：
401

需要：
- 
保存用户输入

- 
提示重新登录

--------------------------------------------------------------------------------

第十类：前端页面状态过期
这个不是认证层，但是企业系统必须处理。
例如：
用户：
打开交易页面

30分钟后：
session expired

React state:
old user info

需要：
logout cleanup:
clear redux
clear cache
clear localStorage

--------------------------------------------------------------------------------

总结：实际需要处理多少种？
编号情况处理位置1正常调用无2BFF Session过期React+BFF3Access Token过期BFF自动refresh4Refresh Token过期重新登录5用户logoutBFF+OIDC6Session被踢React7OIDC不可用BFF8权限变化403React9Refresh并发BFF10页面状态清理React

--------------------------------------------------------------------------------

企业级推荐设计
你的架构：
React
 |
 | Cookie(Session ID)
 |
BFF(Spring Boot)
 |
 | Access Token
 | Refresh Token
 |
OIDC Provider
 |
Resource APIs

建议：
React只处理：
401
403
503

不要知道：
access_token
refresh_token

--------------------------------------------------------------------------------

BFF负责：
Session lifecycle
Token lifecycle
Refresh
Logout
OIDC redirect

--------------------------------------------------------------------------------

如果是银行/交易所（比如你之前提到的 HKEX Post Trade 平台），通常会采用：
React
 |
HttpOnly Secure Cookie
 |
Spring Boot BFF
 |
Spring Security OAuth2 Client
 |
Azure AD / Okta / Keycloak

前端认证逻辑甚至可以控制在 一个 Axios interceptor + AuthContext 里面，核心代码不到 100 行。你这个场景属于典型企业级 OIDC + BFF 架构。

需要这个企业级架构的核心代码
下面给你一个企业级 React + Spring Boot BFF + OIDC 架构核心代码骨架。设计目标：
- 
React 不保存 token
- 
BFF 使用 HttpOnly Secure Cookie Session
- 
Spring Security OAuth2 Client 管理 OIDC

- 
BFF 自动 refresh token

- 
React 统一处理 401/403

- 
支持银行/交易所类似系统的安全模型

架构：
                 Browser
                    |
             HttpOnly Cookie
                    |
              React SPA
                    |
              /api/*
                    |
        Spring Boot BFF (OAuth2 Client)
                    |
       Access Token + Refresh Token
                    |
             OIDC Provider
          (Azure AD / Okta / Keycloak)
                    |
             Backend APIs

--------------------------------------------------------------------------------

1. Spring Boot BFF 项目结构
bff-service
│
├── security
│   ├── SecurityConfig.java
│   ├── OAuth2LoginSuccessHandler.java
│   └── TokenManager.java
│
├── controller
│   ├── AuthController.java
│   └── ApiProxyController.java
│
├── session
│   └── SessionConfig.java
│
└── application.yml

--------------------------------------------------------------------------------

2. Maven依赖
pom.xml
<dependencies>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>


<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>


<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>


<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
</dependency>


</dependencies>

--------------------------------------------------------------------------------

3. OIDC配置
例如 Azure AD / Okta / Keycloak
application.yml
spring:

 security:

  oauth2:

   client:

    registration:

     company-idp:

      client-id: xxx

      client-secret: xxx

      scope:
        - openid
        - profile
        - email
        - offline_access


    provider:

     company-idp:

      issuer-uri:
        https://idp.company.com


server:

 servlet:

  session:

   timeout: 8h

--------------------------------------------------------------------------------

4. Spring Security核心配置
SecurityConfig.java
@Configuration
@EnableWebSecurity
public class SecurityConfig {


@Bean
SecurityFilterChain securityFilterChain(
        HttpSecurity http
) throws Exception {


return http

.oauth2Login(oauth ->

    oauth.loginPage("/oauth2/authorization/company-idp")

)


.authorizeHttpRequests(auth -> auth

.requestMatchers(
    "/",
    "/login/**",
    "/oauth2/**"
)
.permitAll()


.anyRequest()
.authenticated()

)


.sessionManagement(session ->

session

.maximumSessions(1)

)


.csrf(csrf -> csrf.disable())


.build();

}

}

效果：
访问：
/api/account

没有session：
自动：
/oauth2/authorization/company-idp

跳OIDC登录。
--------------------------------------------------------------------------------

5. 登录成功保存Token
Spring OAuth2 默认：
Authentication
      |
OAuth2AuthorizedClient
      |
access_token
refresh_token

保存：
@Component
public class OAuth2LoginSuccessHandler
implements AuthenticationSuccessHandler {


private final OAuth2AuthorizedClientService service;



public OAuth2LoginSuccessHandler(
OAuth2AuthorizedClientService service){

this.service=service;

}



@Override
public void onAuthenticationSuccess(
HttpServletRequest request,
HttpServletResponse response,
Authentication authentication
)throws IOException{


OAuth2AuthenticationToken oauth =
(OAuth2AuthenticationToken)authentication;



OAuth2AuthorizedClient client =
service.loadAuthorizedClient(
oauth.getAuthorizedClientRegistrationId(),
oauth.getName()
);



String accessToken =
client.getAccessToken()
.getTokenValue();



System.out.println(accessToken);



response.sendRedirect("/");

}


}

--------------------------------------------------------------------------------

6. BFF调用后端API
React:
GET

/api/accounts

--------------------------------------------------------------------------------

Controller:
@RestController
@RequestMapping("/api")
public class ApiProxyController {



private final WebClient webClient;



@GetMapping("/accounts")
public ResponseEntity<?> accounts(
Authentication authentication
){


return webClient

.get()

.uri(
"https://backend/api/accounts"
)


.headers(headers -> {


OAuth2AuthenticationToken oauth =
(OAuth2AuthenticationToken)
authentication;


headers.setBearerAuth(
getAccessToken(oauth)
);


})


.retrieve()

.toEntity(Object.class)

.block();



}


}

--------------------------------------------------------------------------------

7. Token自动Refresh（关键）
企业项目不要自己写：
if(expired)
 refresh()

使用：
OAuth2AuthorizedClientManager

代码：
@Bean
OAuth2AuthorizedClientManager manager(
ClientRegistrationRepository repo,
OAuth2AuthorizedClientRepository repository
){


OAuth2AuthorizedClientProvider provider =

OAuth2AuthorizedClientProviderBuilder

.builder()

.authorizationCode()

.refreshToken()

.build();



DefaultOAuth2AuthorizedClientManager manager =

new DefaultOAuth2AuthorizedClientManager(
repo,
repository
);



manager.setAuthorizedClientProvider(provider);


return manager;

}

--------------------------------------------------------------------------------

调用：
OAuth2AuthorizeRequest request =

OAuth2AuthorizeRequest

.withClientRegistrationId(
"company-idp"
)

.principal(authentication)

.build();



OAuth2AuthorizedClient client =
manager.authorize(request);

如果：
access_token expired

自动：
refresh_token
        |
        v
OIDC
        |
 new access_token

--------------------------------------------------------------------------------

8. Session Cookie配置
生产环境：
@Configuration
public class SessionConfig {


@Bean
DefaultCookieSerializer cookieSerializer(){


DefaultCookieSerializer serializer =
new DefaultCookieSerializer();


serializer.setCookieName("BFFSESSION");


serializer.setUseHttpOnlyCookie(true);


serializer.setUseSecureCookie(true);


serializer.setSameSite("Strict");


return serializer;


}

}

浏览器看到：
Cookie:

BFFSESSION=abc123

HttpOnly
Secure
SameSite=Strict

React无法读取。
--------------------------------------------------------------------------------

9. React API封装
axios:
// api.ts


import axios from "axios";


const api = axios.create({

baseURL:"/api",

withCredentials:true

});



api.interceptors.response.use(

response=>response,


error=>{


if(error.response?.status===401){


window.location.href=
"/oauth2/authorization/company-idp";


}



if(error.response?.status===403){


window.location.href="/forbidden";


}



return Promise.reject(error);


}

);



export default api;

--------------------------------------------------------------------------------

10. React Auth Context
export function AuthProvider({

children

}){


const [user,setUser]=useState(null);



useEffect(()=>{


api.get("/user")

.then(res=>{

setUser(res.data)

})

.catch(()=>{

setUser(null)

})


},[]);



return (

<AuthContext.Provider value={{
user
}}>

{children}

</AuthContext.Provider>

)

}

--------------------------------------------------------------------------------

11. Logout
React:
function logout(){

window.location.href=
"/logout";

}

--------------------------------------------------------------------------------

BFF:
@GetMapping("/logout")
public void logout(
HttpServletRequest request,
HttpServletResponse response
){


request.getSession()
.invalidate();


response.sendRedirect(

"https://idp/logout"

);


}

--------------------------------------------------------------------------------

12. 企业级错误码设计
不要直接返回：
401

推荐：
{
 "code":"AUTH_SESSION_EXPIRED",
 "message":"Login expired",
 "traceId":"abc123"
}

统一：
AUTH_SESSION_EXPIRED

AUTH_TOKEN_REFRESH_FAILED

AUTH_FORBIDDEN

AUTH_PROVIDER_UNAVAILABLE

--------------------------------------------------------------------------------

最终生产级流程
                 React
                   |
              Axios interceptor
                   |
              Cookie Session
                   |
             Spring Boot BFF
                   |
        ----------------------
        |                    |
   Session Store        OAuth Client
       Redis                 |
                             |
                     Access Token
                     Refresh Token
                             |
                         OIDC
                             |
                         APIs

--------------------------------------------------------------------------------

对于你之前提到的 HKEX Post Trade Clearing/Settlement 平台，我会进一步增加：
1.Redis Session Cluster
2.Spring Security OAuth2 Client + PKCE
3.OIDC Logout Front Channel / Back Channel
4.Token Refresh Lock
5.Audit Log（登录、退出、token refresh）
6.MFA / Step-up Authentication
这基本就是交易所、银行内部平台采用的 BFF 安全架构。你可以直接作为项目技术方案的 Security Architecture 部分。

你的理解基本正确，但企业级 BFF 架构里需要稍微调整一下：React Auth Provider 不应该负责 OIDC 登录流程，它只负责确认当前 BFF Session 是否有效，以及加载当前用户信息。
正确流程如下：
              OIDC Provider
                   |
             登录成功
                   |
          Spring Boot BFF
                   |
        创建 Server Session
        保存 OAuth2AuthorizedClient
                   |
          HttpOnly Cookie
                   |
                React
                   |
             AuthProvider
                   |
              GET /api/me
--------------------------------------------------------------------------------
React AuthProvider 的职责
它做的事情：
1.
应用启动

2.
调用 BFF /api/me
3.
判断当前用户状态

例如：
function AuthProvider({children}) {

 const [user,setUser] = useState(null);

 const [loading,setLoading] = useState(true);


 useEffect(()=>{

    fetch("/api/me",{
       credentials:"include"
    })
    .then(res=>{

       if(res.ok){
          return res.json();
       }

       throw new Error();

    })
    .then(user=>{

       setUser(user);

    })
    .catch(()=>{

       setUser(null);

    })
    .finally(()=>{

       setLoading(false);

    });


 },[]);


 return (
   <AuthContext.Provider
      value={{
        user,
        loading
      }}
   >
      {children}
   </AuthContext.Provider>
 )

}
--------------------------------------------------------------------------------
那什么时候跳 Login？
不是 AuthProvider 发现 user=null 就立即跳。
企业系统通常分三种状态：
--------------------------------------------------------------------------------
状态1：第一次访问
例如：
打开：
https://app.company.com
React:
AuthProvider启动
       |
       |
GET /api/me
BFF：
Session不存在
返回：
401
Response:
{
 "code":"AUTH_REQUIRED"
}
React：
redirect:

/oauth2/authorization/company-idp
进入OIDC。
--------------------------------------------------------------------------------
状态2：已经登录
BFF Session存在：
Cookie:
BFFSESSION=xxx
调用：
GET /api/me
BFF:
Session OK
Token OK
返回：
{
 "id":"123",
 "name":"Leon",
 "roles":[
    "TRADER"
 ]
}
React:
setUser(user)
进入系统。
--------------------------------------------------------------------------------
状态3：Session过期
例如：
8小时后
React：
GET /api/orders
BFF：
Session expired
返回：
401
React interceptor:
if(status===401){

 window.location.href=
 "/oauth2/authorization/company-idp"

}
重新登录。
--------------------------------------------------------------------------------
但是有一个重要区别
很多人会设计成：
React
 |
 | OIDC login
 |
Token
这是 SPA 标准模式。
但是你的架构：
React
 |
 | Cookie
 |
BFF
 |
 | Token
 |
OIDC
所以：
React不知道：
❌ access_token
❌ refresh_token
❌ token expiry
它只知道：
✅ 当前用户是谁
✅ session是否有效
✅ 有没有权限
--------------------------------------------------------------------------------
推荐企业级 API
BFF提供：
1. 当前用户
GET /api/auth/me
返回：
{
 "authenticated":true,

 "user":{
    "id":"10001",
    "name":"John"
 },

 "permissions":[
    "CLEARING_VIEW",
    "SETTLEMENT_APPROVE"
 ]
}
--------------------------------------------------------------------------------
2. 登录状态检查
GET /api/auth/status
返回：
成功：
{
 "authenticated":true
}
失败：
{
 "authenticated":false
}
--------------------------------------------------------------------------------
3. Logout
POST /api/auth/logout
--------------------------------------------------------------------------------
React Router 配合
典型结构：
App
 |
AuthProvider
 |
Router
 |
ProtectedRoute
 |
Business Pages
ProtectedRoute：
function ProtectedRoute({children}){

const {user,loading}=useAuth();


if(loading)
 return <Loading/>;


if(!user){

 window.location.href=
 "/oauth2/authorization/company-idp";

 return null;
}


return children;

}
--------------------------------------------------------------------------------
交易所/银行系统更推荐
不要让 React 自己判断：
user=null => login
因为可能：
- 
OIDC服务器挂了

- 
网络失败

- 
BFF异常

- 
Session Redis故障

应该区分：
情况HTTPReact行为未登录401 AUTH_REQUIRED跳登录Session过期401 SESSION_EXPIRED重新登录无权限403显示无权限OIDC不可用503提示稍后重试BFF异常500错误页面
--------------------------------------------------------------------------------
所以你的理解可以改成一句更准确的话：

OIDC 登录成功后，BFF 创建 Session；React AuthProvider 启动时调用 /api/auth/me 获取用户信息。如果成功返回 user，则认为登录成功；如果返回 401，则触发 OIDC 登录流程。React 不管理 Token，只管理用户状态。

这就是目前银行、交易所内部 SPA + BFF 的主流模式。

我这边landing的html是静态文件，不是在auth provider下面的，首次登录时打开的是landing.html
你的这个情况很常见，尤其是企业门户、交易平台、银行系统。Landing.html 是静态入口，不属于 React AuthProvider 管理范围，所以首次访问的认证流程需要单独设计。
你的实际结构应该类似：
Browser
   |
   | https://company.com/landing.html
   |
Static Web Server
(Nginx / CDN)
   |
   |
React App
   |
AuthProvider
   |
/api/auth/me
   |
BFF
   |
OIDC

关键点：

AuthProvider 只能处理 React 加载之后的认证状态；landing.html 之前的认证，需要由静态页面或者 BFF 入口控制。


--------------------------------------------------------------------------------

方案1（企业最推荐）：Landing.html 由 BFF 判断认证状态
流程：
第一次访问
用户：
https://company.com/landing.html

请求：
GET /landing.html

Nginx/BFF：
检查：
BFFSESSION Cookie

--------------------------------------------------------------------------------

情况A：没有Session
返回 landing 页面：
landing.html

里面显示：
Welcome

[Login]

按钮：
<a href="/oauth2/authorization/company-idp">
 Login
</a>

跳转：
BFF
 |
OIDC
 |
Login
 |
callback

成功：
BFF创建Session

然后：
redirect /

进入 React。
--------------------------------------------------------------------------------

情况B：已经登录
Cookie存在：
BFFSESSION=xxxx

BFF判断：
session valid

直接：
302 redirect

/app/index.html

--------------------------------------------------------------------------------

流程：
             Browser

                |
                |
        landing.html

                |
          BFF检查Session

          /             \

       无Session       有Session

          |              |

       Login          React App

          |

        OIDC

          |

       Session创建

--------------------------------------------------------------------------------

方案2：Landing.html 自己调用 Auth API
例如 landing.html：
<script>

fetch("/api/auth/status",
{
 credentials:"include"
})
.then(res=>res.json())
.then(data=>{


 if(data.authenticated){

    location.href="/app";

 }

})


</script>

BFF：
GET /api/auth/status

返回：
成功：
{
 authenticated:true
}

失败：
{
 authenticated:false
}

--------------------------------------------------------------------------------

这个方案也可以。
但是：
缺点：
- 
页面会闪一下

- 
安全控制在前端

- 
SEO没意义

--------------------------------------------------------------------------------

方案3：Landing.html 完全公开，React接管
例如：
company.com
 |
landing.html
 |
click login
 |
React
 |
AuthProvider

AuthProvider：
useEffect(()=>{

getUser()

},[])

如果失败：
redirect login

这种适合普通SaaS。
--------------------------------------------------------------------------------

银行/交易所更常用方案
类似你之前说的 HKEX Post Trade：
通常：
                    Browser

                       |
                  landing.html

                       |
                    BFF

             check authentication

              /                 \

       not authenticated     authenticated

             |                    |

          OIDC login          React SPA

                                   |

                              AuthProvider

                                   |

                              GET /me

--------------------------------------------------------------------------------

React AuthProvider 仍然需要存在吗？
需要。
因为：
Landing判断：
有没有登录

AuthProvider负责：
React应用内部用户状态

例如：
React启动：
GET /api/auth/me

返回：
{
 username:"Leon",
 roles:[
   "CLEARING_OPERATOR"
 ],
 permissions:[
   "TRADE_VIEW"
 ]
}

然后：
AuthContext.user

整个React使用。
--------------------------------------------------------------------------------

一个更完整的企业目录结构
例如：
web-server

├── landing.html       <-- public入口
│
├── app/
│    |
│    ├── index.html
│    ├── assets/
│    └── react bundle
│
└── nginx.conf

Nginx:
location / {

    try_files $uri @bff;

}


location @bff {

    proxy_pass http://bff;

}

BFF:
@GetMapping("/")
public String index(
HttpServletRequest request
){

if(sessionExist){

return "redirect:/app";

}

return "landing";

}

--------------------------------------------------------------------------------

还有一个重要设计点
不要让 landing.html 自己存：
❌ access_token
❌ id_token
❌ refresh_token
浏览器里面只有：
Cookie:

BFFSESSION
HttpOnly
Secure
SameSite

--------------------------------------------------------------------------------

所以你的场景正确模型应该是：
landing.html
       |
       | (session check)
       |
       v
Spring Boot BFF
       |
       | OAuth2 Client
       |
OIDC Provider
       |
       |
React App
       |
       |
AuthProvider
       |
       |
GET /api/auth/me

也就是说：
Landing.html 是“认证入口层”，AuthProvider 是“React应用内状态管理层”，两者职责不同。
这个设计在银行、交易所、企业内部平台非常常见。你现在这个问题其实已经进入 SPA + BFF 的实际落地细节了。

