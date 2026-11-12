# JSON解析

单文件 JSON 格式化工具，使用 GitHub Pages 发布：
https://j-x-lab.github.io/json-parse/

支持 Python 字典常见字面量、去除外层转义、语法高亮、折叠、复制与导出。
输入内容在浏览器中处理，不上传服务器。桌面双栏，窄屏切换面板。

磨砂玻璃主题可独立设置背景底色、左上渐变色、右下渐变色，修改底色仍保留双色渐变。
配色按主题保存；旧版自定义配色会保留，并自动补齐渐变色。恢复默认仅影响当前主题。

结果行右侧的图标可复制键值对或仅复制值，悬停时预览复制范围。
对象、数组的起始行和结束行均复制完整内容；字符串值去掉外层引号，其他值保留 JSON 表达及数字精度。
支持键盘聚焦操作，触屏下直接显示图标。

点击结果字段可查看并复制路径，在路径栏右侧切换 JSONPath 与 Python 取值表达式。
例如 `$.flow[0].data.type` 与 `data["flow"][0]["data"]["type"]`；Python 根变量为 `data`。
字段名中的点号、空格、引号等会正确转义。重新格式化保留仍存在的选中字段，清空、解析失败或压缩时清除路径。

结果中的 HTTP/HTTPS 字符串链接支持 Ctrl + 左键（Mac：⌘ + 单击）在新标签页打开并自动切换过去；普通点击仍选中字段，键盘聚焦后可按 Enter 打开。格式化与压缩视图均支持。
链接在点击事件处理结束后打开，不再创建空白过渡页或强制抢焦点。

## 发布

GitHub Settings → Pages → Deploy from a branch → main / (root)。
以后更新 index.html 并推送即可自动发布，无需构建。

## 第三方组件

互动角色使用 [grokbot-animation](https://github.com/iduu/grokbot-animation) 的 Morph Bot v0.6.0，
本地调整了鼠标跟随幅度。相关说明见 THIRD_PARTY_NOTICES.md。
