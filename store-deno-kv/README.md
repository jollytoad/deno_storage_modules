# Deno KV Storage Module

See [@jollytoad/store](https://jsr.io/@jollytoad/store) for the bigger picture.

This package provides an implementation of the storage module interface.

Uses the [Deno KV](https://deno.land/manual/runtime/kv) API for storage.

Import mapping: `"$store": "jsr:@jollytoad/store-deno-kv"`

## Get out of jail free

This package also supplies a utility function to obtained the actual `Deno.Kv`
of any store backed by it (that exports a `getDenoKv` function).
