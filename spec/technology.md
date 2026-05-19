# 技术文档

## 1. 整体架构

### 模块划分
```
src/
├── app.js                    # 主入口文件
├── request/
│   └── index.js              # OpenAI 客户端和 API 调用
└── utils/
    ├── init.js               # 欢迎界面
    ├── logger.js             # 日志输出（含 Markdown 渲染）
    ├── fsHandle.js           # 文件系统操作
    └── pathUtils.js          # 路径工具
```

---

## 2. 核心依赖库

| 库 | 版本 | 用途 |
|---|---|---|
| `readline` | Node.js 内置 | 终端交互，处理用户输入 |
| `openai` | ^6.33.0 | OpenAI API 客户端，用于调用大模型 |
| `ora` | ^9.3.0 | 终端加载动画 |
| `chalk` | ^5.6.2 | 终端文本颜色格式化 |
| `marked` | ^15.0.12 | Markdown 解析 |
| `marked-terminal` | ^7.3.0 | Markdown 终端渲染器 |
| `dotenv` | ^17.4.1 | 环境变量加载 |
| `ansi-escapes` | ^7.3.0 | ANSI 转义序列（预留） |

---

## 3. 代码逻辑流程

### 3.1 启动流程 ([app.js](src/app.js))

```
启动 app.js
   ↓
显示欢迎界面 (welcomeLog)
   ↓
创建 readline 接口 + OpenAI 客户端
   ↓
进入 promptUser 循环
```

### 3.2 对话主循环 ([app.js:20-56](src/app.js#L20-L56))

```
rl.question('问：', 等待用户输入)
   ↓
输入 "exit"/"quit"? → 退出程序
   ↓
空输入? → 重新 prompt
   ↓
消息存入 messages[]
   ↓
显示 ora 加载动画 "AI 正在思考..."
   ↓
调用 getAIResponse()
   ↓
停止 spinner，用 logger.logMarkdown 渲染回复
   ↓
回到 promptUser 等待下一轮
```

### 3.3 配置读取 ([request/index.js:12-39](src/request/index.js#L12-L39))

配置文件 `settings.json` 读取优先级：
1. 当前工作目录: `./.front/settings.json`
2. 用户目录: `~/.front/settings.json`

配置项：
- `apiKey` - API 密钥
- `baseURL` - API 基础地址
- `model` - 模型名称（默认: `doubao-seed-2.0-code`）

### 3.4 历史记录保存 ([fsHandle.js:9-41](src/utils/fsHandle.js#L9-L41))

程序退出时自动保存对话历史到：
```
~/.front/history/{项目名}/{时间戳}.json
```

---

## 4. 核心模块说明

### 4.1 logger.js - 日志与 Markdown 渲染

- `log(text, color)` - 输出彩色文本
- `logMarkdown(markdownText)` - 使用 marked + marked-terminal 渲染并输出 Markdown

支持的 Markdown 样式：代码块、标题、粗体、斜体、链接、表格等

### 4.2 request/index.js - OpenAI 调用

- `createOpenAIClient()` - 从配置创建 OpenAI 实例
- `getAIResponse({ messages, openai, model })` - 调用 chat.completions.create

---

## 5. 待实现功能（规划）

根据需求，后续需要实现：

1. **指令系统** (`commands/`)
   - 指令注册中心
   - 指令定义

2. **输入增强** (`input/`)
   - 键盘按下监听
   - 列表选择器
   - 键码映射

3. **核心交互流程变更**
   - 先 rl.question 提问
   - 监听键盘按键
   - 按键后拉起对应列表
