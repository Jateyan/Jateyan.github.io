---
title: Angular高级表单
description: Angular动态表单生成、复杂验证逻辑、表单状态管理、多步骤表单与性能优化
head:
  - - meta
    - name: keywords
      content: Angular, 高级表单, 动态表单, 表单验证, 表单状态管理, 多步骤表单, 表单性能
---

# Angular高级表单

在企业级应用开发中，表单是用户输入数据的主要方式，也是最常见的交互界面元素。Angular提供了强大的表单处理能力，特别是在处理复杂业务场景时，其高级表单特性能显著提升开发效率和用户体验。本文将深入探讨Angular高级表单的各个方面，提供全面的技术指南和最佳实践。

## 目录

- [动态表单生成](#动态表单生成)
- [复杂验证逻辑](#复杂验证逻辑)
- [表单状态管理](#表单状态管理)
- [多步骤表单](#多步骤表单)
- [表单性能优化](#表单性能优化)
- [实践案例](#实践案例)
- [常见问题与解决方案](#常见问题与解决方案)

## 动态表单生成

动态表单是指根据运行时数据动态构建的表单，能够适应不同业务场景和数据结构，是企业级应用中常见的需求。Angular提供了强大的`FormBuilder`、`FormGroup`和`FormArray`等API来实现这一功能。

### 基本原理

动态表单的核心是将表单结构配置化，通过元数据描述表单结构，然后在运行时解析这些元数据生成实际的表单控件。

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  表单元数据描述  │─────▶│ 表单控件工厂   │─────▶│  动态渲染表单   │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

在这个流程中：
- 表单元数据描述：定义表单字段类型、验证规则、默认值等信息
- 表单控件工厂：根据元数据创建对应的FormControl、FormGroup或FormArray
- 动态渲染表单：将生成的表单模型与模板绑定，完成表单UI渲染

### 表单模型定义

动态表单首先需要定义表单字段的模型，包含字段类型、标签、验证规则等信息。

```typescript
export interface DynamicFormControlConfig {
  type: string;          // 控件类型：text, number, select, checkbox等
  name: string;          // 控件名称
  label: string;         // 显示标签
  value?: any;           // 默认值
  required?: boolean;    // 是否必填
  validators?: any[];    // 验证器数组
  options?: any[];       // 选项（用于select、radio等）
  disabled?: boolean;    // 是否禁用
  order?: number;        // 排序索引
  cssClass?: string;     // 自定义CSS类
}
```

### 动态表单服务

创建一个服务用于根据配置生成表单控件：

```typescript
@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {
  constructor(private fb: FormBuilder) {}
  
  // 根据配置创建FormGroup
  createFormGroup(controls: DynamicFormControlConfig[]): FormGroup {
    const group = {};
    
    controls.forEach(control => {
      const validators = this.mapValidators(control);
      
      group[control.name] = control.required ? 
        this.fb.control(control.value || '', validators) : 
        this.fb.control(control.value || '');
        
      // 设置禁用状态
      if (control.disabled) {
        group[control.name].disable();
      }
    });
    
    return this.fb.group(group);
  }
  
  // 映射验证器
  private mapValidators(control: DynamicFormControlConfig): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    
    if (control.required) {
      validators.push(Validators.required);
    }
    
    // 添加自定义验证器
    if (control.validators && control.validators.length > 0) {
      control.validators.forEach(validator => validators.push(validator));
    }
    
    return validators;
  }
}
```

### 表单控件组件

为每种控件类型创建对应的组件：

```typescript
@Component({
  selector: 'app-dynamic-form-control',
  template: `
    <div [formGroup]="form" class="form-control-container">
      <div [ngSwitch]="config.type">
        
        <!-- 文本输入框 -->
        <mat-form-field *ngSwitchCase="'text'" appearance="outline" class="full-width">
          <mat-label>{{config.label}}</mat-label>
          <input matInput [formControlName]="config.name" [placeholder]="config.label">
          <mat-error *ngIf="control.errors">
            {{getErrorMessage()}}
          </mat-error>
        </mat-form-field>
        
        <!-- 下拉选择框 -->
        <mat-form-field *ngSwitchCase="'select'" appearance="outline" class="full-width">
          <mat-label>{{config.label}}</mat-label>
          <mat-select [formControlName]="config.name">
            <mat-option *ngFor="let option of config.options" [value]="option.value">
              {{option.label}}
            </mat-option>
          </mat-select>
        </mat-form-field>
        
        <!-- 其他控件类型... -->
        
      </div>
    </div>
  `
})
export class DynamicFormControlComponent {
  @Input() config: DynamicFormControlConfig;
  @Input() form: FormGroup;
  
  get control() {
    return this.form.controls[this.config.name];
  }
  
  getErrorMessage() {
    if (this.control.errors?.required) {
      return `${this.config.label}是必填项`;
    }
    // 其他错误信息...
    return '';
  }
}
```

### 动态表单容器组件

创建一个容器组件，负责组装所有动态生成的表单控件：

```typescript
@Component({
  selector: 'app-dynamic-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form-row" *ngFor="let control of sortedControls">
        <app-dynamic-form-control
          [config]="control"
          [form]="form">
        </app-dynamic-form-control>
      </div>
      
      <div class="form-actions">
        <button mat-raised-button color="primary" type="submit" 
                [disabled]="!form.valid">提交</button>
        <button mat-button type="button" (click)="onReset()">重置</button>
      </div>
    </form>
  `
})
export class DynamicFormComponent implements OnInit {
  @Input() formConfig: DynamicFormControlConfig[] = [];
  @Output() formSubmit = new EventEmitter<any>();
  
  form: FormGroup;
  
  constructor(private formService: DynamicFormService) {}
  
  ngOnInit() {
    this.form = this.formService.createFormGroup(this.formConfig);
  }
  
  get sortedControls() {
    return this.formConfig.sort((a, b) => a.order - b.order);
  }
  
  onSubmit() {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    }
  }
  
  onReset() {
    this.form.reset();
  }
}

### 动态表单的JSON驱动方式

在更高级的应用中，可以通过JSON完全驱动表单的结构和行为：

```typescript
// 后端返回的表单定义JSON
const formDefinition = {
  "formId": "user-registration",
  "title": "用户注册",
  "controls": [
    {
      "type": "text",
      "name": "fullName",
      "label": "姓名",
      "required": true,
      "order": 1,
      "validators": [
        { "type": "maxLength", "value": 50 }
      ]
    },
    {
      "type": "text",
      "name": "email",
      "label": "电子邮箱",
      "required": true,
      "order": 2,
      "validators": [
        { "type": "email" }
      ]
    },
    {
      "type": "select",
      "name": "department",
      "label": "部门",
      "required": true,
      "order": 3,
      "options": [
        { "value": "it", "label": "信息技术" },
        { "value": "hr", "label": "人力资源" },
        { "value": "finance", "label": "财务" }
      ]
    }
  ],
  "submitLabel": "注册",
  "cancelLabel": "取消"
};
```

对应的服务代码：

```typescript
@Injectable({
  providedIn: 'root'
})
export class JsonFormService {
  constructor(private fb: FormBuilder) {}
  
  // 从JSON创建表单组
  createFormGroupFromJson(json: any): FormGroup {
    const formGroup = {};
    
    json.controls.forEach(control => {
      // 转换验证器
      const validators = this.mapJsonValidators(control.validators || []);
      
      formGroup[control.name] = this.fb.control(
        control.value || '',
        control.required ? [Validators.required, ...validators] : validators
      );
    });
    
    return this.fb.group(formGroup);
  }
  
  // 映射JSON验证器到Angular验证器
  private mapJsonValidators(jsonValidators: any[]): ValidatorFn[] {
    return jsonValidators.map(validator => {
      switch (validator.type) {
        case 'email':
          return Validators.email;
        case 'maxLength':
          return Validators.maxLength(validator.value);
        case 'minLength':
          return Validators.minLength(validator.value);
        case 'pattern':
          return Validators.pattern(validator.value);
        default:
          return null;
      }
    }).filter(v => v !== null);
  }
}
```

表单生成组件：

```typescript
@Component({
  selector: 'app-json-form',
  template: `
    <div class="form-container" *ngIf="formDefinition">
      <h2>{{formDefinition.title}}</h2>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div *ngFor="let control of sortedControls">
          <div [ngSwitch]="control.type">
            <!-- 渲染不同类型的控件 -->
            <!-- ...控件渲染逻辑... -->
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" [disabled]="!form.valid">
            {{formDefinition.submitLabel || '提交'}}
          </button>
          <button type="button" (click)="onCancel()">
            {{formDefinition.cancelLabel || '取消'}}
          </button>
        </div>
      </form>
    </div>
  `
})
export class JsonFormComponent implements OnInit {
  @Input() formDefinition: any;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();
  
  form: FormGroup;
  
  constructor(private jsonFormService: JsonFormService) {}
  
  ngOnInit() {
    if (this.formDefinition) {
      this.form = this.jsonFormService.createFormGroupFromJson(this.formDefinition);
    }
  }
  
  get sortedControls() {
    return this.formDefinition.controls.sort((a, b) => a.order - b.order);
  }
  
  onSubmit() {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    }
  }
  
  onCancel() {
    this.formCancel.emit();
  }
}
```

### 动态表单与后端集成

在企业级应用中，表单结构常由后端提供，实现真正的动态化：

```
┌─────────────┐    ┌────────────┐    ┌─────────────┐    ┌─────────────┐
│             │    │            │    │             │    │             │
│  后端API    │───▶│ 表单定义   │───▶│ 前端解析器  │───▶│ 动态表单UI  │
│             │    │            │    │             │    │             │
└─────────────┘    └────────────┘    └─────────────┘    └─────────────┘
```

实现示例：

```typescript
@Injectable({
  providedIn: 'root'
})
export class FormDefinitionService {
  constructor(private http: HttpClient) {}
  
  // 从后端获取表单定义
  getFormDefinition(formId: string): Observable<any> {
    return this.http.get<any>(`/api/forms/${formId}`);
  }
  
  // 提交表单数据
  submitFormData(formId: string, data: any): Observable<any> {
    return this.http.post<any>(`/api/forms/${formId}/submit`, data);
  }
}

@Component({
  selector: 'app-dynamic-backend-form',
  template: `
    <div *ngIf="loading" class="loading-indicator">
      <mat-spinner></mat-spinner>
    </div>
    
    <app-json-form 
      *ngIf="!loading && formDefinition"
      [formDefinition]="formDefinition"
      (formSubmit)="handleSubmit($event)"
      (formCancel)="handleCancel()">
    </app-json-form>
    
    <div *ngIf="error" class="error-message">
      {{error}}
    </div>
  `
})
export class DynamicBackendFormComponent implements OnInit {
  @Input() formId: string;
  
  formDefinition: any;
  loading = false;
  error: string = null;
  
  constructor(private formService: FormDefinitionService) {}
  
  ngOnInit() {
    this.loadFormDefinition();
  }
  
  loadFormDefinition() {
    this.loading = true;
    this.error = null;
    
    this.formService.getFormDefinition(this.formId)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        definition => this.formDefinition = definition,
        error => this.error = '无法加载表单定义'
      );
  }
  
  handleSubmit(formData: any) {
    this.loading = true;
    
    this.formService.submitFormData(this.formId, formData)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        response => {
          // 处理成功响应
          console.log('表单提交成功', response);
        },
        error => {
          // 处理错误
          this.error = '表单提交失败';
          console.error('表单提交错误', error);
        }
      );
  }
  
  handleCancel() {
    // 处理取消操作
  }
}

### 条件验证器

有时需要根据表单中其他字段的值来动态应用验证规则：

```typescript
export function conditionalValidator(
  predicate: () => boolean, 
  validator: ValidatorFn
): ValidatorFn {
  return (control: AbstractControl) => {
    if (predicate()) {
      return validator(control);
    }
    return null;
  };
}

// 使用条件验证器
@Component({...})
export class ConditionalValidationComponent implements OnInit {
  form: FormGroup;
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit() {
    this.form = this.fb.group({
      employmentStatus: ['', Validators.required],
      companyName: ['']
    });
    
    // 监听employmentStatus字段变化
    this.form.get('employmentStatus').valueChanges
      .subscribe(status => this.setCompanyNameValidators(status));
  }
  
  // 根据雇佣状态设置公司名称的验证器
  setCompanyNameValidators(status: string) {
    const companyNameControl = this.form.get('companyName');
    
    if (status === 'employed') {
      // 如果是受雇状态，公司名称必填
      companyNameControl.setValidators([Validators.required]);
    } else {
      // 否则清除验证器
      companyNameControl.clearValidators();
    }
    
    // 重新验证
    companyNameControl.updateValueAndValidity();
  }
}
```

### 自定义异步验证器

异步验证器用于需要等待响应的验证场景，如检查用户名是否已被占用：

```typescript
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}
  
  // 检查用户名是否可用
  checkUsernameAvailability(username: string): Observable<boolean> {
    return this.http.get<boolean>(`/api/users/check-username?username=${username}`);
  }
}

// 创建异步验证器
export function usernameAvailableValidator(userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    // 如果控件为空，不进行验证
    if (!control.value) {
      return of(null);
    }
    
    // 添加延迟以避免频繁调用API
    return timer(500).pipe(
      switchMap(() => userService.checkUsernameAvailability(control.value)),
      map(isAvailable => isAvailable ? null : { usernameExists: true }),
      catchError(() => of({ serverError: true }))
    );
  };
}

// 使用异步验证器
@Component({...})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {}
  
  ngOnInit() {
    this.registerForm = this.fb.group({
      username: ['', 
        [Validators.required, Validators.minLength(3)],
        [usernameAvailableValidator(this.userService)]  // 异步验证器作为第三个参数
      ],
      // 其他字段...
    });
  }
}
```

### 自定义验证错误消息

提供友好的错误消息是良好用户体验的关键：

```typescript
@Component({
  selector: 'app-error-message',
  template: `
    <div *ngIf="control.invalid && (control.dirty || control.touched)" class="error-message">
      <div *ngIf="control.errors?.required">
        {{label}}是必填项
      </div>
      <div *ngIf="control.errors?.email">
        请输入有效的电子邮箱地址
      </div>
      <div *ngIf="control.errors?.minlength">
        {{label}}最少需要{{control.errors.minlength.requiredLength}}个字符
      </div>
      <div *ngIf="control.errors?.maxlength">
        {{label}}最多允许{{control.errors.maxlength.requiredLength}}个字符
      </div>
      <div *ngIf="control.errors?.pattern">
        {{label}}格式不正确
      </div>
      <div *ngIf="control.errors?.whitespace">
        {{label}}不能只包含空格
      </div>
      <div *ngIf="control.errors?.usernameExists">
        此用户名已被使用
      </div>
      <!-- 更多自定义错误消息 -->
    </div>
  `
})
export class ErrorMessageComponent {
  @Input() control: AbstractControl;
  @Input() label: string;
}
```

### 高级错误处理服务

为大型应用创建集中式错误处理服务：

```typescript
@Injectable({
  providedIn: 'root'
})
export class FormErrorService {
  // 错误消息映射表
  private errorMessages = {
    required: (params: any, label: string) => `${label}是必填项`,
    email: (params: any, label: string) => `请输入有效的电子邮箱地址`,
    minlength: (params: any, label: string) => 
      `${label}最少需要${params.requiredLength}个字符`,
    maxlength: (params: any, label: string) => 
      `${label}最多允许${params.requiredLength}个字符`,
    pattern: (params: any, label: string) => `${label}格式不正确`,
    whitespace: (params: any, label: string) => `${label}不能只包含空格`,
    usernameExists: (params: any, label: string) => `此用户名已被使用`,
    passwordMismatch: (params: any, label: string) => `两次输入的密码不一致`,
    // 更多错误类型...
  };
  
