/**
 * The game is drawn on a "virtual screen" that is never smaller than MIN_W x MIN_H.
 * On a big screen nothing changes. On a small one (a phone held sideways, a small laptop window) the whole game
 * is laid out at the virtual size and then scaled down to fit, so every screen keeps its proportions.
 *
 * Layout units: use `cqw` / `cqh` (1% of the virtual screen) instead of `vw` / `vh`.
 * Pointer maths: while the stage is scaled, pointer positions, getBoundingClientRect, elementFromPoint and
 * window.innerWidth/innerHeight are all reported in virtual-screen pixels (see installCoordinateShim), so game code
 * can keep treating them as ordinary CSS pixels. On a big screen the scale is 1 and nothing is changed.
 */
// Smaller than before so a phone held sideways shows the game bigger (it used to be drawn at 1000x600 and shrunk to about 65%)
export const MIN_W = 700;
export const MIN_H = 400;

let scale = 1;
let offX = 0; // where the game's top-left corner sits on the real screen (the safe-area insets)
let offY = 0;
// the real screen size, read before the shim below changes what window.innerWidth says
const realInnerWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth');
const realInnerHeight = Object.getOwnPropertyDescriptor(window, 'innerHeight');
const rw = (): number => (realInnerWidth?.get ? realInnerWidth.get.call(window) : document.documentElement.clientWidth);
const rh = (): number => (realInnerHeight?.get ? realInnerHeight.get.call(window) : document.documentElement.clientHeight);
let width = typeof window !== 'undefined' ? window.innerWidth : MIN_W;
let height = typeof window !== 'undefined' ? window.innerHeight : MIN_H;
const listeners = new Set<() => void>();

/** How much the virtual screen is shrunk on the real screen (1 = not at all). */
export const stageScale = () => scale;
/** Size of the virtual screen in CSS pixels. */
export const stageSize = () => ({ w: width, h: height });
/** Real screen pixel to virtual screen pixel. */
export const toStage = (x: number, y: number) => ({ x: (x - offX) / scale, y: (y - offY) / scale });
export const onStageChange = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };

// Notches, rounded corners and the home bar: the game is kept inside the safe area so nothing is cut off at the edges.
let probe: HTMLDivElement | null = null;
function safeInsets() {
  if (!probe) {
    probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
    document.body.appendChild(probe);
  }
  const cs = getComputedStyle(probe);
  const n = (v: string) => Math.max(0, parseFloat(v) || 0);
  return { t: n(cs.paddingTop), r: n(cs.paddingRight), b: n(cs.paddingBottom), l: n(cs.paddingLeft) };
}

function apply() {
  const root = document.getElementById('root');
  if (!root) return;
  const vv = window.visualViewport;
  const ins = safeInsets();
  const w = Math.round(vv?.width ?? rw()) - Math.round(ins.l + ins.r);
  const h = Math.round(vv?.height ?? rh()) - Math.round(ins.t + ins.b);
  offX = Math.round(ins.l);
  offY = Math.round(ins.t);
  root.style.left = `${offX}px`;
  root.style.top = `${offY}px`;
  const s = Math.min(1, w / MIN_W, h / MIN_H);
  scale = s;
  width = s < 1 ? Math.ceil(w / s) : w;
  height = s < 1 ? Math.ceil(h / s) : h;
  root.style.width = `${width}px`;
  root.style.height = `${height}px`;
  root.style.transform = s < 1 ? `scale(${s})` : 'none';
  document.documentElement.style.setProperty('--stage-scale', String(s));
  // a phone held upright: the game wants a wide screen
  const portrait = h > w * 1.05 && Math.min(w, h) < 900;
  document.documentElement.dataset.portrait = portrait ? '1' : '0';
  listeners.forEach(fn => fn());
}

/** Make browser coordinates read in virtual-screen pixels while the stage is scaled down. */
function installCoordinateShim() {
  const wrapGetter = (proto: object, key: string, fn: (v: number) => number) => {
    const d = Object.getOwnPropertyDescriptor(proto, key);
    if (!d?.get) return;
    const g = d.get;
    Object.defineProperty(proto, key, { ...d, get() { const v = g.call(this) as number; return scale === 1 ? v : fn(v); } });
  };
  const divX = (v: number) => (v - offX) / scale;
  const divY = (v: number) => (v - offY) / scale;
  for (const k of ['clientX', 'pageX', 'x']) wrapGetter(MouseEvent.prototype, k, divX);
  for (const k of ['clientY', 'pageY', 'y']) wrapGetter(MouseEvent.prototype, k, divY);
  if (typeof Touch !== 'undefined') {
    for (const k of ['clientX', 'pageX']) wrapGetter(Touch.prototype, k, divX);
    for (const k of ['clientY', 'pageY']) wrapGetter(Touch.prototype, k, divY);
  }
  const rectOf = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function () {
    const r = rectOf.call(this);
    return scale === 1 ? r : new DOMRect((r.x - offX) / scale, (r.y - offY) / scale, r.width / scale, r.height / scale);
  };
  const clientRects = Element.prototype.getClientRects;
  Element.prototype.getClientRects = function () {
    const list = clientRects.call(this);
    if (scale === 1) return list;
    const out = Array.from(list as unknown as ArrayLike<DOMRect>, r => new DOMRect((r.x - offX) / scale, (r.y - offY) / scale, r.width / scale, r.height / scale));
    return Object.assign(out, { item: (i: number) => out[i] ?? null }) as unknown as DOMRectList;
  };
  const at = Document.prototype.elementFromPoint;
  Document.prototype.elementFromPoint = function (x: number, y: number) { return at.call(this, x * scale + offX, y * scale + offY); };
  const atAll = Document.prototype.elementsFromPoint;
  Document.prototype.elementsFromPoint = function (x: number, y: number) { return atAll.call(this, x * scale + offX, y * scale + offY); };
  Object.defineProperty(window, 'innerWidth', { configurable: true, get: () => (scale === 1 ? rw() : width) });
  Object.defineProperty(window, 'innerHeight', { configurable: true, get: () => (scale === 1 ? rh() : height) });
}

export function initStage() {
  installCoordinateShim();
  apply();
  window.addEventListener('resize', apply);
  window.addEventListener('orientationchange', () => setTimeout(apply, 120));
  window.visualViewport?.addEventListener('resize', apply);
}

/** React hook: the size of the virtual screen, kept current when the window or phone is turned or resized. */
import { useEffect, useState } from 'react';
export function useStageSize() {
  const [size, setSize] = useState(() => stageSize());
  useEffect(() => onStageChange(() => setSize(stageSize())), []);
  return size;
}

/** The altar screen: space under the top buttons shrinks on short screens, and the altar scales to fit what is left (it used to be cut off at the top). */
export const altarPad = (h: number) => Math.max(0, Math.min(135, (h - 480) * 1.1));
export const altarScale = (h: number) => Math.max(0.6, Math.min(1, (h - 103 - altarPad(h)) / 420));
