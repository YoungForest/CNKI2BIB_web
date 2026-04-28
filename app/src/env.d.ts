/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}

declare module 'jieba-wasm/node' {
  export function cut(text: string, hmm?: boolean): string[];
  export function cutAll(text: string): string[];
  export function cutForSearch(text: string, hmm?: boolean): string[];
}

declare module 'jieba-wasm/web' {
  export default function init(input?: unknown): Promise<unknown>;
  export function cut(text: string, hmm?: boolean): string[];
  export function cutAll(text: string): string[];
  export function cutForSearch(text: string, hmm?: boolean): string[];
}
