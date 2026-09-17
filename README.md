# dsh-nx

English | [简体中文](README.zh-CN.md)

`dsh-nx` is an experimental DeepSeek Harness bundle for safe, local Siemens NX automation through MCP. Version `0.1.0` ships the current DSH bundle manifest, a typed MCP server, a Chinese/English-compatible modeling skill, workspace policy, mock bridge, doctor command, and an explicit protocol boundary for a future validated NX 2512 bridge.

> This project is not affiliated with or endorsed by Siemens or DeepSeek.

## Current status

- The MCP server, schemas, workspace confinement, mock bridge and tests run on Linux and Windows.
- The repository does **not yet contain a real-NX-accepted NX 2512 bridge**.
- Mock results always contain `mock: true` and never write `.prt` or STEP files.
- Do not use this release on production parts.

## Install in DeepSeek Harness

DeepSeek Harness removed the old `.dsh-plugin` repository format. This project uses the current npm bundle form (`package.json.dsh.bundle` + `cordis.patch.yml`). From the profile where you want NX tools:

```powershell
dsh plugin --profile web add github:ethanrise/dsh-nx
```

Install the included skill for project-scoped discovery:

```powershell
New-Item -ItemType Directory -Force .dsh\skills\nx-modeling | Out-Null
Copy-Item node_modules\dsh-nx\skills\nx-modeling\SKILL.md .dsh\skills\nx-modeling\SKILL.md
```

During repository development:

```sh
npm install
npm run check
DSH_NX_MODE=mock npm run dev
```

## Configuration

| Variable | Purpose |
|---|---|
| `DSH_NX_WORKSPACE` | Only directory the server may use for CAD files |
| `DSH_NX_BRIDGE_URL` | Loopback-only bridge URL, for example `http://127.0.0.1:48161/rpc` |
| `DSH_NX_BRIDGE_TOKEN` | Random bearer token shared with the local bridge |
| `DSH_NX_TIMEOUT_MS` | Tool timeout; default 30000 |
| `DSH_NX_MODE=mock` | Test-only stateful mock; never creates CAD files |
| `DSH_NX_ROOT` | NX installation root used by `dsh-nx-doctor` |

No arbitrary journal, Python, C#, or shell execution tool is exposed.

## Tool surface

Health/capabilities, new part, named expression, rectangle/circle sketch, extrusion, simple hole, rectangular pattern, bounded fillet/chamfer, feature listing, body measurement, safe save-as, STEP AP242 export, and undo.

## NX 2512 validation gate

A real adapter is supported only after all checks pass on native Windows + licensed NX 2512: create a parameterized four-hole plate, inspect native feature history, change an expression and rebuild, verify body count/bounding box/volume, save-close-reopen, export STEP, and undo. Until evidence is recorded under `docs/nx2512-validation.md`, the default bridge fails closed.

## License

MIT applies to this repository's code. Siemens NX, NXOpen libraries, documentation, licenses, and user part files are not distributed.
