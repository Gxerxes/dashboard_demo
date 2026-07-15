你这个问题已经进入企业级 BFF + OIDC 认证状态机设计。我会按照你的 10 个 Case，给出：
- 触发条件
- 请求流程
- BFF(Spring Boot)代码
- React代码
- 处理结果
假设技术栈：
- 
Frontend: React + Axios + AuthProvider

- 
BFF: Spring Boot 3 + Spring Security OAuth2 Client

- 
Session: Redis Session

- 
IdP: Azure AD / Okta / Keycloak

- 
Backend Service: OAuth2 Resource Server

--------------------------------------------------------------------------------
基础代码准备
React Axios
所有 case 基于这个 interceptor：
// api.ts

import axios from "axios";


const api = axios.create({

    baseURL:"/api",

    withCredentials:true

});



api.interceptors.response.use(

response => response,


async error => {


const status = error.response?.status;

const code = error.response?.data?.code;



switch(code){


case "AUTH_REQUIRED":
case "SESSION_EXPIRED":

    window.location.href =
    "/oauth2/authorization/company-idp";

    break;



case "FORBIDDEN":

    window.location.href="/403";

    break;



case "AUTH_PROVIDER_DOWN":

    alert(
     "Authentication unavailable"
    );

    break;

}



return Promise.reject(error);


});


export default api;
--------------------------------------------------------------------------------
Case 1：正常调用
场景
React
 |
GET /api/orders
 |
BFF Session OK
 |
Access Token OK
 |
Service
--------------------------------------------------------------------------------
React
api.get("/orders")
.then(res=>{

 setOrders(res.data);

});
--------------------------------------------------------------------------------
BFF
@GetMapping("/orders")
public ResponseEntity<?> orders(
Authentication authentication
){


return orderService.getOrders();


}
--------------------------------------------------------------------------------
结果：
200 OK
--------------------------------------------------------------------------------
Case 2：BFF Session过期
场景
Cookie:
BFFSESSION=xxx
但是 Redis:
session not found
--------------------------------------------------------------------------------
Spring Session自动处理
请求：
GET /api/orders
Spring Security:
SessionManagementFilter
发现：
AnonymousAuthentication
--------------------------------------------------------------------------------
配置 EntryPoint
@Component
public class RestAuthenticationEntryPoint
implements AuthenticationEntryPoint{


@Override
public void commence(
HttpServletRequest request,
HttpServletResponse response,
AuthenticationException e
)throws IOException{


response.setStatus(401);

response.setContentType(
"application/json"
);


response.getWriter()
.write("""
{
 "code":"SESSION_EXPIRED"
}
""");


}

}
--------------------------------------------------------------------------------
Security:
http
.exceptionHandling(e->
e.authenticationEntryPoint(
restAuthenticationEntryPoint
)
);
--------------------------------------------------------------------------------
React
Interceptor:
if(code==="SESSION_EXPIRED"){

window.location.href=
"/oauth2/authorization/company-idp";

}
--------------------------------------------------------------------------------
Case 3：Access Token过期
场景
BFF Session:
OK
但是：
access_token expired
--------------------------------------------------------------------------------
BFF调用Service：
Authorization:
Bearer expired_token
Service:
401
--------------------------------------------------------------------------------
BFF Refresh
TokenManager:
@Service
public class TokenManager {


private final OAuth2AuthorizedClientManager manager;



public OAuth2AuthorizedClient getToken(
Authentication authentication
){


OAuth2AuthorizeRequest request =

OAuth2AuthorizeRequest

.withClientRegistrationId(
"company-idp"
)

.principal(authentication)

.build();



return manager.authorize(request);

}

}
--------------------------------------------------------------------------------
Spring自动：
refresh_token
        |
        v
OIDC
        |
new access_token
--------------------------------------------------------------------------------
重新调用：
retryRequest();
--------------------------------------------------------------------------------
用户无感：
200 OK
--------------------------------------------------------------------------------
Case 4：Refresh Token过期
场景
access_token expired

