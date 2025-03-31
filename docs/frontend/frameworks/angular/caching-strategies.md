---
title: caching-strategies
createTime: 2025/03/29 17:24:14
permalink: /article/5r1tx3c3/
---
# Angular 缓存策略

## 目录

- [HTTP缓存](#HTTP缓存)
- [Service Worker缓存](#Service-Worker缓存)
- [状态缓存](#状态缓存)
- [数据预加载](#数据预加载)

## HTTP缓存

HTTP缓存是Angular应用性能优化的基础层，通过合理配置HTTP缓存策略，可以减少网络请求数量，降低服务器负载，提高应用响应速度。

### HTTP缓存原理

HTTP缓存主要通过HTTP头控制，包括响应缓存和条件请求两种机制：

```ascii
HTTP缓存决策流程:
┌──────────────────┐
│ 发起HTTP请求     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐    是    ┌──────────────────┐
│ 本地是否有缓存？ ├─────────►│ 缓存是否新鲜？   │
└────────┬─────────┘          └────────┬─────────┘
         │ 否                          │
         ▼                    是       ▼       否
┌──────────────────┐          ┌──────────────────┐
│ 发送网络请求     │◄─────────┤ 使用缓存响应     │
└────────┬─────────┘          └──────────────────┘
         │                              ▲
         ▼                              │
┌──────────────────┐                    │
│ 服务器响应       │                    │
└────────┬─────────┘                    │
         │                              │
         ▼                              │
┌──────────────────┐    是              │
│ 响应可缓存？     ├────────────────────┘
└────────┬─────────┘
         │ 否
         ▼
┌──────────────────┐
│ 不缓存响应       │
└──────────────────┘
```

### HTTP拦截器实现缓存

在Angular中，可以通过HTTP拦截器实现客户端缓存逻辑：

```typescript
// http-cache.interceptor.ts
@Injectable()
export class HttpCacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, HttpCacheEntry>();
  
  constructor(private cacheService: HttpCacheService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 只缓存GET请求
    if (req.method !== 'GET') {
      return next.handle(req);
    }
    
    // 跳过带有no-cache标记的请求
    if (req.headers.get('Cache-Control') === 'no-cache') {
      return next.handle(req);
    }
    
    // 检查是否有缓存
    const cachedResponse = this.cacheService.get(req.urlWithParams);
    
    if (cachedResponse && !this.cacheService.isExpired(cachedResponse)) {
      // 返回缓存响应，包装为HttpResponse事件
      return of(new HttpResponse({
        body: cachedResponse.body,
        headers: new HttpHeaders(cachedResponse.headers),
        status: 200,
        statusText: 'OK',
        url: req.urlWithParams
      }));
    }
    
    // 没有缓存或缓存过期，发送请求并更新缓存
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cacheService.set(req.urlWithParams, {
            body: event.body,
            headers: this.extractHeaders(event.headers),
            timestamp: Date.now(),
            url: event.url || req.urlWithParams
          }, this.getCacheDuration(event.headers));
        }
      })
    );
  }
  
  private extractHeaders(headers: HttpHeaders): Record<string, string> {
    const result: Record<string, string> = {};
    headers.keys().forEach(key => {
      result[key] = headers.get(key) || '';
    });
    return result;
  }
  
  private getCacheDuration(headers: HttpHeaders): number {
    // 从Cache-Control或Expires头获取缓存时间
    const cacheControl = headers.get('Cache-Control');
    if (cacheControl) {
      const maxAge = cacheControl.match(/max-age=(\d+)/);
      if (maxAge && maxAge[1]) {
        return parseInt(maxAge[1], 10) * 1000; // 转换为毫秒
      }
    }
    
    const expires = headers.get('Expires');
    if (expires) {
      const expiresDate = new Date(expires);
      return expiresDate.getTime() - Date.now();
    }
    
    // 默认缓存10分钟
    return 10 * 60 * 1000;
  }
}

// http-cache.service.ts
@Injectable({
  providedIn: 'root'
})
export class HttpCacheService {
  private cache = new Map<string, HttpCacheEntry>();
  
  get(key: string): HttpCacheEntry | undefined {
    return this.cache.get(key);
  }
  
  set(key: string, entry: HttpCacheEntry, duration: number): void {
    this.cache.set(key, entry);
    
    // 设置自动过期清理
    if (duration > 0) {
      setTimeout(() => this.cache.delete(key), duration);
    }
  }
  
  isExpired(entry: HttpCacheEntry): boolean {
    // 检查缓存是否过期，可根据各种策略判断
    const maxAge = 10 * 60 * 1000; // 默认10分钟
    return (Date.now() - entry.timestamp) > maxAge;
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// 缓存条目类型
interface HttpCacheEntry {
  url: string;
  body: any;
  headers: Record<string, string>;
  timestamp: number;
}
```

### 配置HTTP头实现服务端缓存控制

在Angular应用中，通常通过配置服务器响应头来优化缓存策略：

```typescript
// 在API服务中添加缓存控制头
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}
  
  getData(): Observable<any> {
    // 添加缓存控制头
    return this.http.get('/api/data', {
      headers: new HttpHeaders({
        'Cache-Control': 'max-age=3600' // 缓存1小时
      })
    });
  }
  
  getFrequentlyUpdatedData(): Observable<any> {
    // 对频繁更新的数据使用条件请求
    return this.http.get('/api/updates', {
      headers: new HttpHeaders({
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      })
    });
  }
  
  getStaticData(): Observable<any> {
    // 对静态数据使用长期缓存
    return this.http.get('/api/static-data', {
      headers: new HttpHeaders({
        'Cache-Control': 'max-age=86400, immutable' // 缓存24小时且不变
      })
    });
  }
}
```

### 条件请求优化

使用条件请求减少不必要的数据传输：

```typescript
@Injectable({
  providedIn: 'root'
})
export class ConditionalRequestService {
  private etags = new Map<string, string>();
  private lastModified = new Map<string, string>();
  
  constructor(private http: HttpClient) {}
  
  getData(url: string): Observable<any> {
    // 准备条件请求头
    let headers = new HttpHeaders();
    
    // 如果有ETag，添加If-None-Match头
    if (this.etags.has(url)) {
      headers = headers.set('If-None-Match', this.etags.get(url) || '');
    }
    
    // 如果有Last-Modified，添加If-Modified-Since头
    if (this.lastModified.has(url)) {
      headers = headers.set('If-Modified-Since', this.lastModified.get(url) || '');
    }
    
    return this.http.get(url, { headers, observe: 'response' }).pipe(
      tap(response => {
        // 保存新的ETag和Last-Modified值
        const etag = response.headers.get('ETag');
        if (etag) {
          this.etags.set(url, etag);
        }
        
        const lastMod = response.headers.get('Last-Modified');
        if (lastMod) {
          this.lastModified.set(url, lastMod);
        }
      }),
      map(response => response.body)
    );
  }
}
```

### 缓存调优策略

| 资源类型 | 缓存策略 | 示例头设置 | 适用场景 |
|---------|----------|----------|---------|
| 应用静态资源 | 长期缓存 | `Cache-Control: max-age=31536000, immutable` | JS/CSS/字体等带版本的构建输出 |
| API数据(不频繁变化) | 短期缓存 | `Cache-Control: max-age=3600` | 配置数据、参考数据 |
| API数据(频繁变化) | 验证缓存 | `Cache-Control: no-cache, must-revalidate` | 用户个性化数据、状态数据 |
| 实时数据 | 禁止缓存 | `Cache-Control: no-store` | 报价、实时统计 |

### HTTP缓存最佳实践

1. **缓存分层设计**：
   - 浏览器HTTP缓存作为第一层
   - 应用内存缓存作为第二层
   - Service Worker缓存作为离线支持

2. **缓存控制粒度**：
   - 通过路由或API特性设置不同缓存策略
   - 避免过于通用的缓存设置

3. **缓存失效机制**：
   - 实现主动缓存清除功能
   - 为关键操作后的数据刷新设计策略
   - 使用版本化URL避免缓存问题

4. **缓存调试支持**：
   - 添加缓存命中日志
   - 提供开发模式下的缓存控制面板

## Service Worker缓存

Service Worker是Angular应用实现高级缓存策略和离线功能的强大工具，通过拦截网络请求并缓存响应，提供完全可控的缓存机制。

### Service Worker基础架构

Service Worker是运行在浏览器背景中的JavaScript程序，可以拦截网络请求并缓存内容，即使在应用关闭后也能运行。

```ascii
Service Worker缓存架构:
┌─────────────────────────────────────────────────────────────┐
│                        浏览器                               │
│  ┌───────────────┐     ┌───────────────┐    ┌──────────┐   │
│  │               │     │               │    │          │   │
│  │  Angular应用  │◄────┤ Service Worker ├───►│ 缓存API  │   │
│  │               │     │               │    │          │   │
│  └───────┬───────┘     └───────┬───────┘    └────┬─────┘   │
│          │                     │                  │         │
└──────────┼─────────────────────┼──────────────────┼─────────┘
           │                     │                  │
           │                     ▼                  │
           │             ┌───────────────┐          │
           └────────────►│   网络请求    │◄─────────┘
                         └───────────────┘
```

### 在Angular中启用Service Worker

Angular提供了`@angular/service-worker`包简化Service Worker的实现：

```bash
# 在现有项目中添加Service Worker支持
ng add @angular/pwa
```

以上命令会：
1. 安装所需依赖包
2. 生成`ngsw-config.json`配置文件
3. 在`angular.json`中启用Service Worker
4. 在`app.module.ts`中注册Service Worker
5. 创建图标和manifest.webmanifest文件

### Service Worker配置

Service Worker的核心配置在`ngsw-config.json`文件中：

```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/manifest.webmanifest",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot)"
        ]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-performance",
      "urls": [
        "/api/products",
        "/api/categories"
      ],
      "cacheConfig": {
        "strategy": "performance",
        "maxSize": 100,
        "maxAge": "1d"
      }
    },
    {
      "name": "api-freshness",
      "urls": [
        "/api/user",
        "/api/orders"
      ],
      "cacheConfig": {
        "strategy": "freshness",
        "maxSize": 50,
        "maxAge": "1h",
        "timeout": "10s"
      }
    }
  ]
}
```

### 缓存策略配置

在Angular Service Worker中，主要有两种缓存策略：

1. **Performance策略**：优先使用缓存数据，后台更新。适用于不经常变化的数据。
2. **Freshness策略**：优先尝试网络请求，网络失败或超时才使用缓存。适用于频繁变化的数据。

### Service Worker管理服务

Angular提供了`SwUpdate`和`SwPush`服务来管理Service Worker更新和推送通知：

```typescript
// app.component.ts
@Component({
  selector: 'app-root',
  template: `
    <div *ngIf="updateAvailable" class="update-notification">
      <p>新版本可用!</p>
      <button (click)="updateApp()">更新应用</button>
    </div>
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  updateAvailable = false;
  
  constructor(private swUpdate: SwUpdate) {}
  
  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      // 检查更新
      this.swUpdate.available.subscribe(() => {
        this.updateAvailable = true;
      });
      
      // 定期检查更新（每6小时）
      interval(6 * 60 * 60 * 1000).subscribe(() => {
        this.swUpdate.checkForUpdate();
      });
    }
  }
  
  updateApp() {
    this.swUpdate.activateUpdate().then(() => {
      window.location.reload();
    });
  }
}
```

### 自定义缓存请求

通过创建自定义Service Worker策略增强默认行为：

```typescript
// custom-sw.service.ts
@Injectable({
  providedIn: 'root'
})
export class CustomSwService {
  constructor(
    private swUpdate: SwUpdate,
    private http: HttpClient
  ) {}
  
  // 强制从网络刷新数据
  refreshCachedData(url: string): Observable<any> {
    // 添加时间戳或随机数以绕过缓存
    const bypassCacheUrl = `${url}${url.includes('?') ? '&' : '?'}_sw_bypass=${Date.now()}`;
    return this.http.get(bypassCacheUrl);
  }
  
  // 清除特定类型的缓存
  async clearDataCache(cacheType: string): Promise<boolean> {
    if (!('caches' in window)) {
      return false;
    }
    
    try {
      const cache = await caches.open('ngsw:data:api-' + cacheType);
      await cache.keys().then(keys => {
        keys.forEach(request => {
          cache.delete(request);
        });
      });
      return true;
    } catch (error) {
      console.error('清除缓存失败:', error);
      return false;
    }
  }
  
  // 预热(预缓存)关键API数据
  preloadApiData(urls: string[]): Promise<void[]> {
    // 确保URLs是绝对路径
    const absoluteUrls = urls.map(url => {
      return url.startsWith('http') ? url : window.location.origin + url;
    });
    
    // 并行预加载数据
    const preloadPromises = absoluteUrls.map(url => {
      return this.http.get(url).pipe(
        catchError(err => {
          console.warn(`预加载数据失败: ${url}`, err);
          return of(null);
        }),
        first()
      ).toPromise();
    });
    
    return Promise.all(preloadPromises);
  }
}
```

### 网络状态感知服务

结合Service Worker和Network Information API实现网络状态感知：

```typescript
// network-status.service.ts
@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService {
  private online = new BehaviorSubject<boolean>(navigator.onLine);
  private offlineMode = new BehaviorSubject<boolean>(false);
  private connectionType = new BehaviorSubject<string>('unknown');
  
  // 公开可观察流
  online$ = this.online.asObservable();
  offlineMode$ = this.offlineMode.asObservable();
  connectionType$ = this.connectionType.asObservable();
  
  constructor() {
    // 监听在线/离线事件
    window.addEventListener('online', () => {
      this.online.next(true);
      this.checkConnectionType();
    });
    
    window.addEventListener('offline', () => {
      this.online.next(false);
      this.connectionType.next('none');
    });
    
    // 初始化连接类型
    this.checkConnectionType();
    
    // 如果支持，监听连接变化
    if ('connection' in navigator && 'addEventListener' in (navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', () => {
        this.checkConnectionType();
      });
    }
  }
  
  // 手动启用离线模式
  enableOfflineMode(enable: boolean): void {
    this.offlineMode.next(enable);
  }
  
  private checkConnectionType(): void {
    if (!navigator.onLine) {
      this.connectionType.next('none');
      return;
    }
    
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      this.connectionType.next(conn.effectiveType || conn.type || 'unknown');
    } else {
      this.connectionType.next('unknown');
    }
  }
  
  // 获取当前网络限制级别(0-3)，用于调整请求行为
  getNetworkRestrictionLevel(): Observable<number> {
    return combineLatest([
      this.online$,
      this.offlineMode$,
      this.connectionType$
    ]).pipe(
      map(([online, offlineMode, connectionType]) => {
        if (!online || offlineMode) {
          return 3; // 离线模式，最高限制
        }
        
        // 根据连接类型返回限制级别
        switch(connectionType) {
          case 'slow-2g':
          case '2g':
            return 2; // 高限制
          case '3g':
            return 1; // 中等限制
          case '4g':
          case 'wifi':
          case 'ethernet':
            return 0; // 无限制
          default:
            return 1; // 默认中等限制
        }
      })
    );
  }
}
```

### 离线优先模式实现

结合Service Worker和IndexedDB实现完全离线模式：

```typescript
// offline-first.service.ts
@Injectable({
  providedIn: 'root'
})
export class OfflineFirstService {
  private db: IDBDatabase | null = null;
  private dbReady = new BehaviorSubject<boolean>(false);
  
