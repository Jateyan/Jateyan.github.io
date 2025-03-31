---
title: frontend-security
createTime: 2025/03/29 17:38:11
permalink: /article/xv1f3gjl/
---
# Angular前端安全

## 目录

- [XSS防御](#XSS防御)
- [CSRF保护](#CSRF保护)
- [安全HTTP头](#安全HTTP头)
- [输入验证](#输入验证)
- [JWT安全处理](#JWT安全处理)

## XSS防御

跨站脚本攻击(XSS)是Web应用中最常见的安全漏洞之一，攻击者通过注入恶意脚本代码到页面中，使其在用户浏览器中执行。Angular提供了多层防御机制来抵御XSS攻击。

### Angular内置的XSS防护机制

Angular框架默认实现了多种安全机制来防止XSS攻击：

```ascii
Angular XSS防护层:
┌─────────────────────────────────────────────────────┐
│                   Angular应用                        │
│                                                     │
│  ┌─────────────────┐    ┌─────────────────────┐     │
│  │                 │    │                     │     │
│  │ 模板语法保护层  │    │ DOM操作安全抽象层   │     │
│  │                 │    │                     │     │
│  └────────┬────────┘    └──────────┬──────────┘     │
│           │                        │                │
│           ▼                        ▼                │
│  ┌─────────────────────────────────────────────┐    │
│  │                                             │    │
│  │             内容安全策略 (CSP)              │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### 模板语法的自动转义

Angular默认对所有模板绑定的值进行HTML转义，防止插入的内容被解释为HTML代码：

```typescript
@Component({
  selector: 'app-message',
  template: `
    <!-- 即使userInput包含HTML标签，也会被自动转义显示为文本 -->
    <div>{{ userInput }}</div>
  `
})
export class MessageComponent {
  // 假设这是从API或用户输入获取的数据
  userInput = '<script>alert("XSS攻击")</script>';
}
```

在上面的例子中，`<script>`标签会被显示为文本而非执行为脚本代码。

#### DomSanitizer服务

当确实需要动态插入HTML、样式或URL时，Angular提供了`DomSanitizer`服务来安全处理这些内容：

```typescript
@Component({
  selector: 'app-blog-post',
  template: `
    <!-- 使用安全的HTML绑定 -->
    <div [innerHTML]="safeHtml"></div>
  `
})
export class BlogPostComponent implements OnInit {
  userHtml = '<div style="color:blue">用户内容<a href="#">链接</a></div>';
  safeHtml: SafeHtml;
  
  constructor(private sanitizer: DomSanitizer) {}
  
  ngOnInit() {
    // 对HTML内容进行安全处理
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.userHtml);
    
    // 其他方法:
    // this.sanitizer.bypassSecurityTrustStyle('...')  // 处理样式
    // this.sanitizer.bypassSecurityTrustUrl('...')    // 处理URL
    // this.sanitizer.bypassSecurityTrustResourceUrl('...') // 处理资源URL(iframe等)
  }
}
```

⚠️ **警告**：`bypassSecurityTrustXXX`方法会绕过Angular的安全机制，只在确保内容可信的情况下使用。

### 内容安全策略(CSP)

内容安全策略是现代浏览器提供的额外安全层，可以限制页面加载的资源和执行的脚本。

#### 配置CSP

在Angular应用中配置CSP的最佳方式是在服务器端设置HTTP头，例如在Nginx配置中：

```nginx
# Nginx配置示例
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' api.example.com;";
```

或者在HTML文件中使用meta标签（`index.html`）：

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'">
```

#### Angular与严格CSP

Angular 15之后的版本支持在不需要`unsafe-inline`或`nonce`的情况下运行在严格CSP环境中：

1. 在`angular.json`中启用严格CSP兼容模式：

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "aot": true,
            "vendorChunk": true,
            "buildOptimizer": true,
            "optimization": true,
            "csp": true  // 启用CSP兼容模式
          }
        }
      }
    }
  }
}
```

2. 使用严格的CSP策略：

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self';";
```

### XSS防御最佳实践

1. **避免使用危险的API**:

```typescript
// 不安全的代码
element.innerHTML = userInput;  // 危险！
document.write(userInput);      // 危险！
eval(userInput);                // 极度危险！

// 安全替代方案
element.textContent = userInput;  // 安全处理文本
```

2. **使用Angular的安全API**:

```typescript
// 不安全的URL处理
<a [href]="untrustedUrl">链接</a>  // 可能允许javascript:协议

// 安全替代方案
<a [href]="sanitizer.bypassSecurityTrustUrl(untrustedUrl)">链接</a>
```

3. **实现自定义安全验证器**:

```typescript
// 自定义URL验证器
@Injectable({
  providedIn: 'root'
})
export class UrlValidatorService {
  isValidUrl(url: string): boolean {
    // 禁止javascript:协议
    if (url.toLowerCase().startsWith('javascript:')) {
      return false;
    }
    
    // 使用URL构造函数验证
    try {
      const parsedUrl = new URL(url);
      // 只允许特定协议
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch (e) {
      return false;
    }
  }
  
  getSafeUrl(url: string, sanitizer: DomSanitizer): SafeUrl {
    return this.isValidUrl(url) 
      ? sanitizer.bypassSecurityTrustUrl(url) 
      : sanitizer.bypassSecurityTrustUrl('#'); // 无效URL返回安全默认值
  }
}
```

4. **HTTP拦截器清洗响应数据**:

```typescript
@Injectable()
export class XssSanitizeInterceptor implements HttpInterceptor {
  constructor(private sanitizer: DomSanitizer) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      filter(event => event instanceof HttpResponse),
      map(event => {
        if (event instanceof HttpResponse) {
          return event.clone({
            body: this.sanitizeBody(event.body)
          });
        }
        return event;
      })
    );
  }
  
  private sanitizeBody(body: any): any {
    // 基本类型直接返回
    if (body === null || body === undefined || typeof body !== 'object') {
      return body;
    }
    
    // 数组递归处理
    if (Array.isArray(body)) {
      return body.map(item => this.sanitizeBody(item));
    }
    
    // 对象递归处理
    const sanitizedBody = { ...body };
    for (const key in sanitizedBody) {
      if (typeof sanitizedBody[key] === 'string') {
        // 对字符串类型的HTML内容进行处理
        if (this.looksLikeHtml(sanitizedBody[key])) {
          sanitizedBody[key] = this.sanitizeHtml(sanitizedBody[key]);
        }
      } else if (typeof sanitizedBody[key] === 'object' && sanitizedBody[key] !== null) {
        sanitizedBody[key] = this.sanitizeBody(sanitizedBody[key]);
      }
    }
    
    return sanitizedBody;
  }
  
  private looksLikeHtml(str: string): boolean {
    return /<[a-z][\s\S]*>/i.test(str);
  }
  
  private sanitizeHtml(html: string): string {
    // 使用DOMParser可以更精确地清洗HTML
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // 移除所有脚本标签
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // 移除所有事件属性(onclick等)
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(el => {
      const attrs = el.attributes;
      for (let i = attrs.length - 1; i >= 0; i--) {
        if (attrs[i].name.startsWith('on')) {
          el.removeAttribute(attrs[i].name);
        }
      }
    });
    
    return doc.body.innerHTML;
  }
}
```

### XSS防御测试

创建专门的安全测试来验证XSS防护：

```typescript
// security.spec.ts
describe('XSS Security Tests', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestComponent],
      providers: [DomSanitizer]
    }).compileComponents();
    
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });
  
  it('should sanitize malicious script in interpolation', () => {
    component.maliciousInput = '<script>alert("XSS")</script>';
    fixture.detectChanges();
    
    const element = fixture.nativeElement.querySelector('.interpolation');
    expect(element.textContent).toContain('<script>');
    expect(element.textContent).not.toContain('</script>');
    // 或者确保脚本标签被转义显示为文本
    expect(element.querySelector('script')).toBeFalsy();
  });
  
  it('should sanitize malicious script in innerHTML binding', () => {
    component.maliciousHtml = '<img src="x" onerror="alert(\'XSS\')">';
    fixture.detectChanges();
    
    const element = fixture.nativeElement.querySelector('.inner-html');
    const img = element.querySelector('img');
    
    // 验证事件处理器被移除
    expect(img).toBeTruthy();
    expect(img.hasAttribute('onerror')).toBeFalsy();
  });
});

@Component({
  template: `
    <div class="interpolation">{{ maliciousInput }}</div>
    <div class="inner-html" [innerHTML]="maliciousHtml"></div>
  `
})
class TestComponent {
  maliciousInput = '';
  maliciousHtml = '';
}
```

