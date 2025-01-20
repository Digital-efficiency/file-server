# Files Server

基于 NestJS 的文件服务器，提供安全的文件上传、存储和访问功能。

## 特性

- 🔐 基于令牌的认证系统
- 🔄 文件重复检测
- ⏱️ 临时访问令牌
- 📁 文件元数据存储
- 🌐 GraphQL API 支持
- 🔍 文件内容检索
- 💾 文件版本控制

## 系统要求

- Node.js >= 16
- PostgreSQL >= 12
- pnpm >= 8

## 快速开始

1. 克隆仓库
```bash
git clone <repository-url>
cd files-server
```

2. 安装依赖
```bash
pnpm install
```

3. 配置环境变量
```bash
# .env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
DATABASE_NAME=files_db
AUTH_BASE_URL=http://your-auth-service-url
```

4. 运行数据库迁移
```bash
pnpm run migration:run
```

5. 启动服务器
```bash
# 开发模式
pnpm run start:dev

# 生产模式
pnpm run start:prod
```

## API 文档

### REST API

#### 文件操作

##### 上传文件
- **POST** `/files/upload`
- 需要认证：是
- Content-Type: multipart/form-data
```typescript
// 请求
{
  file: File // 文件对象
}

// 响应
{
  id: string
  originalname: string
  mimetype: string
  size: number
}
```

##### 检查文件是否存在
- **POST** `/files/check`
- 需要认证：是
- Content-Type: multipart/form-data
```typescript
// 请求
{
  file: File // 文件对象
}

// 响应
{
  exists: boolean
  file?: {
    id: string
    originalname: string
    mimetype: string
    size: number
  }
}
```

##### 生成访问令牌
- **POST** `/files/:id/access-token`
- 需要认证：是
```typescript
// 响应
{
  fileId: string
  accessToken: string
  expiresAt: string // ISO 日期字符串
}
```

##### 下载文件
- **GET** `/files/:id?token=:token`
- 需要认证：否（需要有效的访问令牌）
- 响应：文件流

### GraphQL API

#### 查询
```graphql
type Query {
  files: [File!]!
  file(id: ID!): File
}

type File {
  id: ID!
  filename: String!
  mimetype: String!
  size: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

## 部署

### Docker 部署

1. 构建镜像
```bash
docker build -t files-server .
```

2. 运行容器
```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_HOST=host.docker.internal \
  -e DATABASE_PORT=5432 \
  -e DATABASE_USERNAME=postgres \
  -e DATABASE_PASSWORD=your-password \
  -e DATABASE_NAME=files_db \
  -e AUTH_BASE_URL=http://your-auth-service-url \
  -v /path/to/uploads:/app/uploads \
  files-server
```

### 传统部署

1. 构建项目
```bash
pnpm run build
```

2. 配置环境变量

3. 启动服务
```bash
# 使用 PM2
pm2 start dist/main.js --name files-server

# 或使用 node
NODE_ENV=production node dist/main.js
```

## 安全注意事项

1. 文件访问控制
   - 所有文件操作需要认证
   - 文件下载使用临时访问令牌
   - 访问令牌有效期为 5 分钟

2. 文件存储
   - 文件存储在服务器本地，建议配置单独的存储卷
   - 定期清理过期的访问令牌
   - 建议配置文件大小限制

3. 认证集成
   - 需要配置正确的 AUTH_BASE_URL
   - 使用 Bearer token 认证
   - 支持令牌自动续期

## 开发指南

### 添加新的文件处理器

1. 创建处理器类
```typescript
@Injectable()
export class NewFileProcessor {
  async process(file: Express.Multer.File) {
    // 处理逻辑
  }
}
```

2. 注册到 FilesModule
```typescript
@Module({
  providers: [NewFileProcessor]
})
```

### 自定义存储提供者

实现 StorageProvider 接口：
```typescript
export interface StorageProvider {
  store(file: Buffer): Promise<string>;
  retrieve(id: string): Promise<Buffer>;
}
```

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交变更
4. 推送到分支
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)
