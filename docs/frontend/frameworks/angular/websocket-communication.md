---
title: Angular WebSocket通信
description: Angular应用中的WebSocket通信指南，包括Socket连接管理、实时数据处理、SignalR客户端集成和消息总线设计
head:
  -
    - meta
    -
      name: keywords
      content: Angular, WebSocket, Socket.IO, SignalR, 实时通信, 消息总线
createTime: 2025/03/28 12:19:54
permalink: /article/ougpfa0c/
---
# Angular WebSocket通信

本文档详细介绍了Angular应用中的WebSocket通信方案，包括Socket连接管理、实时数据处理、SignalR客户端集成以及消息总线设计。

## 目录

- [Socket连接管理](#socket连接管理)
- [实时数据处理](#实时数据处理)
- [SignalR客户端](#signalr客户端)
- [消息总线设计](#消息总线设计)

## Socket连接管理

### Socket.IO集成

```typescript
// Socket.IO服务
@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  private connectionStatus$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.socket = io('http://localhost:3000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers(): void {
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connectionStatus$.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connectionStatus$.next(false);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // 发送消息
  emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  // 监听消息
  on(event: string): Observable<any> {
    return new Observable(subscriber => {
      this.socket.on(event, (data) => {
        subscriber.next(data);
      });
    });
  }

  // 获取连接状态
  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }

  // 断开连接
  disconnect(): void {
    this.socket.disconnect();
  }
}
```

### 连接状态管理

```typescript
// 连接状态组件
@Component({
  selector: 'app-connection-status',
  template: `
    <div [class]="statusClass">
      <span class="status-dot"></span>
      {{ statusText }}
    </div>
  `,
  styles: [`
    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
    }
    .connected {
      color: green;
    }
    .disconnected {
      color: red;
    }
  `]
})
export class ConnectionStatusComponent implements OnInit {
  statusClass: string;
  statusText: string;

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.getConnectionStatus().subscribe(
      isConnected => {
        this.statusClass = isConnected ? 'connected' : 'disconnected';
        this.statusText = isConnected ? '已连接' : '未连接';
      }
    );
  }
}
```

## 实时数据处理

### 数据流处理

```typescript
// 实时数据服务
@Injectable({ providedIn: 'root' })
export class RealTimeDataService {
  private dataStream$ = new Subject<any>();

  constructor(private socketService: SocketService) {
    this.setupDataStream();
  }

  private setupDataStream(): void {
    this.socketService.on('data').pipe(
      map(data => this.transformData(data)),
      catchError(error => {
        console.error('数据处理错误:', error);
        return EMPTY;
      })
    ).subscribe(data => {
      this.dataStream$.next(data);
    });
  }

  private transformData(data: any): any {
    // 数据转换逻辑
    return {
      ...data,
      timestamp: new Date(),
      processed: true
    };
  }

  // 获取数据流
  getDataStream(): Observable<any> {
    return this.dataStream$.asObservable();
  }

  // 发送数据
  sendData(data: any): void {
    this.socketService.emit('data', data);
  }
}
```

### 数据展示组件

```typescript
// 实时数据展示组件
@Component({
  selector: 'app-real-time-data',
  template: `
    <div class="data-container">
      <div *ngFor="let item of dataItems" class="data-item">
        <h3>{{ item.title }}</h3>
        <p>{{ item.content }}</p>
        <span class="timestamp">{{ item.timestamp | date:'medium' }}</span>
      </div>
    </div>
  `,
  styles: [`
    .data-container {
      max-height: 400px;
      overflow-y: auto;
    }
    .data-item {
      padding: 16px;
      border-bottom: 1px solid #eee;
    }
    .timestamp {
      font-size: 12px;
      color: #666;
    }
  `]
})
export class RealTimeDataComponent implements OnInit, OnDestroy {
  dataItems: any[] = [];
  private subscription: Subscription;

  constructor(private realTimeDataService: RealTimeDataService) {}

  ngOnInit(): void {
    this.subscription = this.realTimeDataService.getDataStream()
      .subscribe(data => {
        this.dataItems.unshift(data);
        // 限制显示数量
        if (this.dataItems.length > 100) {
          this.dataItems.pop();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
```

## SignalR客户端

### SignalR集成

```typescript
// SignalR服务
@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection: HubConnection;
  private messageSubject = new Subject<any>();

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5000/chatHub')
      .withAutomaticReconnect()
      .build();

    this.setupHubHandlers();
  }

  private setupHubHandlers(): void {
    this.hubConnection.on('ReceiveMessage', (message) => {
      this.messageSubject.next(message);
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR连接已关闭');
    });
  }

  // 启动连接
  async startConnection(): Promise<void> {
    try {
      await this.hubConnection.start();
      console.log('SignalR连接已建立');
    } catch (error) {
      console.error('SignalR连接失败:', error);
      throw error;
    }
  }

  // 发送消息
  async sendMessage(message: any): Promise<void> {
    try {
      await this.hubConnection.invoke('SendMessage', message);
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  }

  // 获取消息流
  getMessageStream(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  // 停止连接
  async stopConnection(): Promise<void> {
    try {
      await this.hubConnection.stop();
      console.log('SignalR连接已停止');
    } catch (error) {
      console.error('停止SignalR连接失败:', error);
      throw error;
    }
  }
}
```

### 聊天组件实现

```typescript
// 聊天组件
@Component({
  selector: 'app-chat',
  template: `
    <div class="chat-container">
      <div class="messages" #messagesContainer>
        <div *ngFor="let message of messages" class="message">
          <div class="message-header">
            <span class="username">{{ message.user }}</span>
            <span class="time">{{ message.time | date:'short' }}</span>
          </div>
          <div class="message-content">{{ message.content }}</div>
        </div>
      </div>
      <div class="input-area">
        <input 
          [(ngModel)]="newMessage" 
          (keyup.enter)="sendMessage()"
          placeholder="输入消息...">
        <button (click)="sendMessage()">发送</button>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 400px;
    }
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }
    .message {
      margin-bottom: 16px;
    }
    .message-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .input-area {
      display: flex;
      padding: 16px;
      border-top: 1px solid #eee;
    }
    input {
      flex: 1;
      margin-right: 8px;
      padding: 8px;
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: any[] = [];
  newMessage: string = '';
  private subscription: Subscription;

  constructor(private signalRService: SignalRService) {}

  ngOnInit(): void {
    this.signalRService.startConnection();
    this.subscription = this.signalRService.getMessageStream()
      .subscribe(message => {
        this.messages.push(message);
        this.scrollToBottom();
      });
  }

  async sendMessage(): Promise<void> {
    if (this.newMessage.trim()) {
      try {
        await this.signalRService.sendMessage({
          content: this.newMessage,
          user: '当前用户',
          time: new Date()
        });
        this.newMessage = '';
      } catch (error) {
        console.error('发送消息失败:', error);
      }
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.messages');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.signalRService.stopConnection();
  }
}
```

## 消息总线设计

### 消息总线实现

```typescript
// 消息类型定义
export interface Message {
  type: string;
  payload: any;
  timestamp: Date;
}

// 消息总线服务
@Injectable({ providedIn: 'root' })
export class MessageBusService {
  private messageSubject = new Subject<Message>();
  private messageHandlers = new Map<string, Function[]>();

  // 发送消息
  publish(message: Message): void {
    this.messageSubject.next(message);
    this.handleMessage(message);
  }

  // 订阅消息
  subscribe(type: string, handler: Function): Subscription {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);

    return this.messageSubject.pipe(
      filter(msg => msg.type === type)
    ).subscribe(msg => handler(msg.payload));
  }

  // 处理消息
  private handleMessage(message: Message): void {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message.payload));
    }
  }

  // 取消订阅
  unsubscribe(type: string, handler: Function): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
}
```

### 消息总线使用示例

```typescript
// 消息总线使用组件
@Component({
  selector: 'app-message-bus-demo',
  template: `
    <div class="message-bus-demo">
      <div class="message-form">
        <input [(ngModel)]="messageType" placeholder="消息类型">
        <input [(ngModel)]="messageContent" placeholder="消息内容">
        <button (click)="sendMessage()">发送消息</button>
      </div>
      <div class="message-list">
        <div *ngFor="let msg of receivedMessages" class="message-item">
          <span class="type">{{ msg.type }}</span>
          <span class="content">{{ msg.payload }}</span>
          <span class="time">{{ msg.timestamp | date:'medium' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .message-bus-demo {
      padding: 16px;
    }
    .message-form {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .message-list {
      max-height: 300px;
      overflow-y: auto;
    }
    .message-item {
      padding: 8px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  `]
})
export class MessageBusDemoComponent implements OnInit, OnDestroy {
  messageType: string = '';
  messageContent: string = '';
  receivedMessages: Message[] = [];
  private subscription: Subscription;