refresh_token expired
OIDC返回：
{
"error":"invalid_grant"
}
--------------------------------------------------------------------------------
BFF:
catch(OAuth2AuthorizationException e){


session.invalidate();


return ResponseEntity

.status(401)

.body(
Map.of(
"code",
"LOGIN_REQUIRED"
)
);

}
--------------------------------------------------------------------------------
React:
if(
code==="LOGIN_REQUIRED"
){

location.href=
"/oauth2/authorization/company-idp";

}
--------------------------------------------------------------------------------
Case 5：用户 Logout
React
function logout(){

window.location.href=
"/api/auth/logout";

}
--------------------------------------------------------------------------------
BFF
@RestController
public class LogoutController {



@GetMapping("/api/auth/logout")
public void logout(
HttpServletRequest request,
HttpServletResponse response
)
throws IOException{


request
.getSession()
.invalidate();



response.sendRedirect(

"https://idp.com/logout"

);


}

}
--------------------------------------------------------------------------------
OIDC：
清除：
SSO Cookie
--------------------------------------------------------------------------------
Case 6：Session被踢
例如：
管理员：
disable user session
Redis:
delete session:user123
--------------------------------------------------------------------------------
BFF Filter
@Component
public class SessionCheckFilter
extends OncePerRequestFilter{


protected void doFilterInternal(
HttpServletRequest request,
HttpServletResponse response,
FilterChain chain
)
throws IOException,ServletException{


HttpSession session =
request.getSession(false);



if(session==null){

response.setStatus(401);

response.getWriter()
.write("""
{
"code":"SESSION_REVOKED"
}
""");

return;

}


chain.doFilter(
request,response
);

}

}
--------------------------------------------------------------------------------
React:
if(code==="SESSION_REVOKED"){

logout();

}
--------------------------------------------------------------------------------
Case 7：OIDC Provider不可用
场景：
Refresh:
Azure AD timeout
--------------------------------------------------------------------------------
BFF:
try{


refreshToken();


}

catch(Exception e){


return ResponseEntity

.status(503)

.body(

Map.of(
"code",
"AUTH_PROVIDER_DOWN"
)

);


}
--------------------------------------------------------------------------------
React:
if(code==="AUTH_PROVIDER_DOWN"){


showError(
"Login service unavailable"
);


}
--------------------------------------------------------------------------------
Case 8：权限变化403
Token:
{
"roles":[
"USER"
]
}
访问：
/approve
Controller:
@PreAuthorize(
"hasRole('ADMIN')"
)
@PostMapping("/approve")
public void approve(){

}
--------------------------------------------------------------------------------
Spring:
返回：
403
--------------------------------------------------------------------------------
统一处理：
@Component
public class RestDeniedHandler
implements AccessDeniedHandler{


public void handle(
HttpServletRequest req,
HttpServletResponse res,
AccessDeniedException e
)
throws IOException{


res.setStatus(403);

res.getWriter()
.write("""
{
"code":"FORBIDDEN"
}
""");


}

}
--------------------------------------------------------------------------------
React:
if(code==="FORBIDDEN"){

navigate("/403");

}
--------------------------------------------------------------------------------
Case 9：Refresh并发
问题：
三个请求：
GET /account
GET /orders
GET /portfolio
同时：
token expired
三个refresh：
refresh()
refresh()
refresh()
--------------------------------------------------------------------------------
解决：
Redis Lock
@Service
public class RefreshLock {


@Autowired
RedisTemplate redis;



public boolean lock(String user){


return redis.opsForValue()
.setIfAbsent(

"token-refresh:"+user,

"LOCK",

Duration.ofSeconds(10)

);


}

}
--------------------------------------------------------------------------------
Refresh:
if(lock.lock(user)){


refreshToken();


}
else{


waitNewToken();

}
--------------------------------------------------------------------------------
Case 10：页面状态清理
Session失效：
React:
logout()
--------------------------------------------------------------------------------
AuthProvider:
function clearAuth(){


setUser(null);


localStorage.removeItem(
"redux-state"
);


sessionStorage.clear();


dispatch({
type:"RESET"
});


}
--------------------------------------------------------------------------------
Root:
useEffect(()=>{


api.get("/auth/me")

.catch(()=>{


clearAuth();


})


},[]);
--------------------------------------------------------------------------------
最终状态机
                 Request
                    |
                    v
             BFF Session?
              /       \
            No        Yes
            |          |
        Login      Token?
                       |
                 +-----+------+
                 |            |
              Valid        Expired
                 |            |
              Service     Refresh?
                              |
                    +---------+--------+
                    |                  |
                  OK               Failed
                    |                  |
                 Retry            Login


Service Response:

401 -> Authentication
403 -> Authorization
503 -> Identity Provider
--------------------------------------------------------------------------------
这 10 个 Case 基本覆盖了银行/交易所级 SPA + BFF + OIDC 的认证生命周期。
如果落到你之前的 HKEX Post Trade Clearing/Settlement Platform，还会再增加两个生产级 Case：
1.Token Revocation（管理员撤销Token）
2.Step-up Authentication（高风险操作重新MFA，例如Settlement Release）
这两个在清算系统里通常也是必须设计的。