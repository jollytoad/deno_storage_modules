# Deno Filesystem Storage Module

See [@jollytoad/store](https://jsr.io/@jollytoad/store) for the bigger picture.

This package provides an implementation of the storage module interface.

This stores values in individual files under a directory hierarchy via
[Deno fs](https://deno.land/api?s=Deno.readTextFile) calls. By default this is
under a `.store` dir under the current working dir. This can be overridden via
the environment var `STORE_FS_ROOT`.

Each level of the key becomes a directory up to the last segment which becomes a
JSON file.

eg: `["one", "two", "three"]` -> `.store/one/two/three.json`

Import mapping: `"$store": "jsr:@jollytoad/store-deno-fs"`
