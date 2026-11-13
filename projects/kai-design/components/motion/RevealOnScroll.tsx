"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * スクロールに合わせた表示演出（Client Component、D-068・D-069）。
 *
 * app/layout.tsx に1つだけ置き、全ページで動かす。画面には何も描画しない（null を返す）。
 * ページ内の [data-reveal] の要素を見張り、画面に入ったら data-revealed を付ける。
 * 見た目の変化はすべて globals.css の CSS で行う。
 *
 * ■ コンテンツが隠れたままにならないための設計
 * - 隠れた状態（opacity: 0）は、この部品が html に data-reveal-ready を付けたときだけ有効になる。
 *   JavaScript が無効・IntersectionObserver が使えない・動きを減らす設定のときは付けないため、最初から全部表示される。
 * - 準備の時点で一部でも画面内に見えている要素（または画面より上の要素）には、先に data-revealed を付けてから
 *   data-reveal-ready を付ける（同じ処理の中で行うので、一度消えてから現れるちらつきは起きない）。
 * - 一度表示した要素は見張りをやめる（画面に入るたびに何度も動かない）。
 * - キーボード操作でまだ表示していない要素の中へフォーカスが移ったときは、その場で表示する
 *   （globals.css の :focus-within でも、フォーカスの間は表示する）。
 *
 * ■ ページ移動への対応（D-069）
 * - layout.tsx はページを移動しても作り直されないため、パス（usePathname）が変わるたびに、
 *   前のページの見張りを止めてから、新しいページの要素を見張り直す。
 * - 作品詳細から別の作品詳細へ移るときなど、React が同じ DOM 要素を使い回すことがあるため、
 *   前のページで付けた data-revealed は後片付けで外し、新しいページとして判定し直す。
 * - useLayoutEffect を使い、新しいページが画面に描かれる前に、前のページの準備状態（data-reveal-ready）を外す。
 *   useEffect だと、新しいページが一度「隠れた状態」で描かれてから表示に切り替わり、画面内の要素まで
 *   フェードインして見えてしまう。
 * - ページ移動の直後は、ページの先頭へ戻るスクロールが止まってから、新しいページの要素を判定する（下記）。
 *
 * インラインの style 属性は使わない（CSP、D-059）。時間差は data-reveal-delay と CSS で付ける。
 */
export default function RevealOnScroll() {
  const pathname = usePathname();
  // ページを開いた直後の1回目かどうか（2回目以降はクライアント側のページ移動）
  const isFirstRun = useRef(true);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    let targets: HTMLElement[] = [];
    let observer: IntersectionObserver | null = null;
    let frame = 0;

    const reveal = (element: Element) => {
      element.setAttribute("data-revealed", "");
      observer?.unobserve(element);
    };

    // まだ表示していない要素の中にフォーカスが移ったら、その場で表示したままにする
    const handleFocusIn = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      for (const target of targets) {
        if (!target.hasAttribute("data-revealed") && target.contains(event.target)) reveal(target);
      }
    };

    const start = () => {
      targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
      if (targets.length === 0) return;

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) reveal(entry.target);
          }
        },
        // 要素の上端が画面の下から少し入ったところで表示する
        { rootMargin: "0px 0px -10% 0px", threshold: 0 },
      );

      // 画面の下端より上に上端がある要素は、一部でも見えている（または通り過ぎた）ため、動かさずにそのまま表示する。
      // ここを画面の高さより小さくすると、下端に少し見えている要素が準備の瞬間に消えてしまう（D-068 追記）。
      const viewportBottom = window.innerHeight;
      for (const target of targets) {
        if (target.getBoundingClientRect().top < viewportBottom) {
          target.setAttribute("data-revealed", "");
        } else {
          observer.observe(target);
        }
      }
      root.setAttribute("data-reveal-ready", "");
      document.addEventListener("focusin", handleFocusIn);
    };

    if (isFirstRun.current) {
      isFirstRun.current = false;
      start();
    } else {
      // ページ移動の直後は、Next.js がページの先頭へ戻すスクロールが続いている
      // （サイトの CSS が scroll-behavior: smooth のため、一瞬では移動しない）。
      // 移動中の位置で判定すると、画面外の要素まで「表示済み」になるため、スクロール位置が止まってから判定する。
      // 待っている間は準備状態ではない（すべて表示されている）ため、要素が消えて見えることはない。
      const startedAt = performance.now();
      let lastY = Number.NaN;
      let stillFrames = 0;
      const waitForScroll = () => {
        const y = window.scrollY;
        stillFrames = y === lastY ? stillFrames + 1 : 0;
        lastY = y;
        if (stillFrames >= 2 || performance.now() - startedAt > 1500) {
          start();
        } else {
          frame = requestAnimationFrame(waitForScroll);
        }
      };
      frame = requestAnimationFrame(waitForScroll);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      document.removeEventListener("focusin", handleFocusIn);
      root.removeAttribute("data-reveal-ready");
      for (const target of targets) target.removeAttribute("data-revealed");
    };
  }, [pathname]);

  return null;
}