  // 获取控件的错误消息
  getErrorMessage(control: AbstractControl, label: string): string {
    if (control.errors) {
      // 获取第一个错误
      const firstError = Object.keys(control.errors)[0];
      
      if (this.errorMessages[firstError]) {
        return this.errorMessages[firstError](control.errors[firstError], label);
      }
    }
    
    return '';
  }
  
  // 检查表单是否有错误并标记所有控件为已触摸
  validateForm(form: FormGroup): boolean {
    if (form.invalid) {
      this.markFormGroupTouched(form);
      return false;
    }
    return true;
  }
  
  // 递归标记表单组中所有控件为已触摸
  markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }
}

#### 复杂依赖验证

当字段间存在复杂依赖关系时的验证：

```typescript
// 复杂依赖验证器
export function complexDependencyValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const type = group.get('accountType').value;
    const income = group.get('annualIncome').value;
    const duration = group.get('loanDuration').value;
    const amount = group.get('loanAmount').value;
    
    // 业务规则：根据账户类型、收入和贷款期限确定最大贷款额度
    let maxLoanAmount = 0;
    
    if (type === 'premium') {
      maxLoanAmount = income * 5;
    } else if (type === 'standard') {
      maxLoanAmount = income * 3;
    } else {
      maxLoanAmount = income * 2;
    }
    
    // 贷款期限超过5年的，额度增加20%
    if (duration > 5) {
      maxLoanAmount *= 1.2;
    }
    
    if (amount > maxLoanAmount) {
      return { 
        loanLimitExceeded: {
          maxAmount: maxLoanAmount,
          requestedAmount: amount
        } 
      };
    }
    
    return null;
  };
}
```

