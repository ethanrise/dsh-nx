# Marketplace submission

DSH Desktop discovers community plugins through `dsh-market`, whose catalog is
generated from `awesome-dsh-plugin/awesome-dsh-plugin`. Do not submit the entry
to `dsh-desktop` directly.

## Before submitting

1. Add the `dsh-plugin` GitHub topic to this repository.
2. Wait until the repository is at least one day old.
3. Push a version tag matching `package.json`, for example `v0.1.0`.
4. Confirm that the Release workflow publishes the stable asset
   `dsh-nx.tgz` and that its latest-download URL works.
5. Confirm that the README describes the real implementation without implying
   that mock operations modify Siemens NX.

## Submit

Fork `https://github.com/awesome-dsh-plugin/awesome-dsh-plugin`, add only:

```text
data/plugins/ethanrise__dsh-nx.yml
```

Use [`marketplace-entry.yml`](marketplace-entry.yml) as its contents. Do not
manually edit either generated README in the catalog repository. Open one pull
request for the one entry and wait for its automated and maintainer review.

## After real NX acceptance

Only after `nx2512-validation.md` contains evidence from native Windows and a
licensed NX 2512 installation should the entry claim real NX automation. Update
the existing YAML entry through a separate pull request when that gate passes.
