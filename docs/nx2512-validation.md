# NX 2512 acceptance record

Status: **not run**

The Ubuntu development environment cannot validate Siemens NX. A release may change the NX 2512 adapter state from `implemented_unverified` to `verified` only after a reviewer records the Windows version, exact NX build, bridge build hash, license modules already active, and results for:

1. Health and capability handshake.
2. New millimeter part without overwriting an existing path.
3. Named expressions and constrained rectangle sketch.
4. Native extrusion, simple hole, pattern, fillet and chamfer.
5. Feature-tree names and expected feature/body deltas.
6. Exact bounding box, area, volume and centroid.
7. Expression edit followed by successful model update.
8. Save, close, reopen and repeat measurement.
9. STEP AP242 export to a new path.
10. Transaction undo and post-undo verification.
11. Timeout/disconnect inspection without automatic mutation replay.
12. Workspace traversal and overwrite rejection.

No real NX acceptance evidence is recorded yet.
