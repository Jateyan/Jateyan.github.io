---
title: Angular NgRx状态管理
description: NgRx企业级状态管理实践：Store设计、Actions、Reducers、Effects、Selectors及性能优化
head:
  - - meta
    - name: keywords
      content: Angular, NgRx, Redux, 状态管理, Store, Actions, Reducers, Effects, Selectors, Entity
---

# Angular NgRx状态管理

## 目录

- [Store设计](#store设计)
- [Actions与Reducers](#actions与reducers)
- [Effects中间件](#effects中间件)
- [Selectors与衍生状态](#selectors与衍生状态)
- [Entity适配器](#entity适配器)
- [开发者工具](#开发者工具)
- [最佳实践与性能优化](#最佳实践与性能优化)

## Store设计

NgRx Store 是企业级 Angular 应用中状态管理的核心，遵循单一数据源原则，为应用提供可预测的状态管理方案。

### 1. 状态设计原则

NgRx 状态设计中的核心原则：

```
[单一数据源] → [状态不可变] → [纯函数修改]
     │               │              │
     └───────[可预测的状态变化]───────┘
```

**良好状态设计的特点**：
- 扁平化结构
- 规范化数据
- 最小完备表示
- 明确的数据所有权

### 2. 应用状态结构

企业级应用中的状态结构设计：

```typescript
// 应用根状态接口
export interface AppState {
  auth: AuthState;
  products: ProductsState;
  cart: CartState;
  orders: OrdersState;
  ui: UiState;
}

// 认证状态接口
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  error: string | null;
  loading: boolean;
}

// 产品状态接口
export interface ProductsState {
  entities: { [id: string]: Product };
  ids: string[];
  selectedId: string | null;
  filters: ProductFilters;
  loading: boolean;
  error: string | null;
}

// UI状态接口
export interface UiState {
  theme: 'light' | 'dark';
  sidenavOpen: boolean;
  alerts: Alert[];
  modals: { [id: string]: boolean };
}
```

### 3. 特征状态模块

为了保持代码组织和可维护性，NgRx 应用通常按功能区分为多个特征状态模块：

```typescript
// 产品特征模块
@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('products', productsReducer),
    EffectsModule.forFeature([ProductsEffects])
  ],
  // ...
})
export class ProductsModule { }

// 订单特征模块
@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('orders', ordersReducer),
    EffectsModule.forFeature([OrdersEffects])
  ],
  // ...
})
export class OrdersModule { }
```

### 4. 状态初始化

所有 reducer 都应设置初始状态，确保应用启动时有一个确定的初始状态：

```typescript
// 产品状态初始值
export const initialProductsState: ProductsState = {
  entities: {},
  ids: [],
  selectedId: null,
  filters: {
    category: null,
    minPrice: 0,
    maxPrice: null,
    searchTerm: ''
  },
  loading: false,
  error: null
};

// 认证状态初始值
export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
  error: null,
  loading: false
};
```

### 5. 延迟加载状态

对于大型应用，可以利用 NgRx 的延迟加载特性，与 Angular 路由的懒加载结合：

```typescript
// 延迟加载的路由模块
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  }
];

// 在延迟加载的模块中注册特征状态
@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('admin', adminReducer),
    EffectsModule.forFeature([AdminEffects])
  ],
  // ...
})
export class AdminModule { }
```

### 6. 状态持久化

企业应用中常需要持久化某些状态到本地存储，以提升用户体验：

```typescript
// 使用 ngrx-store-localstorage 实现状态持久化
import { localStorageSync } from 'ngrx-store-localstorage';

export function localStorageSyncReducer(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
  return localStorageSync({
    keys: ['auth', 'ui'],
    rehydrate: true
  })(reducer);
}

// 在元数据减速器中注册
export const metaReducers: MetaReducer<AppState>[] = [
  localStorageSyncReducer
];

// 根模块导入
@NgModule({
  imports: [
    StoreModule.forRoot(reducers, { metaReducers })
  ]
})
export class AppModule { }
```

## Actions与Reducers

Actions 是 NgRx 应用中状态变化的触发器，而 Reducers 则负责根据 Action 更新状态。

### 1. 强类型Actions设计

使用 NgRx 的 `createAction` 和 `props` 函数创建类型安全的 Actions：

```typescript
// 产品相关 Actions
export const loadProducts = createAction('[Products] Load Products');

export const loadProductsSuccess = createAction(
  '[Products API] Load Products Success',
  props<{ products: Product[] }>()
);

export const loadProductsFailure = createAction(
  '[Products API] Load Products Failure',
  props<{ error: any }>()
);

export const addProduct = createAction(
  '[Products] Add Product',
  props<{ product: Product }>()
);

export const updateProduct = createAction(
  '[Products] Update Product',
  props<{ id: string; changes: Partial<Product> }>()
);

export const deleteProduct = createAction(
  '[Products] Delete Product',
  props<{ id: string }>()
);
```

### 2. Action命名约定

企业级应用中推荐的 Action 命名模式：

```
[来源] 动词 实体（可选的元数据信息）
```

**示例**：
- `[Auth API] Login Success`
- `[Product List] Select Product`
- `[Shopping Cart] Add Item`
- `[Checkout Page] Submit Order`

### 3. Reducer实现

使用 `createReducer` 和 `on` 函数实现类型安全的 reducer：

```typescript
// 产品状态 reducer
export const productsReducer = createReducer(
  initialProductsState,
  
  // 处理加载产品动作
  on(ProductActions.loadProducts, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  // 处理加载成功动作
  on(ProductActions.loadProductsSuccess, (state, { products }) => {
    // 将产品数组转换为实体形式
    const entities = products.reduce((acc, product) => ({
      ...acc,
      [product.id]: product
    }), {});
    
    return {
      ...state,
      entities,
      ids: products.map(p => p.id),
      loading: false
    };
  }),
  
  // 处理加载失败动作
  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error.message || '加载产品失败'
  })),
  
  // 处理添加产品动作
  on(ProductActions.addProduct, (state, { product }) => ({
    ...state,
    entities: {
      ...state.entities,
      [product.id]: product
    },
    ids: [...state.ids, product.id]
  })),
  
  // 处理更新产品动作
  on(ProductActions.updateProduct, (state, { id, changes }) => {
    if (!state.entities[id]) return state;
    
    const updatedProduct = {
      ...state.entities[id],
      ...changes
    };
    
    return {
      ...state,
      entities: {
        ...state.entities,
        [id]: updatedProduct
      }
    };
  }),
  
  // 处理删除产品动作
  on(ProductActions.deleteProduct, (state, { id }) => {
    if (!state.entities[id]) return state;
    
    const { [id]: removed, ...entities } = state.entities;
    
    return {
      ...state,
      entities,
      ids: state.ids.filter(productId => productId !== id)
    };
  })
);
```

### 4. 复杂状态处理模式

处理嵌套和复杂状态的推荐模式：

```typescript
// 深度嵌套状态的处理
export const updateOrderStatus = createAction(
  '[Orders] Update Order Status',
  props<{ orderId: string; status: OrderStatus }>()
);

export const ordersReducer = createReducer(
  initialOrdersState,
  on(OrderActions.updateOrderStatus, (state, { orderId, status }) => {
    // 如果订单不存在
    if (!state.entities[orderId]) return state;
    
    // 创建更新后的订单对象
    const updatedOrder = {
      ...state.entities[orderId],
      status,
      statusUpdateTime: new Date().toISOString()
    };
    
    // 返回新状态
    return {
      ...state,
      entities: {
        ...state.entities,
        [orderId]: updatedOrder
      }
    };
  })
);
```

### 5. Reducer工具函数

处理复杂状态更新时的辅助函数：

```typescript
// 更新数组中的特定项目
export function updateItemInArray<T>(
  array: T[],
  itemId: string,
  idKey: keyof T,
  updater: (item: T) => T
): T[] {
  return array.map(item => {
    if (item[idKey] === itemId) {
      return updater(item);
    }
    return item;
  });
}

// 从数组中移除项目
export function removeItemFromArray<T>(
  array: T[],
  itemId: string,
  idKey: keyof T
): T[] {
  return array.filter(item => item[idKey] !== itemId);
}

// 在reducer中使用工具函数
on(CartActions.updateQuantity, (state, { productId, quantity }) => {
  const updatedItems = updateItemInArray(
    state.items,
    productId,
    'productId',
    item => ({
      ...item,
      quantity
    })
  );
  
  return {
    ...state,
    items: updatedItems,
    totalAmount: calculateTotalAmount(updatedItems)
  };
})
```

### 6. Meta-Reducers扩展

使用 Meta-Reducers 实现横切关注点，如日志记录、错误处理和数据规范化：

```typescript
// 创建记录Actions的Meta-Reducer
export function logger(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
  return (state, action) => {
    const result = reducer(state, action);
    console.groupCollapsed(`%c [Action]: ${action.type}`, 'color: #3f51b5; font-weight: bold');
    console.log('%c Previous State', 'color: #9e9e9e', state);
    console.log('%c Action', 'color: #03a9f4', action);
    console.log('%c Current State', 'color: #4caf50', result);
    console.groupEnd();
    return result;
  };
}

// 创建错误处理Meta-Reducer
export function errorHandler(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
  return (state, action) => {
    try {
      return reducer(state, action);
    } catch (error) {
      console.error(`Error in action ${action.type}:`, error);
      // 可以分发错误处理action
      return state;
    }
  };
}

// 注册Meta-Reducers
export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? [logger, errorHandler, localStorageSyncReducer]
  : [errorHandler, localStorageSyncReducer];
```

## Effects中间件

NgRx Effects 提供了处理副作用操作的强大机制，例如API调用、路由导航、本地存储操作等。

### 1. Effects基本结构

```typescript
@Injectable()
export class ProductEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProducts),
      mergeMap(() =>
        this.productService.getAll().pipe(
          map(products => loadProductsSuccess({ products })),
          catchError(error => of(loadProductsFailure({ error })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}
}
```

### 2. 不同操作符的选择策略

根据业务需求选择合适的RxJS操作符:

```
┌──────────────────────────────────────────┐
│            操作符选择决策树              │
├──────────────────────────────────────────┤
│ 需要取消之前的请求? ────┬─── 是 ─── switchMap │
│                        │                │
│                        └─── 否 ───┐     │
│                                   │     │
│ 需要并发执行多个请求? ───┬─── 是 ─── mergeMap  │
│                        │                │
│                        └─── 否 ───┐     │
│                                   │     │
│ 需要按顺序处理请求?   ───┬─── 是 ─── concatMap │
│                        │                │
│                        └─── 否 ───┐     │
│                                   │     │
│ 忽略处理中的相同请求? ───┼─── 是 ─── exhaustMap│
│                                          │
└──────────────────────────────────────────┘
```

**使用示例**:

```typescript
// 搜索场景：取消之前的请求，只处理最新的
searchProducts$ = createEffect(() =>
  this.actions$.pipe(
    ofType(searchProducts),
    // 防抖: 等待用户停止输入
    debounceTime(300),
    // 取消之前的请求，只处理最新的
    switchMap(({ query }) =>
      this.productService.search(query).pipe(
        map(products => searchProductsSuccess({ products })),
        catchError(error => of(searchProductsFailure({ error })))
      )
    )
  )
);

// 批量操作：并发执行多个请求
batchUpdateProducts$ = createEffect(() =>
  this.actions$.pipe(
    ofType(batchUpdateProducts),
    // 并发处理多个更新请求
    mergeMap(({ products }) =>
      // 创建并发请求流
      forkJoin(
        products.map(product => 
          this.productService.update(product.id, product)
        )
      ).pipe(
        map(updatedProducts => batchUpdateProductsSuccess({ 
          products: updatedProducts 
        })),
        catchError(error => of(batchUpdateProductsFailure({ error })))
      )
    )
  )
);

// 顺序依赖场景：按顺序处理请求
processOrder$ = createEffect(() =>
  this.actions$.pipe(
    ofType(submitOrder),
    // 按顺序处理：验证 -> 提交 -> 清空购物车
    concatMap(({ order }) =>
      this.orderService.validateOrder(order).pipe(
        // 只有验证成功后才提交订单
        concatMap(() => this.orderService.submitOrder(order)),
        map(result => submitOrderSuccess({ orderId: result.orderId })),
        // 成功后清空购物车
        tap(() => this.store.dispatch(clearCart())),
        catchError(error => of(submitOrderFailure({ error })))
      )
    )
  )
);

// 登录场景：忽略处理中的重复请求
login$ = createEffect(() =>
  this.actions$.pipe(
    ofType(login),
    // 忽略处理中的登录请求
    exhaustMap(({ credentials }) =>
      this.authService.login(credentials).pipe(
        map(user => loginSuccess({ user })),
        catchError(error => of(loginFailure({ error })))
      )
    )
  )
);
```

### 3. 非分发Effects

有些副作用不需要分发新的Action:

```typescript
// 非分发Effect：记录日志
logActions$ = createEffect(() =>
  this.actions$.pipe(
    tap(action => {
      console.log('Action:', action.type, action);
    })
  ),
  { dispatch: false } // 不分发任何Action
);

// 导航Effect
navigateToProductDetail$ = createEffect(() =>
  this.actions$.pipe(
    ofType(selectProduct),
    tap(({ productId }) => {
      this.router.navigate(['/products', productId]);
    })
  ),
  { dispatch: false }
);
```

### 4. Effects中的错误处理

构建健壮的错误处理策略:

```typescript
loadProducts$ = createEffect(() =>
  this.actions$.pipe(
    ofType(loadProducts),
    mergeMap(() =>
      this.productService.getAll().pipe(
        map(products => loadProductsSuccess({ products })),
        catchError(error => {
          // 记录错误
          this.logger.error('加载产品失败', error);
          
          // 显示用户通知
          this.notificationService.showError('无法加载产品列表');
          
          // 返回失败Action
          return of(loadProductsFailure({ 
            error: this.errorService.normalizeError(error) 
          }));
        })
      )
    )
  )
);

// 全局错误处理Effect
globalErrorHandler$ = createEffect(() =>
  this.actions$.pipe(
    // 捕获所有包含'Failure'的Action类型
    filter((action: any) => action.type.includes('Failure')),
    tap(action => {
      // 上报错误到监控服务
      this.monitoringService.reportError(action.type, action.error);
      
      // 可以根据错误类型执行不同处理
      if (action.error?.status === 401) {
        this.store.dispatch(logout());
        this.router.navigate(['/login']);
      }
    })
  ),
  { dispatch: false }
);
```

### 5. Effect依赖注入与测试

Effects同样依赖Angular的依赖注入系统:

```typescript
@Injectable()
export class AuthEffects {
  login$ = createEffect(() => /* ... */);
  
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private store: Store,
    private notificationService: NotificationService
  ) {}
}

// 测试Effect
describe('AuthEffects', () => {
  let actions$: Observable<Action>;
  let effects: AuthEffects;
  let authService: jasmine.SpyObj<AuthService>;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', ['login'])
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate'])
        },
        provideMockStore()
      ]
    });
    
    effects = TestBed.inject(AuthEffects);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });
  
  it('should dispatch loginSuccess action on successful login', () => {
    const credentials = { username: 'test', password: 'password' };
    const user = { id: '1', name: 'Test User' };
    
    actions$ = of(login({ credentials }));
    authService.login.and.returnValue(of(user));
    
    effects.login$.subscribe(action => {
      expect(action).toEqual(loginSuccess({ user }));
    });
  });
});
```

## Selectors与衍生状态

NgRx Selectors在企业级应用中起到关键作用，通过组合、过滤和转换状态数据来创建衍生状态，并提供优化性能的记忆化功能。

### 1. Selector基础

```typescript
// 特征选择器
export const selectProductState = createFeatureSelector<ProductsState>('products');

// 基础选择器
export const selectProductEntities = createSelector(
  selectProductState,
  state => state.entities
);

export const selectProductIds = createSelector(
  selectProductState,
  state => state.ids
);

export const selectSelectedProductId = createSelector(
  selectProductState,
  state => state.selectedId
);

// 组合选择器
export const selectAllProducts = createSelector(
  selectProductEntities,
  selectProductIds,
  (entities, ids) => ids.map(id => entities[id])
);

export const selectSelectedProduct = createSelector(
  selectProductEntities,
  selectSelectedProductId,
  (entities, selectedId) => selectedId ? entities[selectedId] : null
);
```

### 2. 带参数的选择器

```typescript
// 带参数的选择器
export const selectProductById = (productId: string) => createSelector(
  selectProductEntities,
  (entities) => entities[productId]
);

export const selectProductsByCategory = (category: string) => createSelector(
  selectAllProducts,
  (products) => products.filter(product => product.category === category)
);

// 组件中使用
@Component({
  // ...
})
export class ProductComponent implements OnInit {
  product$: Observable<Product>;
  relatedProducts$: Observable<Product[]>;
  
  constructor(private store: Store, private route: ActivatedRoute) {}
  
  ngOnInit() {
    // 从路由参数获取产品ID
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(id => !!id)
    ).subscribe(id => {
      // 使用带参数的选择器
      this.product$ = this.store.select(selectProductById(id));
      
      // 使用一个选择器的结果作为另一个选择器的输入
      this.product$.pipe(
        filter(product => !!product),
        switchMap(product => 
          this.store.select(selectProductsByCategory(product.category))
        )
      ).subscribe(products => {
        this.relatedProducts$ = of(products.filter(p => p.id !== id).slice(0, 5));
      });
    });
  }
}
```

### 3. 复杂数据转换

```typescript
// 计算派生数据
export const selectCartWithDetails = createSelector(
  selectCartItems,
  selectProductEntities,
  (items, productEntities) => items.map(item => ({
    ...item,
    product: productEntities[item.productId],
    totalPrice: productEntities[item.productId]?.price * item.quantity
  }))
);

export const selectCartSummary = createSelector(
  selectCartWithDetails,
  (items) => ({
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
    totalDiscount: items.reduce(
      (sum, item) => sum + ((item.product?.discount || 0) * item.quantity), 
      0
    )
  })
);

// 组合多个状态分支
export const selectProductsWithInventory = createSelector(
  selectAllProducts,
  selectInventoryState,
  (products, inventory) => products.map(product => ({
    ...product,
    inStock: (inventory.productStock[product.id] || 0) > 0,
    stockLevel: inventory.productStock[product.id] || 0,
    stockStatus: getStockStatus(inventory.productStock[product.id] || 0)
  }))
);

// 辅助函数
function getStockStatus(quantity: number): 'out_of_stock' | 'low' | 'in_stock' {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity < 10) return 'low';
  return 'in_stock';
}
```

### 4. 选择器组合与重用

```typescript
// 基础UI选择器
export const selectUiState = createFeatureSelector<UiState>('ui');
export const selectTheme = createSelector(
  selectUiState,
  ui => ui.theme
);
export const selectLanguage = createSelector(
  selectUiState,
  ui => ui.language
);

// 基础用户选择器
export const selectAuthState = createFeatureSelector<AuthState>('auth');
export const selectCurrentUser = createSelector(
  selectAuthState,
  auth => auth.user
);
export const selectUserPermissions = createSelector(
  selectCurrentUser,
  user => user?.permissions || []
);

// 组合为用户界面配置
export const selectUserInterfaceConfig = createSelector(
  selectTheme,
  selectLanguage,
  selectUserPermissions,
  (theme, language, permissions) => ({
    theme,
    language,
    permissions,
    // 派生数据
    showAdminPanel: permissions.includes('ADMIN'),
    dateFormat: language === 'zh-CN' ? 'YYYY-MM-DD' : 'MM/DD/YYYY',
    currencySymbol: language === 'zh-CN' ? '¥' : '$'
  })
);

// 组件中使用
@Component({
  // ...
})
export class AppShellComponent {
  uiConfig$ = this.store.select(selectUserInterfaceConfig);
  
  constructor(private store: Store) {}
}
```

### 5. 性能优化选择器

```typescript
// 避免在组件中进行过滤
// 不推荐做法:
@Component({
  // ...
})
export class ProductListComponent {
  allProducts$ = this.store.select(selectAllProducts);
  featuredProducts$: Observable<Product[]>;
  
  constructor(private store: Store) {
    // 避免在组件中过滤 - 每当allProducts$发出值时都会重新计算
    this.featuredProducts$ = this.allProducts$.pipe(
      map(products => products.filter(p => p.featured))
    );
  }
}

// 推荐做法 - 在选择器中过滤:
export const selectFeaturedProducts = createSelector(
  selectAllProducts,
  products => products.filter(p => p.featured)
);

@Component({
  // ...
})
export class ProductListComponent {
  // 直接使用已优化的选择器
  featuredProducts$ = this.store.select(selectFeaturedProducts);
  
  constructor(private store: Store) {}
}
```

## Entity适配器

NgRx Entity提供了用于管理集合状态的适配器，简化了CRUD操作并提高了性能。

### 1. 实体适配器设置

```typescript
// 创建实体适配器
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  // 其他属性...
}

export const productAdapter: EntityAdapter<Product> = createEntityAdapter<Product>({
  // 自定义ID选择器（默认为'id'属性）
  selectId: (product: Product) => product.id,
  // 自定义排序比较器
  sortComparer: (a: Product, b: Product) => a.name.localeCompare(b.name)
});

// 初始状态
export interface ProductsState extends EntityState<Product> {
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}

export const initialProductsState: ProductsState = productAdapter.getInitialState({
  selectedId: null,
  loading: false,
  error: null
});
```

### 2. 适配器CRUD操作

```typescript
// Reducer
export const productsReducer = createReducer(
  initialProductsState,
  
  // 加载状态
  on(loadProducts, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  // 加载成功 - 替换所有实体
  on(loadProductsSuccess, (state, { products }) => 
    productAdapter.setAll(products, {
      ...state,
      loading: false
    })
  ),
  
  // 添加单个实体
  on(addProductSuccess, (state, { product }) => 
    productAdapter.addOne(product, state)
  ),
  
  // 更新单个实体
  on(updateProductSuccess, (state, { id, changes }) => 
    productAdapter.updateOne({
      id,
      changes
    }, state)
  ),
  
  // 删除单个实体
  on(deleteProductSuccess, (state, { id }) => 
    productAdapter.removeOne(id, state)
  ),
  
  // 添加多个实体
  on(addProductsSuccess, (state, { products }) => 
    productAdapter.addMany(products, state)
  ),
  
  // 更新多个实体
  on(updateProductsSuccess, (state, { updates }) => 
    productAdapter.updateMany(updates, state)
  ),
  
  // 删除多个实体
  on(deleteProductsSuccess, (state, { ids }) => 
    productAdapter.removeMany(ids, state)
  ),
  
  // 更新选中ID
  on(selectProduct, (state, { id }) => ({
    ...state,
    selectedId: id
  }))
);
```

### 3. 实体适配器选择器

```typescript
// 创建基础选择器
export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal
} = productAdapter.getSelectors();

// 创建特征选择器
export const selectProductState = createFeatureSelector<ProductsState>('products');

// 组合选择器
export const selectProductIds = createSelector(
  selectProductState,
  selectIds
);

export const selectProductEntities = createSelector(
  selectProductState,
  selectEntities
);

export const selectAllProducts = createSelector(
  selectProductState,
  selectAll
);

export const selectProductsTotal = createSelector(
  selectProductState,
  selectTotal
);

export const selectSelectedProductId = createSelector(
  selectProductState,
  state => state.selectedId
);

export const selectSelectedProduct = createSelector(
  selectProductEntities,
  selectSelectedProductId,
  (entities, selectedId) => selectedId ? entities[selectedId] : null
);
```

### 4. 实体适配器高级用法

```typescript
// 自定义实体适配器增强器
export const extendedProductAdapter = {
  ...productAdapter,
  
  // 自定义选择器
  getSelectors() {
    const baseSelectors = productAdapter.getSelectors();
    
    return {
      ...baseSelectors,
      
      // 添加自定义选择器
      selectProductsByCategory: (state: ProductsState, category: string) => 
        baseSelectors.selectAll(state).filter(product => product.category === category),
        
      selectDiscountedProducts: (state: ProductsState) => 
        baseSelectors.selectAll(state).filter(product => product.discount > 0),
        
      selectProductsInPriceRange: (state: ProductsState, min: number, max: number) => 
        baseSelectors.selectAll(state).filter(
          product => product.price >= min && product.price <= max
        )
    };
  }
};

// 使用扩展选择器
const extendedSelectors = extendedProductAdapter.getSelectors();

export const selectProductsByCategory = (category: string) => createSelector(
  selectProductState,
  state => extendedSelectors.selectProductsByCategory(state, category)
);

export const selectDiscountedProducts = createSelector(
  selectProductState,
  extendedSelectors.selectDiscountedProducts
);

export const selectProductsInPriceRange = (min: number, max: number) => createSelector(
  selectProductState,
  state => extendedSelectors.selectProductsInPriceRange(state, min, max)
);
```

### 5. 处理关系型数据

```typescript
// 建立实体间关系
export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  // 其他订单属性...
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  // 其他订单项属性...
}

export interface Customer {
  id: string;
  name: string;
  // 其他客户属性...
}

// 选择器组合关系数据
export const selectOrdersWithDetails = createSelector(
  selectAllOrders,
  selectCustomerEntities,
  selectProductEntities,
  (orders, customers, products) => orders.map(order => ({
    ...order,
    customer: customers[order.customerId],
    items: order.items.map(item => ({
      ...item,
      product: products[item.productId],
      subtotal: item.quantity * item.price
    })),
    total: order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  }))
);

// 查询特定客户的订单
export const selectCustomerOrders = (customerId: string) => createSelector(
  selectOrdersWithDetails,
  (orders) => orders.filter(order => order.customerId === customerId)
);

// 计算客户消费统计
export const selectCustomerWithStats = (customerId: string) => createSelector(
  selectCustomerById(customerId),
  selectCustomerOrders(customerId),
  (customer, orders) => ({
    ...customer,
    orderCount: orders.length,
    totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
    averageOrderValue: orders.length ? 
      orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
    lastOrderDate: orders.length ? 
      Math.max(...orders.map(o => new Date(o.createdAt).getTime())) : null
  })
);
```

## 开发者工具

NgRx DevTools是调试复杂状态的必备工具，提供了时间旅行、状态快照和Action监控等功能。

### 1. 配置开发者工具

```typescript
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

@NgModule({
  imports: [
    StoreModule.forRoot(reducers, { metaReducers }),
    // 仅在开发环境启用DevTools
    !environment.production ? 
      StoreDevtoolsModule.instrument({
        maxAge: 25, // 保留最近25个状态
        logOnly: environment.production,
        autoPause: true,
        trace: false,
        traceLimit: 75
      }) : []
  ],
  // ...
})
export class AppModule { }
```

### 2. DevTools功能

使用Redux DevTools的核心功能：

- **时间旅行调试**：可以在应用的不同状态之间移动
- **状态比较**：查看每个Action引起的状态变化
- **Action重放**：可以重放或跳过特定的Action
- **状态持久化**：可以导出和导入应用状态

### 3. 自定义序列化

处理不可序列化的数据：

```typescript
import { ActionReducer, ActionReducerMap, MetaReducer, StoreModule } from '@ngrx/store';
import { routerReducer, StoreRouterConnectingModule } from '@ngrx/router-store';

// 定义序列化器来处理不可序列化的对象
const serializationOptions = {
  serialize: {
    options: {
      // 自定义序列化函数
      replacer: (key: string, value: any): any => {
        if (value instanceof Date) {
          return { _type: 'date', value: value.toISOString() };
        }
        if (value instanceof Map) {
          return { _type: 'map', value: Array.from(value.entries()) };
        }
        if (value instanceof Set) {
          return { _type: 'set', value: Array.from(value) };
        }
        return value;
      }
    }
  },
  deserialize: {
    options: {
      // 自定义反序列化函数
      reviver: (key: string, value: any): any => {
        if (typeof value === 'object' && value !== null) {
          if (value._type === 'date') {
            return new Date(value.value);
          }
          if (value._type === 'map') {
            return new Map(value.value);
          }
          if (value._type === 'set') {
            return new Set(value.value);
          }
        }
        return value;
      }
    }
  }
};

@NgModule({
  imports: [
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      // 使用自定义序列化选项
      serializationOptions
    })
  ],
  // ...
})
export class AppModule { }
```

## 最佳实践与性能优化

### 1. 状态设计最佳实践

- 保持状态扁平化
- 避免深层嵌套
- 使用最小完备表示
- 明确数据所有权

### 2. 状态范式化

```typescript
// 不良实践：嵌套数据结构
interface BadStateDesign {
  customers: {
    list: Customer[];
    selectedCustomer: {
      details: Customer;
      orders: {
        list: Order[];
        selectedOrder: {
          details: Order;
          items: OrderItem[];
        }
      }
    }
  }
}

// 良好实践：范式化数据结构
interface GoodStateDesign {
  customers: {
    entities: { [id: string]: Customer };
    ids: string[];
    selectedId: string | null;
    loading: boolean;
    error: string | null;
  };
  orders: {
    entities: { [id: string]: Order };
    ids: string[];
    selectedId: string | null;
    customerOrderMap: { [customerId: string]: string[] };
    loading: boolean;
    error: string | null;
  };
  orderItems: {
    entities: { [id: string]: OrderItem };
    ids: string[];
    orderItemsMap: { [orderId: string]: string[] };
    loading: boolean;
    error: string | null;
  };
}
```

### 3. 可重用的Action模式

创建可重用的Action创建器模式，减少代码重复：

```typescript
// 实体操作的通用Action创建器工厂
export function createEntityActions<T>(entityName: string) {
  const loadAll = createAction(`[${entityName}] Load All`);
  const loadAllSuccess = createAction(
    `[${entityName}] Load All Success`,
    props<{ entities: T[] }>()
  );
  const loadAllFailure = createAction(
    `[${entityName}] Load All Failure`,
    props<{ error: any }>()
  );
  
  const loadOne = createAction(
    `[${entityName}] Load One`,
    props<{ id: string }>()
  );
  const loadOneSuccess = createAction(
    `[${entityName}] Load One Success`,
    props<{ entity: T }>()
  );
  const loadOneFailure = createAction(
    `[${entityName}] Load One Failure`,
    props<{ error: any }>()
  );
  
  const create = createAction(
    `[${entityName}] Create`,
    props<{ entity: T }>()
  );
  const createSuccess = createAction(
    `[${entityName}] Create Success`,
    props<{ entity: T }>()
  );
  const createFailure = createAction(
    `[${entityName}] Create Failure`,
    props<{ error: any }>()
  );
  
  const update = createAction(
    `[${entityName}] Update`,
    props<{ id: string; changes: Partial<T> }>()
  );
  const updateSuccess = createAction(
    `[${entityName}] Update Success`,
    props<{ id: string; changes: Partial<T> }>()
  );
  const updateFailure = createAction(
    `[${entityName}] Update Failure`,
    props<{ error: any }>()
  );
  
  const remove = createAction(
    `[${entityName}] Remove`,
    props<{ id: string }>()
  );
  const removeSuccess = createAction(
    `[${entityName}] Remove Success`,
    props<{ id: string }>()
  );
  const removeFailure = createAction(
    `[${entityName}] Remove Failure`,
    props<{ error: any }>()
  );
  
  return {
    loadAll,
    loadAllSuccess,
    loadAllFailure,
    loadOne,
    loadOneSuccess,
    loadOneFailure,
    create,
    createSuccess,
    createFailure,
    update,
    updateSuccess,
    updateFailure,
    remove,
    removeSuccess,
    removeFailure
  };
}

// 使用工厂创建产品Actions
export const ProductActions = createEntityActions<Product>('Product');
```

### 4. Effect错误处理策略

在复杂应用中实现健壮的错误处理：

```typescript
@Injectable()
export class ProductEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadAll),
      exhaustMap(() =>
        this.productService.getAll().pipe(
          map(products => ProductActions.loadAllSuccess({ entities: products })),
          catchError(error => {
            // 记录错误
            this.errorService.logError('加载产品失败', error);
            
            // 根据错误类型返回不同的错误Action
            if (error.status === 401) {
              // 先处理会话过期
              this.authService.handleSessionExpired();
              return of(AuthActions.sessionExpired({ redirectUrl: this.router.url }));
            }
            
            // 显示用户友好的错误消息
            this.notificationService.showError('无法加载产品，请稍后重试');
            
            // 返回失败Action
            return of(ProductActions.loadAllFailure({ 
              error: {
                message: error.message || '未知错误',
                status: error.status,
                timestamp: new Date().toISOString()
              }
            }));
          })
        )
      )
    )
  );
  
  // 全局错误处理Effect
  globalErrorHandler$ = createEffect(() =>
    this.actions$.pipe(
      // 捕获所有包含'Failure'的Action类型
      filter((action: any) => action.type.includes('Failure')),
      tap(action => {
        // 记录所有错误
        console.error(`[错误处理] ${action.type}:`, action.error);
        
        // 可以添加全局处理逻辑
        // 例如错误分析、日志上报等
      })
    ),
    { dispatch: false } // 不分发新Action
  );
  
  constructor(
    private actions$: Actions,
    private productService: ProductService,
    private errorService: ErrorService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}
}
```

### 5. 高性能Selector策略

优化Selector以提高渲染性能：

```typescript
// 基本选择器
export const selectProductState = (state: AppState) => state.products;

// 派生选择器
export const selectAllProducts = createSelector(
  selectProductState,
  productAdapter.getSelectors().selectAll
);

// 带过滤条件的选择器
export const selectProductsByCategory = (category: string) => createSelector(
  selectAllProducts,
  (products) => products.filter(p => p.category === category)
);

// 记忆化选择器工厂
export function createSelectProductsByPriceRange(min: number, max: number) {
  return createSelector(
    selectAllProducts,
    (products) => products.filter(p => p.price >= min && p.price <= max)
  );
}

// 组合多个选择器
export const selectProductsWithInventory = createSelector(
  selectAllProducts,
  selectInventoryState,
  (products, inventory) => products.map(product => ({
    ...product,
    inStock: inventory.entities[product.id]?.quantity > 0,
    stockLevel: inventory.entities[product.id]?.quantity || 0
  }))
);

// 使用选择器的组件
@Component({
  // ...
})
export class ProductListComponent implements OnInit {
  // 价格范围选择器
  private priceRangeSelectors: { [key: string]: MemoizedSelector<AppState, Product[]> } = {};
  
  // 产品列表
  products$ = this.store.select(selectAllProducts);
  
  // 根据条件筛选
  getProductsByPriceRange(min: number, max: number): Observable<Product[]> {
    // 创建缓存键
    const key = `${min}-${max}`;
    
    // 检查缓存
    if (!this.priceRangeSelectors[key]) {
      // 创建并缓存选择器
      this.priceRangeSelectors[key] = createSelectProductsByPriceRange(min, max);
    }
    
    // 使用缓存的选择器
    return this.store.select(this.priceRangeSelectors[key]);
  }
  
  constructor(private store: Store<AppState>) {}
  
  ngOnInit() {
    this.store.dispatch(ProductActions.loadAll());
  }
}
```

### 6. 开发者工具与调试

使用NgRx开发者工具增强调试体验：

```typescript
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

@NgModule({
  imports: [
    StoreModule.forRoot(reducers, { metaReducers }),
    // 开发环境配置开发者工具
    !environment.production ? 
      StoreDevtoolsModule.instrument({
        maxAge: 25, // 保留最近的25个状态
        logOnly: environment.production, // 生产环境只记录，不允许时间旅行
        autoPause: true, // 在扩展打开时暂停记录动作和状态变化
        trace: false, // 如果设置为true，将包含在开发工具中的追踪信息
        traceLimit: 75, // 最大跟踪堆栈帧数量
        connectInZone: true // 如果设置为true，通过ngZone连接到Redux Devtools
      }) : []
  ]
})
export class AppModule {}

// 添加自定义序列化/反序列化逻辑处理不可序列化的对象
const serializationOptions = {
  serialize: {
    options: {
      // 自定义序列化函数，处理日期、Map等
      replacer: (key, value) => {
        if (value instanceof Date) {
          return { _isDate: true, value: value.toISOString() };
        }
        if (value instanceof Map) {
          return { _isMap: true, value: Array.from(value.entries()) };
        }
        if (value instanceof Set) {
          return { _isSet: true, value: Array.from(value) };
        }
        return value;
      }
    }
  },
  deserialize: {
    options: {
      // 自定义反序列化函数
      reviver: (key, value) => {
        if (value && value._isDate) {
          return new Date(value.value);
        }
        if (value && value._isMap) {
          return new Map(value.value);
        }
        if (value && value._isSet) {
          return new Set(value.value);
        }
        return value;
      }
    }
  }
};
```

### 7. 大型应用结构模式

```
┌───────────────────────────────────────────────────┐
│                    应用功能模块                     │
├───────────┬───────────┬────────────┬──────────────┤
│  核心模块   │ 共享模块   │  特征模块    │   构建块模块  │
│ (Core)    │ (Shared)  │ (Feature)  │  (Building   │
│           │           │            │   Blocks)    │
├───────────┴───────────┴────────────┴──────────────┤
│                     NgRx架构层                     │
├─────────┬─────────┬──────────┬─────────┬──────────┤
│ Actions │ Reducers│ Selectors│ Effects │ Services │
├─────────┴─────────┴──────────┴─────────┴──────────┤
│                   应用领域模型                      │
└───────────────────────────────────────────────────┘
```

推荐的项目结构：

```
src/
├── app/
│   ├── core/                 # 核心服务和单例
│   │   ├── auth/             # 认证相关
│   │   ├── http/             # HTTP拦截器
│   │   └── store/            # 核心状态管理
│   │       ├── index.ts      # 主导出
│   │       ├── app.state.ts  # 根状态类型定义
│   │       └── meta-reducers/ # 元减速器
│   │
│   ├── features/             # 业务功能模块
│   │   ├── products/         # 产品功能
│   │   │   ├── components/   # 组件
│   │   │   ├── containers/   # 容器组件(连接状态)
│   │   │   ├── services/     # 服务
│   │   │   ├── models/       # 类型定义
│   │   │   └── store/        # 特征状态
│   │   │       ├── actions/  # 产品动作
│   │   │       ├── reducers/ # 产品减速器
│   │   │       ├── effects/  # 产品效果
│   │   │       └── selectors/ # 产品选择器
│   │   │
│   │   ├── orders/           # 订单功能
│   │   └── customers/        # 客户功能
│   │
│   ├── shared/               # 共享组件和指令
│   │   ├── components/       # 通用UI组件
│   │   ├── directives/       # 通用指令
│   │   └── pipes/            # 通用管道
│   │
│   └── building-blocks/      # 可重用的构建块
│       ├── data-table/       # 数据表格模块
│       └── form-controls/    # 表单控件模块
│
└── environments/            # 环境配置
```

### 8. 状态变更追踪与性能监控

实现状态变更的监控与性能追踪：

```typescript
// 创建监控元减速器
export function monitorReducer(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
  return function(state, action) {
    const start = performance.now();
    const nextState = reducer(state, action);
    const end = performance.now();
    
    const duration = end - start;
    
    // 记录时间较长的状态计算
    if (duration > 5) { // 大于5ms的状态计算被视为"慢"
      console.warn(`[性能] 状态计算过慢 (${duration.toFixed(2)}ms) for action: ${action.type}`);
    }
    
    // 可以将性能数据发送到监控系统
    if (environment.enableMetrics) {
      MetricsService.trackStateChange({
        actionType: action.type,
        duration,
        stateSize: calculateStateSize(nextState),
        timestamp: new Date().toISOString()
      });
    }
    
    return nextState;
  };
}

// 计算状态大小的辅助函数
function calculateStateSize(state: any): number {
  // 简单实现：将状态转换为JSON并计算字节大小
  return new TextEncoder().encode(JSON.stringify(state)).length;
}

// 在元减速器中注册
export const metaReducers: MetaReducer<AppState>[] = [
  monitorReducer
];
```

### 9. 延迟加载的状态持久化

针对大型应用的状态持久化策略：

```typescript
import { ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';

// 选择性持久化的元减速器
export function persistState(reducer: ActionReducer<any>): ActionReducer<any> {
  // 只持久化特定的状态键
  return localStorageSync({
    keys: [
      { auth: ['user', 'token'] }, // 只保存auth状态的特定字段
      'ui',                       // 整个ui状态
      { settings: ['theme', 'language'] } // 只保存settings的特定字段
    ],
    rehydrate: true,
    removeOnUndefined: true,
    // 添加存储前的转换
    storageKeySerializer: (key) => `app_state_${key}`,
    // 添加序列化选项
    serialize: (state) => {
      // 可以在这里添加压缩逻辑
      return JSON.stringify(state);
    },
    // 添加反序列化选项
    deserialize: (state) => {
      try {
        return JSON.parse(state);
      } catch (e) {
        console.error('Failed to deserialize state', e);
        return {};
      }
    },
  })(reducer);
}

// 对于延迟加载的模块，可以配置部分持久化
export const DYNAMIC_STORAGE_KEYS = new InjectionToken<string[]>('DynamicStorageKeys');

@NgModule({
  imports: [
    StoreModule.forFeature('admin', adminReducer, {
      // 特征模块自己的元减速器
      metaReducers: [
        // 创建特定于功能的持久化配置
        (reducer: ActionReducer<any>): ActionReducer<any> => {
          return localStorageSync({
            keys: ['adminPreferences'], // 只持久化此特定功能的设置
            rehydrate: true,
            storageKeySerializer: key => `admin_${key}`
          })(reducer);
        }
      ]
    })
  ],
  providers: [
    // 注册此模块的存储键
    { 
      provide: DYNAMIC_STORAGE_KEYS, 
      useValue: ['admin'], 
      multi: true 
    }
  ]
})
export class AdminModule { }
```

### 10. 优化重复选择器执行

监控和优化选择器执行：

```typescript
// 创建选择器监控函数
export function monitorSelector<T, V>(
  selector: MemoizedSelector<T, V>,
  name: string
): MemoizedSelector<T, V> {
  // 计数器
  let hitCount = 0;
  let missCount = 0;
  
  // 创建监控选择器
  const monitoredSelector = createSelector(
    selector.projector as any,
    (...args: any[]) => {
      // 最后一个参数是结果
      const result = args[args.length - 1];
      // 确定是否使用了缓存
      if ((selector as any).memoizedProjector.hasOwnProperty('__cache_key__')) {
        hitCount++;
      } else {
        missCount++;
      }
      
      // 定期记录
      if ((hitCount + missCount) % 10 === 0) {
        console.log(`选择器 [${name}]: 命中 ${hitCount}, 未命中 ${missCount}, 比率 ${(hitCount / (hitCount + missCount) * 100).toFixed(2)}%`);
      }
      
      return result;
    }
  );
  
  return monitoredSelector;
}

// 使用监控选择器
export const selectProductsWithMonitoring = monitorSelector(
  selectAllProducts,
  'selectAllProducts'
);

// 在组件中
@Component({
  // ...
})
export class ProductListComponent {
  // 使用监控选择器
  products$ = this.store.select(selectProductsWithMonitoring);
}