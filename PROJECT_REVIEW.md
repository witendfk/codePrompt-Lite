# CodePrompt 项目复盘文档

> **项目定位**：AI 终端助手 - 类似 Claude Code 的命令行开发辅助工具
> **创建时间**：2026-05-09
> **技术栈**：Node.js + ESM Module + OpenAI API

---

## 一、项目概览

### 1.1 项目目标

开发一个运行在终端中的 AI 助手，辅助开发者进行日常开发工作：

- 与 AI 进行自然语言对话
- 支持项目文件内容的快速引用
- 支持自定义指令扩展功能
- 提供交互式的输入体验（命令补全、文件选择）

### 1.2 核心特性

| 特性 | 描述 |
|------|------|
| **命令补全** | 输入 `/` 触发内置/自定义指令补全 |
| **文件引用** | 输入 `@` 选择文件，内容自动附加到消息 |
| **自定义指令** | 从 `.front/commands/` 目录动态加载用户指令 |
| **Markdown 渲染** | AI 回复以格式化方式在终端展示 |
| **历史持久化** | 对话历史保存到 `~/.front/history/<项目名>/` |

---

## 二、项目架构

### 2.1 目录结构

```
CodePrompt/
├── src/
│   ├── app.js              # 启动入口，主对话循环
│   ├── request/            # API 请求层
│   │   └── index.js        # OpenAI 客户端封装
│   ├── input/              # 增强输入系统
│   │   └── index.js        # 交互式输入（补全、选择）
│   ├── commands/           # 指令系统
│   │   └── index.js        # 内置指令 + 自定义指令加载
│   ├── files/              # 文件处理
│   │   └── index.js        # 文件扫描、解析、附加
│   ├── utils/              # 工具函数
│   │   ├── logger.js       # 日志（Markdown 渲染）
│   │   ├── init.js         # 欢迎信息
│   │   ├── pathUtils.js    # 路径处理
│   │   └── fsHandle.js     # 历史记录写入
│   ├── docs/               # 预留：项目文档模板
│   └── tool/               # 预留：Function Calling 工具
├── .front/                 # 配置目录
│   └── settings.json       # API 配置（apiKey、baseURL、model）
├── package.json
└── CLAUDE.md               # 项目规范文档
```

### 2.2 模块依赖关系

```
┌─────────────────────────────────────────┐
│              app.js (主入口)             │
│  - 初始化 readline                       │
│  - 对话循环                              │
│  - 消息历史管理                          │
└─────────────┬───────────────────────────┘
              │
     ┌────────┼────────┬────────┬────────┐
     ▼        ▼        ▼        ▼        ▼
  request   input   commands  files   utils
```

---

## 三、功能模块详解

### 3.1 启动流程 [app.js]

```javascript
// 1. 创建 readline 接口
const rl = readline.createInterface({ input, output });

// 2. 初始化 OpenAI 客户端
const openai = createOpenAIClient();

// 3. 初始化文件缓存
initFileCache();

// 4. 创建增强输入（绑定键盘事件）
createEnhancedPrompt(rl);

// 5. 显示欢迎信息
welcomeLog();

// 6. 启动对话循环
promptUser();
```

### 3.2 增强输入系统 [input/index.js]

**核心能力**：
- 拦截键盘事件，实现自定义输入控制
- 检测 `/` 触发命令补全
- 检测 `@` 触发文件选择
- 上下键导航、Tab 确认、Esc 取消

**关键函数**：
| 函数 | 作用 |
|------|------|
| `createEnhancedPrompt()` | 绑定自定义键盘监听 |
| `handleKeyPress()` | 路由按键到正常/列表模式 |
| `checkTrigger()` | 检测是否触发补全 |
| `showList()` | 显示补全列表 |
| `confirmSelection()` | Tab 确认选择 |

### 3.3 指令系统 [commands/index.js]

**指令类型**：

1. **阻断类指令** - 返回 `true`，不发送给 AI
   - `/help` - 显示帮助
   - `/clear` - 清空历史
   - `/exit` - 退出程序

2. **非阻断类指令** - 返回字符串，附加给 AI
   - `/context` - 显示对话摘要

3. **自定义指令** - 从 `.front/commands/` 加载
   - 目录结构：`.front/commands/<分类>/<指令名>.md`
   - 指令格式：`/<分类>:<指令名>`
   - 例子：`.front/commands/code/review.md` → `/code:review`

**加载优先级**：项目目录指令 > 用户目录指令

### 3.4 文件系统 [files/index.js]

**功能**：
- 递归扫描项目文件（排除 `node_modules`、`.git` 等）
- 解析输入中的 `@[filename]` 标记
- 读取文件内容并附加到消息

**排除目录**：`node_modules`、`.git`、`.front`、`.claude`、`dist`、`build`

### 3.5 API 请求 [request/index.js]

**配置读取顺序**：
1. 当前项目 `.front/settings.json`
2. 用户目录 `~/.front/settings.json`

**支持的模型**：默认 `doubao-seed-2.0-code`（可配置）

---

## 四、已完成功能清单

