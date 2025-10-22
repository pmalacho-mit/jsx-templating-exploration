import type { Child as Node } from "./";

type Child = Node | string;
type Children = Child | Child[];

type EventHandlers = {
  [K in keyof GlobalEventHandlersEventMap as `on${Capitalize<K>}`]?: (
    ev: GlobalEventHandlersEventMap[K]
  ) => any;
};

type BaseIntrinsicProps = EventHandlers & {
  children?: Children;
  key?: string | number;
  // Accept any attribute (class, id, data-*, aria-*, etc.)
  [attr: string]: any;
};

type IntrinsicHtmlElements = {
  [K in keyof HTMLElementTagNameMap]: BaseIntrinsicProps;
};

declare global {
  namespace JSX {
    type Element = Node;

    interface ElementChildrenAttribute {
      children: "children";
    }

    interface IntrinsicElements extends IntrinsicHtmlElements {}
  }
}
export {};
