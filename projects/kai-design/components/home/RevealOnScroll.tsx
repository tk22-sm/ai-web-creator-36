"use client";

import { useEffect } from "react";

/**
 * スクロールに合わせた表示演出（Client Component、D-068）。
 *
 * 画面には何も描画しない（null を返す）。ページ内の [data-reveal] の要素を見張り、
 * 画面に入ったら data-revealed を付ける。見た目の変化はすべて globals.css の CSS で行う。
 *
 * ■ コンテンツが隠れたままにならないための設計
 * - 隠れた状態（opacity: 0）は、この部品が html に data-reveal-ready を付けたときだけ有効になる。
 *   JavaScript が無効・IntersectionObserver が使えない・動きを減らす設定のときは付けないため、最初から全部表示される。
 * - 準備の時点ですでに画面内（または画面より上）にある要素には、先に data-revealed を付けてから
 *   data-reveal-ready を付ける（同じ処理の中で行うので、一度消えてから現れるちらつきは起きない）。
 * - 一度表示した要素は見張りをやめる（画面に入るたびに何度も動かない）。
 * - ページを離れるときは data-reveal-ready を外し、見張りを止める。
 *
 * インラインの style 属性は使わない（CSP、D-059）。時間差は data-reveal-delay と CSS で付ける。
 */
export default function RevealOnScroll() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (targets.length === 0) return;

    const reveal = (element: Element) => element.setAttribute("data-revealed", "");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      },
      // 要素の上端が画面の下から少し入ったところで表示する
      { rootMargin: "0px 0px -10% 0px", threshold: 0 },
    );

    const viewportBottom = window.innerHeight * 0.9;
    for (const target of targets) {
      if (target.getBoundingClientRect().top < viewportBottom) {
        // すでに見えている（または通り過ぎた）要素は動かさずにそのまま表示する
        reveal(target);
      } else {
        observer.observe(target);
      }
    }
    root.setAttribute("data-reveal-ready", "");

    return () => {
      observer.disconnect();
      root.removeAttribute("data-reveal-ready");
    };
  }, []);

  return null;
}