  constructor(
    private networkStatus: NetworkStatusService,
    private http: HttpClient
  ) {
    this.initDatabase();
  }
  
  // 初始化IndexedDB
  private async initDatabase(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('offline-data', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建存储数据的对象库
        if (!db.objectStoreNames.contains('api-cache')) {
          db.createObjectStore('api-cache', { keyPath: 'url' });
        }
        
        // 创建存储用户操作的对象库
        if (!db.objectStoreNames.contains('pending-requests')) {
          const store = db.createObjectStore('pending-requests', { 
            keyPath: 'id',
            autoIncrement: true 
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.dbReady.next(true);
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('IndexedDB初始化失败:', event);
        reject(new Error('无法打开离线数据库'));
      };
    });
  }
  
  // 离线优先数据获取
  getData<T>(url: string, options?: { forceNetwork?: boolean }): Observable<T> {
    // 等待数据库就绪
    return this.dbReady.pipe(
      filter(ready => ready),
      first(),
      switchMap(() => {
        // 检查是否强制网络请求
        if (options?.forceNetwork) {
          return this.fetchFromNetwork<T>(url);
        }
        
        // 检查网络状态
        return this.networkStatus.online$.pipe(
          first(),
          switchMap(online => {
            if (online) {
              // 在线状态：优先从网络获取，失败时回退到缓存
              return this.fetchFromNetwork<T>(url).pipe(
                catchError(error => {
                  console.warn('网络请求失败，使用缓存数据:', url);
                  return this.fetchFromCache<T>(url);
                })
              );
            } else {
              // 离线状态：仅使用缓存
              return this.fetchFromCache<T>(url);
            }
          })
        );
      })
    );
  }
  
  // 从网络获取数据并更新缓存
  private fetchFromNetwork<T>(url: string): Observable<T> {
    return this.http.get<T>(url).pipe(
      tap(data => {
        // 更新缓存
        this.updateCache(url, data);
      })
    );
  }
  
  // 从缓存获取数据
  private fetchFromCache<T>(url: string): Observable<T> {
    if (!this.db) {
      return throwError('数据库未初始化');
    }
    
    return new Observable<T>(observer => {
      const transaction = this.db!.transaction(['api-cache'], 'readonly');
      const store = transaction.objectStore('api-cache');
      const request = store.get(url);
      
      request.onsuccess = () => {
        if (request.result) {
          observer.next(request.result.data);
          observer.complete();
        } else {
          observer.error(new Error(`缓存中找不到数据: ${url}`));
        }
      };
      
      request.onerror = () => {
        observer.error(new Error(`读取缓存失败: ${url}`));
      };
    });
  }
  
  // 更新缓存
  private updateCache(url: string, data: any): void {
    if (!this.db) {
      return;
    }
    
    const transaction = this.db.transaction(['api-cache'], 'readwrite');
    const store = transaction.objectStore('api-cache');
    
    store.put({
      url,
      data,
      timestamp: Date.now()
    });
  }
  
  // 存储离线时的写操作请求
  savePendingRequest(method: string, url: string, body: any): Observable<number> {
    if (!this.db) {
      return throwError('数据库未初始化');
    }
    
    return new Observable<number>(observer => {
      const transaction = this.db!.transaction(['pending-requests'], 'readwrite');
      const store = transaction.objectStore('pending-requests');
      
      const request = store.add({
        method,
        url,
        body,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => {
        observer.next(request.result as number);
        observer.complete();
      };
      
      request.onerror = () => {
        observer.error(new Error('保存待处理请求失败'));
      };
    });
  }
  
  // 同步离线操作
  syncPendingRequests(): Observable<{success: number, failed: number}> {
    return this.networkStatus.online$.pipe(
      first(),
      switchMap(online => {
        if (!online || !this.db) {
          return of({success: 0, failed: 0});
        }
        
        return this.getPendingRequests().pipe(
          switchMap(requests => {
            if (requests.length === 0) {
              return of({success: 0, failed: 0});
            }
            
            // 处理所有待处理请求
            const processPromises = requests.map(req => this.processPendingRequest(req));
            
            return forkJoin(processPromises).pipe(
              map(results => {
                const success = results.filter(r => r.success).length;
                return {
                  success,
                  failed: results.length - success
                };
              })
            );
          })
        );
      })
    );
  }
  
  // 获取所有待处理请求
  private getPendingRequests(): Observable<Array<any>> {
    if (!this.db) {
      return of([]);
    }
    
    return new Observable<Array<any>>(observer => {
      const transaction = this.db!.transaction(['pending-requests'], 'readonly');
      const store = transaction.objectStore('pending-requests');
      const request = store.index('timestamp').openCursor();
      
      const requests: Array<any> = [];
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          requests.push({
            id: cursor.value.id,
            method: cursor.value.method,
            url: cursor.value.url,
            body: cursor.value.body,
            timestamp: cursor.value.timestamp
          });
          cursor.continue();
        } else {
          observer.next(requests);
          observer.complete();
        }
      };
      
      request.onerror = () => {
        observer.error(new Error('获取待处理请求失败'));
      };
    });
  }
  
  // 处理单个待处理请求
  private processPendingRequest(request: any): Observable<{id: number, success: boolean}> {
    return this.http.request(request.method, request.url, {
      body: request.body
    }).pipe(
      map(() => {
        // 成功处理后删除请求
        this.removePendingRequest(request.id);
        return {id: request.id, success: true};
      }),
      catchError(error => {
        console.error('同步请求失败:', request.url, error);
        return of({id: request.id, success: false});
      })
    );
  }
  
  // 删除已处理的请求
  private removePendingRequest(id: number): void {
    if (!this.db) {
      return;
    }
    
    const transaction = this.db.transaction(['pending-requests'], 'readwrite');
    const store = transaction.objectStore('pending-requests');
    store.delete(id);
  }
}
```

### Service Worker性能优化

Service Worker大型应用优化策略：

| 优化策略 | 实施方法 | 效果 |
|---------|----------|-----|
| 静态资源预缓存 | 使用installMode: "prefetch" | 首次安装时即缓存所有应用资源，改善后续打开速度 |
| 懒加载资源缓存 | 使用installMode: "lazy" | 按需加载较大资源，减少初始加载时间 |
| 选择性API缓存 | 配置dataGroups | 根据API特性选择合适的缓存策略，提高数据获取性能 |
| 定期缓存清理 | 实现自定义清理逻辑 | 防止缓存过大，优化存储使用 |
| 资源优先级 | 排序assetGroups | 确保关键资源优先加载 |

### Service Worker与传统HTTP缓存对比

```ascii
技术对比:

Service Worker缓存               HTTP缓存
┌───────────────────────┐       ┌──────────────────────┐
│ 1. 可编程             │       │ 1. 基于头部规则       │
│ 2. 完全可控           │       │ 2. 有限配置选项       │
│ 3. 离线访问支持       │       │ 3. 需要网络连接       │
│ 4. 后台更新           │       │ 4. 只在请求时验证     │
│ 5. 版本化             │       │ 5. 基于时间过期       │
│ 6. 支持复杂缓存策略   │       │ 6. 策略相对简单       │
│ 7. 需要HTTPS          │       │ 7. 任何协议可用       │
└───────────────────────┘       └──────────────────────┘
```

### Service Worker缓存最佳实践

1. **逐级缓存策略**：
   - 核心应用资源使用预缓存
   - 次要资源使用懒加载
   - 动态数据根据重要性选择缓存策略

2. **版本控制与更新**：
   - 实现自动检测新版本
   - 提供用户可控的更新机制
   - 关键变更时强制更新

3. **离线体验优化**：
   - 设计专门的离线UI状态
   - 实现操作队列系统
   - 提供同步状态指示器

4. **性能监测**：
   - 跟踪Service Worker缓存命中率
   - 监控缓存大小增长
   - 测量离线功能效率

## 状态缓存

状态缓存是前端应用性能优化的核心策略，通过缓存组件和服务的状态数据，减少计算开销和网络请求，提高响应速度。

### 状态缓存架构

在Angular应用中，状态缓存通常分为三个层次：

```ascii
Angular应用状态缓存层次:
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  ┌──────────────────┐   ┌───────────────┐   ┌──────────┐   │
│  │                  │   │               │   │          │   │
│  │  组件级状态缓存  │◄──┤  服务级缓存   │◄──┤ 全局状态 │   │
│  │                  │   │               │   │          │   │
│  └──────────────────┘   └───────────────┘   └──────────┘   │
│        ▲                      ▲                  ▲         │
│        │                      │                  │         │
│        │                      │                  │         │
│        ▼                      ▼                  ▼         │
│  ┌──────────────────┐   ┌───────────────┐   ┌──────────┐   │
│  │                  │   │               │   │          │   │
│  │    视图缓存      │   │  数据访问缓存  │   │ 状态存储 │   │
│  │                  │   │               │   │          │   │
│  └──────────────────┘   └───────────────┘   └──────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 组件级状态缓存

#### 视图和计算结果缓存

在Angular组件中缓存计算结果和视图渲染：

```typescript
@Component({
  selector: 'app-data-table',
  template: `
    <table>
      <thead>...</thead>
      <tbody>
        <tr *ngFor="let item of filteredData">
          <!-- 表格内容 -->
        </tr>
      </tbody>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent implements OnInit {
  @Input() data: Item[] = [];
  @Input() filter: string = '';
  
  // 缓存计算结果
  private _filteredData: Item[] | null = null;
  private _lastFilter: string = '';
  private _lastData: Item[] | null = null;
  
  // 计算属性getter
  get filteredData(): Item[] {
    // 如果输入数据或过滤条件未变化，返回缓存结果
    if (
      this._filteredData && 
      this._lastFilter === this.filter && 
      this._lastData === this.data
    ) {
      return this._filteredData;
    }
    
    // 否则重新计算结果
    this._lastFilter = this.filter;
    this._lastData = this.data;
    this._filteredData = this.data.filter(item => 
      item.name.toLowerCase().includes(this.filter.toLowerCase())
    );
    
    return this._filteredData;
  }
  
  // 使用trackBy优化ngFor渲染
  trackByFn(index: number, item: Item): number {
    return item.id;
  }
}
```

#### 本地存储组件状态

对于需要持久化的组件状态，可以使用本地存储：

```typescript
@Component({
  selector: 'app-preferences',
  template: `
    <div class="preferences">
      <label>
        <input type="checkbox" [(ngModel)]="darkMode" (change)="savePreferences()">
        深色模式
      </label>
      <label>
        <input type="number" [(ngModel)]="itemsPerPage" (change)="savePreferences()">
        每页项目数
      </label>
    </div>
  `
})
export class PreferencesComponent implements OnInit {
  darkMode = false;
  itemsPerPage = 10;
  
