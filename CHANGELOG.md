# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.12.0]

### BREAKING Changes

- `getItems` contract changed for StorageProviders: duplicate keys should be
  ignored so that duplicate items are not returned.

### Changed

- `@storage/fns` `getItems` performs key duplications for the default `getItem`
  based implementation.
- added test for deduplication in `getItems`
- added test for `batch` deduplication of ops

### Added

- `@storage/util`, `asyncFilter` and `uniqueKeyFilter` utility functions to aid
  implementations with key deduplication.

### Fixed

- `@storage/test` ensure that keys are cloned rather than passed by reference
- `@storage/fns` `batch` now correctly overrides previous ops with the same key

## [0.11.0]

**NOTE: This is major refactor of the library**

### BREAKING Changes

- `@storage/common` has been split into `@storage/fns`, `@storage/test`,
  `@storage/util`, and `@storage/types`.
- All public types moved to `@storage/types` and overhauled
  - `StorageModule` now represents the full set of functions
  - `StorageProvider` represents the functions an actual storage 'provider' are
    required to implement and those that are optional
- `@storage/common/test-storage-module` moved to `@storage/test`
- `@storage/common/key-util` moved to `@storage/util/key-string`
- `@storage/extend` has been removed, it's recommended to use storage fns or
  export a store or delegate store from a module and extend that directly.

### Added

- Support for batching of `setItem` and `removeItem` operations
- Allow a storage provider to provide own `commit` function for batched
  operations
- Default `commit` for batching, uses `pooledMap` to concurrently apply
  operations
- `getItems` to support efficient retreival of many items in one operation if
  the underlying storage provider supports it
- `@storage/fns`: comprehensive wrapper functions to polyfill those not
  explicitly implemented in a `StorageProvider`
- Combined entire test suite into `testStore()` in `@storage/test`

## [0.10.0]

### Added

- `setItems` now takes an optional third arg `SetItemOptions`, allowing an
  expiry time to be passed

## [0.9.0]

### Changed

- BREAKING: `listItems` takes a `ListItemsOptions` as it's second arg instead of
  just `reverse` boolean

## [0.8.0]

### Changed

- Moved to `@storage` scope
- `@jollytoad/store` renamed to `@storage/main`

## [0.7.0]

### Added

- [store-extend] new package providing `extendStore` fn

### Changed

- [store-common/test-storage-module] fix `testIsWriteable` -> `testIsWritable`
  typo

### Fixed

- some relative imports to bare module specifiers in tests

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