### XSS漏洞扫描与工具

1. **静态代码分析工具**:
   - ESLint安全规则集
   - SonarQube安全规则

2. **配置Angular安全分析器**:

```json
// angular.json
{
  "projects": {
    "your-app": {
      "architect": {
        "lint": {
          "builder": "@angular-eslint/builder:lint",
          "options": {
            "eslintConfig": ".eslintrc.json",
            "lintFilePatterns": [
              "src/**/*.ts",
              "src/**/*.html"
            ]
          }
        }
      }
    }
  }
}
```

```json
// .eslintrc.json
{
  "extends": [
    "plugin:@angular-eslint/recommended",
    "plugin:@angular-eslint/template/recommended",
    "plugin:security/recommended" // 添加安全规则集
  ],
  "rules": {
    "security/detect-object-injection": "error",
    "security/detect-non-literal-regexp": "error",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-non-literal-fs-filename": "error",
    "security/detect-non-literal-require": "error",
    "@angular-eslint/template/no-any": "error"
  }
}
```

### 防御总结对比表

| 防御措施 | 防御方式 | 安全级别 | 推荐场景 |
|---------|---------|---------|---------|
| Angular自动转义 | 框架内置 | 高 | 默认策略，所有场景 |
| DomSanitizer | 手动API调用 | 中~高 | 需要动态HTML渲染场景 |
| 内容安全策略(CSP) | 浏览器强制实施 | 极高 | 生产环境必备 |
| 自定义拦截器 | 数据清洗 | 高 | API返回不可信内容场景 |
| 输入验证 | 前端过滤 | 中 | 用户输入处理场景 |

## CSRF保护

跨站请求伪造(CSRF)是一种攻击，攻击者诱导已经通过身份验证的用户执行非本意的操作。CSRF攻击利用用户在受信任网站上的活跃会话，诱导用户点击链接或打开恶意网站，从而向受信任站点发送伪造请求。

### CSRF攻击原理与防御机制

CSRF攻击基本流程和Angular中的防御机制可以用以下图表展示：

```ascii
CSRF攻击与防御流程:
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                         用户浏览器                                │
│                                                                  │
│  ┌───────────────┐     1. 登录      ┌───────────────────────┐    │
│  │               │ ───────────────► │                       │    │
│  │  恶意网站     │                   │  合法应用服务器       │    │
│  │  evil.com     │ ◄─────────────── │  app.example.com      │    │
│  │               │  4. 伪造请求执行  │                       │    │
│  └───────┬───────┘                   └───────────┬───────────┘    │
│          │                                       │                │
│          │                                       │                │
│          │ 2. 诱导访问                           │ 3. 携带凭证    │
│          ▼                                       │                │
│  ┌───────────────────────────────────────────────▼───────────┐    │
│  │                                                           │    │
│  │                      防御机制                             │    │
│  │                                                           │    │
│  │  ┌─────────────────┐    ┌─────────────────────────────┐  │    │
│  │  │                 │    │                             │  │    │
│  │  │  Anti-CSRF令牌  │    │  CORS/SameSite Cookie设置   │  │    │
│  │  │                 │    │                             │  │    │
│  │  └─────────────────┘    └─────────────────────────────┘  │    │
│  │                                                           │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Angular中的CSRF防护

#### HttpClientXsrfModule 自动CSRF保护

Angular的HttpClient内置了CSRF防护机制，默认情况下会自动处理CSRF令牌：

```typescript
// 在AppModule中配置CSRF保护
@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN', // 从Cookie中读取的令牌名称
      headerName: 'X-XSRF-TOKEN' // 发送请求时使用的HTTP头名称
    })
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

工作原理：
1. 服务端在响应中设置包含CSRF令牌的Cookie
2. Angular的HttpClient从Cookie中读取令牌
3. 每次非GET请求时，自动在请求头中添加令牌
4. 服务端验证请求头中的令牌与Cookie中的令牌是否匹配

#### 自定义CSRF拦截器

对于需要自定义CSRF处理逻辑的情况，可以实现自定义HTTP拦截器：

```typescript
@Injectable()
export class CustomCsrfInterceptor implements HttpInterceptor {
  constructor(@Inject(DOCUMENT) private document: Document) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 从自定义位置获取CSRF令牌
    const csrfToken = this.getTokenFromCustomSource();
    
    // 仅为非GET请求添加令牌
    if (csrfToken && req.method !== 'GET') {
      req = req.clone({
        headers: req.headers.set('X-CSRF-Token', csrfToken)
      });
    }
    
    return next.handle(req);
  }
  
  private getTokenFromCustomSource(): string | null {
    // 从元数据获取
    const tokenElement = this.document.querySelector('meta[name="csrf-token"]');
    if (tokenElement) {
      return tokenElement.getAttribute('content');
    }
    
    // 或从本地存储获取
    return localStorage.getItem('csrf-token');
  }
}

// 注册拦截器
@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomCsrfInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
```

### 服务端CSRF配置

为了完整的CSRF防护，服务端需要正确配置：

#### Express.js (Node.js) 服务器配置

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const app = express();

// 中间件配置
app.use(cookieParser());
app.use(express.json());

// CSRF保护配置
const csrfProtection = csrf({ 
  cookie: { 
    key: 'XSRF-TOKEN',
    sameSite: 'strict', // 防止跨站携带Cookie
    secure: process.env.NODE_ENV === 'production', // 在生产环境中使用HTTPS
    httpOnly: false // 允许客户端JavaScript读取此Cookie
  }
});

// 为API路由添加CSRF保护
app.use('/api', csrfProtection);

// 提供CSRF令牌的端点
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// 示例受保护的API端点
app.post('/api/data', csrfProtection, (req, res) => {
  // 如果请求通过CSRF验证，则处理
  res.json({ success: true, message: 'Data processed successfully' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

#### ASP.NET Core服务器配置

```csharp
// Startup.cs
public void ConfigureServices(IServiceCollection services)
{
    services.AddAntiforgery(options => {
        options.HeaderName = "X-XSRF-TOKEN";
        options.Cookie.Name = "XSRF-TOKEN";
        options.Cookie.SameSite = SameSiteMode.Strict;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    });
    
    services.AddControllers();
}

public void Configure(IApplicationBuilder app, IAntiforgery antiforgery)
{
    // 其他中间件配置...
    
    // 为每个请求生成CSRF令牌
    app.Use(next => context => {
        if (context.Request.Path.StartsWithSegments("/api") &&
            context.Request.Method == HttpMethods.Get)
        {
            var tokens = antiforgery.GetAndStoreTokens(context);
            context.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken,
                new CookieOptions { HttpOnly = false }); // 允许JS读取
        }
        return next(context);
    });
    
    app.UseEndpoints(endpoints => {
        endpoints.MapControllers();
    });
}
```

### 前端CSRF处理服务

为了更灵活地处理CSRF令牌，可以创建专门的服务：

```typescript
@Injectable({
  providedIn: 'root'
})
export class CsrfService {
  private csrfToken: string | null = null;
  
  constructor(private http: HttpClient) {}
  
  /**
   * 从服务器获取新的CSRF令牌
   */
  fetchToken(): Observable<string> {
    return this.http.get<{csrfToken: string}>('/api/csrf-token').pipe(
      map(response => {
        this.csrfToken = response.csrfToken;
        return this.csrfToken;
      }),
      catchError(error => {
        console.error('Failed to fetch CSRF token:', error);
        return throwError(() => new Error('Failed to fetch CSRF token'));
      })
    );
  }
  
  /**
   * 获取当前存储的CSRF令牌
   */
  getToken(): string | null {
    return this.csrfToken;
  }
  
  /**
   * 手动设置CSRF令牌(如从Cookie或响应头获取)
   */
  setToken(token: string): void {
    this.csrfToken = token;
  }
  
  /**
   * 从Cookie中提取CSRF令牌
   */
  extractTokenFromCookie(cookieName: string = 'XSRF-TOKEN'): string | null {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${cookieName}=`))
      ?.split('=')[1];
    
    if (cookieValue) {
      this.csrfToken = decodeURIComponent(cookieValue);
    }
    
    return this.csrfToken;
  }
}
```

### SameSite Cookie属性

现代浏览器支持SameSite Cookie属性，这是防御CSRF的有效方式：

```typescript
// 在服务端设置Cookie时使用SameSite属性
// Express.js示例
res.cookie('sessionId', 'abc123', {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' // 或 'lax'
});
```

SameSite属性值说明：

| 值 | 说明 | 安全级别 | 用户体验 |
|----|-----|---------|---------|
| Strict | Cookie仅在同站请求时发送，不会随跨站请求发送 | 最高 | 可能影响从外部链接的正常导航 |
| Lax | 导航到目标网站的GET请求会携带Cookie，但其他跨站请求不会 | 中高 | 平衡安全性和用户体验 |
| None | 完全允许第三方使用，必须同时设置Secure属性 | 低 | 最佳兼容性，但需要其他CSRF防护 |

### 常见CSRF防护策略对比

| 防护策略 | 实现复杂度 | 安全级别 | 兼容性 | 推荐场景 |
|---------|----------|---------|-------|---------|
| CSRF令牌 | 中 | 高 | 所有浏览器 | 默认选择，需要强安全性的场景 |
| SameSite Cookie | 低 | 高 | 现代浏览器 | 多数现代应用场景 |
| 自定义请求头 | 低 | 中 | 所有浏览器 | 简单API，无需表单提交 |
| 双重提交Cookie | 中 | 中高 | 所有浏览器 | 不能使用HttpOnly Cookie的场景 |

### CSRF防护的测试

创建专门的测试来验证CSRF防护措施：

```typescript
// csrf.service.spec.ts
describe('CsrfService', () => {
  let service: CsrfService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CsrfService]
    });
    
    service = TestBed.inject(CsrfService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify();
  });
  
  it('should fetch CSRF token from server', () => {
    const mockToken = 'test-csrf-token-123';
    
    service.fetchToken().subscribe(token => {
      expect(token).toBe(mockToken);
      expect(service.getToken()).toBe(mockToken);
    });
    
    const req = httpMock.expectOne('/api/csrf-token');
    expect(req.request.method).toBe('GET');
    req.flush({ csrfToken: mockToken });
  });
  
  it('should extract token from cookie', () => {
    // 模拟cookie
    document.cookie = 'XSRF-TOKEN=mock-cookie-token; path=/';
    
    const extractedToken = service.extractTokenFromCookie();
    expect(extractedToken).toBe('mock-cookie-token');
    expect(service.getToken()).toBe('mock-cookie-token');
    
    // 清理测试cookie
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  });
});

