# dsh-nx

[English](README.md) | 简体中文

`dsh-nx`是一个面向DeepSeek Harness的实验性Siemens NX本地自动化Bundle，通过MCP暴露类型明确、受策略限制的建模工具。

> 本项目与Siemens、DeepSeek均无隶属或官方背书关系。

## 当前状态

`0.1.0`已包含：当前DSH Bundle格式、MCP服务、NX建模Skill、工作区安全策略、Mock Bridge、doctor、stdio端到端测试、Windows安装/构建脚本和NX 2512验收清单。

**目前尚未在真实Windows + NX 2512环境完成Bridge验收。**默认状态下所有写操作都会关闭失败；`DSH_NX_MODE=mock`只用于协议和Agent流程测试，返回结果始终带`mock: true`，不会生成`.prt`。

## 安装

最新版DeepSeek Harness已经移除旧`.dsh-plugin`仓库格式，本项目使用`package.json.dsh.bundle`和`cordis.patch.yml`：

```powershell
dsh plugin --profile web add github:ethanrise/dsh-nx
```

每个正式Tag还会自动发布固定文件名的预编译包，目标电脑无需编译TypeScript：

```text
https://github.com/ethanrise/dsh-nx/releases/latest/download/dsh-nx.tgz
```

将Skill复制到当前项目可发现目录：

```powershell
New-Item -ItemType Directory -Force .dsh\skills\nx-modeling | Out-Null
Copy-Item node_modules\dsh-nx\skills\nx-modeling\SKILL.md .dsh\skills\nx-modeling\SKILL.md
```

开发和Mock测试：

```sh
npm install
npm run check
DSH_NX_MODE=mock npm run dev
```

## 安全边界

- 仅允许访问`DSH_NX_WORKSPACE`；
- Bridge仅允许本机回环地址并要求随机令牌；
- 默认不覆盖、不删除文件；
- 不提供任意Journal、Python、C#或Shell执行；
- Mock结果绝不能作为真实NX执行证据；
- 超时写操作不得自动重试，必须先检查NX状态。

## 第一版工具

环境检查、能力查询、会话状态、操作预检、结果验证、新建零件、Expression、矩形/圆草图、拉伸、简单孔、矩形阵列、受限圆角/倒角、特征树查询、实体测量、安全另存、STEP AP242导出和Undo。

装配、钣金、工程图、PMI、CAM、CAE、Teamcenter、复杂曲面、NX 1946及远程工作站不属于`0.1.0`。

## Ubuntu说明

Ubuntu可以开发和测试MCP、Skill、Mock Bridge与安全策略，但不能验证NXOpen或原生`.prt`。真实支持声明必须在原生Windows + 合法NX 2512许可证环境完成验收。

## 插件市场

DSH Desktop通过`dsh-market`和`awesome-dsh-plugin`目录获得社区插件列表。发布检查、市场条目模板和提交步骤见[`docs/marketplace.md`](docs/marketplace.md)。真实NX验收通过前，市场描述必须明确本项目仍为实验性实现。