### 动态验证规则

在某些应用中，验证规则可能需要从后端获取，实现完全动态的验证：

```typescript
@Injectable({
  providedIn: 'root'
})
export class ValidationRuleService {
  constructor(private http: HttpClient) {}
  
  // 获取表单字段的验证规则
  getValidationRules(formId: string): Observable<any> {
    return this.http.get<any>(`/api/forms/${formId}/validation-rules`);
  }
  
  // 根据后端返回的规则生成验证器
  createValidators(rules: any[]): ValidatorFn[] {
    return rules.map(rule => {
      switch (rule.type) {
        case 'required':
          return Validators.required;
        case 'minLength':
          return Validators.minLength(rule.value);
        case 'maxLength':
          return Validators.maxLength(rule.value);
        case 'pattern':
          return Validators.pattern(rule.value);
        case 'min':
          return Validators.min(rule.value);
        case 'max':
          return Validators.max(rule.value);
        // 处理自定义验证器
        case 'custom':
          return this.createCustomValidator(rule);
        default:
          return null;
      }
    }).filter(validator => validator !== null);
  }
  
  // 创建自定义验证器
  private createCustomValidator(rule: any): ValidatorFn {
    // 根据规则类型创建不同的自定义验证器
    // 这里可以实现一个验证器工厂
    // ...
    return null;
  }
}

// 使用动态验证规则
@Component({...})
export class DynamicValidationComponent implements OnInit {
  form: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private validationService: ValidationRuleService
  ) {}
  
  ngOnInit() {
    // 初始化一个空表单
    this.form = this.fb.group({});
    
    // 获取验证规则并应用
    this.validationService.getValidationRules('user-form')
      .subscribe(formConfig => {
        // 创建表单控件
        formConfig.fields.forEach(field => {
          // 获取字段的验证规则
          const validators = this.validationService.createValidators(field.validationRules || []);
          
          // 添加到表单
          this.form.addControl(field.name, this.fb.control(field.defaultValue || '', validators));
        });
        
        // 应用跨字段验证
        if (formConfig.formValidators) {
          this.form.setValidators(this.createFormLevelValidators(formConfig.formValidators));
        }
      });
  }
  
  // 创建表单级验证器
  createFormLevelValidators(rules: any[]): ValidatorFn {
    // 组合多个表单级验证器
    return (control: AbstractControl): ValidationErrors | null => {
      let errors: ValidationErrors = null;
      
      rules.forEach(rule => {
        // 通过某种方式解析和应用规则
        const ruleResult = /* 应用规则的逻辑 */;
        
        if (ruleResult) {
          errors = { ...errors, ...ruleResult };
        }
      });
      
      return errors;
    };
  }
}
```

通过以上技术，Angular应用可以实现灵活且强大的表单验证系统，满足企业级应用中各种复杂的业务需求。 

## 多步骤表单

多步骤表单是指需要用户按照多个步骤完成表单填写的过程。Angular提供了多种实现多步骤表单的方法，包括基于路由、视图切换和动态组件加载。

### 方案一：基于路由的多步骤表单

这种方法使用路由来管理表单步骤，每个步骤作为单独的路由页面。

