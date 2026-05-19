# CodePrompt-Lite

> 一个强大的 AI 终端应用，辅助开发者进行高效编程

CodePrompt-Lite 是一个类似于 Claude Code 的 AI 终端辅助开发工具，通过自然语言交互帮助你完成代码编写、文件操作、项目分析等开发任务。

## 特性

- **自然语言交互** - 通过对话方式与 AI 协作开发
- **本地工具系统** - 内置文件操作、代码搜索、命令执行等开发工具
- **MCP 协议支持** - 集成 Model Context Protocol，扩展 AI 能力
- **增强输入体验** - 支持历史导航、自动补全
- **指令系统** - 提供快捷指令如 `/help`、`/clear` 等
- **文件标签解析** - 使用 `@文件路径` 语法快速引用文件
- **规则引擎** - 根据文件标签自动匹配项目规则
- **技能系统** - 可扩展的技能插件架构

## 技术栈

- **运行时**: Node.js (ES Module)
- **AI 接口**: OpenAI SDK (兼容多种 API)
- **终端交互**: @inquirer/prompts
- **MCP 协议**: @modelcontextprotocol/sdk
- **终端美化**: chalk, ora, marked-terminal

## 安装

```bash
# 克隆仓库
git clone https://github.com/witendfk/codePrompt-Lite.git
cd codePrompt-Lite

# 安装依赖
npm install
```

## 配置

在项目目录或用户主目录下创建 `.front/settings.json` 配置文件：

```json
{
  "baseURL": "https://open.bigmodel.cn/api/paas/v4/",
  "apiKey": "your-api-key-here",
  "model": "glm-4"
}
```

配置文件读取顺序：
1. 当前项目目录下的 `.front/settings.json`
2. 用户主目录下的 `~/.front/settings.json`

## 使用方法

```bash
# 启动应用
node src/app.js
```

启动后，你可以：

- 直接输入问题与 AI 对话
- 使用 `@文件路径` 引用文件内容
- 使用 `/help` 查看可用指令
- 使用 `/clear` 清除对话历史

## 项目结构

```
codePrompt-Lite/
├── src/
│   ├── app.js              # 启动入口
│   ├── commands/           # 指令系统
│   ├── docs/               # AI 上下文文档模板
│   ├── files/              # 文件标签处理
│   ├── input/              # 增强输入（历史、补全）
│   ├── request/            # AI API 调用
│   ├── tools/              # 工具系统
│   │   ├── local/          # 本地工具
│   │   └── mcp/            # MCP 工具集成
│   └── utils/              # 工具函数
├── .front/                 # 项目配置目录
│   ├── settings.json       # 配置文件
│   ├── rules/              # 项目规则
│   └── skills/             # 技能插件
├── ARCHITECTURE.md         # 架构文档
└── package.json
```

## 内置工具

| 工具名 | 功能 |
|--------|------|
| `bash` | 执行 Shell 命令 |
| `read_file` | 读取文件内容 |
| `write_file` | 写入文件 |
| `grep` | 搜索文件内容 |
| `glob` | 文件模式匹配 |
| `select` | 交互式选择 |
| `confirm` | 确认操作 |
| `skill` | 执行技能插件 |

## 扩展开发

### 添加本地工具

在 `src/tools/local/` 下创建新工具文件，参考现有工具格式：

```javascript
// src/tools/local/your_tool.js
export default {
    name: "your_tool",
    description: "工具描述",
    parameters: {
        type: "object",
        properties: {
            param1: { type: "string", description: "参数描述" }
        }
    },
    execute: async (args) => {
        // 执行逻辑
        return "结果";
    }
};
```

### 添加技能插件

在 `.front/skills/` 下创建技能目录和 `SKILL.md` 文件，定义技能的功能和用法。

## 文档

- [架构文档](ARCHITECTURE.md) - 深入了解项目架构
- [项目评审](PROJECT_REVIEW.md) - 项目开发评审记录
- [TODO 列表](TODO.md) - 待办事项

## License

ISC