  private readonly STORAGE_KEY = 'user_preferences';
  
  ngOnInit() {
    this.loadPreferences();
  }
  
  savePreferences() {
    const preferences = {
      darkMode: this.darkMode,
      itemsPerPage: this.itemsPerPage
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    
    // 可选：通知其他组件
    this.broadcastPreferencesChange(preferences);
  }
  
  loadPreferences() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const preferences = JSON.parse(saved);
        this.darkMode = preferences.darkMode ?? false;
        this.itemsPerPage = preferences.itemsPerPage ?? 10;
      } catch (e) {
        console.error('无法解析存储的首选项', e);
      }
    }
  }
  
  private broadcastPreferencesChange(preferences: any) {
    // 可以使用服务、EventEmitter或RxJS Subject广播变化
  }
}
```

### 服务级状态缓存

#### 基础缓存服务实现

创建通用缓存服务，用于缓存数据和计算结果：

```typescript
// cache.service.ts
@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry>();
  
  constructor() {
    // 可选：从localStorage加载持久化缓存
    this.loadFromStorage();
    
    // 可选：定期清理过期缓存
    this.setupCacheCleanup();
  }
  
  // 获取缓存数据，如果不存在或已过期，使用factory函数获取并缓存
  get<T>(key: string, factory: () => Observable<T>, options?: CacheOptions): Observable<T> {
    const opts = { ...DEFAULT_CACHE_OPTIONS, ...options };
    const entry = this.cache.get(key);
    
    // 检查缓存是否有效
    if (entry && !this.isExpired(entry)) {
      return of(entry.value as T);
    }
    
    // 无缓存或已过期，调用factory获取新数据
    return factory().pipe(
      tap(value => {
        this.set(key, value, opts);
      })
    );
  }
  
  // 直接存储缓存数据
  set<T>(key: string, value: T, options?: CacheOptions): void {
    const opts = { ...DEFAULT_CACHE_OPTIONS, ...options };
    
    const entry: CacheEntry = {
      value,
      timestamp: Date.now(),
      expiresAt: opts.ttl > 0 ? Date.now() + opts.ttl : 0
    };
    
    this.cache.set(key, entry);
    
    // 可选：持久化到localStorage
    if (opts.persist) {
      this.saveToStorage();
    }
  }
  
  // 检查是否存在有效缓存
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return !!entry && !this.isExpired(entry);
  }
  
  // 移除缓存
  remove(key: string): boolean {
    const result = this.cache.delete(key);
    this.saveToStorage();
    return result;
  }
  
  // 清除所有缓存
  clear(): void {
    this.cache.clear();
    localStorage.removeItem('app_cache');
  }
  
  // 检查缓存是否过期
  private isExpired(entry: CacheEntry): boolean {
    return entry.expiresAt > 0 && entry.expiresAt < Date.now();
  }
  
  // 从localStorage加载缓存
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('app_cache');
      if (stored) {
        const data = JSON.parse(stored);
        Object.keys(data).forEach(key => {
          this.cache.set(key, data[key]);
        });
      }
    } catch (e) {
      console.error('从存储加载缓存失败', e);
    }
  }
  
  // 保存缓存到localStorage
  private saveToStorage(): void {
    try {
      const persistData: Record<string, CacheEntry> = {};
      
      this.cache.forEach((value, key) => {
        const entry = this.cache.get(key);
        if (entry && entry.persist) {
          persistData[key] = entry;
        }
      });
      
      localStorage.setItem('app_cache', JSON.stringify(persistData));
    } catch (e) {
      console.error('保存缓存到存储失败', e);
    }
  }
  
  // 设置定期清理过期缓存
  private setupCacheCleanup(): void {
    setInterval(() => {
      let hasRemoved = false;
      
      this.cache.forEach((entry, key) => {
        if (this.isExpired(entry)) {
          this.cache.delete(key);
          hasRemoved = true;
        }
      });
      
      if (hasRemoved) {
        this.saveToStorage();
      }
    }, 60000); // 每分钟清理一次
  }
}