  constructor(private messageBus: MessageBusService) {}

  ngOnInit(): void {
    // 订阅所有消息
    this.subscription = this.messageBus.subscribe('*', (payload: any) => {
      this.receivedMessages.unshift({
        type: this.messageType,
        payload,
        timestamp: new Date()
      });
    });
  }

  sendMessage(): void {
    if (this.messageType && this.messageContent) {
      this.messageBus.publish({
        type: this.messageType,
        payload: this.messageContent,
        timestamp: new Date()
      });
      this.messageContent = '';
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
```

## 最佳实践总结

1. **连接管理**
   - 实现自动重连机制
   - 处理连接状态变化
   - 优雅处理断开连接
   - 心跳检测实现

2. **数据处理**
   - 数据转换与验证
   - 错误处理机制
   - 数据缓存策略
   - 性能优化方案

3. **消息总线**
   - 消息类型定义
   - 订阅管理
   - 消息过滤
   - 错误处理

4. **性能优化**
   - 消息批处理
   - 数据压缩
   - 连接池管理
   - 内存管理

## 相关资源

- [Socket.IO文档](https://socket.io/docs/)
- [SignalR文档](https://docs.microsoft.com/en-us/aspnet/core/signalr)
- [WebSocket最佳实践](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [RxJS操作符](https://rxjs.dev/guide/operators) 