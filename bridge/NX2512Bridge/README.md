# NX 2512 bridge

This is a deliberately transport-only, unverified bridge bootstrap. It proves the loopback/token boundary but advertises no NXOpen capabilities. Build it only on native Windows with the matching licensed NX 2512 installation:

```powershell
dotnet build -c Release -p:NXOpenDir="C:\Program Files\Siemens\NX2512\NXBIN\managed"
```

Before loading the DLL through `File > Execute > NX Open`, set a random `DSH_NX_BRIDGE_TOKEN` and optional `DSH_NX_BRIDGE_PORT`. Configure the MCP side with the same token and `DSH_NX_BRIDGE_URL=http://127.0.0.1:48161/rpc`.

The current implementation handles only transport `health` and empty `capabilities`. It intentionally rejects every NXOpen operation. A production bridge must add a non-blocking NX main-thread dispatcher before reading or mutating session state. Do not extend it with arbitrary-code execution; add one typed handler and one real-NX acceptance case at a time.