// csrf.interceptor.spec.ts
describe('CustomCsrfInterceptor', () => {
  let interceptor: CustomCsrfInterceptor;
  let httpMock: HttpTestingController;
  let csrfService: CsrfService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CustomCsrfInterceptor,
        CsrfService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: CustomCsrfInterceptor,
          multi: true
        }
      ]
    });
    
    interceptor = TestBed.inject(CustomCsrfInterceptor);
    httpMock = TestBed.inject(HttpTestingController);
    csrfService = TestBed.inject(CsrfService);
    
    // 设置模拟令牌
    spyOn(csrfService, 'getToken').and.returnValue('test-csrf-token');
  });
  
  it('should add CSRF token to POST requests', () => {
    const http = TestBed.inject(HttpClient);
    
    http.post('/api/data', { test: true }).subscribe();
    
    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('X-CSRF-Token')).toBe('test-csrf-token');
    req.flush({ success: true });
  });
  
  it('should not add CSRF token to GET requests', () => {
    const http = TestBed.inject(HttpClient);
    
    http.get('/api/data').subscribe();
    
    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.has('X-CSRF-Token')).toBeFalse();
    req.flush({ data: 'test' });
  });
});
```

## 安全HTTP头

安全HTTP头是Web应用安全策略中的重要组成部分，通过在服务器响应中设置特定的HTTP头，可以指示浏览器采取额外的安全措施，有效预防多种类型的攻击。

### 关键安全HTTP头一览

在Angular应用中，应当配置以下关键安全头：

```ascii
安全HTTP头层次防护:
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ┌───────────────────┐    ┌────────────────────┐                  │
│  │                   │    │                    │                  │
│  │ 内容安全策略(CSP) │    │ X-XSS-Protection  │                  │
│  │                   │    │                    │                  │
│  └───────────────────┘    └────────────────────┘                  │
│                                                                   │
│  ┌───────────────────┐    ┌────────────────────┐                  │
│  │                   │    │                    │                  │
│  │ X-Frame-Options   │    │ Referrer-Policy    │                  │
│  │                   │    │                    │                  │
│  └───────────────────┘    └────────────────────┘                  │
│                                                                   │
│  ┌───────────────────┐    ┌────────────────────┐                  │
│  │                   │    │                    │                  │
│  │ HSTS              │    │ X-Content-Type     │                  │
│  │                   │    │                    │                  │
│  └───────────────────┘    └────────────────────┘                  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### 在Angular中集成安全HTTP头

#### 配置常见Web服务器

Angular是一个前端框架，安全头通常在服务器或中间件层配置。以下是几种常见Web服务器的配置示例：

##### Nginx配置

```nginx
server {
    listen 80;
    server_name example.com;
    
    # 重定向到HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name example.com;
    
    # SSL配置
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # 安全头配置
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self' api.example.com;" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    
    # Angular应用静态文件位置
    location / {
        root /var/www/angular-app;
        try_files $uri $uri/ /index.html;
    }
}
```

##### Express.js (Node.js)配置

使用Helmet中间件可以简化HTTP安全头的配置：

```javascript
const express = require('express');
const helmet = require('helmet');
const app = express();

// 基本Helmet配置
app.use(
  helmet({
    // 自定义CSP
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "https://api.example.com"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    // 设置XSS过滤
    xssFilter: true,
    // 防止MIME类型嗅探
    noSniff: true,
    // 设置严格传输安全
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    // 阻止在frame中显示
    frameguard: {
      action: 'sameorigin'
    },
    // 引用来源策略
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    }
  })
);

// 提供Angular应用静态文件
app.use(express.static('dist/angular-app'));

// 所有路由重定向到Angular应用
app.get('*', (req, res) => {
  res.sendFile('dist/angular-app/index.html', { root: __dirname });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

##### Apache配置

```apache
<VirtualHost *:80>
    ServerName example.com
    Redirect permanent / https://example.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName example.com
    
    # SSL配置
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # 安全头配置
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self' api.example.com;"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
    
    # Angular应用静态文件位置
    DocumentRoot /var/www/angular-app
    
    <Directory /var/www/angular-app>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

### 主要安全HTTP头详解

#### Content-Security-Policy (CSP)

内容安全策略是最强大的安全头之一，可以防御XSS攻击、数据注入和其他跨站脚本攻击：

```typescript
// 典型CSP配置示例和说明
const cspHeader = `
  default-src 'self';                  # 默认只允许同源内容
  script-src 'self';                   # 脚本只能从同源加载
  style-src 'self' 'unsafe-inline';    # 样式可以内联和同源加载
  img-src 'self' data:;                # 图片可以是同源或data URI
  font-src 'self';                     # 字体只能从同源加载
  object-src 'none';                   # 禁止所有插件内容(Flash等)
  media-src 'self';                    # 媒体只能从同源加载
  connect-src 'self' api.example.com;  # 允许连接到同源和特定API域
  frame-src 'none';                    # 禁止所有iframe内容
  frame-ancestors 'none';              # 禁止在iframe中嵌入该页面
  base-uri 'self';                     # 限制<base>标签的URL只能是同源
  form-action 'self';                  # 限制表单提交目标只能是同源
  worker-src 'self';                   # Web Worker只能从同源加载
  manifest-src 'self';                 # Web应用清单只能从同源加载
  upgrade-insecure-requests;           # 自动将HTTP请求升级为HTTPS
`;
```

##### Angular应用CSP的特殊考虑

对于Angular应用，需要特别考虑以下CSP指令：

1. **style-src**：Angular组件通常使用内联样式，需要允许`'unsafe-inline'`或使用nonce/hash
2. **script-src**：使用AOT编译可以避免`'unsafe-eval'`
3. **connect-src**：必须包含所有API端点域

#### Strict-Transport-Security (HSTS)

HSTS通知浏览器只使用HTTPS连接网站，防止中间人攻击和协议降级：

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

参数说明：
- `max-age=31536000`：HSTS策略缓存一年
- `includeSubDomains`：策略也适用于所有子域
- `preload`：允许将域添加到浏览器预加载列表

#### X-Content-Type-Options

防止浏览器进行MIME类型嗅探，降低内容注入风险：

```
X-Content-Type-Options: nosniff
```

这个头对于Angular应用尤其重要，因为它可以防止浏览器将JavaScript文件解释为不同的内容类型。

#### X-Frame-Options

控制页面能否在frame中显示，防止点击劫持攻击：

```
X-Frame-Options: SAMEORIGIN
```

