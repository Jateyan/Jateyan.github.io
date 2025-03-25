---
title: Angular GraphQL集成
description: Angular应用中的GraphQL集成指南，包括Apollo Client配置、查询与变更、状态管理集成和订阅实现
head:
  - - meta
    - name: keywords
      content: Angular, GraphQL, Apollo Client, 查询与变更, 状态管理, 订阅
---
# Angular GraphQL集成

本文档详细介绍了Angular应用中的GraphQL集成方案，包括Apollo Client的配置与使用、查询与变更操作、状态管理集成以及实时订阅的实现。GraphQL作为一种现代化的API查询语言，可以有效解决RESTful API中的数据过度获取或获取不足等问题，同时提供更灵活的数据查询能力和类型安全保障。

## 目录

- [Apollo Client配置](#apollo-client配置)
- [查询与变更](#查询与变更)
- [状态管理集成](#状态管理集成)
- [订阅实现](#订阅实现)

## Apollo Client配置

Apollo Client是GraphQL客户端中最流行的实现之一，它提供了丰富的功能，包括缓存、状态管理、错误处理和实时订阅等。在Angular项目中，我们可以使用`apollo-angular`库来集成Apollo Client。

### Apollo Client架构概述

Apollo Client的核心架构由以下几个关键部分组成：

```
+---------------------------------------------------+
|                Apollo Client                       |
+-------------------+-----------------------------+--+
|                   |                             |
| Client Interface  |         Cache               |
| (Query/Mutation)  |      (InMemoryCache)        |
|                   |                             |
+-------------------+-----------------------------+
|                                                 |
|                  Link Chain                     |
| +---------------+  +---------------+  +-------+ |
| |  Auth Link    |->| Error Link    |->| HTTP  | |
| |               |  |               |  | Link  | |
| +---------------+  +---------------+  +-------+ |
+---------------------------------------------------+
                       |
                       v
                  +----------+
                  | GraphQL  |
                  | Server   |
                  +----------+
```

### 基础配置

首先，我们需要安装必要的依赖项：

```bash
# 安装Apollo Angular相关包
npm install @apollo/client apollo-angular graphql
```

接下来，在Angular应用的模块中配置Apollo Client：

```typescript
// Apollo Client配置
import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => {
        return {
          // 设置GraphQL服务器端点
          link: httpLink.create({ uri: 'http://localhost:4000/graphql' }),
          // 配置内存缓存
          cache: new InMemoryCache({
            typePolicies: {
              Query: {
                fields: {
                  // 自定义字段策略，处理数据合并
                  books: {
                    // 对books查询结果进行合并，适用于分页加载
                    merge(existing = [], incoming) {
                      return [...existing, ...incoming];
                    }
                  }
                }
              }
            }
          }),
          // 默认请求策略
          defaultOptions: {
            watchQuery: {
              fetchPolicy: 'cache-and-network', // 先从缓存获取，再从网络获取更新
              errorPolicy: 'all' // 同时处理错误和数据
            }
          }
        };
      },
      deps: [HttpLink]
    }
  ]
})
export class AppModule { }
```

在上面的配置中，我们设置了两个核心组件：

1. **Link**：定义了数据请求如何发送到GraphQL服务器的管道
   - `httpLink.create({ uri: '...' })`创建了一个HTTP链接，指向GraphQL服务器端点

2. **Cache**：定义了如何在客户端存储和管理查询结果
   - `new InMemoryCache({...})`创建了内存缓存，并配置了类型策略
   - `typePolicies`允许自定义特定字段的缓存行为，例如合并分页数据

### 认证配置

在实际应用中，我们通常需要为GraphQL请求添加认证信息。Apollo Client使用链接链(Link Chain)的概念来实现请求拦截和转换：

```typescript
// 认证链接配置
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { HttpLink } from 'apollo-angular/http';
import { from } from 'rxjs';

export function createApollo(httpLink: HttpLink) {
  // 认证链接：为请求添加认证头
  const authLink = setContext((_, { headers }) => {
    // 从localStorage获取认证令牌
    const token = localStorage.getItem('token');
    
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : ''
      }
    };
  });

  // 错误处理链接：捕获GraphQL错误和网络错误
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );
      });
    }
    
    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  });

  // HTTP链接：发送请求到GraphQL服务器
  const http = httpLink.create({
    uri: 'http://localhost:4000/graphql',
    // 跨域请求是否携带凭证
    withCredentials: true
  });

  // 组合链接链
  const link = from([
    errorLink,  // 首先经过错误处理链接
    authLink,   // 然后经过认证链接
    http        // 最后到HTTP链接发送请求
  ]);

  // 创建并返回Apollo客户端配置
  return {
    link,
    cache: new InMemoryCache({
      // 详细的缓存配置
      typePolicies: {
        // 为特定类型定义策略
        Query: {
          fields: {
            books: {
              // 分页数据合并策略
              keyArgs: ['category'], // 使用category参数作为缓存键
              merge(existing = [], incoming, { args }) {
                if (args && args.offset === 0) {
                  return incoming; // 如果是首页，直接返回新数据
                }
                return [...existing, ...incoming]; // 否则合并数据
              }
            }
          }
        },
        // 为Book类型定义唯一标识符策略
        Book: {
          keyFields: ['id'] // 使用id字段作为唯一标识符
        }
      }
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all'
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all'
      },
      mutate: {
        errorPolicy: 'all'
      }
    }
  };
}

// 在模块中提供配置
@NgModule({
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink]
    }
  ]
})
export class GraphQLModule { }
```

链接链的工作流程：

```
+------------+    +------------+    +------------+    +------------+
| 初始请求   | -> | 错误链接   | -> | 认证链接   | -> | HTTP链接   | -> GraphQL服务器
+------------+    +------------+    +------------+    +------------+
                   |                 |                 |
                   v                 v                 v
                  错误处理          添加认证头        发送HTTP请求
```

### 高级配置选项

Apollo Client提供了许多高级配置选项，以满足不同的应用需求：

#### 1. 多个Apollo客户端

对于需要连接多个GraphQL服务器的应用，可以配置多个Apollo客户端实例：

```typescript
// 多客户端配置
import { ApolloModule, APOLLO_OPTIONS, Apollo } from 'apollo-angular';
import { InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { NgModule, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GraphQLConfigService {
  constructor(
    private apollo: Apollo,
    private httpLink: HttpLink
  ) {}

  createMainClient() {
    this.apollo.create({
      link: this.httpLink.create({ uri: 'http://main-api/graphql' }),
      cache: new InMemoryCache(),
      name: 'mainClient'
    });
  }

  createSecondaryClient() {
    this.apollo.create({
      link: this.httpLink.create({ uri: 'http://secondary-api/graphql' }),
      cache: new InMemoryCache(),
      name: 'secondaryClient'
    });
  }
}

// 在应用初始化时配置
@NgModule({
  imports: [ApolloModule],
  providers: [GraphQLConfigService]
})
export class GraphQLModule {
  constructor(graphqlConfig: GraphQLConfigService) {
    graphqlConfig.createMainClient();
    graphqlConfig.createSecondaryClient();
  }
}

// 使用特定客户端
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apollo: Apollo) {}

  getUsers() {
    return this.apollo.use('secondaryClient')
      .watchQuery({
        query: GET_USERS
      })
      .valueChanges;
  }
}
```

#### 2. 批量操作

通过配置批处理链接，可以将多个GraphQL操作合并为一个HTTP请求，减少网络往返：

```typescript
import { BatchHttpLink } from '@apollo/client/link/batch-http';

const batchLink = new BatchHttpLink({
  uri: 'http://localhost:4000/graphql',
  batchMax: 5, // 最多合并5个请求
  batchInterval: 20 // 等待20ms进行批处理
});

const client = {
  link: from([authLink, errorLink, batchLink]),
  cache: new InMemoryCache()
};
```

#### 3. 持久化缓存

使用Apollo Cache Persist可以将缓存持久化到localStorage或其他存储：

```typescript
import { persistCache } from 'apollo3-cache-persist';

// 创建缓存
const cache = new InMemoryCache({/* 配置 */});

// 持久化缓存
async function setupCache() {
  await persistCache({
    cache,
    storage: window.localStorage,
    key: 'apollo-cache', // 存储键名
    maxSize: 1048576, // 最大1MB
    debug: !environment.production
  });
}

// 初始化
setupCache().then(() => {
  // 创建Apollo客户端
});
```

通过这些配置，我们可以根据应用需求定制Apollo Client的行为，优化性能和用户体验。

以上是Apollo Client配置的详细说明，接下来我们将探讨如何使用Apollo Client进行查询和变更操作。

## 查询与变更

在GraphQL中，数据操作主要分为查询(Query)和变更(Mutation)两种类型。查询用于获取数据，而变更用于修改数据。Apollo Client提供了强大的API来处理这两种操作类型。

### GraphQL查询与变更工作流程

```
+-------------+         +-------------+         +-------------+
|   客户端    |         | Apollo客户端 |         |  GraphQL服务器 |
+-------------+         +-------------+         +-------------+
      |                       |                       |
      | 发起查询/变更          |                       |
      |---------------------->|                       |
      |                       | 检查缓存(查询时)       |
      |                       |--------------------   |
      |                       |                   |   |
      |                       |<-------------------   |
      |                       | 缓存未命中/变更操作    |
      |                       |---------------------->|
      |                       |                       | 处理请求
      |                       |                       |-------
      |                       |                       |      |
      |                       |                       |<------
      |                       | 返回结果              |
      |                       |<----------------------|
      |                       | 更新缓存              |
      |                       |--------------------   |
      |                       |                   |   |
      |                       |<-------------------   |
      | 返回数据               |                       |
      |<----------------------|                       |
      |                       |                       |
```

### 查询实现

GraphQL查询是获取数据的主要方式。在Apollo Angular中，我们可以使用`watchQuery`或`query`方法来执行查询操作。

#### 1. 定义查询文档

首先，我们需要使用GraphQL语法定义查询文档：

```typescript
// 使用gql标签函数定义查询
import { gql } from 'apollo-angular';

// 分页查询定义
const GET_BOOKS = gql`
  query GetBooks($first: Int!, $after: String) {
    books(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          title
          author
          publishedDate
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
```

查询文档包含以下部分：
- **操作类型**：`query`表示这是一个查询操作
- **操作名称**：`GetBooks`是操作的名称，便于调试和监控
- **变量**：`$first`和`$after`是传递给查询的参数
- **字段选择**：指定要返回的数据字段
- **分页信息**：使用Relay-style游标分页模式，包含`edges`和`pageInfo`

#### 2. 创建查询服务

接下来，我们创建一个服务来封装查询操作：

```typescript
// 定义接口
export interface BookNode {
  id: string;
  title: string;
  author: string;
  publishedDate: string;
}

export interface BookEdge {
  cursor: string;
  node: BookNode;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string;
}

export interface BookConnection {
  edges: BookEdge[];
  pageInfo: PageInfo;
}

// 查询服务
@Injectable({ providedIn: 'root' })
export class BookService {
  constructor(private apollo: Apollo) {}

  /**
   * 获取书籍列表
   * @param first 获取数量
   * @param after 游标，用于分页
   * @returns 书籍连接对象的可观察流
   */
  getBooks(first: number, after?: string): Observable<BookConnection> {
    return this.apollo.watchQuery<{ books: BookConnection }>({
      query: GET_BOOKS,
      variables: { first, after },
      // 缓存策略
      fetchPolicy: 'cache-and-network', // 先从缓存获取，同时从网络获取更新
      notifyOnNetworkStatusChange: true, // 网络状态变化时通知
      errorPolicy: 'all' // 同时处理错误和数据
    }).valueChanges.pipe(
      map(result => result.data.books),
      catchError(error => {
        console.error('获取书籍失败', error);
        return throwError(() => new Error('获取书籍列表失败'));
      })
    );
  }
}
```

查询方法说明：
- **watchQuery**：返回一个可观察对象，当后续数据变化时会自动更新
- **query**：只返回一次数据，适用于一次性查询
- **fetchPolicy**：定义缓存和网络请求的交互方式
  - `cache-first`：优先使用缓存，如果没有则请求网络（默认）
  - `cache-and-network`：同时使用缓存和网络请求，提供即时响应和最新数据
  - `network-only`：始终从网络获取，但会更新缓存
  - `no-cache`：不使用缓存，也不更新缓存

#### 3. 在组件中使用查询

```typescript
// 组件使用
@Component({
  selector: 'app-book-list',
  template: `
    <!-- 加载状态处理 -->
    <div *ngIf="loading$ | async" class="loading">
      <mat-spinner diameter="40"></mat-spinner>
    </div>

    <!-- 错误处理 -->
    <div *ngIf="error$ | async as error" class="error">
      <p>加载失败: {{ error }}</p>
      <button (click)="loadBooks()">重试</button>
    </div>

    <!-- 数据展示 -->
    <div *ngIf="books$ | async as books" class="book-list">
      <div *ngFor="let edge of books.edges" class="book-item">
        <h3>{{ edge.node.title }}</h3>
        <p>作者: {{ edge.node.author }}</p>
        <p>发布日期: {{ edge.node.publishedDate | date:'yyyy-MM-dd' }}</p>
      </div>
      
      <!-- 分页控制 -->
      <button 
        *ngIf="books.pageInfo.hasNextPage"
        (click)="loadMore(books.pageInfo.endCursor)"
        [disabled]="loadingMore$ | async">
        {{ (loadingMore$ | async) ? '加载中...' : '加载更多' }}
      </button>
    </div>
  `,
  styles: [`
    .book-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    
    .book-item {
      border: 1px solid #eee;
      border-radius: 4px;
      padding: 16px;
      transition: transform 0.2s;
    }
    
    .book-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .loading, .error {
      text-align: center;
      padding: 20px;
    }
  `]
})
export class BookListComponent implements OnInit {
  books$: Observable<BookConnection>;
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loadingMore$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  error$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.loading$.next(true);
    this.error$.next(null);
    
    this.books$ = this.bookService.getBooks(10).pipe(
      tap(() => this.loading$.next(false)),
      catchError(err => {
        this.loading$.next(false);
        this.error$.next(err.message);
        return EMPTY;
      })
    );
  }

  loadMore(cursor: string): void {
    this.loadingMore$.next(true);
    
    // 获取更多数据并与现有数据合并
    this.bookService.getBooks(10, cursor).pipe(
      withLatestFrom(this.books$),
      map(([newData, existingData]) => {
        // 手动合并数据（如果Apollo缓存策略无法满足需求）
        return {
          edges: [...existingData.edges, ...newData.edges],
          pageInfo: newData.pageInfo
        };
      }),
      takeUntil(this.loadingMore$.pipe(filter(loading => !loading))),
      finalize(() => this.loadingMore$.next(false))
    ).subscribe({
      next: (mergedData) => {
        // 更新数据流
        this.books$ = of(mergedData);
      },
      error: (err) => {
        this.error$.next(`加载更多失败: ${err.message}`);
      }
    });
  }
}
```

这个组件展示了如何：
- 处理加载状态和错误
- 使用异步管道(`async pipe`)自动订阅和取消订阅
- 实现"加载更多"分页功能
- 使用RxJS操作符处理数据流

### 变更实现

变更(Mutation)用于修改服务器数据，例如创建、更新或删除资源。

#### 1. 定义变更文档

```typescript
// 变更定义
const CREATE_BOOK = gql`
  mutation CreateBook($input: CreateBookInput!) {
    createBook(input: $input) {
      id
      title
      author
      publishedDate
    }
  }
`;

// 输入类型定义
export interface CreateBookInput {
  title: string;
  author: string;
  publishedDate: string;
  categories?: string[];
}
```

变更文档包含：
- **操作类型**：`mutation`表示这是一个变更操作
- **操作名称**：`CreateBook`
- **变量**：`$input`是传递给变更的输入对象
- **返回字段**：指定变更后要返回的数据

#### 2. 创建变更服务

```typescript
// 变更服务
@Injectable({ providedIn: 'root' })
export class BookMutationService {
  constructor(private apollo: Apollo) {}

  /**
   * 创建书籍
   * @param input 书籍信息
   * @returns 新创建的书籍
   */
  createBook(input: CreateBookInput): Observable<Book> {
    return this.apollo.mutate<{ createBook: Book }>({
      mutation: CREATE_BOOK,
      variables: { input },
      // 乐观响应：在服务器确认前立即更新UI
      optimisticResponse: {
        __typename: 'Mutation',
        createBook: {
          __typename: 'Book',
          id: 'temp-id-' + new Date().getTime(),
          title: input.title,
          author: input.author,
          publishedDate: input.publishedDate
        }
      },
      // 更新缓存
      update: (cache, { data }) => {
        if (!data) return;
        
        // 读取现有查询缓存
        const existingBooks = cache.readQuery<{ books: BookConnection }>({
          query: GET_BOOKS,
          variables: { first: 10 }
        });

        if (!existingBooks) return;

        // 创建新边
        const newEdge = {
          __typename: 'BookEdge',
          cursor: data.createBook.id,
          node: data.createBook
        };

        // 写入更新后的数据
        cache.writeQuery({
          query: GET_BOOKS,
          variables: { first: 10 },
          data: {
            books: {
              __typename: 'BookConnection',
              edges: [newEdge, ...existingBooks.books.edges],
              pageInfo: existingBooks.books.pageInfo
            }
          }
        });
      },
      // 重新获取相关查询
      refetchQueries: [
        {
          query: GET_BOOK_CATEGORIES // 相关查询可能需要刷新
        }
      ]
    }).pipe(
      map(result => result.data.createBook),
      catchError(error => {
        console.error('创建书籍失败', error);
        return throwError(() => new Error('创建书籍失败'));
      })
    );
  }
}
```

变更方法说明：
- **optimisticResponse**：提供临时响应，在服务器确认前立即更新UI
- **update**：回调函数，用于手动更新Apollo缓存
- **refetchQueries**：指定在变更完成后需要重新执行的查询

#### 3. 在组件中使用变更

```typescript
// 组件使用
@Component({
  selector: 'app-book-form',
  template: `
    <form [formGroup]="bookForm" (ngSubmit)="onSubmit()">
      <mat-form-field>
        <mat-label>标题</mat-label>
        <input matInput formControlName="title" required>
        <mat-error *ngIf="bookForm.get('title').hasError('required')">
          标题是必填项
        </mat-error>
      </mat-form-field>
      
      <mat-form-field>
        <mat-label>作者</mat-label>
        <input matInput formControlName="author" required>
        <mat-error *ngIf="bookForm.get('author').hasError('required')">
          作者是必填项
        </mat-error>
      </mat-form-field>
      
      <mat-form-field>
        <mat-label>发布日期</mat-label>
        <input matInput [matDatepicker]="picker" formControlName="publishedDate">
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>
      
      <div class="actions">
        <button mat-button type="button" (click)="onCancel()">取消</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="bookForm.invalid || submitting">
          {{ submitting ? '保存中...' : '保存' }}
        </button>
      </div>
      
      <mat-error *ngIf="error">{{ error }}</mat-error>
    </form>
  `,
  styles: [`
    form {
      display: flex;
      flex-direction: column;
      max-width: 500px;
      margin: 0 auto;
    }
    
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
  `]
})
export class BookFormComponent implements OnInit {
  bookForm: FormGroup;
  submitting = false;
  error: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private bookMutation: BookMutationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      publishedDate: [new Date(), Validators.required]
    });
  }
  
  onSubmit(): void {
    if (this.bookForm.invalid) return;
    
    this.submitting = true;
    this.error = null;
    
    const input: CreateBookInput = {
      title: this.bookForm.get('title').value,
      author: this.bookForm.get('author').value,
      publishedDate: this.formatDate(this.bookForm.get('publishedDate').value)
    };
    
    this.bookMutation.createBook(input).subscribe({
      next: (book) => {
        this.submitting = false;
        this.snackBar.open('书籍创建成功', '关闭', { duration: 3000 });
        this.router.navigate(['/books', book.id]);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.message;
      }
    });
  }
  
  onCancel(): void {
    this.router.navigate(['/books']);
  }
  
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
```

### 优化和最佳实践

#### 1. 片段(Fragments)的使用

对于在多个查询和变更中重复使用的字段集，可以使用片段来减少代码重复：

```typescript
// 定义可重用片段
const BOOK_FRAGMENT = gql`
  fragment BookDetails on Book {
    id
    title
    author
    publishedDate
    categories {
      id
      name
    }
  }
`;

// 在查询中使用片段
const GET_BOOK = gql`
  query GetBook($id: ID!) {
    book(id: $id) {
      ...BookDetails
    }
  }
  ${BOOK_FRAGMENT}
`;

// 在变更中使用片段
const UPDATE_BOOK = gql`
  mutation UpdateBook($id: ID!, $input: UpdateBookInput!) {
    updateBook(id: $id, input: $input) {
      ...BookDetails
    }
  }
  ${BOOK_FRAGMENT}
`;
```

#### 2. 乐观响应的使用

为了提供更好的用户体验，可以使用乐观响应，在服务器响应之前立即更新UI：

```typescript
deleteBook(id: string): Observable<boolean> {
  return this.apollo.mutate<{ deleteBook: boolean }>({
    mutation: DELETE_BOOK,
    variables: { id },
    // 乐观响应
    optimisticResponse: {
      __typename: 'Mutation',
      deleteBook: true
    },
    // 更新缓存
    update: (cache) => {
      // 从缓存中移除已删除的书籍
      cache.modify({
        fields: {
          books(existingBooks = {}, { readField }) {
            const newEdges = existingBooks.edges.filter(
              edge => readField('id', edge.node) !== id
            );
            
            return {
              ...existingBooks,
              edges: newEdges
            };
          }
        }
      });
    }
  }).pipe(
    map(result => result.data.deleteBook)
  );
}
```

#### 3. 缓存更新策略

Apollo Client提供了多种方式来更新缓存：

##### 自动缓存更新

对于简单的情况，Apollo可以自动更新缓存：

```typescript
// 当ID字段匹配时，Apollo会自动更新对象
const UPDATE_BOOK = gql`
  mutation UpdateBook($id: ID!, $input: UpdateBookInput!) {
    updateBook(id: $id, input: $input) {
      id  # 必须包含ID字段
      title
      author
    }
  }
`;
```

##### 重新获取查询

对于复杂情况，可以指定需要重新获取的查询：

```typescript
createBook(input: CreateBookInput): Observable<Book> {
  return this.apollo.mutate<{ createBook: Book }>({
    mutation: CREATE_BOOK,
    variables: { input },
    // 重新获取相关查询
    refetchQueries: [
      { 
        query: GET_BOOKS,
        variables: { first: 10 }
      }
    ],
    // 等待重新获取完成
    awaitRefetchQueries: true
  }).pipe(
    map(result => result.data.createBook)
  );
}
```

##### 手动更新缓存

对于最复杂的情况，可以使用`update`函数手动更新缓存：

```typescript
update: (cache, { data }) => {
  // 读取缓存
  const existingData = cache.readQuery<{ books: BookConnection }>({
    query: GET_BOOKS,
    variables: { first: 10 }
  });
  
  // 修改缓存数据
  const updatedData = {
    ...existingData,
    books: {
      ...existingData.books,
      edges: [
        // 添加新数据到数组开头
        {
          __typename: 'BookEdge',
          cursor: data.createBook.id,
          node: data.createBook
        },
        ...existingData.books.edges
      ]
    }
  };
  
  // 写入更新后的数据
  cache.writeQuery({
    query: GET_BOOKS,
    variables: { first: 10 },
    data: updatedData
  });
}
```

通过这些技术，我们可以高效地实现GraphQL查询和变更，并提供流畅的用户体验。下一节，我们将探讨如何将GraphQL与状态管理系统集成。

## 状态管理集成

在大型Angular应用中，GraphQL与状态管理库(如NgRx)的集成可以提供更强大的数据管理能力。这种集成可以使应用更容易预测、测试和维护。

### GraphQL与NgRx集成架构

```
+----------------+      +----------------+      +----------------+
|                |      |                |      |                |
|  组件(Components) |<---->|   NgRx Store   |<---->| GraphQL (Apollo) |
|                |      |                |      |                |
+----------------+      +----------------+      +----------------+
        ^                      ^                       ^
        |                      |                       |
        v                      v                       v
+----------------+      +----------------+      +----------------+
|                |      |                |      |                |
|    Actions     |----->|    Effects     |----->|   GraphQL API  |
|                |      |                |      |                |
+----------------+      +----------------+      +----------------+
        ^                      |
        |                      v
        |             +----------------+
        |             |                |
        +-------------+    Reducers    |
                      |                |
                      +----------------+
```

上图展示了GraphQL与NgRx的集成架构:
1. 组件通过派发Actions请求数据
2. Effects拦截这些Actions并执行GraphQL查询/变更
3. 查询结果通过新的Actions更新Store
4. Store状态变化触发组件更新

### 1. 定义状态模型

首先，我们需要定义与GraphQL结构对应的状态模型：

```typescript
// books/state/book.model.ts
export interface Book {
  id: string;
  title: string;
  author: string;
  publishedDate: string;
}

export interface BookState {
  books: Book[];
  selectedBook: Book | null;
  loading: boolean;
  error: string | null;
  pagination: {
    endCursor: string | null;
    hasNextPage: boolean;
  };
}

export const initialBookState: BookState = {
  books: [],
  selectedBook: null,
  loading: false,
  error: null,
  pagination: {
    endCursor: null,
    hasNextPage: false
  }
};
```

### 2. 定义Actions

然后，定义对应的Actions:

```typescript
// books/state/book.actions.ts
import { createAction, props } from '@ngrx/store';
import { Book } from './book.model';

// 加载书籍
export const loadBooks = createAction(
  '[Books] Load Books',
  props<{ limit: number; cursor?: string }>()
);

export const loadBooksSuccess = createAction(
  '[Books] Load Books Success',
  props<{ 
    books: Book[]; 
    endCursor: string; 
    hasNextPage: boolean; 
    append: boolean 
  }>()
);

export const loadBooksFailure = createAction(
  '[Books] Load Books Failure',
  props<{ error: string }>()
);

// 加载单本书籍
export const loadBook = createAction(
  '[Books] Load Book',
  props<{ id: string }>()
);

export const loadBookSuccess = createAction(
  '[Books] Load Book Success',
  props<{ book: Book }>()
);

export const loadBookFailure = createAction(
  '[Books] Load Book Failure',
  props<{ error: string }>()
);

// 创建书籍
export const createBook = createAction(
  '[Books] Create Book',
  props<{ book: Omit<Book, 'id'> }>()
);

export const createBookSuccess = createAction(
  '[Books] Create Book Success',
  props<{ book: Book }>()
);

export const createBookFailure = createAction(
  '[Books] Create Book Failure',
  props<{ error: string }>()
);

// 删除书籍
export const deleteBook = createAction(
  '[Books] Delete Book',
  props<{ id: string }>()
);

export const deleteBookSuccess = createAction(
  '[Books] Delete Book Success',
  props<{ id: string }>()
);

export const deleteBookFailure = createAction(
  '[Books] Delete Book Failure',
  props<{ error: string }>()
);
```

### 3. 实现Reducers

接下来，实现状态更新的Reducers:

```typescript
// books/state/book.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { initialBookState } from './book.model';
import * as BookActions from './book.actions';

export const bookReducer = createReducer(
  initialBookState,
  
  // 加载书籍列表 - 开始
  on(BookActions.loadBooks, (state, { cursor }) => ({
    ...state,
    loading: true,
    error: null,
    // 如果是加载更多，保留现有书籍，否则清空
    ...(cursor ? {} : { books: [] })
  })),
  
  // 加载书籍列表 - 成功
  on(BookActions.loadBooksSuccess, (state, { books, endCursor, hasNextPage, append }) => ({
    ...state,
    loading: false,
    books: append ? [...state.books, ...books] : books,
    error: null,
    pagination: {
      endCursor,
      hasNextPage
    }
  })),
  
  // 加载书籍列表 - 失败
  on(BookActions.loadBooksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // 加载单本书籍 - 开始
  on(BookActions.loadBook, (state) => ({
    ...state,
    selectedBook: null,
    loading: true,
    error: null
  })),
  
  // 加载单本书籍 - 成功
  on(BookActions.loadBookSuccess, (state, { book }) => ({
    ...state,
    selectedBook: book,
    loading: false,
    error: null
  })),
  
  // 加载单本书籍 - 失败
  on(BookActions.loadBookFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // 创建书籍 - 成功
  on(BookActions.createBookSuccess, (state, { book }) => ({
    ...state,
    books: [book, ...state.books],
    error: null
  })),
  
  // 创建书籍 - 失败
  on(BookActions.createBookFailure, (state, { error }) => ({
    ...state,
    error
  })),
  
  // 删除书籍 - 成功
  on(BookActions.deleteBookSuccess, (state, { id }) => ({
    ...state,
    books: state.books.filter(book => book.id !== id),
    error: null
  })),
  
  // 删除书籍 - 失败
  on(BookActions.deleteBookFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
```

### 4. 创建Selectors

创建选择器以从状态中获取数据：

```typescript
// books/state/book.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BookState } from './book.model';

export const selectBookState = createFeatureSelector<BookState>('books');

export const selectAllBooks = createSelector(
  selectBookState,
  (state: BookState) => state.books
);

export const selectSelectedBook = createSelector(
  selectBookState,
  (state: BookState) => state.selectedBook
);

export const selectBooksLoading = createSelector(
  selectBookState,
  (state: BookState) => state.loading
);

export const selectBooksError = createSelector(
  selectBookState,
  (state: BookState) => state.error
);

export const selectBooksPagination = createSelector(
  selectBookState,
  (state: BookState) => state.pagination
);

export const selectHasMoreBooks = createSelector(
  selectBookState,
  (state: BookState) => state.pagination.hasNextPage
);

export const selectEndCursor = createSelector(
  selectBookState,
  (state: BookState) => state.pagination.endCursor
);
```

### 5. 实现Effects

最关键的部分是实现Effects，将Actions与GraphQL查询连接起来：

```typescript
// books/state/book.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, exhaustMap } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { GET_BOOKS, GET_BOOK, CREATE_BOOK, DELETE_BOOK } from '../graphql/book.queries';
import * as BookActions from './book.actions';

@Injectable()
export class BookEffects {
  constructor(
    private actions$: Actions,
    private apollo: Apollo
  ) {}

  // 加载书籍列表
  loadBooks$ = createEffect(() => this.actions$.pipe(
    ofType(BookActions.loadBooks),
    switchMap(({ limit, cursor }) => 
      this.apollo.watchQuery<any>({
        query: GET_BOOKS,
        variables: { 
          first: limit,
          after: cursor || null
        }
      }).valueChanges.pipe(
        map(({ data }) => {
          const { edges, pageInfo } = data.books;
          const books = edges.map(edge => edge.node);
          
          return BookActions.loadBooksSuccess({
            books,
            endCursor: pageInfo.endCursor,
            hasNextPage: pageInfo.hasNextPage,
            append: !!cursor
          });
        }),
        catchError(error => of(BookActions.loadBooksFailure({ 
          error: error.message 
        })))
      )
    )
  ));

  // 加载单本书籍
  loadBook$ = createEffect(() => this.actions$.pipe(
    ofType(BookActions.loadBook),
    switchMap(({ id }) => 
      this.apollo.query<any>({
        query: GET_BOOK,
        variables: { id }
      }).pipe(
        map(({ data }) => BookActions.loadBookSuccess({ 
          book: data.book 
        })),
        catchError(error => of(BookActions.loadBookFailure({ 
          error: error.message 
        })))
      )
    )
  ));

  // 创建书籍
  createBook$ = createEffect(() => this.actions$.pipe(
    ofType(BookActions.createBook),
    exhaustMap(({ book }) => 
      this.apollo.mutate<any>({
        mutation: CREATE_BOOK,
        variables: { input: book },
        update: (cache, { data }) => {
          // 执行缓存更新逻辑...
        }
      }).pipe(
        map(({ data }) => BookActions.createBookSuccess({ 
          book: data.createBook 
        })),
        catchError(error => of(BookActions.createBookFailure({ 
          error: error.message 
        })))
      )
    )
  ));

  // 删除书籍
  deleteBook$ = createEffect(() => this.actions$.pipe(
    ofType(BookActions.deleteBook),
    exhaustMap(({ id }) => 
      this.apollo.mutate<any>({
        mutation: DELETE_BOOK,
        variables: { id },
        update: (cache) => {
          // 执行缓存更新逻辑...
        }
      }).pipe(
        map(() => BookActions.deleteBookSuccess({ id })),
        catchError(error => of(BookActions.deleteBookFailure({ 
          error: error.message 
        })))
      )
    )
  ));
}
```

### 6. 在组件中使用NgRx + GraphQL

最后，在组件中使用这个集成系统：

```typescript
// books/book-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Book } from './state/book.model';
import * as BookActions from './state/book.actions';
import * as fromBooks from './state/book.selectors';

@Component({
  selector: 'app-book-list',
  template: `
    <div class="book-container">
      <h2>书籍列表</h2>
      
      <button mat-raised-button color="primary" routerLink="/books/new">
        添加新书籍
      </button>
      
      <div *ngIf="loading$ | async" class="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
      
      <div *ngIf="error$ | async as error" class="error">
        <p>加载失败: {{ error }}</p>
        <button mat-button (click)="loadBooks()">重试</button>
      </div>
      
      <div class="book-list">
        <mat-card *ngFor="let book of books$ | async" class="book-card">
          <mat-card-header>
            <mat-card-title>{{ book.title }}</mat-card-title>
            <mat-card-subtitle>{{ book.author }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>发布日期: {{ book.publishedDate | date:'yyyy-MM-dd' }}</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button [routerLink]="['/books', book.id]">查看</button>
            <button mat-button color="warn" (click)="deleteBook(book.id)">删除</button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <div *ngIf="hasMore$ | async" class="load-more">
        <button mat-button (click)="loadMore()">
          {{ (loading$ | async) ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .book-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .book-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 20px;
    }
    
    .book-card {
      transition: transform 0.2s;
    }
    
    .book-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .loading, .error, .load-more {
      text-align: center;
      padding: 20px;
    }
  `]
})
export class BookListComponent implements OnInit {
  books$: Observable<Book[]>;
  loading$: Observable<boolean>;
  error$: Observable<string>;
  hasMore$: Observable<boolean>;
  endCursor$: Observable<string>;
  
  constructor(private store: Store) {}
  
  ngOnInit(): void {
    // 从store获取数据
    this.books$ = this.store.select(fromBooks.selectAllBooks);
    this.loading$ = this.store.select(fromBooks.selectBooksLoading);
    this.error$ = this.store.select(fromBooks.selectBooksError);
    this.hasMore$ = this.store.select(fromBooks.selectHasMoreBooks);
    this.endCursor$ = this.store.select(fromBooks.selectEndCursor);
    
    // 加载初始数据
    this.loadBooks();
  }
  
  loadBooks(): void {
    this.store.dispatch(BookActions.loadBooks({ limit: 10 }));
  }
  
  loadMore(): void {
    // 从store获取当前游标
    this.endCursor$.subscribe(cursor => {
      if (cursor) {
        this.store.dispatch(BookActions.loadBooks({ 
          limit: 10, 
          cursor 
        }));
      }
    }).unsubscribe();
  }
  
  deleteBook(id: string): void {
    if (confirm('确定要删除这本书吗？')) {
      this.store.dispatch(BookActions.deleteBook({ id }));
    }
  }
}
```

### 对比：直接使用Apollo vs NgRx + Apollo

让我们对比这两种方法的不同特点：

| 特性 | 直接使用Apollo | NgRx + Apollo集成 |
|------|---------------|-----------------|
| **数据流** | 组件直接与Apollo服务交互 | 组件 -> Actions -> Effects -> Apollo -> Store -> 组件 |
| **状态管理** | 由Apollo缓存管理 | 由NgRx Store集中管理 |
| **调试能力** | 需要Apollo开发工具 | 可使用Redux DevTools追踪所有状态变化 |
| **代码复杂度** | 较低，适合小型应用 | 较高，但在大型应用中更有条理 |
| **测试难度** | 需要模拟Apollo服务 | 可以独立测试每个部分(Actions, Reducers, Effects) |
| **缓存策略** | 由Apollo缓存策略控制 | 可以在Store层自定义更复杂的缓存逻辑 |
| **离线支持** | 有限 | 更容易实现复杂的离线逻辑 |

### 缓存策略

在集成NgRx和Apollo时，有两种主要的缓存策略：

#### 1. Apollo主导缓存

这种方式让Apollo管理所有缓存，NgRx只存储最基本的UI状态：

```typescript
// effects.ts
loadBooks$ = createEffect(() => this.actions$.pipe(
  ofType(BookActions.loadBooks),
  switchMap(({ limit, cursor }) => 
    this.apollo.watchQuery<any>({
      query: GET_BOOKS,
      variables: { first: limit, after: cursor },
      // 使用Apollo缓存
      fetchPolicy: 'cache-and-network'
    }).valueChanges.pipe(/* ... */)
  )
));
```

**优点**：
- 利用Apollo强大的缓存能力
- 减少代码重复
- 简化状态管理

**缺点**：
- 状态分散在Apollo和NgRx之间
- 调试时需要同时监控两个状态源

#### 2. NgRx主导缓存

这种方式让NgRx存储和管理所有数据，Apollo只用于数据获取：

```typescript
// effects.ts
loadBooks$ = createEffect(() => this.actions$.pipe(
  ofType(BookActions.loadBooks),
  switchMap(({ limit, cursor }) => 
    this.apollo.query<any>({
      query: GET_BOOKS,
      variables: { first: limit, after: cursor },
      // 禁用Apollo缓存
      fetchPolicy: 'network-only'
    }).pipe(/* ... */)
  )
));
```

**优点**：
- 状态集中在一处
- 完全控制数据流程
- 更容易调试和测试

**缺点**：
- 失去Apollo缓存带来的性能优势
- 需要手动实现一些Apollo自带的功能

### 最佳实践

1. **确定缓存主导者**：在项目开始时就决定由谁主导缓存(Apollo或NgRx)，并在整个项目中保持一致。

2. **利用Apollo归一化**：即使使用NgRx管理状态，也可以利用Apollo的缓存归一化能力：

   ```typescript
   // apollo-config.ts
   export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
     return {
       link: httpLink.create({ uri: 'graphql' }),
       cache: new InMemoryCache({
         // 配置类型策略
         typePolicies: {
           Query: {
             fields: {
               books: relayStylePagination(),
             },
           },
           Book: {
             // 设置键字段
             keyFields: ['id']
           }
         }
       })
     };
   }
   ```

3. **使用正确的RxJS操作符**：
   - `switchMap`: 用于查询，当有新请求时取消旧请求
   - `exhaustMap`: 用于变更，确保一次只处理一个请求

4. **乐观更新**：在NgRx中实现乐观更新：

   ```typescript
   // 乐观更新
   on(BookActions.deleteBook, (state, { id }) => ({
     ...state,
     // 乐观地从状态中移除书籍
     books: state.books.filter(book => book.id !== id)
   }))
   ```

5. **错误恢复**：为乐观更新实现错误恢复机制：

   ```typescript
   // reducer.ts - 错误恢复
   on(BookActions.deleteBookFailure, (state, { id, error }) => {
     // 从备份中恢复被删除的书籍
     const bookToRestore = state.deletedBooks[id];
     return {
       ...state,
       books: bookToRestore ? [...state.books, bookToRestore] : state.books,
       deletedBooks: {
         ...state.deletedBooks,
         [id]: undefined
       },
       error
     };
   }),
   ```

6. **考虑分页**：在集成中处理好分页逻辑：

   ```typescript
   // selectors.ts
   export const selectBooksPaginated = createSelector(
     selectAllBooks,
     (books, props: { page: number, pageSize: number }) => {
       const { page, pageSize } = props;
       const start = page * pageSize;
       return books.slice(start, start + pageSize);
     }
   );
   ```

通过这些最佳实践，我们可以有效地将GraphQL与NgRx集成，创建一个健壮、可维护的状态管理系统。下一节，我们将探讨如何实现实时数据订阅。

## 订阅实现

GraphQL订阅提供了实时数据更新的能力，让客户端可以监听服务器上发生的事件并获得实时更新。在Angular应用中，我们可以使用Apollo Client的订阅功能来实现这一点。

### 订阅工作原理

GraphQL订阅基于WebSocket协议实现，与查询和变更的HTTP请求不同，订阅建立长连接以接收实时更新。

```
┌────────────┐                                          ┌────────────┐
│            │                                          │            │
│  客户端     │                                          │  服务器     │
│            │                                          │            │
└─────┬──────┘                                          └──────┬─────┘
      │                                                        │
      │  1. 建立WebSocket连接                                   │
      │───────────────────────────────────────────────────────>│
      │                                                        │
      │  2. 发送订阅请求                                         │
      │───────────────────────────────────────────────────────>│
      │                                                        │
      │  3. 确认订阅                                            │
      │<───────────────────────────────────────────────────────│
      │                                                        │
      │                                                        │  4. 事件发生
      │                                                        │◄───────────
      │                                                        │
      │  5. 发送事件数据                                         │
      │<───────────────────────────────────────────────────────│
      │                                                        │
      │  6. 发送事件数据 (当有新事件时)                           │
      │<───────────────────────────────────────────────────────│
      │                                                        │
      │  7. 取消订阅 (可选)                                      │
      │───────────────────────────────────────────────────────>│
      │                                                        │
      │  8. 关闭WebSocket连接 (可选)                             │
      │───────────────────────────────────────────────────────>│
      │                                                        │
```

### 1. 配置WebSocket链接

首先，我们需要配置Apollo Client以支持WebSocket连接：

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, split } from '@apollo/client/core';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

export function createApollo(httpLink: HttpLink) {
  // 创建HTTP链接
  const http = httpLink.create({
    uri: 'http://localhost:4000/graphql'
  });

  // 创建WebSocket链接
  const ws = new WebSocketLink({
    uri: 'ws://localhost:4000/graphql',
    options: {
      reconnect: true,
      connectionParams: {
        // 可以在这里传递认证信息
        authToken: localStorage.getItem('auth_token')
      }
    }
  });

  // 使用split函数根据操作类型分离链接
  // 查询和变更使用HTTP，订阅使用WebSocket
  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    ws,
    http
  );

  return {
    link,
    cache: new InMemoryCache()
  };
}

@NgModule({
  imports: [
    HttpClientModule,
    ApolloModule
  ],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink]
    }
  ]
})
export class GraphQLModule {}
```

链接设置详解：
- **HTTP链接**：处理查询和变更请求
- **WebSocket链接**：处理订阅请求
- **Split函数**：根据操作类型动态选择使用哪个链接
- **重连机制**：WebSocket链接断开时自动重连
- **连接参数**：可以传递认证信息或其他上下文信息

### 2. 定义订阅文档

接下来，我们定义GraphQL订阅文档：

```typescript
// book.subscriptions.ts
import { gql } from 'apollo-angular';

// 订阅新书籍
export const BOOK_ADDED = gql`
  subscription OnBookAdded {
    bookAdded {
      id
      title
      author
      publishedDate
    }
  }
`;

// 订阅书籍更新
export const BOOK_UPDATED = gql`
  subscription OnBookUpdated {
    bookUpdated {
      id
      title
      author
      publishedDate
    }
  }
`;

// 订阅书籍删除
export const BOOK_DELETED = gql`
  subscription OnBookDeleted {
    bookDeleted {
      id
    }
  }
`;

// 带过滤条件的订阅
export const BOOK_BY_AUTHOR_ADDED = gql`
  subscription OnBookByAuthorAdded($author: String!) {
    bookByAuthorAdded(author: $author) {
      id
      title
      author
      publishedDate
    }
  }
`;
```

### 3. 创建订阅服务

然后，创建一个服务来管理订阅：

```typescript
// book-subscription.service.ts
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Book } from './book.model';
import { 
  BOOK_ADDED, 
  BOOK_UPDATED, 
  BOOK_DELETED,
  BOOK_BY_AUTHOR_ADDED
} from './book.subscriptions';

@Injectable({ providedIn: 'root' })
export class BookSubscriptionService {
  constructor(private apollo: Apollo) {}

  /**
   * 订阅新增的书籍
   * @returns 新书籍的Observable流
   */
  subscribeToNewBooks(): Observable<Book> {
    return this.apollo.subscribe<{ bookAdded: Book }>({
      query: BOOK_ADDED
    }).pipe(
      map(result => result.data.bookAdded)
    );
  }

  /**
   * 订阅更新的书籍
   * @returns 更新书籍的Observable流
   */
  subscribeToBookUpdates(): Observable<Book> {
    return this.apollo.subscribe<{ bookUpdated: Book }>({
      query: BOOK_UPDATED
    }).pipe(
      map(result => result.data.bookUpdated)
    );
  }

  /**
   * 订阅删除的书籍
   * @returns 删除书籍ID的Observable流
   */
  subscribeToBookDeletions(): Observable<{ id: string }> {
    return this.apollo.subscribe<{ bookDeleted: { id: string } }>({
      query: BOOK_DELETED
    }).pipe(
      map(result => result.data.bookDeleted)
    );
  }

  /**
   * 订阅特定作者的新书
   * @param author 作者名
   * @returns 该作者新书的Observable流
   */
  subscribeToNewBooksByAuthor(author: string): Observable<Book> {
    return this.apollo.subscribe<{ bookByAuthorAdded: Book }>({
      query: BOOK_BY_AUTHOR_ADDED,
      variables: { author }
    }).pipe(
      map(result => result.data.bookByAuthorAdded)
    );
  }
}
```

订阅服务的关键点：
- 每个订阅都返回一个Observable，可以在组件中订阅
- 使用`map`操作符提取数据
- 可以传递变量进行过滤（如按作者过滤）

### 4. 在组件中使用订阅

现在，我们可以在组件中使用这些订阅：

```typescript
// book-real-time.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Book } from './book.model';
import { BookSubscriptionService } from './book-subscription.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-book-real-time',
  template: `
    <div class="container">
      <h2>实时书籍更新</h2>
      
      <div class="status-indicator">
        <span [class.connected]="isConnected">
          {{ isConnected ? '已连接' : '连接中...' }}
        </span>
      </div>
      
      <div class="book-list">
        <mat-card *ngFor="let book of books" class="book-card">
          <mat-card-header>
            <mat-card-title>{{ book.title }}</mat-card-title>
            <mat-card-subtitle>{{ book.author }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>发布日期: {{ book.publishedDate | date:'yyyy-MM-dd' }}</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button [routerLink]="['/books', book.id]">查看</button>
          </mat-card-actions>
        </mat-card>
        
        <div *ngIf="books.length === 0" class="empty-state">
          暂无书籍。新书籍将自动显示在这里。
        </div>
      </div>
      
      <div class="notifications">
        <h3>最近更新</h3>
        <mat-list>
          <mat-list-item *ngFor="let notification of recentNotifications">
            <mat-icon matListItemIcon>{{ getNotificationIcon(notification.type) }}</mat-icon>
            <span matListItemTitle>{{ notification.message }}</span>
            <span matListItemLine>{{ notification.timestamp | date:'HH:mm:ss' }}</span>
          </mat-list-item>
        </mat-list>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .status-indicator {
      margin-bottom: 20px;
    }
    
    .status-indicator span {
      padding: 5px 10px;
      border-radius: 4px;
      background-color: #f44336;
      color: white;
    }
    
    .status-indicator span.connected {
      background-color: #4caf50;
    }
    
    .book-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .book-card {
      transition: all 0.3s ease;
    }
    
    .book-card.new {
      animation: highlightNew 2s ease;
    }
    
    @keyframes highlightNew {
      0% { background-color: #e3f2fd; }
      100% { background-color: white; }
    }
    
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 40px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .notifications {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
    }
  `]
})
export class BookRealTimeComponent implements OnInit, OnDestroy {
  books: Book[] = [];
  isConnected = false;
  recentNotifications: Array<{
    type: 'add' | 'update' | 'delete';
    message: string;
    timestamp: Date;
  }> = [];
  
  private destroy$ = new Subject<void>();
  private maxNotifications = 10;
  
  constructor(
    private bookSubscriptionService: BookSubscriptionService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    // 模拟连接状态
    setTimeout(() => this.isConnected = true, 1000);
    
    // 订阅新书籍
    this.bookSubscriptionService.subscribeToNewBooks()
      .pipe(takeUntil(this.destroy$))
      .subscribe(newBook => {
        // 添加到列表开头
        this.books = [newBook, ...this.books];
        
        // 添加通知
        this.addNotification('add', `新书籍: "${newBook.title}"`);
        
        // 显示提示
        this.snackBar.open(`新书籍已添加: ${newBook.title}`, '关闭', {
          duration: 3000
        });
      });
    
    // 订阅书籍更新
    this.bookSubscriptionService.subscribeToBookUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(updatedBook => {
        // 更新列表中的书籍
        this.books = this.books.map(book => 
          book.id === updatedBook.id ? updatedBook : book
        );
        
        // 添加通知
        this.addNotification('update', `书籍更新: "${updatedBook.title}"`);
      });
    
    // 订阅书籍删除
    this.bookSubscriptionService.subscribeToBookDeletions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ id }) => {
        // 找到要删除的书籍
        const bookToRemove = this.books.find(book => book.id === id);
        
        // 从列表中移除
        this.books = this.books.filter(book => book.id !== id);
        
        // 添加通知
        if (bookToRemove) {
          this.addNotification('delete', `书籍已删除: "${bookToRemove.title}"`);
        }
      });
  }
  
  ngOnDestroy(): void {
    // 取消所有订阅
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  getNotificationIcon(type: 'add' | 'update' | 'delete'): string {
    switch (type) {
      case 'add': return 'add_circle';
      case 'update': return 'update';
      case 'delete': return 'delete';
    }
  }
  
  private addNotification(
    type: 'add' | 'update' | 'delete', 
    message: string
  ): void {
    // 添加到通知列表开头
    this.recentNotifications = [
      { type, message, timestamp: new Date() },
      ...this.recentNotifications
    ];
    
    // 限制通知数量
    if (this.recentNotifications.length > this.maxNotifications) {
      this.recentNotifications = this.recentNotifications.slice(0, this.maxNotifications);
    }
  }
}
```

组件中订阅使用的关键点：
- 利用`takeUntil`在组件销毁时自动取消订阅
- 使用`Subject`作为取消信号
- 在`ngOnDestroy`中完成和清理所有订阅
- 实现视觉反馈(如高亮新项目、显示通知)

### 5. 集成NgRx与订阅

对于使用NgRx的应用，我们可以在Effects中处理订阅：

```typescript
// book.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { BookSubscriptionService } from './book-subscription.service';
import * as BookActions from './book.actions';

@Injectable()
export class BookSubscriptionEffects implements OnInitEffects {
  constructor(
    private actions$: Actions,
    private bookSubscription: BookSubscriptionService
  ) {}

  // 初始化时自动启动订阅
  ngrxOnInitEffects(): Action {
    return BookActions.initBookSubscriptions();
  }

  // 订阅新书籍Effect
  bookAddedSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(BookActions.initBookSubscriptions),
    mergeMap(() => this.bookSubscription.subscribeToNewBooks().pipe(
      map(book => BookActions.bookAdded({ book })),
      catchError(() => EMPTY)
    ))
  ));

  // 订阅更新书籍Effect
  bookUpdatedSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(BookActions.initBookSubscriptions),
    mergeMap(() => this.bookSubscription.subscribeToBookUpdates().pipe(
      map(book => BookActions.bookUpdated({ book })),
      catchError(() => EMPTY)
    ))
  ));

  // 订阅删除书籍Effect
  bookDeletedSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(BookActions.initBookSubscriptions),
    mergeMap(() => this.bookSubscription.subscribeToBookDeletions().pipe(
      map(({ id }) => BookActions.bookDeleted({ id })),
      catchError(() => EMPTY)
    ))
  ));
}
```

在Reducer中处理这些Actions：

```typescript
// book.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as BookActions from './book.actions';
import { initialBookState } from './book.model';

export const bookReducer = createReducer(
  initialBookState,
  
  // 处理新书籍添加
  on(BookActions.bookAdded, (state, { book }) => ({
    ...state,
    books: [book, ...state.books]
  })),
  
  // 处理书籍更新
  on(BookActions.bookUpdated, (state, { book }) => ({
    ...state,
    books: state.books.map(existingBook => 
      existingBook.id === book.id ? book : existingBook
    )
  })),
  
  // 处理书籍删除
  on(BookActions.bookDeleted, (state, { id }) => ({
    ...state,
    books: state.books.filter(book => book.id !== id)
  }))
);
```

### 6. 高级订阅技术

#### 订阅生命周期管理

在复杂应用中，管理订阅的生命周期非常重要：

```typescript
// 订阅管理器服务
@Injectable({ providedIn: 'root' })
export class SubscriptionManagerService {
  private subscriptions = new Map<string, ZenObservable.Subscription>();
  
  // 注册订阅
  registerSubscription(key: string, subscription: ZenObservable.Subscription): void {
    // 先取消同名订阅
    this.unregisterSubscription(key);
    this.subscriptions.set(key, subscription);
  }
  
  // 取消订阅
  unregisterSubscription(key: string): void {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(key);
    }
  }
  
  // 取消所有订阅
  unregisterAll(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions.clear();
  }
}
```

使用订阅管理器：

```typescript
// 使用订阅管理器
@Component({/* ... */})
export class BookListComponent implements OnInit, OnDestroy {
  constructor(
    private apollo: Apollo,
    private subscriptionManager: SubscriptionManagerService
  ) {}
  
  ngOnInit(): void {
    // 创建订阅并注册
    const subscription = this.apollo.subscribe<{ bookAdded: Book }>({
      query: BOOK_ADDED
    }).subscribe(/* ... */);
    
    this.subscriptionManager.registerSubscription('bookAdded', subscription);
  }
  
  ngOnDestroy(): void {
    // 取消特定订阅
    this.subscriptionManager.unregisterSubscription('bookAdded');
  }
}
```

#### 基于用户行为的动态订阅

根据用户行为动态启动和停止订阅：

```typitten
@Component({/* ... */})
export class AuthorBooksComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private currentAuthorSubscription?: ZenObservable.Subscription;
  
  @Input() set authorId(id: string) {
    // 当作者ID变化时，更新订阅
    this.updateSubscription(id);
  }
  
  // ...
  
  private updateSubscription(authorId: string): void {
    // 取消现有订阅
    if (this.currentAuthorSubscription) {
      this.currentAuthorSubscription.unsubscribe();
    }
    
    // 创建新订阅
    if (authorId) {
      this.currentAuthorSubscription = this.bookSubscriptionService
        .subscribeToNewBooksByAuthor(authorId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(/* ... */);
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

#### 手动取消与重连

在某些情况下，需要手动控制订阅的连接状态：

```typescript
@Component({/* ... */})
export class ConfigurableSubscriptionComponent {
  private subscription?: ZenObservable.Subscription;
  isSubscribed = false;
  
  startSubscription(): void {
    if (this.subscription) return;
    
    this.subscription = this.bookSubscriptionService
      .subscribeToNewBooks()
      .subscribe({
        next: (book) => {
          console.log('New book received:', book);
        },
        error: (err) => {
          console.error('Subscription error:', err);
          this.isSubscribed = false;
          this.subscription = undefined;
        },
        complete: () => {
          console.log('Subscription completed');
          this.isSubscribed = false;
          this.subscription = undefined;
        }
      });
    
    this.isSubscribed = true;
  }
  
  stopSubscription(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
      this.isSubscribed = false;
    }
  }
}
```

#### 客户端过滤

有时服务器可能不支持某些复杂的过滤逻辑，这时可以在客户端进行过滤：

```typescript
this.bookSubscriptionService.subscribeToNewBooks()
  .pipe(
    takeUntil(this.destroy$),
    // 客户端过滤
    filter(book => {
      // 仅接受特定类别的书籍
      return book.categories.some(c => this.selectedCategories.includes(c));
    })
  )
  .subscribe(/* ... */);
```

### 最佳实践

1. **处理连接状态**：
   - 监控WebSocket连接状态并向用户提供反馈
   - 在连接断开时提供自动或手动重连机制

   ```typescript
   // 状态监控
   const wsClient = new SubscriptionClient('ws://localhost:4000/graphql', {
     reconnect: true,
     connectionCallback: (error) => {
       if (error) {
         this.connectionStatus$.next('error');
       } else {
         this.connectionStatus$.next('connected');
       }
     }
   });
   ```

2. **订阅分组**：
   - 根据功能将相关订阅分组到专用服务中
   - 避免在单个组件中创建太多不同的订阅

3. **错误处理**：
   - 为每个订阅实现错误恢复策略
   - 使用`retry`或`retryWhen`操作符处理临时错误

   ```typescript
   this.bookSubscriptionService.subscribeToNewBooks()
     .pipe(
       takeUntil(this.destroy$),
       retryWhen(errors => errors.pipe(
         // 指数退避重试策略
         delay(1000),
         scan((count, error) => {
           if (count >= 5) throw error;
           return count + 1;
         }, 0)
       ))
     )
     .subscribe(/* ... */);
   ```

4. **优化网络使用**：
   - 使用细粒度的订阅而非广泛的订阅
   - 在用户界面隐藏或未活跃时暂停订阅

   ```typescript
   // 组件可见性变化时管理订阅
   @HostListener('window:focus')
   onFocus(): void {
     this.startSubscriptions();
   }
   
   @HostListener('window:blur')
   onBlur(): void {
     if (this.pauseOnBlur) {
       this.pauseSubscriptions();
     }
   }
   ```

5. **性能优化**：
   - 限制同时活跃的订阅数量
   - 使用`debounceTime`或`throttleTime`限制更新频率

   ```typescript
   // 限制更新频率
   this.bookSubscriptionService.subscribeToFrequentUpdates()
     .pipe(
       takeUntil(this.destroy$),
       // 至少间隔500毫秒才显示更新
       throttleTime(500)
     )
     .subscribe(/* ... */);
   ```

6. **与其他数据同步**：
   - 确保订阅数据与查询/变更数据保持一致
   - 在Apollo缓存中反映订阅更新

   ```typescript
   // 更新Apollo缓存
   this.bookSubscriptionService.subscribeToBookUpdates()
     .subscribe(updatedBook => {
       // 获取Apollo客户端实例
       const client = this.apollo.client;
       
       // 更新缓存中的书籍
       client.cache.modify({
         id: client.cache.identify(updatedBook),
         fields: {
           title: () => updatedBook.title,
           author: () => updatedBook.author,
           // 其他字段...
         }
       });
     });
   ```

7. **认证与安全**：
   - 在WebSocket连接中包含认证信息
   - 处理认证过期的情况

   ```typescript
   // 处理认证更新
   this.wsClient.connectionParams = {
     authToken: token
   };
   ```

通过遵循这些最佳实践，我们可以创建健壮、高效的实时数据更新机制，提升用户体验。

## 相关资源

- [Apollo Angular文档](https://apollo-angular.com/docs/)
- [Apollo Client订阅文档](https://www.apollographql.com/docs/react/data/subscriptions/)
- [GraphQL订阅规范](https://spec.graphql.org/draft/#sec-Subscription)
- [NgRx官方文档](https://ngrx.io/)
- [使用Apollo Client的最佳实践](https://www.apollographql.com/docs/react/v2/recipes/apollo-client-devtools/)