| 模块 | 功能 | 状态 | 文件位置 |
|------|------|:----:|---------|
| 核心流程 | 终端交互循环 | ✅ | [app.js](src/app.js) |
| 核心流程 | 消息历史管理 | ✅ | [app.js:26](src/app.js#L26) |
| 输入系统 | 命令补全 (/) | ✅ | [input/index.js:114](src/input/index.js#L114) |
| 输入系统 | 文件选择 (@) | ✅ | [input/index.js:130](src/input/index.js#L130) |
| 输入系统 | 列表导航（↑↓TabEsc） | ✅ | [input/index.js:184](src/input/index.js#L184) |
| 指令系统 | 内置指令 | ✅ | [commands/index.js:8](src/commands/index.js#L8) |
| 指令系统 | 自定义指令加载 | ✅ | [commands/index.js:103](src/commands/index.js#L103) |
| 指令系统 | 指令缓存机制 | ✅ | [commands/index.js:94](src/commands/index.js#L94) |
| 文件系统 | 项目文件扫描 | ✅ | [files/index.js:10](src/files/index.js#L10) |
| 文件系统 | 文件标记解析 | ✅ | [files/index.js:63](src/files/index.js#L63) |
| 文件系统 | 文件内容附加 | ✅ | [files/index.js:78](src/files/index.js#L78) |
| 工具函数 | Markdown 渲染输出 | ✅ | [utils/logger.js](src/utils/logger.js) |
| 工具函数 | 历史记录持久化 | ✅ | [utils/fsHandle.js](src/utils/fsHandle.js) |
| 工具函数 | 路径处理 | ✅ | [utils/pathUtils.js](src/utils/pathUtils.js) |
| API 集成 | OpenAI 兼容接口 | ✅ | [request/index.js](src/request/index.js) |
| API 集成 | 配置文件读取 | ✅ | [request/index.js:7](src/request/index.js#L7) |

---

## 五、待开发/预留功能

| 功能 | 状态 | 说明 |
|------|:----:|------|
| `src/tool/` | 🔲 预留 | Function Calling 工具定义 |
| `src/docs/` | 🔲 预留 | 项目文档模板（用于上下文注入） |
| 会话恢复 | 🔲 未实现 | 历史记录只写不读 |
| 流式输出 | 🔲 未实现 | 当前等待完整响应 |
| 多轮对话上下文管理 | 🔲 未优化 | 无上下文裁剪、token 控制 |
| 测试 | 🔲 未实现 | package.json 中无测试脚本 |

---

## 六、使用指南

### 6.1 启动项目

```bash
node src/app.js
```

### 6.2 配置 API

在项目目录或用户目录创建 `.front/settings.json`：

```json
{
  "baseURL": "https://open.bigmodel.cn/api/paas/v4/",
  "apiKey": "your-api-key",
  "model": "glm-4"
}
```

### 6.3 交互方式

| 输入 | 效果 |
|------|------|
| `help` | 输入 `/` 后显示命令列表，↑↓选择，Tab确认 |
| `@` | 显示项目文件列表，选择后文件内容附加 |
| `/help` | 显示帮助信息 |
| `/clear` | 清空对话历史 |
| `/context` | 查看当前对话摘要 |
| `exit` | 退出程序 |

### 6.4 自定义指令

创建文件 `.front/commands/<分类>/<指令名>.md`：

```markdown
# 指令描述

这是指令的具体内容，会被发送给 AI...
```

使用：输入 `/<分类>:<指令名>`

---

## 七、技术要点记录

### 7.1 ESM 模块规范

项目使用 ES Module（`"type": "module"`），注意：
- 导入需要加 `.js` 扩展名
- 使用 `import/export` 而非 `require/module.exports`

### 7.2 readline 增强

通过移除默认 `keypress` 监听器实现自定义输入控制：

```javascript
rl.input.removeAllListeners('keypress');
rl.input.on('keypress', (char, key) => {
  // 自定义处理
});
```

### 7.3 终端光标控制

使用 `ansi-escapes` 控制光标位置和屏幕清除：

```javascript
ansiEscapes.cursorLeft    // 光标左移
ansiEscapes.eraseLine     // 清除当前行
ansiEscapes.cursorUp(n)   // 光标上移 n 行
```

### 7.4 Markdown 终端渲染

使用 `marked` + `marked-terminal` 实现：

```javascript
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

marked.setOptions({ renderer: new TerminalRenderer() });
console.log(marked.parse(markdownText));
```

---

## 八、复盘检查清单

### 代码质量
- [ ] 检查是否有重复代码可抽取
- [ ] 检查错误处理是否完善
- [ ] 检查是否有性能优化空间

### 功能完整性
- [ ] 所有核心功能是否正常工作
- [ ] 边界情况是否处理
- [ ] 用户体验是否流畅

### 扩展性
- [ ] 模块职责是否单一
- [ ] 接口设计是否清晰
- [ ] 是否易于添加新功能

### 文档
- [ ] 代码注释是否充分
- [ ] API 文档是否完整
- [ ] 使用说明是否清晰

---

## 九、更新日志

| 日期 | 内容 |
|------|------|
| 2026-05-09 | 创建复盘文档，梳理已完成功能 |

---

> **最后复盘时间**：2026-05-09
> **复盘人**：Claude Code