// 缓存配置选项
interface CacheOptions {
  ttl: number;       // 生存时间(毫秒)，0表示永不过期
  persist: boolean;  // 是否持久化到localStorage
}

// 缓存条目
interface CacheEntry {
  value: any;
  timestamp: number;
  expiresAt: number;
  persist?: boolean;
}

// 默认缓存选项
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  ttl: 5 * 60 * 1000,  // 默认5分钟
  persist: false
};
```

#### 数据服务缓存策略

在数据服务中集成缓存服务：

```typescript
// product.service.ts
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = '/api/products';
  
  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) {}
  
  // 获取产品列表，应用缓存策略
  getProducts(forceRefresh = false): Observable<Product[]> {
    const cacheKey = 'products_list';
    
    // 强制刷新则清除缓存
    if (forceRefresh) {
      this.cacheService.remove(cacheKey);
    }
    
    // 使用缓存服务
    return this.cacheService.get<Product[]>(
      cacheKey,
      () => this.http.get<Product[]>(this.apiUrl),
      { ttl: 10 * 60 * 1000, persist: true } // 10分钟缓存，持久化
    );
  }
  
  // 获取单个产品，独立缓存
  getProduct(id: number): Observable<Product> {
    const cacheKey = `product_${id}`;
    
    return this.cacheService.get<Product>(
      cacheKey,
      () => this.http.get<Product>(`${this.apiUrl}/${id}`),
      { ttl: 30 * 60 * 1000 } // 30分钟缓存
    );
  }
  
  // 创建产品，更新缓存
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      tap(newProduct => {
        // 更新产品列表缓存
        this.updateProductsListCache(newProduct);
      })
    );
  }
  
  // 更新产品，更新缓存
  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${product.id}`, product).pipe(
      tap(updatedProduct => {
        // 更新单个产品缓存
        this.cacheService.set(`product_${product.id}`, updatedProduct);
        
        // 更新产品列表缓存
        this.updateProductsListCache(updatedProduct, true);
      })
    );
  }
  
  // 删除产品，更新缓存
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // 移除单个产品缓存
        this.cacheService.remove(`product_${id}`);
        
        // 更新产品列表缓存
        this.removeFromProductsListCache(id);
      })
    );
  }
  
  // 更新产品列表缓存
  private updateProductsListCache(product: Product, isUpdate = false): void {
    if (!this.cacheService.has('products_list')) {
      return;
    }
    
    this.cacheService.get<Product[]>('products_list', () => of([])).pipe(
      take(1),
      map(products => {
        if (isUpdate) {
          // 更新现有产品
          return products.map(p => p.id === product.id ? product : p);
        } else {
          // 添加新产品
          return [...products, product];
        }
      })
    ).subscribe(updatedProducts => {
      this.cacheService.set('products_list', updatedProducts);
    });
  }
  
  // 从产品列表缓存中移除
  private removeFromProductsListCache(productId: number): void {
    if (!this.cacheService.has('products_list')) {
      return;
    }
    
    this.cacheService.get<Product[]>('products_list', () => of([])).pipe(
      take(1),
      map(products => products.filter(p => p.id !== productId))
    ).subscribe(filteredProducts => {
      this.cacheService.set('products_list', filteredProducts);
    });
  }
}
```