选项说明：
- `DENY`：完全禁止在frame中显示
- `SAMEORIGIN`：只允许同源页面嵌入frame
- `ALLOW-FROM uri`：允许指定源嵌入frame（已废弃，推荐使用CSP的`frame-ancestors`代替）

#### X-XSS-Protection

控制浏览器内置的XSS过滤器（现代浏览器中已部分被CSP替代）：

```
X-XSS-Protection: 1; mode=block
```

参数说明：
- `0`：禁用XSS过滤器
- `1`：启用XSS过滤器
- `mode=block`：检测到XSS攻击时阻止整个页面渲染

#### Referrer-Policy

控制请求头中包含多少引用来源信息：

```
Referrer-Policy: strict-origin-when-cross-origin
```

常用选项：
- `no-referrer`：不发送Referer头
- `no-referrer-when-downgrade`：HTTPS到HTTP不发送
- `origin`：只发送源（协议、域名、端口）
- `origin-when-cross-origin`：跨源时只发送源
- `same-origin`：只在同源请求时发送
- `strict-origin`：只发送源，且HTTPS到HTTP不发送
- `strict-origin-when-cross-origin`：跨源只发送源，且HTTPS到HTTP不发送
- `unsafe-url`：始终发送完整URL（不推荐）

#### Permissions-Policy

控制浏览器功能和API的使用权限：

```
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

这可以防止未经授权使用敏感浏览器功能，例如摄像头、麦克风、地理位置和支付API。

### HTTP安全头的实现与检测

#### 使用Angular HTTP拦截器添加安全头

对于从Angular应用发出的请求，可以使用HTTP拦截器添加安全头：

```typescript
@Injectable()
export class SecurityHeadersInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 为从客户端发起的请求添加安全头
    // 注意：这不会影响服务器对客户端的响应头
    const secureReq = req.clone({
      headers: req.headers
        .set('X-Content-Type-Options', 'nosniff')
        .set('X-XSS-Protection', '1; mode=block')
    });
    
    return next.handle(secureReq);
  }
}

// 在AppModule中注册
@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SecurityHeadersInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
```

#### 服务器中间件添加安全头

在Node.js Express应用中，使用自定义中间件添加安全头：

```javascript
// security-headers.middleware.js
function securityHeaders() {
  return (req, res, next) => {
    // 设置安全头
    res.setHeader('Content-Security-Policy', "default-src 'self'; /* 其他CSP配置 */");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // 继续处理请求
    next();
  };
}

// 在应用中使用
const express = require('express');
const app = express();
const securityHeadersMiddleware = require('./security-headers.middleware');

app.use(securityHeadersMiddleware());
```

#### 检测安全HTTP头

使用以下工具检测应用的安全头配置：

1. **浏览器开发者工具**：
   - 在网络面板中检查响应头

2. **在线扫描工具**：
   - [Mozilla Observatory](https://observatory.mozilla.org/)
   - [SecurityHeaders.com](https://securityheaders.com/)
   - [SSL Labs](https://www.ssllabs.com/ssltest/)

3. **命令行检查**：
   ```bash
   curl -I https://example.com | grep -E "Content-Security-Policy|Strict-Transport-Security|X-"
   ```

### 安全HTTP头最佳实践

1. **逐步实施CSP**：
   - 从报告模式开始：`Content-Security-Policy-Report-Only`
   - 收集违规报告并分析
   - 逐步调整策略直到应用正常工作
   - 切换到强制模式

2. **对关键安全头使用`always`指令**：
   - 在Nginx和Apache配置中，使用`always`确保头部一直添加到响应中，包括错误页面

3. **配置理想的CSP策略**：
   ```
   Content-Security-Policy: default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self'; font-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self';
   ```

4. **定期审核和更新安全头**：
   - 浏览器安全功能不断演进
   - 跟踪最新最佳实践
   - 使用自动化工具进行定期检查

### 安全HTTP头解决方案对比

| 安全头 | 防御威胁 | 实现复杂度 | 浏览器支持 | 潜在应用影响 |
|-------|---------|----------|----------|------------|
| CSP | XSS, 数据注入, 点击劫持 | 高 | 优秀 | 可能阻止合法脚本/样式 |
| HSTS | 中间人攻击, 降级攻击 | 低 | 优秀 | 需要有效SSL证书 |
| X-Content-Type-Options | MIME嗅探攻击 | 低 | 优秀 | 极少 |
| X-Frame-Options | 点击劫持 | 低 | 优秀 | 可能阻止合法的框架嵌入 |
| X-XSS-Protection | 基本XSS攻击 | 低 | 部分浏览器 | 极少 |
| Referrer-Policy | 信息泄露 | 中 | 优秀 | 可能影响分析 |
| Permissions-Policy | 未授权API使用 | 中 | 良好 | 可能阻止需要的功能 |

### 与其他安全措施的集成

安全HTTP头应作为深度防御战略的一部分，与其他安全措施结合使用：

```ascii
深度防御安全层:
┌─────────────────────────────────────┐
│ HTTP安全头                          │
├─────────────────────────────────────┤
│ 内容验证和输入净化                   │
├─────────────────────────────────────┤
│ HTTPS/TLS加密                       │
├─────────────────────────────────────┤
│ CSRF防护                            │
├─────────────────────────────────────┤
│ 认证与授权                          │
├─────────────────────────────────────┤
│ 代码安全审计和自动扫描               │
├─────────────────────────────────────┤
│ 渗透测试和漏洞赏金计划               │
└─────────────────────────────────────┘
```

综合使用这些安全头可以显著提高Angular应用的安全性，为用户数据和应用完整性提供强有力的保护。

## 输入验证

输入验证是前端安全的基础，是防止恶意数据进入应用程序的第一道防线。在Angular应用中，输入验证应该在客户端和服务器端双重实施，以确保数据的完整性和安全性。

### 输入验证的重要性

```ascii
输入验证防御层:
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ┌───────────────┐   ┌────────────────┐   ┌──────────────────┐    │
│  │               │   │                │   │                  │    │
│  │ 前端表单验证  │ → │ Angular验证器  │ → │ 后端API验证      │    │
│  │               │   │                │   │                  │    │
│  └───────────────┘   └────────────────┘   └──────────────────┘    │
│                                                                   │
│                防御深度                                           │
│  ◄─────────────────────────────────────────────────────────────► │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

不充分的输入验证可能导致多种安全威胁：

1. **注入攻击**：如SQL注入、命令注入
2. **XSS攻击**：通过不安全的输入注入恶意脚本
3. **数据污染**：导致应用逻辑错误或数据损坏
4. **越权访问**：伪造或篡改数据以访问未授权资源
5. **拒绝服务**：提交异常大的输入导致服务器资源耗尽

### Angular表单验证基础

Angular提供了两种主要的表单验证方法：模板驱动和响应式表单。

#### 响应式表单验证

响应式表单提供了直接在组件类中定义和管理表单控件的方法，更适合复杂验证场景：

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <div>
        <label for="username">用户名</label>
        <input id="username" type="text" formControlName="username">
        <div *ngIf="username.invalid && (username.dirty || username.touched)">
          <div *ngIf="username.errors?.['required']">用户名是必填项</div>
          <div *ngIf="username.errors?.['minlength']">用户名至少需要3个字符</div>
          <div *ngIf="username.errors?.['pattern']">用户名只能包含字母和数字</div>
        </div>
      </div>
      
      <div>
        <label for="email">邮箱</label>
        <input id="email" type="email" formControlName="email">
        <div *ngIf="email.invalid && (email.dirty || email.touched)">
          <div *ngIf="email.errors?.['required']">邮箱是必填项</div>
          <div *ngIf="email.errors?.['email']">请输入有效的邮箱地址</div>
        </div>
      </div>
      
      <div>
        <label for="password">密码</label>
        <input id="password" type="password" formControlName="password">
        <div *ngIf="password.invalid && (password.dirty || password.touched)">
          <div *ngIf="password.errors?.['required']">密码是必填项</div>
          <div *ngIf="password.errors?.['minlength']">密码至少需要8个字符</div>
          <div *ngIf="password.errors?.['passwordStrength']">
            密码必须包含大小写字母、数字和特殊字符
          </div>
        </div>
      </div>
      
      <button type="submit" [disabled]="userForm.invalid">提交</button>
    </form>
  `
})
export class UserFormComponent {
  userForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z0-9]+$')
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]]
    });
  }
  
  // 自定义密码强度验证器
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value || '';
    
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
    
    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;
    
    return !passwordValid ? { 'passwordStrength': true } : null;
  }
  
  get username() { return this.userForm.get('username')!; }
  get email() { return this.userForm.get('email')!; }
  get password() { return this.userForm.get('password')!; }
  
  onSubmit() {
    if (this.userForm.valid) {
      console.log('Form submitted:', this.userForm.value);
      // 提交数据到服务器
    }
  }
}
```

