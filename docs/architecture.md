# Architecture

```text
DeepSeek Harness
  -> nx-modeling skill
  -> @deepseek-ai/dsh-mcp-client
  -> dsh-nx-mcp (stdio)
  -> authenticated loopback JSON-RPC
  -> NX-hosted bridge
  -> NXOpen on the NX main thread
  -> native .prt
```

The Harness bundle and MCP side are model- and platform-independent. Native NX execution is Windows-only. The MCP process validates schemas and confines file paths; the bridge repeats validation, owns NX object references and is the only component allowed to call NXOpen.

## Trust boundaries

- The model never receives arbitrary-code execution.
- MCP accepts only typed operations and workspace-relative destinations.
- Bridge transport binds to loopback and requires a random token.
- An adapter advertises only operations tested on its exact NX release.
- Every mutation returns a transaction id and observed identifiers.
- Timeout means unknown execution state; callers inspect before retrying.
- Mock mode is a protocol simulator, not a CAD kernel.

## Current boundary

The TypeScript side and mock workflow are implemented. The included C# bridge is transport-only and advertises zero NXOpen operations because a background HTTP listener cannot safely call NXOpen. The next native step is a non-blocking dispatcher that marshals each typed request onto NX's main thread, followed by operation-by-operation live validation.