### 全局状态缓存

#### 基于NgRx的状态缓存

在使用NgRx的应用中，可以实现持久化状态缓存：

```typescript
// meta.reducer.ts
export function storageMetaReducer<T, V extends Action = Action>(
  reducer: ActionReducer<T, V>,
  localStorageKey: string = 'app_state'
): ActionReducer<T, V> {
  let onInit = true;

  // 返回增强的reducer
  return (state: T | undefined, action: V): T => {
    // 初始化时从localStorage加载状态
    if (onInit) {
      onInit = false;
      const savedState = localStorage.getItem(localStorageKey);
      
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          return { ...parsedState };
        } catch (e) {
          console.error('无法解析存储的状态', e);
        }
      }
    }

    // 使用原始reducer处理action
    const nextState = reducer(state, action);

    // 保存状态到localStorage
    localStorage.setItem(localStorageKey, JSON.stringify(nextState));

    return nextState;
  };
}

// 注册metaReducer
@NgModule({
  imports: [
    StoreModule.forRoot(reducers, {
      metaReducers: [
        storageMetaReducer
      ]
    })
  ]
})
export class AppModule {}
```

#### 基于RxJS的状态缓存

使用RxJS实现轻量级全局状态缓存：

```typescript
// app-state.service.ts
@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  // 应用状态
  private state$ = new BehaviorSubject<AppState>(this.getInitialState());
  
  // 公开可观察状态
  readonly state = this.state$.asObservable();
  
  // 获取用户设置的派生状态
  readonly userSettings = this.state.pipe(
    map(state => state.userSettings),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
  );
  
  // 获取主题设置的派生状态
  readonly theme = this.state.pipe(
    map(state => state.userSettings.theme),
    distinctUntilChanged()
  );
  
  constructor() {
    // 监听状态变化，持久化到localStorage
    this.state.pipe(
      skip(1), // 跳过初始值
      debounceTime(300) // 防抖，避免频繁写入
    ).subscribe(state => {
      localStorage.setItem('app_state', JSON.stringify(state));
    });
  }
  
  // 获取初始状态
  private getInitialState(): AppState {
    // 默认状态
    const defaultState: AppState = {
      userSettings: {
        theme: 'light',
        fontSize: 'medium',
        notifications: true
      },
      ui: {
        sidebarExpanded: true,
        lastViewedPage: ''
      },
      cache: {
        lastUpdated: Date.now()
      }
    };
    
    // 尝试从localStorage加载状态
    try {
      const savedState = localStorage.getItem('app_state');
      return savedState ? { ...defaultState, ...JSON.parse(savedState) } : defaultState;
    } catch (e) {
      console.error('无法加载应用状态', e);
      return defaultState;
    }
  }
  
  // 更新状态
  updateState(stateFn: (state: AppState) => AppState): void {
    this.state$.next(stateFn(this.state$.value));
  }
  
  // 更新用户设置
  updateUserSettings(settings: Partial<UserSettings>): void {
    this.updateState(state => ({
      ...state,
      userSettings: {
        ...state.userSettings,
        ...settings
      },
      cache: {
        ...state.cache,
        lastUpdated: Date.now()
      }
    }));
  }
  
  // 更新UI状态
  updateUiState(ui: Partial<UiState>): void {
    this.updateState(state => ({
      ...state,
      ui: {
        ...state.ui,
        ...ui
      }
    }));
  }
  
  // 清除状态
  clearState(): void {
    localStorage.removeItem('app_state');
    this.state$.next(this.getInitialState());
  }
}

// 状态接口
interface AppState {
  userSettings: UserSettings;
  ui: UiState;
  cache: CacheState;
}

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
}

interface UiState {
  sidebarExpanded: boolean;
  lastViewedPage: string;
}

interface CacheState {
  lastUpdated: number;
}
```

