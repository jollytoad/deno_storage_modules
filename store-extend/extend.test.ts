import {
  assertSpyCall,
  assertSpyCallAsync,
  type MethodSpy,
  spy,
} from "@std/testing/mock";
import {
  open,
  testClearItems,
  testCopyItems,
  testGetItem,
  testHasItem,
  testIsWritable,
  testListItems,
  testMoveItems,
  testRemoveItem,
  testSetItem,
  testUrl,
} from "@jollytoad/store-common/test-storage-module";
import { extendStore } from "./mod.ts";
import * as originalStore from "@jollytoad/store-deno-fs";
import type {
  CompleteStorageModule,
  StorageModule,
} from "@jollytoad/store-common/types";
import { copyItems } from "@jollytoad/store-common/copy-items";
import { moveItems } from "@jollytoad/store-common/move-items";
import type { StoreTrait } from "./types.ts";

const extension: StoreTrait<StorageModule, CompleteStorageModule> = {
  async url() {
    return (await this.url()) + "#extended";
  },
  isWritable(key) {
    return this.isWritable(key);
  },
  setItem(key, value) {
    return this.setItem(key, value);
  },
  hasItem(key) {
    return this.hasItem(key);
  },
  getItem(key) {
    return this.getItem(key);
  },
  listItems(keyPrefix) {
    return this.listItems(keyPrefix);
  },
  removeItem(key) {
    return this.removeItem(key);
  },
  clearItems(keyPrefix) {
    return this.clearItems(keyPrefix);
  },
  copyItems(fromPrefix, toPrefix) {
    return this.copyItems
      ? this.copyItems(fromPrefix, toPrefix)
      : copyItems(fromPrefix, toPrefix, this);
  },
  moveItems(fromPrefix, toPrefix) {
    return this.moveItems
      ? this.moveItems(fromPrefix, toPrefix)
      : moveItems(fromPrefix, toPrefix, this);
  },
  close() {
    return this.close();
  },
};

Deno.test("extendStore with no extension", async (t) => {
  const store = extendStore(originalStore, {});

  try {
    await open(t, store);
    await testUrl(t, store, "store-deno-fs");
    await testIsWritable(t, store, true);
    await testSetItem(t, store);
    await testHasItem(t, store);
    await testGetItem(t, store);
    await testListItems(t, store);
    await testRemoveItem(t, store);
    await testClearItems(t, store);
    await testCopyItems(t, store);
    await testMoveItems(t, store);
  } finally {
    await store.close();
  }
});

Deno.test("extendStore with extensions", async (t) => {
  const store = extendStore(originalStore, extension);

  try {
    await open(t, store);

    await t.step("extended url", async (t) => {
      using urlSpy = extSpy("url");
      await testUrl(t, store, "store-deno-fs");
      await testUrl(t, store, "#extended");
      await assertSpyCallAsync(urlSpy, 0);
    });

    await t.step("extended isWritable", async (t) => {
      using isWritableSpy = extSpy("isWritable");
      await testIsWritable(t, store);
      await assertSpyCallAsync(isWritableSpy, 0, { returned: true });
    });

    await t.step("extended setItem", async (t) => {
      using setItemSpy = extSpy("setItem");
      await testSetItem(t, store);
      await assertSpyCallAsync(setItemSpy, 0, {
        args: [["store", "number"], 100],
        returned: undefined,
      });
    });

    await t.step("extended hasItem", async (t) => {
      using hasItemSpy = extSpy("hasItem");
      await testHasItem(t, store);
      await assertSpyCallAsync(hasItemSpy, 0, {
        args: [["store", "number"]],
        returned: true,
      });
    });

    await t.step("extended getItem", async (t) => {
      using getItemSpy = extSpy("getItem");
      await testGetItem(t, store);
      await assertSpyCallAsync(getItemSpy, 0, {
        args: [["store", "number"]],
        returned: 100,
      });
    });

    await t.step("extended listItems", async (t) => {
      using listItemsSpy = spy(extension, "listItems");
      await testListItems(t, store);
      assertSpyCall(listItemsSpy, 0, { args: [["store"]] });
    });

    await t.step("extended removeItem", async (t) => {
      using removeItemSpy = extSpy("removeItem");
      await testRemoveItem(t, store);
      await assertSpyCallAsync(removeItemSpy, 0, {
        args: [["store", "number"]],
      });
    });

    await t.step("extended clearItems", async (t) => {
      using clearItemsSpy = extSpy("clearItems");
      await testClearItems(t, store);
      await assertSpyCallAsync(clearItemsSpy, 0, { args: [["store"]] });
    });

    await t.step("extended copyItems", async (t) => {
      using copyItemsSpy = extSpy("copyItems");
      await testCopyItems(t, store);
      await assertSpyCallAsync(copyItemsSpy, 0, {
        args: [["store", "original"], ["store", "copied"]],
      });
    });

    await t.step("extended moveItems", async (t) => {
      using moveItemsSpy = extSpy("moveItems");
      await testMoveItems(t, store);
      await assertSpyCallAsync(moveItemsSpy, 0, {
        args: [["store", "original"], ["store", "moved"]],
      });
    });
  } finally {
    await store.close();
  }
});

// spy() doesn't seem to get the return type correct, so this is just a little work-around
type Ext = Omit<Required<typeof extension>, "listItems">;
type ExtFn = keyof Ext;
function extSpy(
  fn: ExtFn,
): MethodSpy<Ext, Parameters<Ext[ExtFn]>, ReturnType<Ext[ExtFn]>> {
  // deno-lint-ignore no-explicit-any
  return spy(extension, fn) as any;
}