#### 模板驱动表单验证

模板驱动表单基于HTML表单元素，使用指令进行验证：

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-form',
  template: `
    <form #contactForm="ngForm" (ngSubmit)="onSubmit(contactForm.value)">
      <div>
        <label for="name">名称</label>
        <input id="name" name="name" [(ngModel)]="contact.name" 
               required minlength="2" #name="ngModel">
        <div *ngIf="name.invalid && (name.dirty || name.touched)">
          <div *ngIf="name.errors?.['required']">名称是必填项</div>
          <div *ngIf="name.errors?.['minlength']">名称至少需要2个字符</div>
        </div>
      </div>
      
      <div>
        <label for="message">留言</label>
        <textarea id="message" name="message" [(ngModel)]="contact.message" 
                  required maxlength="500" #message="ngModel"></textarea>
        <div *ngIf="message.invalid && (message.dirty || message.touched)">
          <div *ngIf="message.errors?.['required']">留言是必填项</div>
          <div *ngIf="message.errors?.['maxlength']">留言不能超过500个字符</div>
        </div>
      </div>
      
      <button type="submit" [disabled]="contactForm.invalid">发送</button>
    </form>
  `
})
export class ContactFormComponent {
  contact = {
    name: '',
    message: ''
  };
  
  onSubmit(formValue: any) {
    console.log('Form submitted:', formValue);
    // 提交数据到服务器
  }
}
```

### 自定义验证器

创建自定义验证器可以实现特定的业务规则验证：

```typescript
// 自定义验证器函数
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// 1. 禁止特定词语验证器
export function forbiddenNameValidator(forbiddenNames: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = forbiddenNames
      .some(name => control.value?.toLowerCase() === name.toLowerCase());
    return forbidden ? { 'forbiddenName': { value: control.value } } : null;
  };
}

// 2. 文件类型验证器
export function allowedFileTypeValidator(allowedTypes: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value;
    if (file && file instanceof File) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !allowedTypes.includes(extension)) {
        return { 'fileType': { allowedTypes } };
      }
    }
    return null;
  };
}

// 3. 密码匹配验证器(用于表单组)
export function passwordMatchValidator(
  controlName: string, matchingControlName: string
): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);
    
    if (!control || !matchingControl) return null;
    
    if (matchingControl.errors && !matchingControl.errors['passwordMismatch']) {
      // 如果匹配字段已有其他错误，不添加新错误
      return null;
    }
    
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      matchingControl.setErrors(null);
      return null;
    }
  };
}

// 使用示例
@Component({
  selector: 'app-registration-form',
  template: `
    <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
      <!-- 用户名字段 -->
      <div>
        <input formControlName="username" placeholder="用户名">
        <div *ngIf="username.errors?.['forbiddenName']">
          该用户名不允许使用
        </div>
      </div>
      
      <!-- 密码字段 -->
      <div>
        <input type="password" formControlName="password" placeholder="密码">
      </div>
      
      <!-- 确认密码字段 -->
      <div>
        <input type="password" formControlName="confirmPassword" placeholder="确认密码">
        <div *ngIf="confirmPassword.errors?.['passwordMismatch']">
          密码不匹配
        </div>
      </div>
      
      <!-- 文件上传 -->
      <div>
        <input type="file" (change)="onFileChange($event)" formControlName="avatar">
        <div *ngIf="avatar.errors?.['fileType']">
          只允许上传以下类型: {{ avatar.errors?.['fileType'].allowedTypes.join(', ') }}
        </div>
      </div>
      
      <button type="submit" [disabled]="registrationForm.invalid">注册</button>
    </form>
  `
})
export class RegistrationFormComponent {
  registrationForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.registrationForm = this.fb.group({
      username: ['', {
        validators: [Validators.required, Validators.minLength(3)],
        asyncValidators: [this.uniqueUsernameValidator.validate.bind(this.uniqueUsernameValidator)],
        updateOn: 'blur' // 失去焦点时验证，减少请求次数
      }],
      // 其他表单控件
    });
  }
  
  get username() { return this.registrationForm.get('username')!; }
  
  onSubmit() {
    if (this.registrationForm.valid) {
      // 提交表单
    }
  }
}
```

### 异步验证器

异步验证器可以检查需要服务器验证的数据，例如用户名唯一性：

```typescript
import { Injectable } from '@angular/core';
import { AsyncValidator, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, switchMap, first } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UniqueUsernameValidator implements AsyncValidator {
  constructor(private http: HttpClient) {}
  
  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return of(control.value).pipe(
      debounceTime(500), // 延迟验证，避免频繁API调用
      switchMap(username => {
        // 检查用户名是否已存在
        return this.http.get<{exists: boolean}>(`/api/check-username?username=${username}`).pipe(
          map(response => response.exists ? { usernameExists: true } : null),
          catchError(() => of(null)) // 出错时不报错，后端会再次验证
        );
      }),
      first() // 完成后完成observable
    );
  }
}

