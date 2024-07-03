# Deno KV+Filesystem Storage Module

See [@jollytoad/store](https://jsr.io/@jollytoad/store) for the bigger picture.

This package provides an implementation of the storage module interface.

Combination of a readonly `deno-fs` and writeable `deno-kv`, allowing fallback
or immutable storage in the filesystem, and mutable storage via the KV store.

By default the filesystem takes priority, and cannot be overridden by KV values,
unless the env var `STORE_PRIMARY` is set to `kv`, in which case the KV always
overrides filesystem values.

Import mapping: `"$store": "jsr:@jollytoad/store-deno-kv-fs"`