```typescript
// 定义步骤组件接口
export interface StepComponent {
  data: any;
  isValid: boolean;
  
  // 步骤初始化时调用
  initialize(data?: any): void;
  
  // 步骤验证方法
  validate(): boolean;
  
  // 获取步骤数据
  getStepData(): any;
}

// 步骤基类
export abstract class BaseStepComponent implements StepComponent {
  data: any = {};
  isValid: boolean = false;
  
  // 初始化步骤，注入已有数据
  initialize(data?: any): void {
    if (data) {
      this.data = { ...data };
      this.onDataInitialized();
    }
  }
  
  // 数据初始化后的钩子方法
  protected onDataInitialized(): void { }
  
  // 验证步骤数据
  abstract validate(): boolean;
  
  // 获取步骤数据
  abstract getStepData(): any;
}

// 步骤配置接口
export interface StepConfig {
  title: string;        // 步骤标题
  component: Type<any>; // 步骤组件类型
  icon?: string;        // 步骤图标
  optional?: boolean;   // 是否为可选步骤
}

// 动态步骤容器组件
@Component({
  selector: 'app-dynamic-form-wizard',
  template: `
    <div class="wizard-container">
      <!-- 步骤指示器 -->
      <div class="step-indicator">
        <div class="step-item" 
            *ngFor="let step of steps; let i = index"
            [class.active]="currentStepIndex === i"
            [class.completed]="isStepCompleted(i)"
            (click)="canNavigateToStep(i) && navigateToStep(i)">
          <div class="step-icon">
            <i [class]="step.icon || 'default-icon'"></i>
          </div>
          <div class="step-label">{{ step.title }}</div>
        </div>
      </div>
      
      <!-- 动态组件容器 -->
      <div class="step-content">
        <h3 class="step-title">{{ currentStep.title }}</h3>
        
        <div class="component-container">
          <ng-container #stepContainer></ng-container>
        </div>
      </div>
      
      <!-- 导航按钮 -->
      <div class="wizard-actions">
        <button type="button" class="btn-prev" 
                *ngIf="!isFirstStep()" 
                (click)="previousStep()">
          上一步
        </button>
        
        <button type="button" class="btn-skip" 
                *ngIf="currentStep.optional" 
                (click)="skipStep()">
          跳过
        </button>
        
        <button type="button" class="btn-next" 
                *ngIf="!isLastStep()" 
                [disabled]="!canMoveNext()" 
                (click)="nextStep()">
          下一步
        </button>
        
        <button type="button" class="btn-submit" 
                *ngIf="isLastStep()" 
                [disabled]="!canSubmit()" 
                (click)="submit()">
          提交
        </button>
      </div>
    </div>
  `
})
export class DynamicFormWizardComponent implements OnInit, OnDestroy {
  @ViewChild('stepContainer', { read: ViewContainerRef, static: true })
  stepContainer: ViewContainerRef;
  
  // 步骤定义
  @Input() steps: StepConfig[] = [];
  
  // 完成事件
  @Output() complete = new EventEmitter<any>();
  
  // 取消事件
  @Output() cancel = new EventEmitter<void>();
  
  // 当前步骤索引
  currentStepIndex = 0;
  
  // 步骤完成状态
  stepsCompleted: boolean[] = [];
  
  // 表单数据
  formData: any = {};
  
  // 当前组件引用
  private componentRef: ComponentRef<StepComponent>;
  
  // 服务订阅
  private subscriptions = new Subscription();
  
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private wizardService: WizardService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    // 初始化步骤完成状态
    this.stepsCompleted = new Array(this.steps.length).fill(false);
    
    // 从服务恢复数据
    this.subscriptions.add(
      this.wizardService.getWizardState().subscribe(state => {
        if (state) {
          this.formData = state.data || {};
          this.currentStepIndex = state.step || 0;
          this.stepsCompleted = state.completed || new Array(this.steps.length).fill(false);
          this.loadCurrentStep();
        } else {
          this.loadCurrentStep();
        }
      })
    );
  }
  
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
  
  // 获取当前步骤
  get currentStep(): StepConfig {
    return this.steps[this.currentStepIndex];
  }
  
  // 是否为第一步
  isFirstStep(): boolean {
    return this.currentStepIndex === 0;
  }
  
  // 是否为最后一步
  isLastStep(): boolean {
    return this.currentStepIndex === this.steps.length - 1;
  }
  
  // 步骤是否已完成
  isStepCompleted(index: number): boolean {
    return this.stepsCompleted[index];
  }
  
  // 检查是否可以导航到指定步骤
  canNavigateToStep(index: number): boolean {
    // 可以导航到已完成的步骤
    if (this.stepsCompleted[index]) {
      return true;
    }
    
    // 可以导航到当前步骤
    if (index === this.currentStepIndex) {
      return true;
    }
    
    // 可以导航到下一个待完成的步骤（如果当前步骤有效）
    if (index === this.currentStepIndex + 1 && this.isCurrentStepValid()) {
      return true;
    }
    
    return false;
  }
  
  // 检查当前步骤是否有效
  isCurrentStepValid(): boolean {
    return this.componentRef?.instance?.isValid || false;
  }
  
  // 检查是否可以移动到下一步
  canMoveNext(): boolean {
    // 当前步骤可选且有效，或者当前步骤必填且有效
    return (this.currentStep.optional || this.isCurrentStepValid());
  }
  
  // 检查是否可以提交
  canSubmit(): boolean {
    // 检查所有非可选步骤是否已完成
    for (let i = 0; i < this.steps.length - 1; i++) {
      if (!this.steps[i].optional && !this.stepsCompleted[i]) {
        return false;
      }
    }
    
    // 检查最后一步是否有效
    return this.isCurrentStepValid();
  }
  
  // 加载当前步骤组件
  loadCurrentStep() {
    this.stepContainer.clear();
    
    const factory = this.componentFactoryResolver.resolveComponentFactory(
      this.steps[this.currentStepIndex].component
    );
    
    this.componentRef = this.stepContainer.createComponent(factory);
    
    // 初始化组件
    this.componentRef.instance.initialize(this.formData);
    
    // 检测变更
    this.changeDetectorRef.detectChanges();
  }
  
  // 获取当前步骤的数据
  getCurrentStepData(): any {
    if (this.componentRef && this.componentRef.instance) {
      return this.componentRef.instance.getStepData();
    }
    return null;
  }
  
  // 导航到指定步骤
  navigateToStep(index: number) {
    if (this.canNavigateToStep(index)) {
      // 保存当前步骤数据
      this.saveCurrentStepData();
      
      // 设置当前步骤索引
      this.currentStepIndex = index;
      
      // 加载新步骤
      this.loadCurrentStep();
    }
  }
  
  // 保存当前步骤数据
  saveCurrentStepData() {
    if (this.componentRef && this.componentRef.instance) {
      // 获取步骤数据
      const stepData = this.componentRef.instance.getStepData();
      
      // 合并到表单数据
      this.formData = { ...this.formData, ...stepData };
      
      // 如果当前步骤有效，标记为已完成
      if (this.componentRef.instance.validate()) {
        this.stepsCompleted[this.currentStepIndex] = true;
      }
      
      // 保存向导状态
      this.wizardService.saveWizardState({
        step: this.currentStepIndex,
        data: this.formData,
        completed: this.stepsCompleted
      });
    }
  }
  
  // 移动到下一步
  nextStep() {
    if (this.canMoveNext() && !this.isLastStep()) {
      // 保存当前步骤数据
      this.saveCurrentStepData();
      
      // 移动到下一步
      this.currentStepIndex++;
      
      // 加载新步骤
      this.loadCurrentStep();
    }
  }
  
  // 返回上一步
  previousStep() {
    if (!this.isFirstStep()) {
      // 保存当前步骤数据
      this.saveCurrentStepData();
      
      // 返回上一步
      this.currentStepIndex--;
      
      // 加载新步骤
      this.loadCurrentStep();
    }
  }
  
  // 跳过当前步骤
  skipStep() {
    if (this.currentStep.optional && !this.isLastStep()) {
      // 移动到下一步
      this.currentStepIndex++;
      
      // 加载新步骤
      this.loadCurrentStep();
    }
  }
  
  // 提交表单
  submit() {
    if (this.canSubmit()) {
      // 保存最后一步数据
      this.saveCurrentStepData();
      
      // 发送完成事件
      this.complete.emit(this.formData);
      
      // 清除向导状态
      this.wizardService.clearWizardState();
    }
  }
}

// 向导服务
@Injectable({
  providedIn: 'root'
})
export class WizardService {
  // 状态主题
  private wizardStateSubject = new BehaviorSubject<any>(null);
  
  constructor() {
    // 从存储初始化状态
    this.loadStateFromStorage();
  }
  
  // 获取向导状态
  getWizardState(): Observable<any> {
    return this.wizardStateSubject.asObservable();
  }
  
  // 保存向导状态
  saveWizardState(state: any) {
    // 存储到本地
    localStorage.setItem('wizard_state', JSON.stringify(state));
    
    // 更新主题
    this.wizardStateSubject.next(state);
  }
  
  // 清除向导状态
  clearWizardState() {
    localStorage.removeItem('wizard_state');
    this.wizardStateSubject.next(null);
  }
  
  // 从存储加载状态
  private loadStateFromStorage() {
    try {
      const storedState = localStorage.getItem('wizard_state');
      if (storedState) {
        const state = JSON.parse(storedState);
        this.wizardStateSubject.next(state);
      }
    } catch (e) {
      console.error('加载向导状态失败', e);
      this.clearWizardState();
    }
  }
}

// 示例步骤组件实现
@Component({
  selector: 'app-personal-info-step',
  template: `
    <form [formGroup]="personalInfoForm">
      <div class="form-group">
        <label for="fullName">姓名</label>
        <input id="fullName" formControlName="fullName" class="form-control">
        <div *ngIf="showError('fullName')" class="error">
          请输入有效的姓名
        </div>
      </div>
      
      <div class="form-group">
        <label for="email">电子邮箱</label>
        <input id="email" type="email" formControlName="email" class="form-control">
        <div *ngIf="showError('email')" class="error">
          请输入有效的电子邮箱
        </div>
      </div>
      
      <div class="form-group">
        <label for="phone">电话</label>
        <input id="phone" formControlName="phone" class="form-control">
        <div *ngIf="showError('phone')" class="error">
          请输入有效的电话号码
        </div>
      </div>
    </form>
  `
})
export class PersonalInfoStepComponent extends BaseStepComponent implements OnInit {
  personalInfoForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    super();
  }
  
  ngOnInit() {
    this.personalInfoForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]]
    });
    
    // 监听表单状态变化
    this.personalInfoForm.statusChanges.subscribe(() => {
      this.isValid = this.personalInfoForm.valid;
    });
  }
  
  // 数据初始化后的处理
  protected onDataInitialized() {
    if (this.data) {
      this.personalInfoForm.patchValue({
        fullName: this.data.fullName || '',
        email: this.data.email || '',
        phone: this.data.phone || ''
      });
    }
  }
  
  // 显示字段错误
  showError(field: string): boolean {
    const control = this.personalInfoForm.get(field);
    return control.invalid && (control.dirty || control.touched);
  }
  
  // 验证步骤
  validate(): boolean {
    // 标记所有字段为已触摸
    Object.keys(this.personalInfoForm.controls).forEach(key => {
      this.personalInfoForm.get(key).markAsTouched();
    });
    
    return this.personalInfoForm.valid;
  }
  
  // 获取步骤数据
  getStepData(): any {
    return this.personalInfoForm.valid ? this.personalInfoForm.value : {};
  }
}

// 在主模块中使用
@Component({
  selector: 'app-registration',
  template: `
    <div class="registration-container">
      <h2>用户注册</h2>
      
      <app-dynamic-form-wizard
        [steps]="wizardSteps"
        (complete)="onComplete($event)"
        (cancel)="onCancel()">
      </app-dynamic-form-wizard>
    </div>
  `
})
export class RegistrationComponent implements OnInit {
  // 定义向导步骤
  wizardSteps: StepConfig[] = [
    {
      title: '个人信息',
      component: PersonalInfoStepComponent,
      icon: 'user-icon'
    },
    {
      title: '联系方式',
      component: ContactInfoStepComponent,
      icon: 'phone-icon'
    },
    {
      title: '兴趣爱好',
      component: InterestsStepComponent,
      icon: 'heart-icon',
      optional: true  // 可选步骤
    },
    {
      title: '账户设置',
      component: AccountSetupStepComponent,
      icon: 'settings-icon'
    },
    {
      title: '确认信息',
      component: ReviewStepComponent,
      icon: 'check-icon'
    }
  ];
  
  constructor(private userService: UserService, private router: Router) {}
  
  ngOnInit() {
    // 可以在此处执行初始化逻辑
  }
  
  // 完成向导
  onComplete(data: any) {
    console.log('注册数据:', data);
    
    // 提交注册
    this.userService.register(data).subscribe(
      response => {
        // 导航到成功页面
        this.router.navigate(['/registration-success']);
      },
      error => {
        console.error('注册失败', error);
        // 处理错误...
      }
    );
  }
  
  // 取消向导
  onCancel() {
    // 导航回首页
    this.router.navigate(['/']);
  }
}

### 方案二：基于视图切换的多步骤表单

这种方法使用视图切换技术，每个步骤作为单独的视图页面，通过路由或导航控制来管理步骤切换。

```typescript
// 定义步骤组件接口
export interface StepComponent {
  data: any;
  isValid: boolean;
  
