---
title: permission-control
createTime: 2025/03/30 09:35:31
permalink: /article/pw584ec4/
---
# Angular权限控制系统

在企业级应用程序中，权限控制是确保安全性和合规性的关键组成部分。一个设计良好的权限控制系统不仅能够限制用户只能访问其有权限的功能和数据，还能在用户界面层面提供一致且直观的体验。本文档详细介绍Angular应用中权限控制的实现方法、最佳实践和常见模式。

## 目录

- [基于角色的访问控制](#基于角色的访问控制)
  - [RBAC模型设计](#rbac模型设计)
  - [核心服务实现](#核心服务实现)
  - [路由守卫实现](#路由守卫实现)
  - [权限指令](#权限指令)
  - [角色优先级与继承](#角色优先级与继承)
  - [测试RBAC实现](#测试rbac实现)
  - [RBAC最佳实践](#rbac最佳实践)
- [功能权限系统](#功能权限系统)
  - [功能权限模型](#功能权限模型)
  - [功能权限数据模型](#功能权限数据模型)
  - [分层的权限服务](#分层的权限服务)
  - [功能权限指令](#功能权限指令)
  - [功能权限路由守卫](#功能权限路由守卫)
  - [权限矩阵配置](#权限矩阵配置)
  - [动态生成权限控制界面](#动态生成权限控制界面)
  - [功能权限最佳实践](#功能权限最佳实践)
- [数据权限实现](#数据权限实现)
  - [数据权限模型](#数据权限模型)
  - [行级数据权限接口](#行级数据权限接口)
  - [数据权限服务](#数据权限服务)
  - [HTTP拦截器实现](#http拦截器实现)
  - [字段级权限指令](#字段级权限指令)
  - [应用数据权限](#应用数据权限)
  - [后端数据权限实现](#后端数据权限实现)
  - [数据权限最佳实践](#数据权限最佳实践)
- [动态权限策略](#动态权限策略)
  - [动态权限模型](#动态权限模型)
  - [基础架构实现](#基础架构实现)
  - [动态权限服务实现](#动态权限服务实现)
  - [条件评估器实现](#条件评估器实现)
  - [权限装饰器](#权限装饰器)
  - [动态权限守卫](#动态权限守卫)
  - [动态权限指令](#动态权限指令)
  - [权限管理界面](#权限管理界面)
  - [动态权限最佳实践](#动态权限最佳实践)
- [总结](#总结)

## 基于角色的访问控制

基于角色的访问控制(Role-Based Access Control, RBAC)是企业应用中最常用的权限模型，通过将权限分配给角色，再将角色分配给用户，实现权限的集中管理和灵活分配。

### RBAC模型设计

RBAC模型通常包含以下核心组件：

```ascii
RBAC模型架构:
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│              │     │              │     │              │     │              │
│    用户      │────▶│    角色      │────▶│    权限      │────▶│   资源/操作   │
│  (Users)     │     │  (Roles)     │     │(Permissions) │     │(Resources)   │
│              │     │              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       1:N                 1:N                  1:N                   
```

### 核心服务实现

在Angular应用中实现RBAC，首先需要创建一个权限服务：

```typescript
// permission.model.ts
export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  username: string;
  roles: Role[];
  // 其他用户信息
}

// permission.service.ts
@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private currentUser: User | null = null;
  private userRoles: string[] = [];
  private userPermissions: string[] = [];
  
  constructor(private authService: AuthService) {
    // 从认证服务获取用户信息
    this.authService.currentUser$.pipe(
      filter(user => !!user)
    ).subscribe(user => {
      this.currentUser = user;
      this.updatePermissions();
    });
  }
  
  /**
   * 更新用户权限集合
   */
  private updatePermissions(): void {
    if (!this.currentUser) {
      this.userRoles = [];
      this.userPermissions = [];
      return;
    }
    
    // 提取所有角色ID
    this.userRoles = this.currentUser.roles.map(role => role.id);
    
    // 提取所有权限并去重
    const permissionSet = new Set<string>();
    this.currentUser.roles.forEach(role => {
      role.permissions.forEach(permission => {
        permissionSet.add(permission.id);
      });
    });
    
    this.userPermissions = Array.from(permissionSet);
  }
  
  /**
   * 检查用户是否拥有指定角色
   */
  hasRole(roleId: string): boolean {
    return this.userRoles.includes(roleId);
  }
  
  /**
   * 检查用户是否拥有任意一个指定角色
   */
  hasAnyRole(roleIds: string[]): boolean {
    return roleIds.some(roleId => this.hasRole(roleId));
  }
  
  /**
   * 检查用户是否拥有所有指定角色
   */
  hasAllRoles(roleIds: string[]): boolean {
    return roleIds.every(roleId => this.hasRole(roleId));
  }
  
  /**
   * 检查用户是否拥有指定权限
   */
  hasPermission(permissionId: string): boolean {
    return this.userPermissions.includes(permissionId);
  }
  
  /**
   * 检查用户是否拥有任意一个指定权限
   */
  hasAnyPermission(permissionIds: string[]): boolean {
    return permissionIds.some(permissionId => this.hasPermission(permissionId));
  }
  
  /**
   * 检查用户是否拥有所有指定权限
   */
  hasAllPermissions(permissionIds: string[]): boolean {
    return permissionIds.every(permissionId => this.hasPermission(permissionId));
  }
}
```

### 路由守卫实现

使用角色权限控制路由访问：

```typescript
// role-guard.service.ts
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private permissionService: PermissionService
  ) {}
  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // 从路由数据中获取所需角色
    const requiredRoles = next.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // 没有指定角色要求，允许访问
    }
    
    // 检查用户是否拥有所需角色
    const hasRequiredRole = this.permissionService.hasAnyRole(requiredRoles);
    
    if (!hasRequiredRole) {
      // 重定向到无权限页面
      this.router.navigate(['/forbidden']);
      return false;
    }
    
    return true;
  }
}

// permission-guard.service.ts
@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private router: Router,
    private permissionService: PermissionService
  ) {}
  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // 从路由数据中获取所需权限
    const requiredPermissions = next.data['permissions'] as string[];
    
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // 没有指定权限要求，允许访问
    }
    
    // 检查用户是否拥有所需权限
    const hasRequiredPermission = this.permissionService.hasAllPermissions(requiredPermissions);
    
    if (!hasRequiredPermission) {
      // 重定向到无权限页面
      this.router.navigate(['/forbidden']);
      return false;
    }
    
    return true;
  }
}
```

在路由配置中使用守卫：

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] } // 只允许管理员访问
  },
  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['VIEW_REPORTS'] } // 需要查看报表权限
  },
  {
    path: 'users',
    component: UserManagementComponent,
    canActivate: [PermissionGuard],
    data: { permissions: ['MANAGE_USERS'] } // 需要管理用户权限
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent
  }
];
```

### 权限指令

创建自定义指令以基于角色/权限控制UI元素的显示：

```typescript
// has-permission.directive.ts
@Directive({
  selector: '[appHasPermission]'
})
export class HasPermissionDirective implements OnInit {
  @Input('appHasPermission') permission: string | string[] = [];
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}
  
  ngOnInit(): void {
    this.updateView();
    
    // 监听权限变化
    this.permissionService.permissionsChanged$.subscribe(() => {
      this.updateView();
    });
  }
  
  private updateView(): void {
    this.viewContainer.clear();
    
    const permissions = Array.isArray(this.permission) 
      ? this.permission 
      : [this.permission];
    
    if (this.permissionService.hasAnyPermission(permissions)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}

// has-role.directive.ts
@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit {
  @Input('appHasRole') role: string | string[] = [];
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}
  
  ngOnInit(): void {
    this.updateView();
    
    // 监听角色变化
    this.permissionService.rolesChanged$.subscribe(() => {
      this.updateView();
    });
  }
  
  private updateView(): void {
    this.viewContainer.clear();
    
    const roles = Array.isArray(this.role) ? this.role : [this.role];
    
    if (this.permissionService.hasAnyRole(roles)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
```

在模板中使用这些指令：

```html
<!-- 基于权限控制按钮的显示 -->
<button *appHasPermission="'CREATE_USER'" (click)="createUser()">创建用户</button>

<!-- 基于角色控制菜单项的显示 -->
<li *appHasRole="'ADMIN'">
  <a routerLink="/admin">管理控制台</a>
</li>

<!-- 多权限组合 -->
<div *appHasPermission="['EDIT_REPORT', 'DELETE_REPORT']">
  <button (click)="editReport()">编辑报表</button>
  <button (click)="deleteReport()">删除报表</button>
</div>
```

### 角色优先级与继承

在复杂系统中，角色可能存在继承关系和优先级：

```typescript
// 扩展角色模型支持继承
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  parentRoles?: string[]; // 父角色ID
  priority: number; // 优先级，数字越大优先级越高
}

// 修改权限服务以支持角色继承
@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  // ... 其他代码
  
  /**
   * 获取所有角色，包括继承的角色
   */
  private getAllRolesWithInheritance(): Role[] {
    if (!this.currentUser) {
      return [];
    }
    
    // 创建角色映射便于查找
    const roleMap = new Map<string, Role>();
    this.currentUser.roles.forEach(role => {
      roleMap.set(role.id, role);
    });
    
    // 递归获取父角色
    const processInheritance = (roleIds: string[]): Role[] => {
      const result: Role[] = [];
      
      roleIds.forEach(roleId => {
        const role = roleMap.get(roleId);
        if (role) {
          result.push(role);
          
          if (role.parentRoles && role.parentRoles.length > 0) {
            // 递归获取父角色
            const parentRoles = processInheritance(role.parentRoles);
            result.push(...parentRoles);
          }
        }
      });
      
      return result;
    };
    
    const allRoles = processInheritance(this.userRoles);
    
    // 去重并按优先级排序
    return Array.from(new Map(allRoles.map(r => [r.id, r])).values())
      .sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * 更新权限时考虑角色继承
   */
  private updatePermissions(): void {
    if (!this.currentUser) {
      this.userRoles = [];
      this.userPermissions = [];
      return;
    }
    
    // 获取直接分配的角色ID
    this.userRoles = this.currentUser.roles.map(role => role.id);
    
    // 获取所有角色（包括继承的）
    const allRoles = this.getAllRolesWithInheritance();
    
    // 提取所有权限并去重
    const permissionSet = new Set<string>();
    allRoles.forEach(role => {
      role.permissions.forEach(permission => {
        permissionSet.add(permission.id);
      });
    });
    
    this.userPermissions = Array.from(permissionSet);
  }
}
```

### 测试RBAC实现

编写单元测试确保权限系统正常工作：

```typescript
// permission.service.spec.ts
describe('PermissionService', () => {
  let service: PermissionService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  
  const mockUser: User = {
    id: '1',
    username: 'testuser',
    roles: [
      {
        id: 'MANAGER',
        name: '经理',
        permissions: [
          { id: 'VIEW_REPORTS', name: '查看报表' },
          { id: 'EDIT_REPORTS', name: '编辑报表' }
        ],
        priority: 2
      }
    ]
  };
  
  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', [''], {
      currentUser$: new BehaviorSubject<User | null>(null)
    });
    
    TestBed.configureTestingModule({
      providers: [
        PermissionService,
        { provide: AuthService, useValue: spy }
      ]
    });
    
    service = TestBed.inject(PermissionService);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  
  it('should have no permissions when no user is logged in', () => {
    expect(service.hasPermission('VIEW_REPORTS')).toBeFalse();
    expect(service.hasRole('MANAGER')).toBeFalse();
  });
  
  it('should update permissions when user logs in', () => {
    // 模拟用户登录
    (authServiceSpy.currentUser$ as BehaviorSubject<User | null>).next(mockUser);
    
    // 验证权限更新
    expect(service.hasRole('MANAGER')).toBeTrue();
    expect(service.hasPermission('VIEW_REPORTS')).toBeTrue();
    expect(service.hasPermission('EDIT_REPORTS')).toBeTrue();
    expect(service.hasPermission('DELETE_REPORTS')).toBeFalse();
  });
  
  it('should check for any permission correctly', () => {
    (authServiceSpy.currentUser$ as BehaviorSubject<User | null>).next(mockUser);
    
    expect(service.hasAnyPermission(['VIEW_REPORTS', 'DELETE_REPORTS'])).toBeTrue();
    expect(service.hasAnyPermission(['CREATE_USER', 'DELETE_REPORTS'])).toBeFalse();
  });
  
  it('should check for all permissions correctly', () => {
    (authServiceSpy.currentUser$ as BehaviorSubject<User | null>).next(mockUser);
    
    expect(service.hasAllPermissions(['VIEW_REPORTS', 'EDIT_REPORTS'])).toBeTrue();
    expect(service.hasAllPermissions(['VIEW_REPORTS', 'DELETE_REPORTS'])).toBeFalse();
  });
});
```

### RBAC最佳实践

1. **粒度控制**：角色应该具有适当的粒度，既不要过于细碎也不要过于宽泛

2. **最小权限原则**：为用户分配完成工作所需的最小权限集

3. **职责分离**：关键操作可能需要多个角色共同参与，以防止权力滥用

4. **角色层次结构**：设计清晰的角色层次结构，避免权限重叠和混乱

5. **定期审计**：定期审查角色和权限分配，确保符合安全策略

6. **缓存策略**：权限检查是高频操作，应考虑合适的缓存策略提高性能

## 功能权限系统

功能权限系统是基于角色权限控制的精细化扩展，允许在应用程序的特定功能、模块或操作级别上实施细粒度的权限控制。与RBAC相比，功能权限更加灵活，能够满足复杂企业应用的精确授权需求。

### 功能权限模型

功能权限系统通常基于以下层次结构：

```ascii
功能权限层次结构:
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                            应用程序                                       │
│                               │                                          │
│                               ▼                                          │
│           ┌─────────────┬─────────────┬─────────────┬─────────────┐     │
│           │             │             │             │             │     │
│           ▼             ▼             ▼             ▼             ▼     │
│        模块1          模块2          模块3         模块4          模块5   │
│           │             │             │                                 │
│           ▼             ▼             ▼                                 │
│    ┌─────────────┐┌─────────────┐┌─────────────┐                        │
│    │             ││             ││             │                        │
│    │   功能1-1   ││   功能2-1   ││   功能3-1   │                        │
│    │             ││             ││             │                        │
│    └─────────────┘└─────────────┘└─────────────┘                        │
│           │                                                             │
│           ▼                                                             │
│    ┌─────────────┐                                                      │
│    │             │                                                      │
│    │   操作1-1-1 │                                                      │
│    │             │                                                      │
│    └─────────────┘                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 功能权限数据模型

创建一个更细粒度的权限数据模型：

```typescript
// feature-permission.model.ts
export enum PermissionType {
  MODULE = 'MODULE',
  FEATURE = 'FEATURE',
  OPERATION = 'OPERATION'
}

export interface FeaturePermission {
  id: string;
  name: string;
  code: string; // 权限唯一编码，如'user:create'
  type: PermissionType;
  parentId?: string; // 父级权限ID
  description?: string;
}

export interface PermissionGroup {
  id: string;
  name: string;
  permissions: FeaturePermission[];
}

export interface RoleWithFeaturePermissions {
  id: string;
  name: string;
  permissionGroups: PermissionGroup[];
  permissions: FeaturePermission[]; // 直接分配的权限
}
```

### 分层的权限服务

实现分层的功能权限服务：

```typescript
// feature-permission.service.ts
@Injectable({
  providedIn: 'root'
})
export class FeaturePermissionService {
  private permissionMap = new Map<string, FeaturePermission>();
  private permissionCodeMap = new Map<string, FeaturePermission>();
  private userPermissions: string[] = []; // 权限ID集合
  private userPermissionCodes: string[] = []; // 权限编码集合
  
  constructor(private authService: AuthService) {
    // 加载当前用户的权限
    this.authService.currentUser$.pipe(
      filter(user => !!user),
      switchMap(user => this.loadUserPermissions(user!.id))
    ).subscribe({
      next: permissions => {
        this.processPermissions(permissions);
      }
    });
  }
  
  /**
   * 加载用户权限
   */
  private loadUserPermissions(userId: string): Observable<FeaturePermission[]> {
    // 通常从API获取用户权限
    return this.http.get<FeaturePermission[]>(`/api/users/${userId}/permissions`);
  }
  
  /**
   * 处理权限数据
   */
  private processPermissions(permissions: FeaturePermission[]): void {
    // 重置映射
    this.permissionMap.clear();
    this.permissionCodeMap.clear();
    
    // 创建权限映射
    permissions.forEach(perm => {
      this.permissionMap.set(perm.id, perm);
      this.permissionCodeMap.set(perm.code, perm);
    });
    
    // 提取权限ID和编码
    this.userPermissions = permissions.map(p => p.id);
    this.userPermissionCodes = permissions.map(p => p.code);
    
    // 通知权限变更
    this.permissionsChanged.next();
  }
  
  /**
   * 权限变更通知
   */
  private permissionsChanged = new Subject<void>();
  permissionsChanged$ = this.permissionsChanged.asObservable();
  
  /**
   * 检查用户是否拥有指定权限ID
   */
  hasPermission(permissionId: string): boolean {
    return this.userPermissions.includes(permissionId);
  }
  
  /**
   * 基于权限编码检查权限
   */
  hasPermissionByCode(code: string): boolean {
    return this.userPermissionCodes.includes(code);
  }
  
  /**
   * 检查用户是否拥有指定资源的操作权限
   * 例如：hasPermissionFor('user', 'create')
   */
  hasPermissionFor(resource: string, action: string): boolean {
    return this.hasPermissionByCode(`${resource}:${action}`);
  }
  
  /**
   * 检查用户是否拥有模块权限
   */
  hasModulePermission(moduleCode: string): boolean {
    // 检查模块级权限或子功能权限
    if (this.hasPermissionByCode(moduleCode)) {
      return true;
    }
    
    // 如果有以模块代码为前缀的任何权限，也视为有模块权限
    return this.userPermissionCodes.some(code => 
      code.startsWith(`${moduleCode}:`)
    );
  }
  
  /**
   * 获取用户在指定模块中的所有权限
   */
  getModulePermissions(moduleCode: string): FeaturePermission[] {
    return Array.from(this.permissionCodeMap.values())
      .filter(p => p.code === moduleCode || p.code.startsWith(`${moduleCode}:`));
  }
}
```

### 功能权限指令

创建对功能权限的特定指令：

```typescript
// has-feature-permission.directive.ts
@Directive({
  selector: '[appHasFeaturePermission]'
})
export class HasFeaturePermissionDirective implements OnInit {
  @Input('appHasFeaturePermission') permission: string = '';
  @Input('appHasFeaturePermissionResource') resource?: string;
  @Input('appHasFeaturePermissionAction') action?: string;
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: FeaturePermissionService
  ) {}
  
  ngOnInit(): void {
    this.updateView();
  }
  
  private updateView(): void {
    this.viewContainer.clear();
    
    let hasPermission = false;
    
    if (this.resource && this.action) {
      // 资源:操作 格式的权限检查
      hasPermission = this.permissionService.hasPermissionFor(
        this.resource, this.action
      );
    } else {
      // 直接使用权限编码
      hasPermission = this.permissionService.hasPermissionByCode(this.permission);
    }
    
    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
```

使用功能权限指令：

```html
<!-- 直接使用权限代码 -->
<button *appHasFeaturePermission="'user:create'">创建用户</button>

<!-- 资源+操作方式 -->
<button 
  *appHasFeaturePermission
  [appHasFeaturePermissionResource]="'user'"
  [appHasFeaturePermissionAction]="'delete'">
  删除用户
</button>

<!-- 检查模块权限 -->
<div *appHasFeaturePermission="'reports'">
  <!-- 报表模块内容 -->
</div>
```

### 功能权限路由守卫

创建功能权限路由守卫：

```typescript
// feature-permission-guard.service.ts
@Injectable({
  providedIn: 'root'
})
export class FeaturePermissionGuard implements CanActivate {
  constructor(
    private router: Router,
    private permissionService: FeaturePermissionService
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // 获取所需权限
    const requiredPermission = route.data['permission'] as string;
    const requiredResource = route.data['resource'] as string;
    const requiredAction = route.data['action'] as string;
    
    let hasAccess = false;
    
    if (requiredPermission) {
      // 使用完整权限代码
      hasAccess = this.permissionService.hasPermissionByCode(requiredPermission);
    } else if (requiredResource && requiredAction) {
      // 使用资源和操作组合
      hasAccess = this.permissionService.hasPermissionFor(
        requiredResource, requiredAction
      );
    } else if (requiredResource) {
      // 仅检查模块访问权限
      hasAccess = this.permissionService.hasModulePermission(requiredResource);
    } else {
      // 没有权限要求
      hasAccess = true;
    }
    
    if (!hasAccess) {
      this.router.navigate(['/forbidden']);
      return false;
    }
    
    return true;
  }
}
```

在路由中使用功能权限守卫：

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'users',
    component: UserListComponent,
    canActivate: [FeaturePermissionGuard],
    data: { resource: 'user', action: 'view' } // 需要user:view权限
  },
  {
    path: 'users/new',
    component: UserFormComponent,
    canActivate: [FeaturePermissionGuard],
    data: { permission: 'user:create' } // 需要user:create权限
  },
  {
    path: 'reports',
    component: ReportDashboardComponent,
    canActivate: [FeaturePermissionGuard],
    data: { resource: 'reports' } // 只要有reports模块的任何权限即可访问
  }
];
```

### 权限矩阵配置

对于复杂应用，可以使用权限矩阵来统一管理功能权限：

```typescript
// permission-matrix.config.ts
export const PERMISSION_MATRIX = {
  user: {
    module: { code: 'user', name: '用户管理' },
    operations: [
      { code: 'view', name: '查看用户' },
      { code: 'create', name: '创建用户' },
      { code: 'edit', name: '编辑用户' },
      { code: 'delete', name: '删除用户' }
    ]
  },
  role: {
    module: { code: 'role', name: '角色管理' },
    operations: [
      { code: 'view', name: '查看角色' },
      { code: 'create', name: '创建角色' },
      { code: 'edit', name: '编辑角色' },
      { code: 'delete', name: '删除角色' },
      { code: 'assign', name: '分配权限' }
    ]
  },
  reports: {
    module: { code: 'reports', name: '报表中心' },
    operations: [
      { code: 'view', name: '查看报表' },
      { code: 'export', name: '导出报表' },
      { code: 'create', name: '创建报表' },
      { code: 'schedule', name: '计划报表' }
    ]
  }
};

// 扩展权限服务以使用权限矩阵
@Injectable({
  providedIn: 'root'
})
export class PermissionMatrixService {
  constructor(private permissionService: FeaturePermissionService) {}
  
  /**
   * 获取权限矩阵
   */
  getPermissionMatrix() {
    return PERMISSION_MATRIX;
  }
  
  /**
   * 检查用户是否有模块的特定操作权限
   */
  hasOperation(module: string, operation: string): boolean {
    const permissionCode = `${module}:${operation}`;
    return this.permissionService.hasPermissionByCode(permissionCode);
  }
  
  /**
   * 获取用户在模块中的所有可用操作
   */
  getUserOperationsForModule(module: string): string[] {
    const modulePermissions = this.permissionService.getModulePermissions(module);
    
    // 提取操作代码
    return modulePermissions
      .filter(p => p.code.startsWith(`${module}:`))
      .map(p => p.code.split(':')[1]);
  }
  
  /**
   * 检查是否显示整个模块
   */
  shouldShowModule(module: string): boolean {
    // 如果有模块的任何权限，则显示模块
    return this.permissionService.hasModulePermission(module);
  }
}
```

使用权限矩阵服务：

```typescript
// sidebar.component.ts
@Component({
  selector: 'app-sidebar',
  template: `
    <ul class="nav-menu">
      <li *ngIf="permissionMatrix.shouldShowModule('user')">
        <a routerLink="/users">用户管理</a>
        <ul class="submenu">
          <li *ngIf="permissionMatrix.hasOperation('user', 'create')">
            <a routerLink="/users/new">新建用户</a>
          </li>
        </ul>
      </li>
      <li *ngIf="permissionMatrix.shouldShowModule('role')">
        <a routerLink="/roles">角色管理</a>
      </li>
      <li *ngIf="permissionMatrix.shouldShowModule('reports')">
        <a routerLink="/reports">报表中心</a>
      </li>
    </ul>
  `
})
export class SidebarComponent {
  constructor(public permissionMatrix: PermissionMatrixService) {}
}
```

### 动态生成权限控制界面

创建权限管理界面：

```typescript
// permission-management.component.ts
@Component({
  selector: 'app-permission-management',
  template: `
    <div class="permission-matrix">
      <h2>权限配置</h2>
      
      <div *ngFor="let module of moduleKeys" class="module-section">
        <h3>{{ getModuleName(module) }}</h3>
        
        <div class="operations">
          <div *ngFor="let op of getModuleOperations(module)" class="operation">
            <label>
              <input type="checkbox" 
                     [checked]="isPermissionAssigned(module, op.code)"
                     (change)="togglePermission(module, op.code)">
              {{ op.name }}
            </label>
          </div>
        </div>
      </div>
      
      <div class="actions">
        <button (click)="savePermissions()">保存</button>
        <button (click)="cancel()">取消</button>
      </div>
    </div>
  `
})
export class PermissionManagementComponent implements OnInit {
  matrix = PERMISSION_MATRIX;
  moduleKeys: string[] = [];
  selectedPermissions: Set<string> = new Set();
  roleId: string;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService
  ) {
    this.roleId = this.route.snapshot.paramMap.get('id') || '';
  }
  
  ngOnInit() {
    this.moduleKeys = Object.keys(this.matrix);
    this.loadRolePermissions();
  }
  
  loadRolePermissions() {
    this.roleService.getRolePermissions(this.roleId).subscribe(permissions => {
      this.selectedPermissions = new Set(
        permissions.map(p => p.code)
      );
    });
  }
  
  getModuleName(moduleKey: string): string {
    return this.matrix[moduleKey].module.name;
  }
  
  getModuleOperations(moduleKey: string): any[] {
    return this.matrix[moduleKey].operations;
  }
  
  isPermissionAssigned(moduleKey: string, opCode: string): boolean {
    const permCode = `${moduleKey}:${opCode}`;
    return this.selectedPermissions.has(permCode);
  }
  
  togglePermission(moduleKey: string, opCode: string) {
    const permCode = `${moduleKey}:${opCode}`;
    
    if (this.selectedPermissions.has(permCode)) {
      this.selectedPermissions.delete(permCode);
    } else {
      this.selectedPermissions.add(permCode);
    }
  }
  
  savePermissions() {
    const permissions = Array.from(this.selectedPermissions);
    
    this.roleService.updateRolePermissions(this.roleId, permissions)
      .subscribe({
        next: () => {
          // 成功保存后导航回角色列表
          this.router.navigate(['/roles']);
        },
        error: (err) => {
          console.error('保存权限失败', err);
          // 显示错误信息
        }
      });
  }
  
  cancel() {
    this.router.navigate(['/roles']);
  }
}
```

### 功能权限最佳实践

1. **编码规范**：采用统一的权限编码格式（如`resource:action`），确保一致性

2. **缓存机制**：权限检查可能非常频繁，应该实施适当的缓存机制

3. **前后端一致**：确保前端和后端的权限检查逻辑保持一致

4. **可配置性**：让权限配置易于修改，避免硬编码

5. **性能优化**：对于复杂界面，考虑批量权限检查而非多次单独检查

6. **开发便利性**：提供开发模式工具，允许临时覆盖权限以便测试所有功能

## 数据权限实现

数据权限是权限控制的高级形式，它不仅控制用户对功能的访问，还限制用户只能访问和操作其有权限的数据。在企业应用中，数据权限通常更加复杂，需要结合业务规则、组织结构和用户角色来实现精细的数据访问控制。

### 数据权限模型

常见的数据权限模型包括：

```ascii
数据权限模型:
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                         用户/角色                                    │
│                            │                                        │
│              ┌─────────────┼─────────────┐                          │
│              │             │             │                          │
│              ▼             ▼             ▼                          │
│     ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│     │             │ │             │ │             │                │
│     │ 行级权限    │ │ 列级权限    │ │ 字段级权限  │                │
│     │ (记录过滤)  │ │ (列过滤)    │ │ (字段脱敏)  │                │
│     │             │ │             │ │             │                │
│     └─────────────┘ └─────────────┘ └─────────────┘                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 行级数据权限接口

首先定义数据权限的基本模型：

```typescript
// data-permission.model.ts
export enum DataScopeType {
  ALL = 'ALL',               // 全部数据
  CUSTOM = 'CUSTOM',         // 自定义数据
  DEPARTMENT = 'DEPARTMENT', // 部门数据
  DEPARTMENT_AND_BELOW = 'DEPARTMENT_AND_BELOW', // 部门及以下数据
  PERSONAL = 'PERSONAL',     // 个人数据
  NONE = 'NONE'              // 无权限
}

export interface DataPermissionRule {
  id: string;
  resourceType: string;      // 资源类型，如'user', 'order', 'product'
  dataScope: DataScopeType;  // 数据范围类型
  departments?: string[];    // 当dataScope为CUSTOM时的部门列表
  customSql?: string;        // 自定义SQL条件
  fieldPermissions?: FieldPermission[]; // 字段级权限
}

export interface FieldPermission {
  fieldName: string;         // 字段名称
  readable: boolean;         // 是否可读
  writable: boolean;         // 是否可写
  maskingType?: string;      // 脱敏类型
}
```

### 数据权限服务

实现数据权限服务：

```typescript
// data-permission.service.ts
@Injectable({
  providedIn: 'root'
})
export class DataPermissionService {
  private dataPermissionRules: Map<string, DataPermissionRule[]> = new Map();
  
  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    // 监听用户变化，重新加载数据权限
    this.authService.currentUser$.pipe(
      filter(user => !!user),
      switchMap(user => this.loadDataPermissions(user!.id))
    ).subscribe(rules => {
      this.processDataPermissionRules(rules);
    });
  }
  
  /**
   * 加载用户的数据权限规则
   */
  private loadDataPermissions(userId: string): Observable<DataPermissionRule[]> {
    return this.http.get<DataPermissionRule[]>(`/api/users/${userId}/data-permissions`);
  }
  
  /**
   * 处理数据权限规则
   */
  private processDataPermissionRules(rules: DataPermissionRule[]): void {
    // 按资源类型分组
    this.dataPermissionRules.clear();
    
    rules.forEach(rule => {
      if (!this.dataPermissionRules.has(rule.resourceType)) {
        this.dataPermissionRules.set(rule.resourceType, []);
      }
      
      this.dataPermissionRules.get(rule.resourceType)!.push(rule);
    });
  }
  
  /**
   * 获取特定资源的数据权限规则
   */
  getDataPermissionRules(resourceType: string): DataPermissionRule[] {
    return this.dataPermissionRules.get(resourceType) || [];
  }
  
  /**
   * 判断用户是否有指定资源的全部数据权限
   */
  hasAllDataPermission(resourceType: string): boolean {
    const rules = this.getDataPermissionRules(resourceType);
    return rules.some(rule => rule.dataScope === DataScopeType.ALL);
  }
  
  /**
   * 获取数据查询参数
   */
  getDataQueryParams(resourceType: string): any {
    const rules = this.getDataPermissionRules(resourceType);
    
    if (rules.length === 0) {
      return { dataScope: DataScopeType.NONE };
    }
    
    // 优先级：ALL > CUSTOM > DEPARTMENT_AND_BELOW > DEPARTMENT > PERSONAL > NONE
    const priorityOrder = [
      DataScopeType.ALL,
      DataScopeType.CUSTOM,
      DataScopeType.DEPARTMENT_AND_BELOW,
      DataScopeType.DEPARTMENT,
      DataScopeType.PERSONAL,
      DataScopeType.NONE
    ];
    
    // 按优先级排序
    rules.sort((a, b) => {
      return priorityOrder.indexOf(a.dataScope) - priorityOrder.indexOf(b.dataScope);
    });
    
    const highestRule = rules[0];
    
    // 构建查询参数
    const queryParams: any = {
      dataScope: highestRule.dataScope
    };
    
    if (highestRule.dataScope === DataScopeType.CUSTOM && highestRule.departments) {
      queryParams.departments = highestRule.departments;
    }
    
    return queryParams;
  }
  
  /**
   * 获取字段权限
   */
  getFieldPermissions(resourceType: string): { [field: string]: FieldPermission } {
    const rules = this.getDataPermissionRules(resourceType);
    const fieldPermissions: { [field: string]: FieldPermission } = {};
    
    rules.forEach(rule => {
      if (rule.fieldPermissions) {
        rule.fieldPermissions.forEach(fp => {
          // 如果字段已存在，取较严格的权限
          if (fieldPermissions[fp.fieldName]) {
            const existing = fieldPermissions[fp.fieldName];
            fieldPermissions[fp.fieldName] = {
              fieldName: fp.fieldName,
              readable: existing.readable && fp.readable,
              writable: existing.writable && fp.writable,
              maskingType: fp.maskingType || existing.maskingType
            };
          } else {
            fieldPermissions[fp.fieldName] = { ...fp };
          }
        });
      }
    });
    
    return fieldPermissions;
  }
  
  /**
   * 判断字段是否可读
   */
  isFieldReadable(resourceType: string, fieldName: string): boolean {
    const fieldPermissions = this.getFieldPermissions(resourceType);
    
    // 如果没有明确的字段权限，默认可读
    if (!fieldPermissions[fieldName]) {
      return true;
    }
    
    return fieldPermissions[fieldName].readable;
  }
  
  /**
   * 判断字段是否可写
   */
  isFieldWritable(resourceType: string, fieldName: string): boolean {
    const fieldPermissions = this.getFieldPermissions(resourceType);
    
    // 如果没有明确的字段权限，默认可写
    if (!fieldPermissions[fieldName]) {
      return true;
    }
    
    return fieldPermissions[fieldName].writable;
  }
  
  /**
   * 获取字段脱敏类型
   */
  getFieldMaskingType(resourceType: string, fieldName: string): string | undefined {
    const fieldPermissions = this.getFieldPermissions(resourceType);
    
    if (!fieldPermissions[fieldName]) {
      return undefined;
    }
    
    return fieldPermissions[fieldName].maskingType;
  }
}
```

### HTTP拦截器实现

实现数据权限HTTP拦截器，自动为请求添加数据权限参数：

```typescript
// data-permission.interceptor.ts
@Injectable()
export class DataPermissionInterceptor implements HttpInterceptor {
  // 需要添加数据权限的API路径前缀
  private readonly API_PATTERNS = [
    /^\/api\/users/,
    /^\/api\/orders/,
    /^\/api\/customers/
  ];
  
  // 资源类型映射
  private readonly RESOURCE_TYPE_MAP: { [pattern: string]: string } = {
    '^/api/users': 'user',
    '^/api/orders': 'order',
    '^/api/customers': 'customer'
  };
  
  constructor(private dataPermissionService: DataPermissionService) {}
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 只处理GET请求，其他类型请求通常有具体的权限控制
    if (request.method !== 'GET') {
      return next.handle(request);
    }
    
    // 判断是否需要添加数据权限参数
    const resourceType = this.getResourceType(request.url);
    
    if (!resourceType) {
      return next.handle(request);
    }
    
    // 获取数据权限参数
    const dataPermParams = this.dataPermissionService.getDataQueryParams(resourceType);
    
    // 克隆请求并添加数据权限参数
    const modifiedRequest = request.clone({
      params: this.addDataPermissionParams(request.params, dataPermParams)
    });
    
    return next.handle(modifiedRequest);
  }
  
  /**
   * 根据URL获取资源类型
   */
  private getResourceType(url: string): string | null {
    for (const pattern in this.RESOURCE_TYPE_MAP) {
      if (new RegExp(pattern).test(url)) {
        return this.RESOURCE_TYPE_MAP[pattern];
      }
    }
    
    return null;
  }
  
  /**
   * 添加数据权限参数
   */
  private addDataPermissionParams(params: HttpParams, dataPermParams: any): HttpParams {
    let newParams = params;
    
    for (const key in dataPermParams) {
      const value = dataPermParams[key];
      
      if (Array.isArray(value)) {
        // 数组参数
        value.forEach(item => {
          newParams = newParams.append(`${key}[]`, item);
        });
      } else {
        // 简单参数
        newParams = newParams.set(key, String(value));
      }
    }
    
    return newParams;
  }
}
```

### 字段级权限指令

创建用于控制字段显示和编辑的指令：

```typescript
// field-permission.directive.ts
@Directive({
  selector: '[appFieldPermission]'
})
export class FieldPermissionDirective implements OnInit {
  @Input('appFieldPermission') field: string = '';
  @Input('appFieldPermissionResource') resource: string = '';
  @Input('appFieldPermissionMode') mode: 'read' | 'write' = 'read';
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private dataPermissionService: DataPermissionService
  ) {}
  
  ngOnInit(): void {
    this.updateView();
  }
  
  private updateView(): void {
    this.viewContainer.clear();
    
    let hasPermission = false;
    
    if (this.mode === 'read') {
      hasPermission = this.dataPermissionService.isFieldReadable(
        this.resource, this.field
      );
    } else {
      hasPermission = this.dataPermissionService.isFieldWritable(
        this.resource, this.field
      );
    }
    
    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
```

创建用于字段脱敏的管道：

```typescript
// field-masking.pipe.ts
@Pipe({
  name: 'fieldMasking'
})
export class FieldMaskingPipe implements PipeTransform {
  constructor(private dataPermissionService: DataPermissionService) {}
  
  transform(value: string, resource: string, field: string): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    const maskingType = this.dataPermissionService.getFieldMaskingType(resource, field);
    
    if (!maskingType) {
      return value;
    }
    
    switch (maskingType) {
      case 'name':
        return this.maskName(value);
      case 'phone':
        return this.maskPhone(value);
      case 'email':
        return this.maskEmail(value);
      case 'idcard':
        return this.maskIdCard(value);
      case 'bankcard':
        return this.maskBankCard(value);
      case 'address':
        return this.maskAddress(value);
      default:
        return value;
    }
  }
  
  private maskName(name: string): string {
    if (name.length <= 1) {
      return name;
    }
    
    if (name.length === 2) {
      return name.charAt(0) + '*';
    }
    
    const firstChar = name.charAt(0);
    const lastChar = name.charAt(name.length - 1);
    const maskedMiddle = '*'.repeat(name.length - 2);
    
    return firstChar + maskedMiddle + lastChar;
  }
  
  private maskPhone(phone: string): string {
    if (phone.length <= 7) {
      return phone;
    }
    
    return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);
  }
  
  private maskEmail(email: string): string {
    const parts = email.split('@');
    if (parts.length !== 2) {
      return email;
    }
    
    const username = parts[0];
    const domain = parts[1];
    
    let maskedUsername = username;
    if (username.length > 2) {
      maskedUsername = username.substring(0, 2) + '*'.repeat(username.length - 2);
    }
    
    return maskedUsername + '@' + domain;
  }
  
  private maskIdCard(idCard: string): string {
    if (idCard.length <= 10) {
      return idCard;
    }
    
    const prefix = idCard.substring(0, 6);
    const suffix = idCard.substring(idCard.length - 4);
    const maskedMiddle = '*'.repeat(idCard.length - 10);
    
    return prefix + maskedMiddle + suffix;
  }
  
  private maskBankCard(bankCard: string): string {
    if (bankCard.length <= 8) {
      return bankCard;
    }
    
    const prefix = bankCard.substring(0, 4);
    const suffix = bankCard.substring(bankCard.length - 4);
    const maskedMiddle = '*'.repeat(bankCard.length - 8);
    
    return prefix + maskedMiddle + suffix;
  }
  
  private maskAddress(address: string): string {
    if (address.length <= 6) {
      return address;
    }
    
    const visiblePart = address.substring(0, 6);
    return visiblePart + '**********';
  }
}
```

### 应用数据权限

在组件中应用数据权限：

```typescript
// user-list.component.ts
@Component({
  selector: 'app-user-list',
  template: `
    <h2>用户列表</h2>
    
    <table class="users-table">
      <thead>
        <tr>
          <th>用户名</th>
          <!-- 只有可读电话号码字段的用户才能看到此列 -->
          <th *appFieldPermission="'phone'; resource: 'user'; mode: 'read'">电话号码</th>
          <th *appFieldPermission="'email'; resource: 'user'; mode: 'read'">电子邮件</th>
          <th>部门</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let user of users">
          <td>{{ user.username }}</td>
          <!-- 应用脱敏管道 -->
          <td *appFieldPermission="'phone'; resource: 'user'; mode: 'read'">
            {{ user.phone | fieldMasking:'user':'phone' }}
          </td>
          <td *appFieldPermission="'email'; resource: 'user'; mode: 'read'">
            {{ user.email | fieldMasking:'user':'email' }}
          </td>
          <td>{{ user.department }}</td>
          <td>
            <button *appHasPermission="'user:edit'" 
                    [disabled]="!canEdit(user)"
                    (click)="editUser(user)">
              编辑
            </button>
            <button *appHasPermission="'user:delete'"
                    [disabled]="!canDelete(user)"
                    (click)="deleteUser(user)">
              删除
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  
  constructor(
    private userService: UserService,
    private dataPermissionService: DataPermissionService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  loadUsers(): void {
    // userService会通过HTTP拦截器自动添加数据权限参数
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }
  
  canEdit(user: any): boolean {
    // 检查是否有编辑权限
    const currentUser = this.authService.getCurrentUser();
    
    // 如果有全部数据权限，则可以编辑所有用户
    if (this.dataPermissionService.hasAllDataPermission('user')) {
      return true;
    }
    
    // 个人权限 - 只能编辑自己
    if (currentUser && currentUser.id === user.id) {
      return true;
    }
    
    // 部门权限 - 只能编辑同部门用户
    if (currentUser && 
        currentUser.departmentId === user.departmentId &&
        this.dataPermissionService.getDataQueryParams('user').dataScope === DataScopeType.DEPARTMENT) {
      return true;
    }
    
    // 默认不允许编辑
    return false;
  }
  
  canDelete(user: any): boolean {
    // 删除权限通常比编辑更严格
    const currentUser = this.authService.getCurrentUser();
    
    // 不能删除自己
    if (currentUser && currentUser.id === user.id) {
      return false;
    }
    
    // 只有全部数据权限才能删除用户
    return this.dataPermissionService.hasAllDataPermission('user');
  }
  
  editUser(user: any): void {
    // 编辑用户逻辑
  }
  
  deleteUser(user: any): void {
    // 删除用户逻辑
  }
}
```

### 后端数据权限实现

虽然前端可以实现一定的数据权限控制，但真正的安全控制必须在后端实现。以下是后端实现数据权限的伪代码：

```typescript
// 后端数据权限过滤（伪代码）
function applyDataPermission(query, resourceType, user) {
  // 获取用户对该资源的数据权限
  const dataPermissions = getUserDataPermissions(user.id, resourceType);
  
  if (!dataPermissions.length) {
    // 无权限，返回空结果
    return query.where('1 = 0');
  }
  
  // 获取最高权限
  const highestPermission = getHighestPermission(dataPermissions);
  
  switch (highestPermission.dataScope) {
    case 'ALL':
      // 全部数据权限，不进行过滤
      return query;
      
    case 'CUSTOM':
      // 自定义数据权限
      if (highestPermission.departments && highestPermission.departments.length) {
        return query.whereIn('department_id', highestPermission.departments);
      }
      if (highestPermission.customSql) {
        return query.whereRaw(highestPermission.customSql);
      }
      break;
      
    case 'DEPARTMENT':
      // 本部门数据
      return query.where('department_id', user.departmentId);
      
    case 'DEPARTMENT_AND_BELOW':
      // 本部门及以下数据
      const subDepartments = getAllSubDepartments(user.departmentId);
      const deptIds = [user.departmentId, ...subDepartments.map(d => d.id)];
      return query.whereIn('department_id', deptIds);
      
    case 'PERSONAL':
      // 个人数据
      return query.where('creator_id', user.id);
      
    case 'NONE':
    default:
      // 无权限，返回空结果
      return query.where('1 = 0');
  }
}

// API控制器调用示例
async function getUserList(request, response) {
  try {
    let query = db('users').select('*');
    
    // 应用数据权限过滤
    query = applyDataPermission(query, 'user', request.user);
    
    // 应用其他查询条件
    if (request.query.keyword) {
      query = query.where('username', 'like', `%${request.query.keyword}%`);
    }
    
    // 执行查询
    const users = await query;
    
    // 应用字段权限（脱敏）
    const fieldPermissions = getUserFieldPermissions(request.user.id, 'user');
    const maskedUsers = users.map(user => applyFieldMasking(user, fieldPermissions));
    
    response.json(maskedUsers);
  } catch (error) {
    response.status(500).json({ message: 'Internal server error' });
  }
}
```

### 数据权限最佳实践

1. **双重验证**：在前端和后端都实施数据权限控制，前端提供良好用户体验，后端确保安全性

2. **性能考虑**：数据权限过滤可能导致复杂的SQL查询，需优化查询性能

3. **缓存策略**：缓存用户数据权限配置，减少频繁查询权限表

4. **UI一致性**：确保UI元素的显示/隐藏与数据访问权限保持一致

5. **最小权限原则**：默认提供最小权限，需要时才额外授权

6. **审计日志**：记录数据访问和操作，便于追踪权限使用情况

## 动态权限策略

动态权限策略允许应用根据用户行为、环境条件、业务规则或其他运行时因素动态调整权限设置。这种灵活的权限管理方式能够适应复杂多变的业务需求，为企业应用提供更精细的权限控制。

### 动态权限模型

动态权限通常基于以下几个关键概念：

```ascii
动态权限系统:
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                                权限管理引擎                                   │
│                                                                              │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐            │
│  │                 │   │                 │   │                 │            │
│  │   条件评估器    │◄──┤   规则引擎      │──►│   权限解析器    │            │
│  │                 │   │                 │   │                 │            │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘            │
│           ▲                     ▲                     ▲                     │
│           │                     │                     │                     │
│           │                     │                     │                     │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐            │
│  │                 │   │                 │   │                 │            │
│  │   上下文提供者  │   │   规则存储库    │   │   权限缓存      │            │
│  │                 │   │                 │   │                 │            │
│  └─────────────────┘   └─────────────────┘   └─────────────────┘            │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 基础架构实现

首先，定义动态权限的基本模型和接口：

```typescript
// dynamic-permission.model.ts
export interface PermissionContext {
  user: any;
  resource: string;
  action: string;
  environment: {
    time: Date;
    ip?: string;
    userAgent?: string;
    location?: string;
  };
  resourceAttributes?: { [key: string]: any };
  [key: string]: any; // 其他上下文信息
}

export interface PermissionRule {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  condition: string; // 条件表达式
  priority: number;  // 规则优先级
  effect: 'allow' | 'deny'; // 允许或拒绝
}

export interface RuleEvaluationResult {
  rule: PermissionRule;
  granted: boolean;
  context: PermissionContext;
  reason?: string;
}

export interface PermissionDecision {
  granted: boolean;
  context: PermissionContext;
  evaluationResults: RuleEvaluationResult[];
  timestamp: Date;
}
```

### 动态权限服务实现

```typescript
// dynamic-permission.service.ts
@Injectable({
  providedIn: 'root'
})
export class DynamicPermissionService {
  // 规则缓存
  private rulesCache: Map<string, PermissionRule[]> = new Map();
  // 决策缓存
  private decisionCache: Map<string, PermissionDecision> = new Map();
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // 加载权限规则
    this.loadAllRules().subscribe();
    
    // 设置定期刷新规则
    interval(5 * 60 * 1000) // 每5分钟
      .pipe(
        switchMap(() => this.loadAllRules())
      )
      .subscribe();
  }
  
  /**
   * 加载所有权限规则
   */
  private loadAllRules(): Observable<void> {
    return this.http.get<PermissionRule[]>('/api/permission-rules')
      .pipe(
        tap(rules => {
          // 按资源和操作分组
          this.rulesCache.clear();
          
          rules.forEach(rule => {
            const key = `${rule.resource}:${rule.action}`;
            
            if (!this.rulesCache.has(key)) {
              this.rulesCache.set(key, []);
            }
            
            this.rulesCache.get(key)!.push(rule);
          });
          
          // 对每组规则按优先级排序
          this.rulesCache.forEach(rules => {
            rules.sort((a, b) => b.priority - a.priority);
          });
          
          // 清除决策缓存
          this.decisionCache.clear();
        }),
        map(() => undefined)
      );
  }
  
  /**
   * 创建权限上下文
   */
  createContext(resource: string, action: string, attributes?: any): PermissionContext {
    const user = this.authService.getCurrentUser();
    
    const context: PermissionContext = {
      user,
      resource,
      action,
      environment: {
        time: new Date()
      },
      resourceAttributes: attributes || {}
    };
    
    return context;
  }
  
  /**
   * 检查权限
   */
  checkPermission(context: PermissionContext): Observable<PermissionDecision> {
    // 生成缓存键
    const cacheKey = this.generateCacheKey(context);
    
    // 检查缓存
    if (this.decisionCache.has(cacheKey)) {
      return of(this.decisionCache.get(cacheKey)!);
    }
    
    // 获取相关规则
    const ruleKey = `${context.resource}:${context.action}`;
    const rules = this.rulesCache.get(ruleKey) || [];
    
    // 如果没有规则，使用后端决策
    if (rules.length === 0) {
      return this.checkPermissionFromServer(context);
    }
    
    // 评估规则
    return this.evaluateRules(rules, context).pipe(
      map(results => {
        // 构建决策
        const decision: PermissionDecision = {
          granted: this.determinePermissionDecision(results),
          context,
          evaluationResults: results,
          timestamp: new Date()
        };
        
        // 缓存决策
        this.decisionCache.set(cacheKey, decision);
        
        return decision;
      })
    );
  }
  
  /**
   * 从后端检查权限
   */
  private checkPermissionFromServer(context: PermissionContext): Observable<PermissionDecision> {
    return this.http.post<PermissionDecision>('/api/check-permission', context)
      .pipe(
        tap(decision => {
          // 缓存决策
          const cacheKey = this.generateCacheKey(context);
          this.decisionCache.set(cacheKey, decision);
        })
      );
  }
  
  /**
   * 评估权限规则
   */
  private evaluateRules(rules: PermissionRule[], context: PermissionContext): Observable<RuleEvaluationResult[]> {
    // 在真实场景中，可能需要调用规则引擎
    // 这里使用简化的实现
    return of(rules.map(rule => this.evaluateRule(rule, context)));
  }
  
  /**
   * 评估单个规则
   */
  private evaluateRule(rule: PermissionRule, context: PermissionContext): RuleEvaluationResult {
    try {
      // 简单规则评估 - 在实际应用中应使用规则引擎
      let granted = false;
      
      switch (rule.condition) {
        case 'isOwner':
          granted = context.user.id === context.resourceAttributes?.ownerId;
          break;
        case 'isInSameDepartment':
          granted = context.user.departmentId === context.resourceAttributes?.departmentId;
          break;
        case 'isAdmin':
          granted = context.user.roles.includes('ADMIN');
          break;
        case 'isDuringBusinessHours':
          const hour = context.environment.time.getHours();
          granted = hour >= 9 && hour < 17; // 9am to 5pm
          break;
        case 'always':
          granted = true;
          break;
        case 'never':
          granted = false;
          break;
        default:
          // 对于复杂条件，可使用表达式解析器或规则引擎
          granted = false;
      }
      
      // 应用规则效果
      if (rule.effect === 'deny') {
        granted = !granted;
      }
      
      return {
        rule,
        granted,
        context,
        reason: granted ? '满足条件' : '不满足条件'
      };
    } catch (error) {
      return {
        rule,
        granted: false,
        context,
        reason: `规则评估错误: ${error}`
      };
    }
  }
  
  /**
   * 根据评估结果确定最终决策
   */
  private determinePermissionDecision(results: RuleEvaluationResult[]): boolean {
    // 找到第一个适用的规则
    const applicableResult = results.find(result => 
      (result.rule.effect === 'allow' && result.granted) || 
      (result.rule.effect === 'deny' && !result.granted)
    );
    
    // 如果有适用规则，返回其结果
    if (applicableResult) {
      return applicableResult.rule.effect === 'allow';
    }
    
    // 默认拒绝
    return false;
  }
  
  /**
   * 生成缓存键
   */
  private generateCacheKey(context: PermissionContext): string {
    // 简化的缓存键生成
    return `${context.user.id}:${context.resource}:${context.action}:${
      JSON.stringify(context.resourceAttributes || {})
    }`;
  }
  
  /**
   * 清除缓存
   */
  clearCache(): void {
    this.decisionCache.clear();
  }
}
```

### 条件评估器实现

对于复杂的条件评估，可以实现一个灵活的条件评估引擎：

```typescript
// condition-evaluator.service.ts
@Injectable({
  providedIn: 'root'
})
export class ConditionEvaluatorService {
  // 函数映射表
  private readonly functions: { [name: string]: Function } = {
    // 用户相关函数
    hasRole: (context: PermissionContext, role: string) => 
      context.user.roles.includes(role),
    
    hasPermission: (context: PermissionContext, permission: string) =>
      context.user.permissions.includes(permission),
    
    isResourceOwner: (context: PermissionContext) =>
      context.user.id === context.resourceAttributes?.ownerId,
    
    // 部门相关函数
    inSameDepartment: (context: PermissionContext) =>
      context.user.departmentId === context.resourceAttributes?.departmentId,
    
    isDepartmentManager: (context: PermissionContext, departmentId?: string) =>
      context.user.managedDepartments.includes(
        departmentId || context.resourceAttributes?.departmentId
      ),
    
    // 时间相关函数
    isDuringBusinessHours: (context: PermissionContext) => {
      const hour = context.environment.time.getHours();
      const day = context.environment.time.getDay();
      return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
    },
    
    // 资源相关函数
    resourceHasAttribute: (context: PermissionContext, attr: string, value: any) =>
      context.resourceAttributes?.[attr] === value,
    
    // 复杂业务规则
    isApproved: (context: PermissionContext) =>
      context.resourceAttributes?.status === 'APPROVED',
    
    isInDraftState: (context: PermissionContext) =>
      context.resourceAttributes?.status === 'DRAFT',
    
    valueExceedsThreshold: (context: PermissionContext, field: string, threshold: number) =>
      (context.resourceAttributes?.[field] || 0) > threshold
  };
  
  /**
   * 评估条件表达式
   */
  evaluate(expression: string, context: PermissionContext): boolean {
    try {
      // 解析表达式
      const tokens = this.parseExpression(expression);
      return this.evaluateTokens(tokens, context);
    } catch (error) {
      console.error('条件评估错误:', error);
      return false;
    }
  }
  
  /**
   * 简单的表达式解析器（实际应用中可使用更完善的实现）
   */
  private parseExpression(expression: string): any[] {
    // 简化示例 - 实际情况应使用更健壮的解析器
    // 支持 AND, OR, NOT 以及函数调用
    
    // 简单函数调用，如: hasRole('ADMIN')
    if (expression.includes('(') && expression.includes(')')) {
      const funcName = expression.substring(0, expression.indexOf('('));
      const params = expression
        .substring(expression.indexOf('(') + 1, expression.lastIndexOf(')'))
        .split(',')
        .map(p => p.trim().replace(/^['"]|['"]$/g, ''));
      
      return [{ type: 'function', name: funcName, params }];
    }
    
    // 简单的AND表达式: expr1 AND expr2
    if (expression.includes(' AND ')) {
      const parts = expression.split(' AND ');
      return [
        { type: 'operator', operator: 'AND', operands: [
          this.parseExpression(parts[0]),
          this.parseExpression(parts[1])
        ]}
      ];
    }
    
    // 简单的OR表达式: expr1 OR expr2
    if (expression.includes(' OR ')) {
      const parts = expression.split(' OR ');
      return [
        { type: 'operator', operator: 'OR', operands: [
          this.parseExpression(parts[0]),
          this.parseExpression(parts[1])
        ]}
      ];
    }
    
    // 简单的NOT表达式: NOT expr
    if (expression.startsWith('NOT ')) {
      return [
        { type: 'operator', operator: 'NOT', operands: [
          this.parseExpression(expression.substring(4))
        ]}
      ];
    }
    
    // 如果是简单值
    return [{ type: 'value', value: expression }];
  }
  
  /**
   * 评估解析后的表达式
   */
  private evaluateTokens(tokens: any[], context: PermissionContext): boolean {
    if (!tokens || tokens.length === 0) {
      return false;
    }
    
    const token = tokens[0];
    
    switch (token.type) {
      case 'function':
        const func = this.functions[token.name];
        if (!func) {
          throw new Error(`未知函数: ${token.name}`);
        }
        return func(context, ...token.params);
        
      case 'operator':
        switch (token.operator) {
          case 'AND':
            return this.evaluateTokens(token.operands[0], context) && 
                  this.evaluateTokens(token.operands[1], context);
          case 'OR':
            return this.evaluateTokens(token.operands[0], context) || 
                  this.evaluateTokens(token.operands[1], context);
          case 'NOT':
            return !this.evaluateTokens(token.operands[0], context);
          default:
            throw new Error(`未知操作符: ${token.operator}`);
        }
        
      case 'value':
        return Boolean(token.value);
        
      default:
        throw new Error(`未知令牌类型: ${token.type}`);
    }
  }
}
```

### 权限装饰器

在组件和服务中使用动态权限装饰器：

```typescript
// permission.decorators.ts
import { DynamicPermissionService } from './dynamic-permission.service';

/**
 * 权限检查装饰器
 */
export function RequirePermission(resource: string, action: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      const permissionService = this.injector.get(DynamicPermissionService);
      
      // 创建上下文
      const resourceAttributes = args[0]; // 假设第一个参数包含资源属性
      const context = permissionService.createContext(resource, action, resourceAttributes);
      
      // 检查权限
      return permissionService.checkPermission(context).pipe(
        mergeMap(decision => {
          if (decision.granted) {
            return originalMethod.apply(this, args);
          } else {
            console.error(`权限被拒绝: ${resource}:${action}`);
            return throwError(() => new Error('权限不足'));
          }
        })
      );
    };
    
    return descriptor;
  };
}
```

### 动态权限守卫

实现基于动态权限的路由守卫：

```typescript
// dynamic-permission-guard.service.ts
@Injectable({
  providedIn: 'root'
})
export class DynamicPermissionGuard implements CanActivate {
  constructor(
    private dynamicPermissionService: DynamicPermissionService,
    private router: Router
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const resource = route.data['permissionResource'] as string;
    const action = route.data['permissionAction'] as string;
    
    if (!resource || !action) {
      return true; // 没有指定权限要求
    }
    
    // 提取资源属性
    // 可以从路由参数、查询参数或其他来源获取
    const resourceAttributes: any = {};
    
    if (route.params.id) {
      resourceAttributes.id = route.params.id;
    }
    
    // 创建权限上下文
    const context = this.dynamicPermissionService.createContext(
      resource, action, resourceAttributes
    );
    
    // 检查权限
    return this.dynamicPermissionService.checkPermission(context).pipe(
      map(decision => {
        if (!decision.granted) {
          this.router.navigate(['/forbidden'], {
            queryParams: { resource, action }
          });
        }
        return decision.granted;
      })
    );
  }
}
```

在路由中使用动态权限守卫：

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'orders/:id/edit',
    component: OrderEditComponent,
    canActivate: [DynamicPermissionGuard],
    data: {
      permissionResource: 'order',
      permissionAction: 'update'
    }
  },
  {
    path: 'reports/sales',
    component: SalesReportComponent,
    canActivate: [DynamicPermissionGuard],
    data: {
      permissionResource: 'report',
      permissionAction: 'view',
      permissionAttributes: { reportType: 'sales' }
    }
  }
];
```

### 动态权限指令

创建动态权限检查指令：

```typescript
// dynamic-permission.directive.ts
@Directive({
  selector: '[appDynamicPermission]'
})
export class DynamicPermissionDirective implements OnInit {
  @Input('appDynamicPermission') resource: string = '';
  @Input('appDynamicPermissionAction') action: string = '';
  @Input('appDynamicPermissionAttributes') attributes: any = null;
  
  private checkSubscription: Subscription | null = null;
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private dynamicPermissionService: DynamicPermissionService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.checkPermission();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resource'] || changes['action'] || changes['attributes']) {
      this.checkPermission();
    }
  }
  
  ngOnDestroy(): void {
    if (this.checkSubscription) {
      this.checkSubscription.unsubscribe();
    }
  }
  
  private checkPermission(): void {
    if (!this.resource || !this.action) {
      this.viewContainer.clear();
      return;
    }
    
    const context = this.dynamicPermissionService.createContext(
      this.resource, this.action, this.attributes
    );
    
    if (this.checkSubscription) {
      this.checkSubscription.unsubscribe();
    }
    
    this.checkSubscription = this.dynamicPermissionService.checkPermission(context)
      .subscribe(decision => {
        this.viewContainer.clear();
        
        if (decision.granted) {
          this.viewContainer.createEmbeddedView(this.templateRef);
          this.changeDetectorRef.markForCheck();
        }
      });
  }
}
```

使用动态权限指令：

```html
<!-- 基于动态条件控制按钮的显示 -->
<button 
  *appDynamicPermission="'order'; action: 'approve'; attributes: { status: order.status, amount: order.amount }"
  (click)="approveOrder(order)">
  审批订单
</button>

<!-- 条件性显示敏感信息 -->
<div 
  *appDynamicPermission="'customer'; action: 'viewFinancial'; attributes: { customerId: customer.id, customerType: customer.type }">
  <h3>财务信息</h3>
  <p>信用额度: {{ customer.creditLimit }}</p>
  <p>账户余额: {{ customer.accountBalance }}</p>
</div>
```

### 权限管理界面

创建动态权限规则管理界面：

```typescript
// permission-rule-management.component.ts
@Component({
  selector: 'app-permission-rule-management',
  template: `
    <div class="permission-rules-container">
      <h2>权限规则管理</h2>
      
      <div class="toolbar">
        <button (click)="createRule()">新建规则</button>
        <button (click)="loadRules()">刷新</button>
      </div>
      
      <table class="rules-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>资源</th>
            <th>操作</th>
            <th>条件</th>
            <th>效果</th>
            <th>优先级</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let rule of rules">
            <td>{{ rule.name }}</td>
            <td>{{ rule.resource }}</td>
            <td>{{ rule.action }}</td>
            <td>{{ rule.condition }}</td>
            <td>{{ rule.effect }}</td>
            <td>{{ rule.priority }}</td>
            <td>
              <button (click)="editRule(rule)">编辑</button>
              <button (click)="deleteRule(rule)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <app-rule-editor 
        *ngIf="showEditor"
        [rule]="selectedRule"
        (save)="saveRule($event)"
        (cancel)="cancelEdit()">
      </app-rule-editor>
    </div>
  `
})
export class PermissionRuleManagementComponent implements OnInit {
  rules: PermissionRule[] = [];
  showEditor = false;
  selectedRule: PermissionRule | null = null;
  
  constructor(
    private http: HttpClient,
    private dynamicPermissionService: DynamicPermissionService
  ) {}
  
  ngOnInit(): void {
    this.loadRules();
  }
  
  loadRules(): void {
    this.http.get<PermissionRule[]>('/api/permission-rules')
      .subscribe(rules => {
        this.rules = rules;
      });
  }
  
  createRule(): void {
    this.selectedRule = {
      id: '', // 新规则ID为空
      name: '',
      resource: '',
      action: '',
      condition: '',
      priority: 0,
      effect: 'allow'
    };
    this.showEditor = true;
  }
  
  editRule(rule: PermissionRule): void {
    this.selectedRule = { ...rule };
    this.showEditor = true;
  }
  
  deleteRule(rule: PermissionRule): void {
    if (confirm(`确定要删除规则 "${rule.name}" 吗?`)) {
      this.http.delete(`/api/permission-rules/${rule.id}`)
        .subscribe(() => {
          this.loadRules();
          this.dynamicPermissionService.clearCache(); // 清除缓存
        });
    }
  }
  
  saveRule(rule: PermissionRule): void {
    const isNew = !rule.id;
    const method = isNew ? 'post' : 'put';
    const url = isNew ? '/api/permission-rules' : `/api/permission-rules/${rule.id}`;
    
    this.http[method](url, rule)
      .subscribe(() => {
        this.loadRules();
        this.showEditor = false;
        this.selectedRule = null;
        this.dynamicPermissionService.clearCache(); // 清除缓存
      });
  }
  
  cancelEdit(): void {
    this.showEditor = false;
    this.selectedRule = null;
  }
}
```

### 动态权限最佳实践

1. **性能优化**：实施有效的缓存策略，避免频繁权限检查导致的性能问题

2. **渐进式降级**：当权限服务不可用时，提供降级机制，确保系统可用性

3. **规则可维护性**：提供友好的规则编辑界面，支持规则测试和预览

4. **审计与监控**：记录权限决策及其依据，便于审计和故障排查

5. **规则版本控制**：实施规则版本控制，允许回滚有问题的规则变更

6. **测试覆盖**：全面测试权限规则，确保正确性和一致性

7. **文档化**：维护清晰的规则文档，确保业务规则透明可理解

## 总结

权限控制是企业级Angular应用中至关重要的一环，本文档详细介绍了三种互补的权限控制方法：

1. **基于角色的访问控制 (RBAC)**：通过角色分配权限，适合大多数应用场景

2. **功能权限系统**：提供更细粒度的功能级访问控制，适合复杂应用

3. **数据权限实现**：限制用户只能访问有权限的数据，适合处理敏感信息

4. **动态权限策略**：基于条件和上下文动态调整权限，适合复杂多变的业务需求

这些方法可以独立使用，也可以组合使用以构建全面的权限控制系统。选择哪种方法取决于应用的复杂性、安全需求和业务规则。

在实施权限控制时，应遵循最小权限原则，注重性能优化，并确保前后端一致的权限验证机制。

一个设计良好的权限系统不仅能保障应用安全，还能提升用户体验，允许灵活配置，适应不断变化的业务需求。 