#### 基于Signal的状态缓存

使用Angular的Signal系统实现状态缓存：

```typescript
// signal-state.service.ts
@Injectable({
  providedIn: 'root'
})
export class SignalStateService implements OnDestroy {
  // 持久化存储键
  private readonly STORAGE_KEY = 'signal_state';
  
  // 状态Signal
  private stateSignal = signal<AppState>(this.getInitialState());
  
  // 公开只读状态
  readonly state = this.stateSignal.asReadonly();
  
  // 派生状态
  readonly userSettings = computed(() => this.state().userSettings);
  readonly theme = computed(() => this.userSettings().theme);
  readonly uiState = computed(() => this.state().ui);
  
  // 用于状态持久化的Effect
  private persistEffect = effect(() => {
    // 获取当前状态
    const currentState = this.state();
    
    // 持久化到localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentState));
  }, { allowSignalWrites: true });
  
  constructor() {}
  
  ngOnDestroy() {
    // 清理effect
    this.persistEffect.destroy();
  }
  
  // 获取初始状态
  private getInitialState(): AppState {
    // 默认状态
    const defaultState: AppState = {
      userSettings: {
        theme: 'light',
        fontSize: 'medium',
        notifications: true
      },
      ui: {
        sidebarExpanded: true,
        lastViewedPage: ''
      },
      lastUpdated: Date.now()
    };
    
    // 尝试从localStorage加载状态
    try {
      const savedState = localStorage.getItem(this.STORAGE_KEY);
      return savedState ? { ...defaultState, ...JSON.parse(savedState) } : defaultState;
    } catch (e) {
      console.error('无法加载Signal状态', e);
      return defaultState;
    }
  }
  
  // 更新状态
  updateState(stateFn: (state: AppState) => AppState): void {
    this.stateSignal.update(currentState => {
      const newState = stateFn(currentState);
      return {
        ...newState,
        lastUpdated: Date.now()
      };
    });
  }
  
  // 更新用户设置
  updateUserSettings(settings: Partial<UserSettings>): void {
    this.stateSignal.update(state => ({
      ...state,
      userSettings: {
        ...state.userSettings,
        ...settings
      },
      lastUpdated: Date.now()
    }));
  }
  
  // 更新UI状态
  updateUiState(ui: Partial<UiState>): void {
    this.stateSignal.update(state => ({
      ...state,
      ui: {
        ...state.ui,
        ...ui
      },
      lastUpdated: Date.now()
    }));
  }
  
  // 重置状态
  resetState(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.stateSignal.set(this.getInitialState());
  }
}

// 状态接口
interface AppState {
  userSettings: UserSettings;
  ui: UiState;
  lastUpdated: number;
}

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
}

interface UiState {
  sidebarExpanded: boolean;
  lastViewedPage: string;
}
```

### 缓存失效策略

#### 基于时间的缓存失效

使用时间戳实现缓存自动过期：

```typescript
// time-based-cache.service.ts
@Injectable({
  providedIn: 'root'
})
export class TimeBasedCacheService {
  private cache = new Map<string, TimedCacheEntry>();
  
  /**
   * 获取缓存值，如果不存在或已过期，则执行回调获取新值
   */
  get<T>(key: string, factory: () => T, maxAge: number = 5 * 60 * 1000): T {
    const entry = this.cache.get(key);
    const now = Date.now();
    
    // 检查缓存是否存在且未过期
    if (entry && now - entry.timestamp < maxAge) {
      return entry.value as T;
    }
    
    // 没有缓存或已过期，获取新值
    const value = factory();
    
    // 更新缓存
    this.cache.set(key, {
      value,
      timestamp: now
    });
    
    return value;
  }
  
  /**
   * 获取缓存值(异步版本)
   */
  getAsync<T>(key: string, factory: () => Observable<T>, maxAge: number = 5 * 60 * 1000): Observable<T> {
    const entry = this.cache.get(key);
    const now = Date.now();
    
    // 检查缓存是否存在且未过期
    if (entry && now - entry.timestamp < maxAge) {
      return of(entry.value as T);
    }
    
    // 没有缓存或已过期，获取新值
    return factory().pipe(
      tap(value => {
        // 更新缓存
        this.cache.set(key, {
          value,
          timestamp: now
        });
      })
    );
  }
  
  /**
   * 设置缓存值
   */
  set(key: string, value: any): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  /**
   * 清除指定键的缓存
   */
  remove(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * 清除过期缓存
   */
  cleanExpired(maxAge: number = 30 * 60 * 1000): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
  }
}

interface TimedCacheEntry {
  value: any;
  timestamp: number;
}
```

#### 基于事件的缓存失效

使用事件触发器使相关缓存失效：