// 使用异步验证器
@Component({
  selector: 'app-register',
  template: `
    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
      <div>
        <label for="username">用户名</label>
        <input id="username" formControlName="username">
        <div *ngIf="username.pending">检查用户名...</div>
        <div *ngIf="username.errors?.['usernameExists']">
          此用户名已被使用
        </div>
      </div>
      
      <!-- 其他表单字段 -->
      
      <button type="submit" [disabled]="registerForm.invalid || registerForm.pending">
        注册
      </button>
    </form>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private uniqueUsernameValidator: UniqueUsernameValidator
  ) {
    this.registerForm = this.fb.group({
      username: ['', {
        validators: [Validators.required, Validators.minLength(3)],
        asyncValidators: [this.uniqueUsernameValidator.validate.bind(this.uniqueUsernameValidator)],
        updateOn: 'blur' // 失去焦点时验证，减少请求次数
      }],
      // 其他表单控件
    });
  }
  
  get username() { return this.registerForm.get('username')!; }
  
  onSubmit() {
    if (this.registerForm.valid) {
      // 提交表单
    }
  }
}
```

### 高级输入验证技术

#### 输入清理与净化

除了验证输入格式外，清理和净化用户输入也是至关重要的安全措施：

```typescript
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class InputSanitizationService {
  constructor(private sanitizer: DomSanitizer) {}
  
  // 清理HTML内容，移除危险标签和属性
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  
  // 完全去除HTML标签，只保留文本
  stripHtml(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }
  
  // 清理URL，仅允许安全的协议
  sanitizeUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      // 仅允许http和https协议
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return url;
      }
      return null;
    } catch (e) {
      return null; // 无效URL
    }
  }
  
  // 清理JSON输入，防止原型污染
  sanitizeJson(json: string): any {
    try {
      // 使用JSON.parse处理
      const parsed = JSON.parse(json);
      
      // 移除__proto__和constructor等危险属性
      const sanitize = (obj: any): any => {
        if (obj === null || typeof obj !== 'object') {
          return obj;
        }
        
        if (Array.isArray(obj)) {
          return obj.map(item => sanitize(item));
        }
        
        const result: any = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // 跳过危险属性
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
              continue;
            }
            result[key] = sanitize(obj[key]);
          }
        }
        
        return result;
      };
      
      return sanitize(parsed);
    } catch (e) {
      return null; // 无效JSON
    }
  }
}
```

#### 全局输入验证策略

实现全局输入验证策略可以确保应用中的所有输入都经过一致的验证处理：

```typescript
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationStrategyService {
  private defaultValidationStrategies: Record<string, any> = {
    // 字符串类型验证规则
    string: {
      minLength: 1,
      maxLength: 255,
      pattern: null, // 默认不限制模式
      sanitize: true
    },
    
    // 数字类型验证规则
    number: {
      min: Number.MIN_SAFE_INTEGER,
      max: Number.MAX_SAFE_INTEGER,
      integer: false
    },
    
    // 电子邮件验证规则
    email: {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    
    // URL验证规则
    url: {
      protocols: ['http', 'https'],
      requireTLD: true
    },
    
    // 日期验证规则
    date: {
      min: null, // 最小日期
      max: null, // 最大日期
      format: 'YYYY-MM-DD' // 默认格式
    }
  };
  
  constructor(private fb: FormBuilder) {}
  
  // 根据字段类型应用验证策略
  applyValidationStrategy(
    control: AbstractControl,
    type: string,
    customOptions?: any
  ): void {
    const options = {
      ...this.defaultValidationStrategies[type] || {},
      ...customOptions
    };
    
    const validators: any[] = [];
    
    switch (type) {
      case 'string':
        // 添加字符串验证器
        if (options.required) validators.push(Validators.required);
        if (options.minLength) validators.push(Validators.minLength(options.minLength));
        if (options.maxLength) validators.push(Validators.maxLength(options.maxLength));
        if (options.pattern) validators.push(Validators.pattern(options.pattern));
        break;
        
      case 'number':
        // 添加数字验证器
        validators.push(Validators.pattern(/^-?\d*\.?\d+$/));
        if (options.required) validators.push(Validators.required);
        if (options.min !== undefined) validators.push(Validators.min(options.min));
        if (options.max !== undefined) validators.push(Validators.max(options.max));
        if (options.integer) validators.push(this.integerValidator());
        break;
        
      case 'email':
        // 添加电子邮件验证器
        if (options.required) validators.push(Validators.required);
        validators.push(Validators.email);
        if (options.pattern) validators.push(Validators.pattern(options.pattern));
        break;
        
      case 'url':
        // 添加URL验证器
        if (options.required) validators.push(Validators.required);
        validators.push(this.urlValidator(options.protocols, options.requireTLD));
        break;
        
      case 'date':
        // 添加日期验证器
        if (options.required) validators.push(Validators.required);
        if (options.min) validators.push(this.dateMinValidator(options.min));
        if (options.max) validators.push(this.dateMaxValidator(options.max));
        validators.push(this.dateFormatValidator(options.format));
        break;
    }
    
    // 设置验证器
    control.setValidators(validators);
    control.updateValueAndValidity();
  }
  
  // 应用验证策略到表单组
  applyFormValidationStrategies(
    form: FormGroup,
    schema: Record<string, { type: string, options?: any }>
  ): void {
    Object.keys(schema).forEach(key => {
      const control = form.get(key);
      if (control) {
        this.applyValidationStrategy(control, schema[key].type, schema[key].options);
      }
    });
  }
  
  // 创建基于模式的表单
  createFormFromSchema(schema: Record<string, { type: string, options?: any }>): FormGroup {
    const controls: Record<string, FormControl> = {};
    
    Object.keys(schema).forEach(key => {
      controls[key] = this.fb.control('');
    });
    
    const form = this.fb.group(controls);
    this.applyFormValidationStrategies(form, schema);
    
    return form;
  }
  
  // 自定义验证器：整数
  private integerValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const value = Number(control.value);
      return Number.isInteger(value) ? null : { integer: true };
    };
  }
  
  // 自定义验证器：URL
  private urlValidator(protocols: string[] = ['http', 'https'], requireTLD: boolean = true): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      try {
        const url = new URL(control.value);
        
        // 检查协议
        const protocol = url.protocol.replace(':', '');
        if (!protocols.includes(protocol)) {
          return { url: { invalidProtocol: true } };
        }
        
        // 检查TLD
        if (requireTLD) {
          const hostnameArr = url.hostname.split('.');
          if (hostnameArr.length < 2) {
            return { url: { requireTLD: true } };
          }
        }
        
        return null;
      } catch (e) {
        return { url: { invalid: true } };
      }
    };
  }
  
  // 自定义验证器：最小日期
  private dateMinValidator(minDate: Date | string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const controlDate = new Date(control.value);
      const min = typeof minDate === 'string' ? new Date(minDate) : minDate;
      
      return controlDate >= min ? null : { dateMin: { min, actual: controlDate } };
    };
  }
  
  // 自定义验证器：最大日期
  private dateMaxValidator(maxDate: Date | string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const controlDate = new Date(control.value);
      const max = typeof maxDate === 'string' ? new Date(maxDate) : maxDate;
      
      return controlDate <= max ? null : { dateMax: { max, actual: controlDate } };
    };
  }
  
  // 自定义验证器：日期格式
  private dateFormatValidator(format: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      // 简单的日期格式验证，实际应用中可能需要更复杂的逻辑
      // 或使用像moment.js这样的库
      const isValid = !isNaN(Date.parse(control.value));
      return isValid ? null : { dateFormat: { required: format } };
    };
  }
}

// 使用示例
@Component({
  selector: 'app-product-form',
  template: `
    <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
      <div>
        <label for="name">产品名称</label>
        <input id="name" formControlName="name">
        <div *ngIf="name.errors?.['required']">必填字段</div>
        <div *ngIf="name.errors?.['minlength']">最小长度为2个字符</div>
      </div>
      
      <div>
        <label for="price">价格</label>
        <input id="price" type="number" formControlName="price">
        <div *ngIf="price.errors?.['min']">价格不能小于0</div>
      </div>
      
      <div>
        <label for="website">网站</label>
        <input id="website" formControlName="website">
        <div *ngIf="website.errors?.['url']">请输入有效的URL</div>
      </div>
      
      <div>
        <label for="releaseDate">发布日期</label>
        <input id="releaseDate" type="date" formControlName="releaseDate">
        <div *ngIf="releaseDate.errors?.['dateMin']">
          日期不能早于{{ releaseDate.errors?.['dateMin'].min | date }}
        </div>
      </div>
      
      <button type="submit" [disabled]="productForm.invalid">提交</button>
    </form>
  `
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private validationStrategy: ValidationStrategyService
  ) {
    this.productForm = this.fb.group({
      name: [''],
      price: [''],
      website: [''],
      releaseDate: ['']
    });
  }
  
  ngOnInit() {
    // 应用验证策略
    this.validationStrategy.applyFormValidationStrategies(this.productForm, {
      name: { 
        type: 'string', 
        options: { required: true, minLength: 2, maxLength: 100 } 
      },
      price: { 
        type: 'number', 
        options: { required: true, min: 0 } 
      },
      website: { 
        type: 'url' 
      },
      releaseDate: { 
        type: 'date', 
        options: { min: new Date(2000, 0, 1) } 
      }
    });
  }
  
  get name() { return this.productForm.get('name')!; }
  get price() { return this.productForm.get('price')!; }
  get website() { return this.productForm.get('website')!; }
  get releaseDate() { return this.productForm.get('releaseDate')!; }
  
  onSubmit() {
    if (this.productForm.valid) {
      console.log('Product form submitted:', this.productForm.value);
    }
  }
}
```

#### API请求验证

在向后端发送请求之前，对数据进行验证可以减轻服务器负担并提高用户体验：

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private validationService: ValidationStrategyService,
    private sanitizationService: InputSanitizationService
  ) {}
  
  /**
   * 发送经过验证和清理的API请求
   */
  post<T>(url: string, data: any, schema: any): Observable<T> {
    // 创建临时表单组进行验证
    const form = this.validationService.createFormFromSchema(schema);
    form.patchValue(data);
    
    if (form.invalid) {
      // 如果验证失败，返回错误
      return throwError(() => new Error('Invalid form data'));
    }
    
    // 获取验证后的数据并清理
    const validatedData = form.value;
    const sanitizedData = this.sanitizeData(validatedData);
    
    // 发送API请求
    return this.http.post<T>(url, sanitizedData).pipe(
      catchError(error => {
        console.error('API request error:', error);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * 根据数据类型进行清理
   */
  private sanitizeData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }
    
    if (typeof data === 'string') {
      // 清理字符串
      return this.sanitizationService.stripHtml(data);
    }
    
    if (Array.isArray(data)) {
      // 递归清理数组
      return data.map(item => this.sanitizeData(item));
    }
    
    if (typeof data === 'object') {
      // 递归清理对象
      const result: any = {};
      
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          result[key] = this.sanitizeData(data[key]);
        }
      }
      
      return result;
    }
    
    // 原始类型直接返回
    return data;
  }
  
  /**
   * 使用示例
   */
  createUser(userData: any): Observable<any> {
    const userSchema = {
      username: { 
        type: 'string', 
        options: { required: true, minLength: 3, pattern: /^[a-zA-Z0-9_]+$/ } 
      },
      email: { 
        type: 'email', 
        options: { required: true } 
      },
      age: { 
        type: 'number', 
        options: { min: 18, max: 120 } 
      },
      website: { 
        type: 'url' 
      }
    };
    
    return this.post<any>('/api/users', userData, userSchema);
  }
}
```

## JWT安全处理 

JSON Web Token (JWT) 是一种开放标准，用于在各方之间以JSON对象的形式安全地传输信息。在Angular应用中，JWT通常用于身份验证和授权，但如果实现不当，可能导致多种安全问题。

### JWT基础与安全风险

JWT由三部分组成：头部(Header)、载荷(Payload)和签名(Signature)，以点号分隔：

```ascii
JWT结构:
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐   │
│  │             │    │             │    │                     │   │
│  │  头部       │.   │  载荷       │.   │  签名               │   │
│  │  (Header)   │    │  (Payload)  │    │  (Signature)        │   │
│  │             │    │             │    │                     │   │
│  └─────────────┘    └─────────────┘    └─────────────────────┘   │
│                                                                  │
│  Base64编码的JSON   Base64编码的JSON    头部+载荷+密钥的签名     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