  // 步骤初始化时调用
  initialize(data?: any): void;
  
  // 步骤验证方法
  validate(): boolean;
  
  // 获取步骤数据
  getStepData(): any;
}

// 步骤基类
export abstract class BaseStepComponent implements StepComponent {
  data: any = {};
  isValid: boolean = false;
  
  // 初始化步骤，注入已有数据
  initialize(data?: any): void {
    if (data) {
      this.data = { ...data };
      this.onDataInitialized();
    }
  }
  
  // 数据初始化后的钩子方法
  protected onDataInitialized(): void { }
  
  // 验证步骤数据
  abstract validate(): boolean;
  
  // 获取步骤数据
  abstract getStepData(): any;
}

// 步骤配置接口
export interface StepConfig {
  title: string;        // 步骤标题
  component: Type<any>; // 步骤组件类型
  icon?: string;        // 步骤图标
  optional?: boolean;   // 是否为可选步骤
}

// 动态步骤容器组件
@Component({
  selector: 'app-dynamic-form-wizard',
  template: `
    <div class="wizard-container">
      <!-- 步骤指示器 -->
      <div class="step-indicator">
        <div class="step-item" 
            *ngFor="let step of steps; let i = index"
            [class.active]="currentStepIndex === i"
            [class.completed]="isStepCompleted(i)"
            (click)="canNavigateToStep(i) && navigateToStep(i)">
          <div class="step-icon">
            <i [class]="step.icon || 'default-icon'"></i>
          </div>
          <div class="step-label">{{ step.title }}</div>
        </div>
      </div>
      
      <!-- 动态组件容器 -->
      <div class="step-content">
        <h3 class="step-title">{{ currentStep.title }}</h3>
        
        <div class="component-container">
          <ng-container #stepContainer></ng-container>
        </div>
      </div>
      
      <!-- 导航按钮 -->
      <div class="wizard-actions">
        <button type="button" class="btn-prev" 
                *ngIf="!isFirstStep()" 
                (click)="previousStep()">
          上一步
        </button>
        
        <button type="button" class="btn-skip" 
                *ngIf="currentStep.optional" 
                (click)="skipStep()">
          跳过
        </button>
        
        <button type="button" class="btn-next" 
                *ngIf="!isLastStep()" 
                [disabled]="!canMoveNext()" 
                (click)="nextStep()">
          下一步
        </button>
        
        <button type="button" class="btn-submit" 
                *ngIf="isLastStep()" 
                [disabled]="!canSubmit()" 
                (click)="submit()">
          提交
        </button>
      </div>
    </div>
  `
})
export class DynamicFormWizardComponent implements OnInit, OnDestroy {
  @ViewChild('stepContainer', { read: ViewContainerRef, static: true })
  stepContainer: ViewContainerRef;
  
  // 步骤定义
  @Input() steps: StepConfig[] = [];
  
  // 完成事件
  @Output() complete = new EventEmitter<any>();
  
  // 取消事件
  @Output() cancel = new EventEmitter<void>();
  
  // 当前步骤索引
  currentStepIndex = 0;
  
  // 步骤完成状态
  stepsCompleted: boolean[] = [];
  
  // 表单数据
  formData: any = {};
  
  // 当前组件引用
  private componentRef: ComponentRef<StepComponent>;
  
  // 服务订阅
  private subscriptions = new Subscription();
  
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private wizardService: WizardService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    // 初始化步骤完成状态
    this.stepsCompleted = new Array(this.steps.length).fill(false);
    