```typescript
// event-based-cache.service.ts
@Injectable({
  providedIn: 'root'
})
export class EventBasedCacheService {
  private cache = new Map<string, any>();
  private dependencies = new Map<string, Set<string>>();
  
  constructor(private events: EventService) {
    // 订阅缓存失效事件
    this.events.on('cache:invalidate').subscribe(event => {
      if (event.key) {
        // 使特定键失效
        this.invalidate(event.key);
      } else if (event.pattern) {
        // 使匹配模式的键失效
        this.invalidatePattern(event.pattern);
      } else if (event.tags && event.tags.length) {
        // 使包含特定标签的键失效
        this.invalidateTags(event.tags);
      }
    });
  }
  
  /**
   * 获取缓存值，不存在时设置
   */
  get<T>(key: string, factory: () => T, deps: string[] = []): T {
    if (!this.cache.has(key)) {
      const value = factory();
      this.set(key, value, deps);
      return value;
    }
    
    return this.cache.get(key);
  }
  
  /**
   * 获取缓存值(异步版本)
   */
  getAsync<T>(key: string, factory: () => Observable<T>, deps: string[] = []): Observable<T> {
    if (!this.cache.has(key)) {
      return factory().pipe(
        tap(value => this.set(key, value, deps))
      );
    }
    
    return of(this.cache.get(key));
  }
  
  /**
   * 设置缓存值和依赖关系
   */
  set<T>(key: string, value: T, deps: string[] = []): void {
    this.cache.set(key, value);
    
    // 设置依赖关系
    deps.forEach(dep => {
      if (!this.dependencies.has(dep)) {
        this.dependencies.set(dep, new Set());
      }
      
      this.dependencies.get(dep)?.add(key);
    });
  }
  
  /**
   * 使特定键和依赖于它的缓存失效
   */
  invalidate(key: string): void {
    // 移除缓存
    this.cache.delete(key);
    
    // 检查是否有依赖于此键的其他缓存
    if (this.dependencies.has(key)) {
      const dependents = this.dependencies.get(key) || new Set();
      
      // 递归使依赖项失效
      for (const dep of dependents) {
        this.invalidate(dep);
      }
      
      // 移除依赖关系
      this.dependencies.delete(key);
    }
  }
  
  /**
   * 使匹配模式的键失效
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    
    // 查找所有匹配的键
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.invalidate(key);
      }
    }
  }
  
  /**
   * 使包含特定标签的键失效
   */
  invalidateTags(tags: string[]): void {
    // 查找与标签相关的所有缓存键
    tags.forEach(tag => {
      if (this.dependencies.has(tag)) {
        const keys = Array.from(this.dependencies.get(tag) || []);
        
        // 使每个键失效
        keys.forEach(key => this.invalidate(key));
        
        // 移除标签依赖关系
        this.dependencies.delete(tag);
      }
    });
  }
  
  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.dependencies.clear();
  }
}

// 事件服务
@Injectable({
  providedIn: 'root'
})
export class EventService {
  private events = new Subject<any>();
  
  emit(type: string, payload?: any): void {
    this.events.next({ type, ...payload });
  }
  
  on(type: string): Observable<any> {
    return this.events.pipe(
      filter(event => event.type === type)
    );
  }
}
```

### 状态缓存性能对比

| 缓存策略类型 | 内存使用 | 持久化支持 | 适用场景 | 性能影响 |
|------------|--------|----------|---------|---------|
| 组件级计算缓存 | 低 | 无 | 重复计算优化 | 减少50-70%计算时间 |
| 组件状态本地存储 | 低 | 高 | 用户偏好/设置 | 提升用户体验连续性 |
| 服务级通用缓存 | 中 | 可选 | API响应/计算结果 | 减少40-60%请求数量 |
| 全局状态存储 | 高 | 高 | 应用全局状态 | 改善跨组件数据共享 |
| RxJS状态缓存 | 中 | 可选 | 轻量应用状态 | 结合响应式流的高效状态管理 |
| 基于事件缓存失效 | 低 | 可选 | 关联数据缓存 | 精确控制缓存生命周期 |

## 数据预加载

数据预加载是提升应用性能和用户体验的重要技术，通过预先获取可能需要的数据，减少用户等待时间。

### 路由预加载策略

Angular路由系统支持预加载功能模块：

```typescript
// app-routing.module.ts
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // 预加载所有懒加载模块
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// 自定义预加载策略
@Injectable()
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // 仅预加载标记了data.preload = true的路由
    return route.data && route.data.preload ? load() : of(null);
  }
}

// 在模块中注册自定义策略
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: SelectivePreloadingStrategy
    })
  ],
  providers: [SelectivePreloadingStrategy],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// 在路由中使用预加载标记
const routes: Routes = [
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    data: { preload: true } 
  },
  { 
    path: 'reports', 
    loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule),
    data: { preload: false } 
  }
];
```

### 预加载解析器

使用路由解析器预加载组件所需数据：

```typescript
// product-resolver.service.ts
@Injectable({
  providedIn: 'root'
})
export class ProductResolver implements Resolve<Product[]> {
  constructor(private productService: ProductService) {}
  
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Product[]> {
    return this.productService.getProducts().pipe(
      catchError(error => {
        console.error('加载产品数据失败', error);
        return of([]); // 出错时返回空数组
      })
    );
  }
}

// 在路由中使用解析器
const routes: Routes = [
  {
    path: 'products',
    component: ProductListComponent,
    resolve: {
      products: ProductResolver
    }
  }
];

// 在组件中访问预加载数据
@Component({/* ... */})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  
  constructor(private route: ActivatedRoute) {}
  
  ngOnInit() {
    // 从路由数据中获取预加载的产品
    this.route.data.subscribe(data => {
      this.products = data.products;
    });
  }
}
```

### 智能预加载服务

根据用户行为和应用状态预测并预加载数据：

```typescript
// preload.service.ts
@Injectable({
  providedIn: 'root'
})
export class PreloadService {
  private preloadedData = new Map<string, any>();
  private preloadSubscriptions = new Map<string, Subscription>();
  
  constructor(private router: Router, private http: HttpClient) {
    // 监听路由事件
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // 根据当前路由预测可能的下一个路由
      this.predictAndPreload(event.urlAfterRedirects);
    });
  }
  
  /**
   * 预加载特定URL的数据
   */
  preloadData(apiUrl: string, key: string = apiUrl): Observable<any> {
    // 检查是否已经预加载
    if (this.preloadedData.has(key)) {
      // 已预加载，使用缓存数据
      const data = this.preloadedData.get(key);
      // 清除预加载数据以避免内存泄漏
      this.preloadedData.delete(key);
      return of(data);
    }
    
    // 尚未预加载，发起请求
    return this.http.get(apiUrl);
  }
  
  /**
   * 触发数据预加载
   */
  triggerPreload(apiUrl: string, key: string = apiUrl): void {
    // 避免重复预加载
    if (this.preloadSubscriptions.has(key)) {
      return;
    }
    
    // 开始预加载
    const subscription = this.http.get(apiUrl).pipe(
      take(1)
    ).subscribe({
      next: (data) => {
        this.preloadedData.set(key, data);
        this.preloadSubscriptions.delete(key);
      },
      error: () => {
        this.preloadSubscriptions.delete(key);
      }
    });
    
    this.preloadSubscriptions.set(key, subscription);
  }
  
  /**
   * 取消特定预加载
   */
  cancelPreload(key: string): void {
    if (this.preloadSubscriptions.has(key)) {
      const subscription = this.preloadSubscriptions.get(key);
      subscription?.unsubscribe();
      this.preloadSubscriptions.delete(key);
    }
  }
  
  /**
   * 取消所有预加载
   */
  cancelAllPreloads(): void {
    this.preloadSubscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.preloadSubscriptions.clear();
  }
  
  /**
   * 根据当前路由预测下一个路由并预加载数据
   */
  private predictAndPreload(currentUrl: string): void {
    // 举例：如果用户在产品列表页，预加载畅销产品详情
    if (currentUrl.includes('/products')) {
      this.triggerPreload('/api/products/top-selling', 'top-selling-products');
    }
    
    // 如果用户在用户资料页，预加载订单历史
    if (currentUrl.includes('/profile')) {
      this.triggerPreload('/api/orders/recent', 'recent-orders');
    }
    
    // 可以基于更复杂的用户行为分析实现更智能的预测策略
  }
}

// 在组件中使用预加载服务
@Component({/* ... */})
export class ProductComponent implements OnInit {
  products: Product[] = [];
  
  constructor(private preloadService: PreloadService) {}
  
  ngOnInit() {
    // 使用预加载服务获取数据
    this.preloadService.preloadData('/api/products').subscribe(data => {
      this.products = data;
    });
  }
  
  // 当用户悬停在产品上时，预加载产品详情
  onProductHover(productId: number): void {
    this.preloadService.triggerPreload(
      `/api/products/${productId}/details`,
      `product-${productId}`
    );
  }
}
```