安全使用JWT时需要注意以下风险：

1. **客户端存储风险**：如果存储在易受XSS攻击的位置，令牌可能被盗取
2. **信息泄露**：载荷部分仅进行Base64编码而非加密，不应存储敏感数据
3. **无效令牌验证**：缺乏适当验证可能导致接受伪造或已过期的令牌
4. **令牌撤销困难**：JWT本身无内置撤销机制，需要额外实现

### 安全的JWT实现

#### JWT身份验证服务

使用专门的身份验证服务来处理JWT令牌：

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

// 用户模型
export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

// 认证响应接口
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  
  private refreshTokenTimeout: any;
  
  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private router: Router
  ) {
    // 初始化时尝试从存储中恢复用户会话
    this.initializeFromStorage();
  }
  
  // 从localStorage初始化
  private initializeFromStorage(): void {
    const token = this.getAccessToken();
    if (token && !this.isTokenExpired(token)) {
      const user = this.getUserFromToken(token);
      this.currentUserSubject.next(user);
      this.startRefreshTokenTimer();
    } else if (token) {
      // 令牌已过期但存在，尝试使用刷新令牌
      this.refreshToken().subscribe();
    }
  }
  
  // 登录
  login(username: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>('/api/auth/login', { username, password })
      .pipe(
        tap(response => this.setSession(response)),
        map(response => response.user),
        catchError(error => {
          console.error('Login failed:', error);
          return throwError(() => new Error('Invalid credentials'));
        })
      );
  }
  
  // 注销
  logout(): void {
    // 向服务器发送注销请求，使刷新令牌失效
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post('/api/auth/logout', { refreshToken })
        .subscribe({
          next: () => this.clearSession(),
          error: () => this.clearSession()
        });
    } else {
      this.clearSession();
    }
  }
  
  // 使用刷新令牌获取新的访问令牌
  refreshToken(): Observable<User> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.http.post<AuthResponse>('/api/auth/refresh-token', { refreshToken })
      .pipe(
        tap(response => this.setSession(response)),
        map(response => response.user),
        catchError(error => {
          console.error('Token refresh failed:', error);
          this.clearSession();
          this.router.navigate(['/login']);
          return throwError(() => new Error('Token refresh failed'));
        })
      );
  }
  
  // 设置身份验证会话
  private setSession(response: AuthResponse): void {
    // 安全地存储令牌
    this.setAccessToken(response.accessToken);
    this.setRefreshToken(response.refreshToken);
    
    // 更新当前用户状态
    this.currentUserSubject.next(response.user);
    
    // 设置刷新计时器
    this.startRefreshTokenTimer();
  }
  
  // 清除会话
  private clearSession(): void {
    // 移除令牌
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    
    // 停止刷新计时器
    this.stopRefreshTokenTimer();
    
    // 清除用户状态
    this.currentUserSubject.next(null);
    
    // 重定向到登录页
    this.router.navigate(['/login']);
  }
  
  // 启动刷新令牌计时器
  private startRefreshTokenTimer(): void {
    // 停止任何现有计时器
    this.stopRefreshTokenTimer();
    
    // 解析令牌以获取过期时间
    const token = this.getAccessToken();
    if (!token) return;
    
    const jwtToken = this.jwtHelper.decodeToken(token);
    const expires = new Date(jwtToken.exp * 1000);
    
    // 在令牌过期前30秒刷新
    const timeout = expires.getTime() - Date.now() - (30 * 1000);
    
    // 设置计时器在令牌过期前刷新
    this.refreshTokenTimeout = setTimeout(() => {
      this.refreshToken().subscribe();
    }, Math.max(0, timeout));
  }
  
  // 停止刷新令牌计时器
  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }
  
  // 检查令牌是否过期
  isTokenExpired(token: string): boolean {
    return this.jwtHelper.isTokenExpired(token);
  }
  
  // 从令牌中提取用户信息
  private getUserFromToken(token: string): User {
    const decodedToken = this.jwtHelper.decodeToken(token);
    
    return {
      id: decodedToken.sub,
      username: decodedToken.username,
      email: decodedToken.email,
      roles: decodedToken.roles || []
    };
  }
  
  // 获取当前用户
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  
  // 检查用户是否具有特定角色
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.roles.includes(role);
  }
  
  // 检查用户是否已认证
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired(token);
  }
  
  // 获取访问令牌
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
  
  // 设置访问令牌
  private setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }
  
  // 获取刷新令牌
  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  
  // 设置刷新令牌
  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }
}
```

#### JWT HTTP拦截器

使用HTTP拦截器自动将JWT令牌添加到请求头：

```typescript
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 跳过认证端点，避免循环调用
    if (this.isAuthRequest(request)) {
      return next.handle(request);
    }

    // 将令牌添加到请求中
    const accessToken = this.authService.getAccessToken();
    if (accessToken) {
      request = this.addTokenToRequest(request, accessToken);
    }

    // 处理响应和错误
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        } else {
          return throwError(() => error);
        }
      })
    );
  }

  // 将令牌添加到请求头
  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 检查是否为认证相关请求
  private isAuthRequest(request: HttpRequest<any>): boolean {
    return (
      request.url.includes('/api/auth/login') ||
      request.url.includes('/api/auth/register') ||
      request.url.includes('/api/auth/refresh-token')
    );
  }

  // 处理401未授权错误
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 如果已经在刷新，将请求排队等待
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          return next.handle(this.addTokenToRequest(request, token));
        })
      );
    }

    // 否则，刷新令牌并重试原始请求
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.authService.refreshToken().pipe(
      switchMap(user => {
        this.isRefreshing = false;
        const token = this.authService.getAccessToken()!;
        this.refreshTokenSubject.next(token);
        return next.handle(this.addTokenToRequest(request, token));
      }),
      catchError(err => {
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(() => err);
      })
    );
  }
}

// 在AppModule中注册
@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
```

#### 角色基础的路由守卫

使用路由守卫实现基于角色的访问控制：

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // 检查用户是否已认证
    if (!this.authService.isAuthenticated()) {
      // 未认证，重定向到登录页
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // 检查是否需要特定角色
    const requiredRoles = route.data['roles'] as Array<string>;
    if (requiredRoles && requiredRoles.length > 0) {
      // 验证用户是否拥有所需角色
      const hasRequiredRole = requiredRoles.some(role => this.authService.hasRole(role));
      
      if (!hasRequiredRole) {
        // 无权访问，重定向到错误页或首页
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    // 允许访问
    return true;
  }
}

// 在路由配置中使用
const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  }
];
```

### JWT安全最佳实践

#### 安全的令牌存储

JWT存储方式对比：

```ascii
JWT存储选项对比:
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌─────────────────┐   ┌────────────────┐   ┌────────────────┐   │
│  │                 │   │                │   │                │   │
│  │ localStorage    │   │ sessionStorage │   │ HttpOnly Cookie│   │
│  │                 │   │                │   │                │   │
│  └────────┬────────┘   └───────┬────────┘   └────────┬───────┘   │
│           │                    │                     │           │
│  ┌────────┴────────┐   ┌───────┴────────┐   ┌────────┴───────┐   │
│  │ 持久性          │   │ 会话期间有效   │   │ 持久性取决于   │   │
│  │ XSS攻击易受害   │   │ XSS攻击易受害  │   │ Cookie设置     │   │
│  │ 可跨标签页使用  │   │ 标签页间隔离   │   │ XSS无法直接读取│   │
│  └─────────────────┘   └────────────────┘   └────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

最安全的方式是使用双令牌策略：

1. **短期访问令牌**：使用HttpOnly Cookie，防止XSS攻击
2. **长期刷新令牌**：也使用HttpOnly Cookie，但具有更严格的路径设置

Cookie安全配置示例（服务器端）：

```typescript
// 服务器端设置安全Cookie(使用Express.js示例)
res.cookie('access_token', token, {
  httpOnly: true,           // 防止JavaScript访问
  secure: true,             // 只在HTTPS连接中发送
  sameSite: 'strict',       // 防止CSRF攻击
  maxAge: 15 * 60 * 1000    // 15分钟有效期
});

