# 项目架构复盘文档

## 一、整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                           app.js (启动入口)                      │
└─────────────────────────────────────────────────────────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
         ▼                      ▼                      ▼
┌────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   上下文层      │    │   输入处理层     │    │    工具层        │
│ contextRead.js │    │ input/          │    │ tools/          │
└────────────────┘    └─────────────────┘    └─────────────────┘
         │                      │                      │
         │ - systemDoc.md       │ - enhancedQuestion   │ - 本地工具
         │ - .front.md          │ - 指令系统           │ - MCP工具
         │ - rules/             │ - 文件标签           │ - 工具映射
         │ - skills/            │                      │
         └──────────────────────┴──────────────────────┘
                                       │
                                       ▼
                          ┌─────────────────────────┐
                          │    request/index.js     │
                          │   OpenAI API 调用        │
                          │   + 工具调用循环         │
                          └─────────────────────────┘
```

---

## 二、核心模块说明

### 2.1 启动入口 - app.js

**职责：** 应用启动、流程编排

**关键流程：**
```javascript
// 1. 读取静态上下文（启动时一次）
const systemMessage = { role: 'system', content: readSystem() };
const userContextMessage = { role: 'user', content: getUserContext() };
const userSkillMessage = { role: 'user', content: getSkillHeaders() };

// 2. 初始化
initFileCache();           // 文件缓存
createEnhancedPrompt(rl);  // 增强输入

// 3. 对话循环
promptUser()
  → enhancedQuestion()          // 等待输入
  → 指令检测与执行               // commands/
  → 文件标签处理                 // files/
  → 规则匹配                     // contextRead.readRules()
  → getAIResponse()             // API 调用 + 工具执行
  → 输出结果
  → promptUser()                // 递归下一次对话
```

---

### 2.2 上下文层 - utils/contextRead.js

**职责：** 构建发送给 AI 的所有上下文信息

| 函数 | 读取内容 | 注入位置 |
|-----|---------|---------|
| `readSystem()` | `docs/systemDoc.md` | system 角色 |
| `getUserContext()` | `~/.front/.front.md` + `项目/.front.md` | user 角色 |
| `readRules()` | `.front/rules/*.md` | 按文件标签匹配注入 |
| `getSkillHeaders()` | `.front/skills/*/SKILL.md` | user 角色（技能列表） |

**上下文合并方式：**
```javascript
// request/index.js 第 61 行
messages: [...contextMessageList, ...messages]
// 即: [system, userContext, userSkill, user, assistant, user, assistant, ...]
```

---

### 2.3 工具层 - tools/

**目录结构：**
```
tools/
├── index.js          # 工具注册中心
├── util.js           # 工具格式转换
├── local/
│   ├── LocalClient.js  # 本地工具加载器
│   ├── index.js        # 本地工具导出
│   ├── bash.js
│   ├── read_file.js
│   ├── write_file.js
│   ├── grep.js
│   ├── glob.js
│   ├── select.js
│   ├── confirm.js
│   └── skill.js
└── mcp/
    └── index.js        # MCP 工具（暂未展开）
```

**工具注册流程：**
```javascript
// tools/index.js
toolResult.tools  ←  localTools + mcpTools
                    ↓
         transformToOpenAi()  // 转换为 OpenAI function 格式
                    ↓
         注入到 API 请求的 tools 字段
```

**工具定义格式：**
```javascript
// 以 grep.js 为例
export default {
    name: "grep",
    description: "搜索文件内容",
    parameters: {
        type: "object",
        properties: {
            pattern: { type: "string" },
            path: { type: "string" },
            // ...
        }
    },
    execute: async (args) => {
        // 实际执行逻辑
    }
}
```

---

### 2.4 输入处理层

**子模块：**

| 模块 | 功能 |
|-----|------|
| `input/index.js` | 增强输入（历史导航、自动补全） |
| `commands/` | 指令系统（如 /help, /clear 等） |
| `files/` | 文件标签解析（@文件路径 语法） |

**输入处理流程：**
```javascript
用户输入
   ↓
指令检测 (isCommand)
   ├─ 阻断类 → 执行后返回，不发送给 AI
   └─ 非阻断类 → 执行后附加结果到输入
   ↓
文件标签解析 (parseFileTags)
   ↓
规则匹配 (matchRulesForFiles)
   ↓
附加指令结果
   ↓
发送给 AI
```

---

### 2.5 请求层 - request/index.js

**职责：** OpenAI API 调用 + 工具调用循环

**工具调用循环：**
```javascript
getAIResponse()
   ↓
调用 OpenAI API
   ↓
返回 assistant 消息
   ↓
检测 tool_calls?
   ├─ 否 → 直接返回
   └─ 是 →
       ├─ 遍历执行每个工具 (excuteTool)
       ├─ 将结果作为 tool 消息 push 到 messages
       └─ 递归调用 getAIResponse() (继续让 AI 处理工具结果)
```

---

## 三、关键数据流

### 3.1 消息结构
```javascript
// 完整的 API 请求消息
[
    { role: 'system', content: readSystem() },
    { role: 'user', content: getUserContext() },
    { role: 'user', content: getSkillHeaders() },
    // ... 对话历史
    { role: 'user', content: '当前用户输入' }
]
```

### 3.2 工具调用消息流
```javascript
// AI 请求调用工具
{ role: 'assistant', tool_calls: [{ id: 'call_xxx', function: { name: 'grep', arguments: '{...}' }}] }

// 工具执行结果
{ role: 'tool', tool_call_id: 'call_xxx', content: '执行结果...' }
```

---

## 四、阅读顺序建议

| 顺序 | 文件 | 关注点 |
|-----|------|-------|
| 1 | src/app.js | 整体流程、消息循环 |
| 2 | src/utils/contextRead.js | 上下文构建方式 |
| 3 | src/tools/index.js | 工具注册机制 |
| 4 | src/tools/local/LocalClient.js | 本地工具加载器 |
| 5 | src/tools/util.js | 工具格式转换 |
| 6 | src/request/index.js | API 调用、工具循环 |
| 7 | src/commands/index.js | 指令系统实现 |
| 8 | src/files/index.js | 文件标签处理 |

---

## 五、扩展点

如需添加新功能，可关注以下扩展点：

| 扩展点 | 说明 |
|-------|------|
| 新增本地工具 | 在 `tools/local/` 添加 js 文件，参考现有工具格式 |
| 新增指令 | 在 `commands/` 添加处理逻辑 |
| 新增上下文源 | 在 `contextRead.js` 添加新的读取函数 |
| 自定义规则 | 在项目 `.front/rules/` 添加 md 文件 |
| 自定义技能 | 在项目 `.front/skills/` 添加技能目录 |

---

## 六、待深入的主题（后续提问）

- [ ] 工具加载器的内部实现细节
- [ ] 指令系统的检测和执行机制
- [ ] 文件标签解析的具体逻辑
- [ ] 规则引擎的匹配算法
- [ ] 增强输入的实现原理
- [ ] MCP 工具的集成方式
