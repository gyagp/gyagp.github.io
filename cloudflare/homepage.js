// The account class remains on gyagp-home so its existing SQLite namespace survives.
// This Worker binds that class across scripts; it does not create a new namespace.
export { default } from "./worker.js";