res.cookie('refresh_token', refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/api/auth/refresh', // 限制只能在刷新端点使用
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7天有效期
});
```

#### 令牌安全配置

JWT配置最佳实践：

1. **合理的过期时间**：
   - 访问令牌：15分钟或更短
   - 刷新令牌：最多7-14天

2. **包含必要声明**：
   ```json
   {
     "iss": "https://yourdomain.com",  // 发行者
     "sub": "user123",                 // 主题(用户ID)
     "aud": "https://api.yourdomain.com", // 受众
     "exp": 1621459742,                // 过期时间
     "iat": 1621458842,                // 发行时间
     "nbf": 1621458842,                // 生效时间
     "jti": "unique-token-id-123"      // JWT唯一标识符
   }
   ```

3. **使用合适的签名算法**：
   - 推荐：RS256(非对称)而非HS256(对称)
   - 对称加密(HS256)仅适合受控环境

#### 令牌撤销策略

实现令牌黑名单或撤销机制：

```typescript
@Injectable({
  providedIn: 'root'
})
export class TokenBlacklistService {
  // 内存中的黑名单，实际应用可能需要存储在Redis等持久化系统
  private blacklistedTokens: Map<string, number> = new Map();
  
  constructor(private http: HttpClient) {
    // 定期清除过期的黑名单条目
    setInterval(() => this.cleanupExpiredTokens(), 3600000); // 每小时清理
  }
  
  // 将令牌加入黑名单
  addToBlacklist(jti: string, exp: number): void {
    this.blacklistedTokens.set(jti, exp);
    
    // 同步到服务器
    this.http.post('/api/auth/blacklist', { jti, exp }).subscribe();
  }
  
  // 检查令牌是否在黑名单中
  isBlacklisted(jti: string): boolean {
    return this.blacklistedTokens.has(jti);
  }
  
  // 从服务器加载黑名单
  loadBlacklist(): Observable<void> {
    return this.http.get<{jti: string, exp: number}[]>('/api/auth/blacklist').pipe(
      tap(items => {
        items.forEach(item => {
          this.blacklistedTokens.set(item.jti, item.exp);
        });
      }),
      map(() => void 0)
    );
  }
  
  // 清理过期的黑名单条目
  private cleanupExpiredTokens(): void {
    const now = Math.floor(Date.now() / 1000);
    
    for (const [jti, exp] of this.blacklistedTokens.entries()) {
      if (exp < now) {
        this.blacklistedTokens.delete(jti);
      }
    }
  }
}

// 在JWT拦截器中使用
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private tokenBlacklist: TokenBlacklistService
  ) {}
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();
    
    if (token) {
      // 解析令牌
      const jwtToken = this.authService.decodeToken(token);
      
      // 检查令牌是否在黑名单中
      if (jwtToken.jti && this.tokenBlacklist.isBlacklisted(jwtToken.jti)) {
        // 令牌已被撤销，强制重新登录
        this.authService.logout();
        return throwError(() => new Error('Token has been revoked'));
      }
      
      // 添加令牌到请求
      request = this.addTokenToRequest(request, token);
    }
    
    return next.handle(request);
  }
}
```

#### 防御常见JWT攻击

1. **None算法攻击**防御：
   ```typescript
   // 服务器端验证(Node.js示例)
   jwt.verify(token, secretKey, { 
     algorithms: ['RS256', 'HS256'] // 明确指定允许的算法
   });
   ```

2. **防止JWT泄露**：
   - 使用HTTPS传输所有JWT
   - 不记录JWT到日志
   - 令牌通过安全通道(Authorization头或Cookie)传输

3. **安全的注销实现**：
   ```typescript
   logout(): void {
     // 获取当前令牌的JTI
     const token = this.getAccessToken();
     if (token) {
       const decoded = this.jwtHelper.decodeToken(token);
       
       if (decoded.jti) {
         // 添加到黑名单
         this.tokenBlacklist.addToBlacklist(
           decoded.jti, 
           decoded.exp
         );
       }
     }
     
     // 清除客户端存储
     this.clearSession();
     
     // 通知服务器注销
     this.http.post('/api/auth/logout', {}).subscribe();
   }
   ```

### JWT安全测试

测试JWT实现的安全性：

```typescript
describe('JWT Security', () => {
  let authService: AuthService;
  let httpMock: HttpTestingController;
  let tokenBlacklist: TokenBlacklistService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        TokenBlacklistService,
        JwtHelperService
      ]
    });
    
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenBlacklist = TestBed.inject(TokenBlacklistService);
  });
  
  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });
  
  it('should detect expired tokens', () => {
    // 创建已过期的令牌(修改exp声明)
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                         'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.' +
                         'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    spyOn(authService, 'isTokenExpired').and.callThrough();
    
    expect(authService.isTokenExpired(expiredToken)).toBeTrue();
  });
  
  it('should refresh token when expired', () => {
    // 设置模拟令牌
    const expiredToken = 'expired-token';
    const refreshToken = 'refresh-token';
    const newToken = 'new-token';
    
    // 模拟存储中的令牌
    spyOn(localStorage, 'getItem').and.callFake((key) => {
      if (key === 'access_token') return expiredToken;
      if (key === 'refresh_token') return refreshToken;
      return null;
    });
    
    spyOn(authService, 'isTokenExpired').and.returnValue(true);
    
    // 触发刷新
    authService.refreshToken().subscribe();
    
    // 验证刷新请求
    const req = httpMock.expectOne('/api/auth/refresh-token');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken });
    
    // 模拟刷新响应
    req.flush({
      accessToken: newToken,
      refreshToken: 'new-refresh',
      expiresIn: 900,
      user: { id: 1, username: 'test', email: 'test@example.com', roles: ['USER'] }
    });
    
    // 验证新令牌存储
    expect(localStorage.setItem).toHaveBeenCalledWith('access_token', newToken);
  });
  
  it('should handle token revocation', () => {
    // 模拟令牌
    const token = 'test-token';
    const jti = 'unique-id-123';
    const exp = Math.floor(Date.now() / 1000) + 3600;
    
    // 设置模拟令牌
    spyOn(authService, 'getAccessToken').and.returnValue(token);
    spyOn(authService, 'decodeToken').and.returnValue({ jti, exp });
    
    // 加入黑名单
    tokenBlacklist.addToBlacklist(jti, exp);
    
    // 验证黑名单
    expect(tokenBlacklist.isBlacklisted(jti)).toBeTrue();
    
    // 验证黑名单同步请求
    const req = httpMock.expectOne('/api/auth/blacklist');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ jti, exp });
    
    req.flush({ success: true });
  });
});
```

### JWT解决方案对比表

| 解决方案 | 安全级别 | 复杂度 | 优势 | 劣势 |
|---------|---------|-------|------|------|
| Cookie存储JWT | 高 | 中 | 防XSS，较高安全性 | 需要处理CSRF，跨域复杂 |
| 内存存储+刷新令牌 | 中高 | 中 | 无持久JWT，难以窃取 | 页面刷新需重新认证 |
| localStorage(不推荐) | 低 | 低 | 简单实现，持久化 | 易受XSS攻击 |
| sessionStorage | 中低 | 低 | 会话隔离，标签页限制 | 仍易受XSS攻击 |
| 双令牌+黑名单 | 极高 | 高 | 完整防护，可撤销令牌 | 实现复杂，需服务器支持 |

选择合适的JWT解决方案取决于应用需求和安全要求，但建议对任何严肃的应用至少实现Cookie存储或内存存储+刷新令牌方案。

### 总结与安全检查清单

实现安全的JWT认证系统需关注以下关键点：

1. **存储安全**
   - [ ] 使用HttpOnly Cookie存储敏感令牌
   - [ ] 避免在localStorage中存储访问令牌
   - [ ] 考虑内存存储+刷新令牌模式

2. **令牌配置**
   - [ ] 设置合理的过期时间
   - [ ] 包含所有必要的标准声明(iss, sub, exp, iat, aud)
   - [ ] 使用安全的签名算法(优先RS256)
   - [ ] 令牌包含唯一标识符(jti)便于撤销

3. **传输安全**
   - [ ] 仅通过HTTPS传输令牌
   - [ ] 使用安全头(Authorization或HttpOnly Cookie)

4. **令牌验证**
   - [ ] 验证所有JWT签名
   - [ ] 验证发行者(iss)和受众(aud)
   - [ ] 检查令牌是否过期
   - [ ] 实现令牌撤销机制或黑名单

5. **错误处理**
   - [ ] 适当响应认证错误
   - [ ] 对过期令牌实现自动刷新
   - [ ] 捕获和处理令牌验证失败