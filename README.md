# Simple Pluggable Storage Modules

This project provides a simple storage API module across a variety of backends.

Each module here provides the same interface to a hierarchical key -> value
storage mechanism. So they can be imported directly, or as swappable interface
via an import map, or registered a delegate for a top-level key segment.

See the main package [README](./main/README.md) for more details.
