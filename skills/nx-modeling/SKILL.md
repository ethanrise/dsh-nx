---
name: nx-modeling
description: Safely create and inspect native parametric Siemens NX parts through the dsh-nx MCP tools. Use for NX/UG part modeling, expressions, sketches, extrusions, holes, patterns, fillets, chamfers, measurement, STEP export, and undo.
---

# NX Modeling

Use only the typed `mcp__nx__nx_*` tools. Never claim that NX created, saved, measured, or exported an artifact unless the corresponding tool result confirms it and does not contain `mock: true`.

## Required workflow

1. Call `nx_health`, then `nx_get_capabilities`.
2. Stop mutations when the bridge is disconnected, the adapter is unverified, or a required operation is absent.
3. Convert the request into an explicit plan containing millimeter dimensions, principal plane, feature order, expected body count, output path, and assumptions.
4. Ask one focused question only when a missing dimension is fit-critical or makes the model ambiguous. Otherwise state conservative assumptions.
5. Create named expressions before geometry. Use ordered feature names such as `01_BASE_SKETCH`, `02_BASE_EXTRUDE`, and `03_MOUNTING_HOLE`.
6. Immediately before each write, call `nx_preflight` for that exact operation. Stop if `allowed` is false; never reuse a preflight after NX state or parameters change.
7. Use native sketches and features. Do not substitute mesh, STEP import, arbitrary journals, shell commands, or free-form NXOpen code.
8. After each mutation, retain its transaction id and call `nx_verify_result` with the preflight id and expected counts. On an error or timeout, inspect session state and the feature tree before retrying; an uncertain mutation must never be replayed automatically.
9. Before saving, call `nx_list_features` and `nx_measure_body`. Check expected feature/body changes and dimensions.
10. Save only to a new `.prt` path below `DSH_NX_WORKSPACE`. Export STEP only when requested.
11. Report assumptions, observed features, measurements, output paths, adapter/version, and whether the result was verified in real NX.

## Safety

- Never overwrite, delete, close with unsaved changes, or access a path outside the configured workspace.
- Never treat a screenshot as dimensional proof.
- Never describe mock output as a CAD artifact.
- If validation fails, do not save; offer `nx_undo` with the returned transaction id.
- Version compatibility is explicit. NX 2512 support requires the `nx2512` adapter and real-runtime acceptance evidence.

## Version 0.1 boundary

Supported tool surface: new millimeter parts, named expressions, principal-plane rectangle/circle sketches, extrusion, simple holes, rectangular patterns, bounded fillet/chamfer selectors, feature inspection, body measurement, save-as, STEP AP242 export, and undo.

Assemblies, drawings, sheet metal, PMI/GD&T, CAM, CAE, Teamcenter, arbitrary code, and NX versions other than a verified 2512 adapter are out of scope.
