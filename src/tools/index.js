//把本地和mcp合并成一个最终的
import { linkMcpAndListTool } from "./mcp/index.js"
import getLocalTool from "./local/index.js"
const { localTools, localMap } = getLocalTool();


//初始只有本地的工具
const tools = [...localTools];
const toolNameMap = {
    ...localMap,
}

linkMcpAndListTool(tools, toolNameMap)
export async function excuteTool(name, args) {
    console.log('\n[excuteTool] 调用工具:', name);
    console.log('[excuteTool] 参数:', args);
    console.log('[excuteTool] 找到的处理器:', toolNameMap[name]?.constructor?.name);

    const result = await toolNameMap[name].callTool({
        name: name,
        arguments: args
    });

    console.log('[excuteTool] 原始返回:', JSON.stringify(result, null, 2));
    //返回文本出去
    return result.content[0].text
}


export default {
    tools,
    toolNameMap
}
