# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0]

### Added

- `copyItems` and `moveItems` optional extended storage module functions
- [store-common/test-storage-module] common tests for these new functions
- [store-common/copy-items] fallback implementation for `copyItems`
- [store-common/move-items] fallback implementation for `moveItems`
- [store-common/types] new types to represent storage modules with/without
  extended features

## [0.5.0]

### Added

- [store] support for multiple delegated storage modules, based on the key
  prefix

### Changed

- update to Deno 2+

## [0.4.0]

### Changed

- [store] remove dep on `@cross/env`

### Added

- [store-node-fs] Node.js compatible file storage

## [0.3.0]

### Changed

- [store-deno-kv] & [store-deno-kv-fs] renamed `getKv()` to `getDenoKv()`

### Added

- [store-deno-kv/get-deno-kv] utility function `getDenoKv()` to obtain `Deno.Kv`
  from a store if it exposes a `getDenoKv()` function

### Fixed

- stricter TS options, add `import type` where necessary

## [0.2.0]

### Changed

- [store] use cross-platform env var checking
- [store-deno-kv] & [store-deno-kv-fs] export `getKv()` function

### Added

- [store-no-op] a no-op implementation of the interface

## [0.1.0]

- Initial release on JSR