    // 从服务恢复数据
    this.subscriptions.add(
      this.wizardService.getWizardState().subscribe(state => {
        if (state) {
          this.formData = state.data || {};
          this.currentStepIndex = state.step || 0;
          this.stepsCompleted = state.completed || new Array(this.steps.length).fill(false);
          this.loadCurrentStep();
        } else {
          this.loadCurrentStep();
        }
      })
    );
  }
  
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
  
  // 获取当前步骤
  get currentStep(): StepConfig {
    return this.steps[this.currentStepIndex];
  }
  
  // 是否为第一步
  isFirstStep(): boolean {
    return this.currentStepIndex === 0;
  }
  
  // 是否为最后一步
  isLastStep(): boolean {
    return this.currentStepIndex === this.steps.length - 1;
  }
  
  // 步骤是否已完成
  isStepCompleted(index: number): boolean {
    return this.stepsCompleted[index];
  }
  
  // 检查是否可以导航到指定步骤
  canNavigateToStep(index: number): boolean {
    // 可以导航到已完成的步骤
    if (this.stepsCompleted[index]) {
      return true;
    }
    
    // 可以导航到当前步骤
    if (index === this.currentStepIndex) {
      return true;
    }
    
    // 可以导航到下一个待完成的步骤（如果当前步骤有效）
    if (index === this.currentStepIndex + 1 && this.isCurrentStepValid()) {
      return true;
    }
    
    return false;
  }
  
  // 检查当前步骤是否有效
  isCurrentStepValid(): boolean {
    return this.componentRef?.instance?.isValid || false;
  }
  
  // 检查是否可以移动到下一步
  canMoveNext(): boolean {
    // 当前步骤可选且有效，或者当前步骤必填且有效
    return (this.currentStep.optional || this.isCurrentStepValid());
  }
  
  // 检查是否可以提交
  canSubmit(): boolean {
    // 检查所有非可选步骤是否已完成
    for (let i = 0; i < this.steps.length - 1; i++) {
      if (!this.steps[i].optional && !this.stepsCompleted[i]) {
        return false;
      }
    }
    
    // 检查最后一步是否有效
    return this.isCurrentStepValid();
  }
  
  // 加载当前步骤组件
  loadCurrentStep() {
    this.stepContainer.clear();
    
    const factory = this.componentFactoryResolver.resolveComponentFactory(
      this.steps[this.currentStepIndex].component
    );
    
    this.componentRef = this.stepContainer.createComponent(factory);
    
    // 初始化组件
    this.componentRef.instance.initialize(this.formData);
    
    // 检测变更
    this.changeDetectorRef.detectChanges();
  }
  
  // 获取当前步骤的数据
  getCurrentStepData(): any {
    if (this.componentRef && this.componentRef.instance) {
      return this.componentRef.instance.getStepData();
    }
    return null;
  }
  
  // 导航到指定步骤
  navigateToStep(index: number) {
    if (this.canNavigateToStep(index)) {
      // 保存当前步骤数据
      this.saveCurrentStepData();
      
      // 设置当前步骤索引
      this.currentStepIndex = index;
      
      // 加载新步骤
      this.loadCurrentStep();
    }
  }
  
  // 保存当前步骤数据
  saveCurrentStepData() {
    if (this.componentRef && this.componentRef.instance) {
      // 获取步骤数据
      const stepData = this.componentRef.instance.getStepData();
      
      // 合并到表单数据
      this.formData = { ...this.formData, ...stepData };
      
      // 如果当前步骤有效，标记为已完成
      if (this.componentRef.instance.validate()) {
        this.stepsCompleted[this.currentStepIndex] = true;
      }
      
      // 保存向导状态
      this.wizardService.saveWizardState({
        step: this.currentStepIndex,
        data: this.formData,
        completed: this.stepsCompleted
      });
    }
  }
  
  // 移动到下一步
  nextStep() {
    if (this.canMoveNext() && !this.isLastStep()) {
      // 保存当前步骤数据
      this.saveCurrentStepData();
      
      // 移动到下一步
      this.currentStepIndex++;
      
      // 加载新步骤
      this.loadCurrentStep();
    }
  }
  
  // 返回上一步
  previousStep() {
    if (!this.isFirstStep()) {
      // 保存当前步骤数据
      this.saveCurrentStepData();
      
      // 返回上一步
      this.currentStepIndex--;
      
      // 加载新步骤
      this.loadCurrentStep();
    }
  }
  
  // 跳过当前步骤
  skipStep() {
    if (this.currentStep.optional && !this.isLastStep()) {
      // 移动到下一步
      this.currentStepIndex++;
      
      // 加载新步骤
      this.loadCurrentStep();
    }
  }
  
  // 提交表单
  submit() {
    if (this.canSubmit()) {
      // 保存最后一步数据
      this.saveCurrentStepData();
      
      // 发送完成事件
      this.complete.emit(this.formData);
      
      // 清除向导状态
      this.wizardService.clearWizardState();
    }
  }
}

// 向导服务
@Injectable({
  providedIn: 'root'
})
export class WizardService {
  // 状态主题
  private wizardStateSubject = new BehaviorSubject<any>(null);
  
  constructor() {
    // 从存储初始化状态
    this.loadStateFromStorage();
  }
  
  // 获取向导状态
  getWizardState(): Observable<any> {
    return this.wizardStateSubject.asObservable();
  }
  
  // 保存向导状态
  saveWizardState(state: any) {
    // 存储到本地
    localStorage.setItem('wizard_state', JSON.stringify(state));
    
    // 更新主题
    this.wizardStateSubject.next(state);
  }
  
  // 清除向导状态
  clearWizardState() {
    localStorage.removeItem('wizard_state');
    this.wizardStateSubject.next(null);
  }
  
  // 从存储加载状态
  private loadStateFromStorage() {
    try {
      const storedState = localStorage.getItem('wizard_state');
      if (storedState) {
        const state = JSON.parse(storedState);
        this.wizardStateSubject.next(state);
      }
    } catch (e) {
      console.error('加载向导状态失败', e);
      this.clearWizardState();
    }
  }
}

// 示例步骤组件实现
@Component({
  selector: 'app-personal-info-step',
  template: `
    <form [formGroup]="personalInfoForm">
      <div class="form-group">
        <label for="fullName">姓名</label>
        <input id="fullName" formControlName="fullName" class="form-control">
        <div *ngIf="showError('fullName')" class="error">
          请输入有效的姓名
        </div>
      </div>
      
      <div class="form-group">
        <label for="email">电子邮箱</label>
        <input id="email" type="email" formControlName="email" class="form-control">
        <div *ngIf="showError('email')" class="error">
          请输入有效的电子邮箱
        </div>
      </div>
      
      <div class="form-group">
        <label for="phone">电话</label>
        <input id="phone" formControlName="phone" class="form-control">
        <div *ngIf="showError('phone')" class="error">
          请输入有效的电话号码
        </div>
      </div>
    </form>
  `
})
export class PersonalInfoStepComponent extends BaseStepComponent implements OnInit {
  personalInfoForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    super();
  }
  
  ngOnInit() {
    this.personalInfoForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]]
    });
    
    // 监听表单状态变化
    this.personalInfoForm.statusChanges.subscribe(() => {
      this.isValid = this.personalInfoForm.valid;
    });
  }
  
  // 数据初始化后的处理
  protected onDataInitialized() {
    if (this.data) {
      this.personalInfoForm.patchValue({
        fullName: this.data.fullName || '',
        email: this.data.email || '',
        phone: this.data.phone || ''
      });
    }
  }
  
  // 显示字段错误
  showError(field: string): boolean {
    const control = this.personalInfoForm.get(field);
    return control.invalid && (control.dirty || control.touched);
  }
  
  // 验证步骤
  validate(): boolean {
    // 标记所有字段为已触摸
    Object.keys(this.personalInfoForm.controls).forEach(key => {
      this.personalInfoForm.get(key).markAsTouched();
    });
    
    return this.personalInfoForm.valid;
  }
  
  // 获取步骤数据
  getStepData(): any {
    return this.personalInfoForm.valid ? this.personalInfoForm.value : {};
  }
}

// 在主模块中使用
@Component({
  selector: 'app-registration',
  template: `
    <div class="registration-container">
      <h2>用户注册</h2>
      
      <app-dynamic-form-wizard
        [steps]="wizardSteps"
        (complete)="onComplete($event)"
        (cancel)="onCancel()">
      </app-dynamic-form-wizard>
    </div>
  `
})
export class RegistrationComponent implements OnInit {
  // 定义向导步骤
  wizardSteps: StepConfig[] = [
    {
      title: '个人信息',
      component: PersonalInfoStepComponent,
      icon: 'user-icon'
    },
    {
      title: '联系方式',
      component: ContactInfoStepComponent,
      icon: 'phone-icon'
    },
    {
      title: '兴趣爱好',
      component: InterestsStepComponent,
      icon: 'heart-icon',
      optional: true  // 可选步骤
    },
    {
      title: '账户设置',
      component: AccountSetupStepComponent,
      icon: 'settings-icon'
    },
    {
      title: '确认信息',
      component: ReviewStepComponent,
      icon: 'check-icon'
    }
  ];
  
  constructor(private userService: UserService, private router: Router) {}
  
  ngOnInit() {
    // 可以在此处执行初始化逻辑
  }
  
  // 完成向导
  onComplete(data: any) {
    console.log('注册数据:', data);
    
    // 提交注册
    this.userService.register(data).subscribe(
      response => {
        // 导航到成功页面
        this.router.navigate(['/registration-success']);
      },
      error => {
        console.error('注册失败', error);
        // 处理错误...
      }
    );
  }
  
  // 取消向导
  onCancel() {
    // 导航回首页
    this.router.navigate(['/']);
  }
}
```

### 方案三：基于动态组件的多步骤表单

这种方法使用动态组件加载技术，每个步骤作为单独的组件开发，提供更好的代码组织和复用性。

```typescript
// 定义步骤组件接口
export interface StepComponent {
  data: any;
  isValid: boolean;
  