### 交互式预加载

基于用户交互预加载数据：

```typescript
// 指令方式实现交互式预加载
@Directive({
  selector: '[appPreloadOnHover]'
})
export class PreloadOnHoverDirective {
  private preloadTriggered = false;
  
  @Input('appPreloadOnHover') preloadUrl!: string;
  @Input() preloadDelay = 300; // 默认延迟300ms
  @Input() preloadKey?: string;
  
  private timerRef: any = null;
  
  constructor(
    private el: ElementRef,
    private preloadService: PreloadService
  ) {}
  
  @HostListener('mouseenter')
  onMouseEnter(): void {
    // 避免重复触发
    if (this.preloadTriggered) {
      return;
    }
    
    // 设置延迟，防止用户快速划过时触发不必要的预加载
    this.timerRef = setTimeout(() => {
      if (this.preloadUrl) {
        this.preloadService.triggerPreload(
          this.preloadUrl,
          this.preloadKey || this.preloadUrl
        );
        this.preloadTriggered = true;
      }
    }, this.preloadDelay);
  }
  
  @HostListener('mouseleave')
  onMouseLeave(): void {
    // 清除定时器
    if (this.timerRef) {
      clearTimeout(this.timerRef);
      this.timerRef = null;
    }
  }
  
  ngOnDestroy(): void {
    if (this.timerRef) {
      clearTimeout(this.timerRef);
    }
  }
}

// 在模板中使用指令
@Component({
  selector: 'app-product-list',
  template: `
    <div class="products">
      <div *ngFor="let product of products" 
           [appPreloadOnHover]="'/api/products/' + product.id + '/details'"
           [preloadKey]="'product-' + product.id"
           [preloadDelay]="200"
           class="product-card"
           [routerLink]="['/products', product.id]">
        
        <h3>{{ product.name }}</h3>
        <p>{{ product.price | currency }}</p>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  
  constructor(private productService: ProductService) {}
  
  ngOnInit() {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
    });
  }
}
```

### 滚动预加载

在用户滚动时预加载即将进入视口的内容：

```typescript
// scroll-preload.directive.ts
@Directive({
  selector: '[appScrollPreload]'
})
export class ScrollPreloadDirective implements AfterViewInit, OnDestroy {
  @Input('appScrollPreload') preloadUrl!: string;
  @Input() preloadThreshold = 200; // 元素距离视口多远时触发预加载
  @Input() preloadKey?: string;
  
  private observer: IntersectionObserver | null = null;
  private preloadTriggered = false;
  
  constructor(
    private el: ElementRef,
    private preloadService: PreloadService
  ) {}
  
  ngAfterViewInit() {
    // 创建IntersectionObserver监视元素
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          // 当元素接近视口时
          if (entry.isIntersecting && !this.preloadTriggered) {
            // 触发预加载
            this.preloadService.triggerPreload(
              this.preloadUrl,
              this.preloadKey || this.preloadUrl
            );
            this.preloadTriggered = true;
            
            // 已触发预加载，停止观察
            this.observer?.unobserve(this.el.nativeElement);
          }
        });
      },
      {
        rootMargin: `${this.preloadThreshold}px`,
        threshold: 0
      }
    );
    
    // 开始观察元素
    this.observer.observe(this.el.nativeElement);
  }
  
  ngOnDestroy() {
    // 清理observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// 在长列表中使用滚动预加载
@Component({
  selector: 'app-product-catalog',
  template: `
    <div class="catalog">
      <div *ngFor="let category of categories; let i = index"
           [appScrollPreload]="'/api/products/category/' + category.id"
           [preloadKey]="'category-' + category.id"
           [preloadThreshold]="300"
           class="category-section">
        
        <h2>{{ category.name }}</h2>
        <app-product-grid [categoryId]="category.id"></app-product-grid>
      </div>
    </div>
  `
})
export class ProductCatalogComponent implements OnInit {
  categories: Category[] = [];
  
  constructor(private categoryService: CategoryService) {}
  
  ngOnInit() {
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }
}
```

### 预加载策略比较

| 预加载策略 | 优点 | 缺点 | 适用场景 |
|-----------|-----|------|---------|
| 路由预加载 | 集成Angular路由系统，配置简单 | 仅支持模块级预加载 | 整体应用架构优化 |
| 路由解析器 | 保证数据在组件初始化前加载完毕 | 页面跳转时会等待数据加载 | 关键页面初始数据 |
| 智能预测预加载 | 基于用户行为智能预加载 | 可能浪费带宽加载不需要的数据 | 具有典型用户路径的应用 |
| 交互式预加载 | 根据用户兴趣加载，精准度高 | 需在UI中添加额外逻辑 | 导航密集型界面 |
| 滚动预加载 | 适合长列表和无限滚动场景 | 依赖IntersectionObserver API | 内容密集型应用 |

### 预加载最佳实践

1. **优先级策略**：
   - 优先预加载核心交互路径上的数据
   - 根据用户角色和权限调整预加载内容
   - 考虑网络条件和设备性能动态调整预加载策略

2. **避免过量预加载**：
   - 限制同时预加载的请求数量
   - 监控预加载流量和命中率
   - 根据用户行为模式定期优化预加载策略

3. **与缓存结合**：
   - 预加载数据应与HTTP缓存和服务缓存协同工作
   - 使用TTL策略避免预加载过期数据
   - 清理未使用的预加载数据以避免内存泄漏

4. **自适应预加载**：
   - 根据网络状况调整预加载行为
   - 在高速网络环境下更激进地预加载
   - 在低速或计量网络中减少或禁用预加载