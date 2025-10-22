import { HTML, type Child } from "./";

type Key = string | number | null;

export const jsx = (type: any, rawProps: any, key?: Key): Child =>
  typeof type === "function"
    ? type(rawProps)
    : new HTML(type, rawProps, rawProps.children ?? []);

export const jsxs = jsx;
export const Fragment = Symbol.for("dsl.fragment");