  // 步骤初始化时调用
  initialize(data?: any): void;
  
  // 步骤验证方法
  validate(): boolean;
  
  // 获取步骤数据
  getStepData(): any;
}

// 步骤基类
export abstract class BaseStepComponent implements StepComponent {
  data: any = {};
  isValid: boolean = false;
  
  // 初始化步骤，注入已有数据
  initialize(data?: any): void {
    if (data) {
      this.data = { ...data };
      this.onDataInitialized();
    }
  }
  
  // 数据初始化后的钩子方法
  protected onDataInitialized(): void { }
  
  // 验证步骤数据
  abstract validate(): boolean;
  
  // 获取步骤数据
  abstract getStepData(): any;
}

// 步骤配置接口
export interface StepConfig {
  title: string;        // 步骤标题
  component: Type<any>; // 步骤组件类型
  icon?: string;        // 步骤图标
  optional?: boolean;   // 是否为可选步骤
}

// 动态步骤容器组件
@Component({
  selector: 'app-dynamic-form-wizard',
  template: `
    <div class="wizard-container">
      <!-- 步骤指示器 -->
      <div class="step-indicator">
        <div class="step-item" 
            *ngFor="let step of steps; let i = index"
            [class.active]="currentStepIndex === i"
            [class.completed]="isStepCompleted(i)"
            (click)="canNavigateToStep(i) && navigateToStep(i)">
          <div class="step-icon">
            <i [class]="step.icon || 'default-icon'"></i>
          </div>
          <div class="step-label">{{ step.title }}</div>
        </div>
      </div>
      
      <!-- 动态组件容器 -->
      <div class="step-content">
        <h3 class="step-title">{{ currentStep.title }}</h3>
        
        <div class="component-container">
          <ng-container #stepContainer></ng-container>
        </div>
      </div>
      
      <!-- 导航按钮 -->
      <div class="wizard-actions">
        <button type="button" class="btn-prev" 
                *ngIf="!isFirstStep()" 
                (click)="previousStep()">
          上一步
        </button>
        
        <button type="button" class="btn-skip" 
                *ngIf="currentStep.optional" 
                (click)="skipStep()">
          跳过
        </button>
        
        <button type="button" class="btn-next" 
                *ngIf="!isLastStep()" 
                [disabled]="!canMoveNext()" 
                (click)="nextStep()">
          下一步
        </button>
        
        <button type="button" class="btn-submit" 
                *ngIf="isLastStep()" 
                [disabled]="!canSubmit()" 
                (click)="submit()">
          提交
        </button>
      </div>
    </div>
  `
})
export class DynamicFormWizardComponent implements OnInit, OnDestroy {
  @ViewChild('stepContainer', { read: ViewContainerRef, static: true })
  stepContainer: ViewContainerRef;
  
  // 步骤定义
  @Input() steps: StepConfig[] = [];
  
  // 完成事件
  @Output() complete = new EventEmitter<any>();
  
  // 取消事件
  @Output() cancel = new EventEmitter<void>();
  
  // 当前步骤索引
  currentStepIndex = 0;
  
  // 步骤完成状态
  stepsCompleted: boolean[] = [];
  
  // 表单数据
  formData: any = {};
  
  // 当前组件引用
  private componentRef: ComponentRef<StepComponent>;
  
  // 服务订阅
  private subscriptions = new Subscription();
  
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private wizardService: WizardService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    // 初始化步骤完成状态
    this.stepsCompleted = new Array(this.steps.length).fill(false);
    
    // 从服务恢复数据
    this.subscriptions.add(
      this.wizardService.getWizardState().subscribe(state => {
        if (state) {
          this.formData = state.data || {};
          this.currentStepIndex = state.step || 0;
          this.stepsCompleted = state.completed || new Array(this.steps.length).fill(false);
          this.loadCurrentStep();
        } else {
          this.loadCurrentStep();
        }
      })
    );
  }
  
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
  
  // 获取当前步骤
  get currentStep(): StepConfig {
    return this.steps[this.currentStepIndex];
  }
  
  // 是否为第一步
  isFirstStep(): boolean {
    return this.currentStepIndex === 0;
  }
  
  // 是否为最后一步
  isLastStep(): boolean {
    return this.currentStepIndex === this.steps.length - 1;
  }
  
  // 步骤是否已完成
  isStepCompleted(index: number): boolean {
    return this.stepsCompleted[index];
  }
  
  // 检查是否可以导航到指定步骤
  canNavigateToStep(index: number): boolean {
    // 可以导航到已完成的步骤
    if (this.stepsCompleted[index]) {
      return true;
    }
    
    // 可以导航到当前步骤
    if (index === this.currentStepIndex) {
      return true;
    }
    
    // 可以导航到下一个待完成的步骤（如果当前步骤有效）
    if (index === this.currentStepIndex + 1 && this.isCurrentStepValid()) {
      return true;
    }
    
    return false;
  }
  
  // 检查当前步骤是否有效
  isCurrentStepValid(): boolean {
    return this.componentRef?.instance?.isValid || false;
  }
  
  // 检查是否可以移动到下一步
  canMoveNext(): boolean {
    // 当前步骤可选且有效，或者当前步骤必填且有效
    return (this.currentStep.optional || this.isCurrentStepValid());
  }
  
  // 检查是否可以提交
  canSubmit(): boolean {
    // 检查所有非可选步骤是否已完成
    for (let i = 0; i < this.steps.length - 1; i++) {
      if (!this.steps[i].optional && !this.stepsCompleted[i]) {
        return false;
      }
    }
    
    // 检查最后一步是否有效
    return this.isCurrentStepValid();
  }
  
  // 加载当前步骤组件
  loadCurrentStep() {
    this.stepContainer.clear();
    
    const factory = this.componentFactoryResolver.resolveComponentFactory(
      this.steps[this.currentStepIndex].component
    );
    
    this.componentRef = this.stepContainer.createComponent(factory);
    
    // 初始化组件
    this.componentRef.instance.initialize(this.formData);
    
    // 检测变更
    this.changeDetectorRef.detectChanges();
  }
  
  // 获取当前步骤的数据
  getCurrentStepData(): any {
    if (this.componentRef && this.componentRef.instance) {
      return this.componentRef.instance.getStepData();
    }
    return null;
  }
  
  // 导航到指定步骤
  navigateToStep(index: number) {
    if (this.canNavigateToStep(index)) {
      // 保存当前步骤数据
      this.saveCurrentStepData();
      
      // 设置当前步骤索引
      this.currentStepIndex = index;
      
      // 加载新步骤
      this.loadCurrentStep();
    }
  }
  
  // 保存当前步骤数据
  saveCurrentStepData() {
    if (this.componentRef && this.componentRef.instance) {
      // 获取步骤数据
      const stepData = this.componentRef.instance.getStepData();
      
      // 合并到表单数据
      this.formData = { ...this.formData, ...stepData };
      
      // 如果当前步骤有效，标记为已完成
      if (this.componentRef.instance.validate()) {
        this.stepsCompleted[this.currentStepIndex] = true;
      }
      
      // 保存向导状态
      this.wizardService.saveWizardState({
        step: this.currentStepIndex,
        data: this.formData,
        completed: this.stepsCompleted
      });
    }
  }
  
  // 移动到下一步
  nextStep() {
    if (this.canMoveNext() && !this.isLastStep()) {
      // 保存当前步骤数据
      this.saveCurrentStepData();
      
      // 移动到下一步
      this.currentStepIndex++;
      
      // 加载新步骤
      this.loadCurrentStep();
    }
  }
  
  // 返回上一步
  previousStep() {
    if (!this.isFirstStep()) {
      // 保存当前步骤数据
      this.saveCurrentStepData();
      
      // 返回上一步
      this.currentStepIndex--;
      
      // 加载新步骤
      this.loadCurrentStep();
    }
  }
  
  // 跳过当前步骤
  skipStep() {
    if (this.currentStep.optional && !this.isLastStep()) {
      // 移动到下一步
      this.currentStepIndex++;
      
      // 加载新步骤
      this.loadCurrentStep();
    }
  }
  
  // 提交表单
  submit() {
    if (this.canSubmit()) {
      // 保存最后一步数据
      this.saveCurrentStepData();
      
      // 发送完成事件
      this.complete.emit(this.formData);
      
      // 清除向导状态
      this.wizardService.clearWizardState();
    }
  }
}

// 向导服务
@Injectable({
  providedIn: 'root'
})
export class WizardService {
  // 状态主题
  private wizardStateSubject = new BehaviorSubject<any>(null);
  
  constructor() {
    // 从存储初始化状态
    this.loadStateFromStorage();
  }
  
  // 获取向导状态
  getWizardState(): Observable<any> {
    return this.wizardStateSubject.asObservable();
  }
  
  // 保存向导状态
  saveWizardState(state: any) {
    // 存储到本地
    localStorage.setItem('wizard_state', JSON.stringify(state));
    
    // 更新主题
    this.wizardStateSubject.next(state);
  }
  
  // 清除向导状态
  clearWizardState() {
    localStorage.removeItem('wizard_state');
    this.wizardStateSubject.next(null);
  }
  
  // 从存储加载状态
  private loadStateFromStorage() {
    try {
      const storedState = localStorage.getItem('wizard_state');
      if (storedState) {
        const state = JSON.parse(storedState);
        this.wizardStateSubject.next(state);
      }
    } catch (e) {
      console.error('加载向导状态失败', e);
      this.clearWizardState();
    }
  }
}

// 示例步骤组件实现
@Component({
  selector: 'app-personal-info-step',
  template: `
    <form [formGroup]="personalInfoForm">
      <div class="form-group">
        <label for="fullName">姓名</label>
        <input id="fullName" formControlName="fullName" class="form-control">
        <div *ngIf="showError('fullName')" class="error">
          请输入有效的姓名
        </div>
      </div>
      
      <div class="form-group">
        <label for="email">电子邮箱</label>
        <input id="email" type="email" formControlName="email" class="form-control">
        <div *ngIf="showError('email')" class="error">
          请输入有效的电子邮箱
        </div>
      </div>
      
      <div class="form-group">
        <label for="phone">电话</label>
        <input id="phone" formControlName="phone" class="form-control">
        <div *ngIf="showError('phone')" class="error">
          请输入有效的电话号码
        </div>
      </div>
    </form>
  `
})
export class PersonalInfoStepComponent extends BaseStepComponent implements OnInit {
  personalInfoForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    super();
  }
  
  ngOnInit() {
    this.personalInfoForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]]
    });
    
    // 监听表单状态变化
    this.personalInfoForm.statusChanges.subscribe(() => {
      this.isValid = this.personalInfoForm.valid;
    });
  }
  
  // 数据初始化后的处理
  protected onDataInitialized() {
    if (this.data) {
      this.personalInfoForm.patchValue({
        fullName: this.data.fullName || '',
        email: this.data.email || '',
        phone: this.data.phone || ''
      });
    }
  }
  
  // 显示字段错误
  showError(field: string): boolean {
    const control = this.personalInfoForm.get(field);
    return control.invalid && (control.dirty || control.touched);
  }
  
  // 验证步骤
  validate(): boolean {
    // 标记所有字段为已触摸
    Object.keys(this.personalInfoForm.controls).forEach(key => {
      this.personalInfoForm.get(key).markAsTouched();
    });
    
    return this.personalInfoForm.valid;
  }
  
  // 获取步骤数据
  getStepData(): any {
    return this.personalInfoForm.valid ? this.personalInfoForm.value : {};
  }
}

// 在主模块中使用
@Component({
  selector: 'app-registration',
  template: `
    <div class="registration-container">
      <h2>用户注册</h2>
      
      <app-dynamic-form-wizard
        [steps]="wizardSteps"
        (complete)="onComplete($event)"
        (cancel)="onCancel()">
      </app-dynamic-form-wizard>
    </div>
  `
})
export class RegistrationComponent implements OnInit {
  // 定义向导步骤
  wizardSteps: StepConfig[] = [
    {
      title: '个人信息',
      component: PersonalInfoStepComponent,
      icon: 'user-icon'
    },
    {
      title: '联系方式',
      component: ContactInfoStepComponent,
      icon: 'phone-icon'
    },
    {
      title: '兴趣爱好',
      component: InterestsStepComponent,
      icon: 'heart-icon',
      optional: true  // 可选步骤
    },
    {
      title: '账户设置',
      component: AccountSetupStepComponent,
      icon: 'settings-icon'
    },
    {
      title: '确认信息',
      component: ReviewStepComponent,
      icon: 'check-icon'
    }
  ];
  
  constructor(private userService: UserService, private router: Router) {}
  
  ngOnInit() {
    // 可以在此处执行初始化逻辑
  }
  
  // 完成向导
  onComplete(data: any) {
    console.log('注册数据:', data);
    
    // 提交注册
    this.userService.register(data).subscribe(
      response => {
        // 导航到成功页面
        this.router.navigate(['/registration-success']);
      },
      error => {
        console.error('注册失败', error);
        // 处理错误...
      }
    );
  }
  
  // 取消向导
  onCancel() {
    // 导航回首页
    this.router.navigate(['/']);
  }
}
```

### 多步骤表单的最佳实践

开发企业级多步骤表单时，应遵循以下最佳实践：

1. **状态管理**
   - 跨步骤状态共享：使用服务或状态管理库保存表单状态
   - 实现表单数据持久化：允许用户中断并稍后继续
   - 维护步骤完成状态：清晰指示用户进度

2. **导航控制**
   - 实现合理的导航限制：防止用户跳过必要步骤
   - 提供清晰的进度指示：让用户知道当前位置和剩余步骤
   - 支持非线性导航：允许返回修改已完成步骤

3. **验证策略**
   - 分步验证：每个步骤具有独立的验证逻辑
   - 提交前全局验证：确保所有必要数据都已正确填写
   - 实时验证反馈：及时告知用户输入问题

4. **用户体验优化**
   - 自动保存：定期保存用户输入，防止数据丢失
   - 进度恢复：允许用户在不同会话间继续填写
   - 可选步骤支持：区分必填与可选内容
   - 预填数据：尽可能从已知信息预填表单

5. **性能考虑**
   - 延迟加载：只加载当前需要的步骤组件
   - 数据提交策略：可选择分步提交或最终提交
   - 大型表单拆分：适当拆分复杂表单减轻负担

6. **测试策略**
   - 端到端测试：验证完整表单流程
   - 步骤间状态一致性测试：确保数据正确传递
   - 异常路径测试：验证跳转、保存、恢复功能

### 技术选择比较

| 实现方法 | 优点 | 缺点 | 适用场景 |
|---------|------|------|---------|
| 基于路由 | • URL可分享和书签<br>• 自然的浏览器历史支持<br>• 适合大型表单 | • 配置复杂<br>• 需要路由守卫<br>• 步骤间数据共享需额外处理 | • 复杂的注册流程<br>• 多页应用<br>• 需要URL直达特定步骤 |
| 视图切换 | • 实现简单直接<br>• 单组件内数据共享方便<br>• 完全控制导航逻辑 | • 组件可能过大复杂<br>• 不支持URL直达<br>• 代码复用性较差 | • 相对简单的表单<br>• 步骤数量有限<br>• 单页应用内表单 |
| 动态组件 | • 高度模块化<br>• 良好的代码组织<br>• 组件可复用 | • 实现复杂度高<br>• 组件通信需要额外设计<br>• 编码量大 | • 企业级复杂表单<br>• 需要高度可复用组件<br>• 多个相似表单的应用 |

通过以上三种方法，Angular应用可以实现功能强大、用户体验良好的多步骤表单，满足企业级应用中复杂的表单处理需求。选择哪种方法应根据具体的应用场景、复杂度和团队熟悉度而定。 