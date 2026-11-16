"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

/** 旧ページのフェードアウトの時間（ms）。globals.css の値と合わせる */
const LEAVE_MS = 250;
/** 新ページのフェードインの時間（ms）。globals.css の値と合わせる */
const ENTER_MS = 550;
/** 移動を始めてから、新しいページに切り替わらないときに表示を元に戻すまでの時間（ms） */
const TIMEOUT_MS = 1500;
/** ブラウザの戻る・進む（popstate）のあと、ページの切り替わりをその操作によるものとみなす時間（ms） */
const HISTORY_WINDOW_MS = 1500;

type Phase = "idle" | "leaving" | "navigating" | "entering";

/**
 * ページ遷移の演出（Client Component、D-070）。
 *
 * app/layout.tsx に1つだけ置く。画面には何も描画しない（null を返す）。
 * html に data-page-transition を付け外しするだけで、見た目の変化はすべて globals.css の CSS で行う。
 * 演出の対象は本文（main）とフッター。ヘッダーは動かさない。
 *
 * ■ 流れ
 * 1. サイト内リンクのクリック（下記の条件を満たすものだけ）で、通常のページ移動をいったん止め、
 *    旧ページを 0.25 秒でフェードアウトする（data-page-transition="leaving"）。
 * 2. フェードアウトが終わったら、Next.js 標準の router.push() で移動する（"navigating"）。
 * 3. 新しいページに切り替わったら透明のまま待ち（"pending"）、描画されてから 0.55 秒でフェードインする（"entering"）。
 *    終わったら属性を外す。
 * - ブラウザの戻る・進むでは待たずに移動し、フェードインだけを行う。
 * - ページを開いた直後・再読み込みでは何もしない。
 *
 * ■ 新しいページの描画を待つ
 * - URL（usePathname）が変わったことは、React が新しいページを DOM に反映した（コミットした）合図として使う。
 *   App Router のページ移動は Transition のため、新しいページの準備ができるまで旧ページが表示されたまま
 *   になり、パスと新しいページは同じコミットで切り替わる。
 * - そのうえで、新しいページは透明なまま、ブラウザが2回描画する（requestAnimationFrame を2回）のを待ってから
 *   フェードインを始める。レイアウトと最初の描画が済んだ状態から現れるようにするため。
 *
 * ■ 通常のリンク操作を壊さないための条件（どれかに当てはまれば何もしない＝Next.js の通常の動作）
 * - すでに他の処理で止められたクリック、左ボタン以外、Ctrl・⌘・Shift・Alt を押しながらのクリック
 * - <a href> ではないもの、target が _self 以外（新しいタブなど）、download 付き、data-no-transition 付き
 * - 別のオリジン（外部サイト）、拡張子の付いたファイル（.pdf など）
 * - パスが同じ（同じページ内の # への移動・同じ URL・クエリだけの変更）、クエリ（?）付きのリンク
 * - 動きを減らす設定（prefers-reduced-motion: reduce）
 * Link の replace・scroll={false} などの指定は、ここからは読み取れない。そのような Link を追加するときは
 * data-no-transition を付けて、この演出から外す。
 *
 * ■ 止まったままにならないための設計
 * - 移動を始めて 1.5 秒たっても新しいページに切り替わらなければ、属性を外して旧ページを表示に戻す。
 *   そのあと遅れて切り替わった場合は、フェードを付けずにそのまま表示する（消えて現れるちらつきを防ぐ）。
 * - フェードアウト中に別のリンクを押したときは、最後に押したリンクへ移動する（タイマーは1つだけ）。
 * - ブラウザのキャッシュ（bfcache）から戻ったときと、この部品が破棄されたときは、属性とタイマーをすべて片付ける。
 * - JavaScript が無効なときは何もしないため、通常のページ移動になる。
 *
 * インラインの style 属性は使わない（CSP、D-059）。
 */
export default function PageTransition() {
  const pathname = usePathname();
  const router = useRouter();

  const phase = useRef<Phase>("idle");
  const target = useRef<string | null>(null);
  const previousPath = useRef<string | null>(null);
  const lastHistoryNavAt = useRef(-Infinity);
  const leaveTimer = useRef<number | undefined>(undefined);
  const failTimer = useRef<number | undefined>(undefined);
  const enterTimer = useRef<number | undefined>(undefined);
  const frames = useRef<number[]>([]);

  // useRouter が返すルーターは描画ごとに同じとは限らないため、最新のものを参照する
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  // クリックの受け取り・戻る/進む・キャッシュからの復帰・破棄時の片付け
  useEffect(() => {
    const root = document.documentElement;

    const setState = (value: "leaving" | null) => {
      if (value) root.setAttribute("data-page-transition", value);
      else root.removeAttribute("data-page-transition");
    };

    const clearTimers = () => {
      window.clearTimeout(leaveTimer.current);
      window.clearTimeout(failTimer.current);
      window.clearTimeout(enterTimer.current);
      for (const id of frames.current) cancelAnimationFrame(id);
      frames.current = [];
    };

    // 遷移が進まないときなど：旧ページをそのまま表示に戻す
    const recover = () => {
      clearTimers();
      phase.current = "idle";
      target.current = null;
      setState(null);
    };

    const startNavigation = () => {
      const href = target.current;
      if (!href) return recover();
      phase.current = "navigating";
      routerRef.current.push(href);
      window.clearTimeout(failTimer.current);
      failTimer.current = window.setTimeout(recover, TIMEOUT_MS);
    };

    const handleClick = (event: MouseEvent) => {
      const href = getTransitionHref(event);
      if (!href) return;
      event.preventDefault();
      target.current = href;

      if (phase.current === "leaving") return; // フェードアウト中：移動先だけを最新にする
      if (phase.current === "navigating") return startNavigation(); // 切り替わり待ち：最新の移動先へ移動し直す

      // 新しいページのフェードイン中に押された場合も、ここからフェードアウトをやり直す
      clearTimers();
      phase.current = "leaving";
      setState("leaving");
      leaveTimer.current = window.setTimeout(startNavigation, LEAVE_MS);
    };

    const handlePopState = () => {
      lastHistoryNavAt.current = performance.now();
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) recover();
    };

    // capture（捕捉段階）で受け取り、Next.js の Link の処理より先に preventDefault する。
    // Link は「すでに止められたクリック」では移動しない。onClick（スマホメニューを閉じる処理など）は従来どおり動く。
    window.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
      clearTimers();
      phase.current = "idle";
      target.current = null;
      root.removeAttribute("data-page-transition");
    };
  }, []);

  // 新しいページに切り替わったとき（新しいページが DOM に反映された直後、画面に描かれる前）
  useLayoutEffect(() => {
    if (previousPath.current === null) {
      // ページを開いた直後・再読み込み：演出しない
      previousPath.current = pathname;
      return;
    }
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    const root = document.documentElement;
    const byLink = phase.current === "leaving" || phase.current === "navigating";
    const byHistory = performance.now() - lastHistoryNavAt.current < HISTORY_WINDOW_MS;
    lastHistoryNavAt.current = -Infinity;

    window.clearTimeout(leaveTimer.current);
    window.clearTimeout(failTimer.current);
    window.clearTimeout(enterTimer.current);
    for (const id of frames.current) cancelAnimationFrame(id);
    frames.current = [];
    target.current = null;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if ((!byLink && !byHistory) || reduceMotion) {
      // タイムアウトで元に戻したあとに遅れて切り替わった場合・演出の対象外の移動：フェードを付けずに表示する
      phase.current = "idle";
      root.removeAttribute("data-page-transition");
      return;
    }

    // 新しいページを透明にしたまま（戻る・進むでは、ここで初めて透明にする。トランジションなしで即座に）、
    // 描画を2回待ってからフェードインする
    phase.current = "entering";
    root.setAttribute("data-page-transition", "pending");
    const first = requestAnimationFrame(() => {
      const second = requestAnimationFrame(() => {
        frames.current = [];
        root.setAttribute("data-page-transition", "entering");
        enterTimer.current = window.setTimeout(() => {
          phase.current = "idle";
          root.removeAttribute("data-page-transition");
        }, ENTER_MS + 50);
      });
      frames.current.push(second);
    });
    frames.current.push(first);
  }, [pathname]);

  return null;
}

/**
 * クリックがページ遷移の演出の対象なら、移動先（パス＋ハッシュ）を返す。対象外なら null。
 * 迷うものはすべて対象外にし、Next.js（またはブラウザ）の通常の動作に任せる。
 */
function getTransitionHref(event: MouseEvent): string | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  const start = event.target instanceof Element ? event.target : null;
  const anchor = start?.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download") || anchor.hasAttribute("data-no-transition")) return null;

  let url: URL;
  try {
    url = new URL(anchor.href);
  } catch {
    return null;
  }
  if (url.origin !== window.location.origin) return null;
  if (url.search !== "" || window.location.search !== "") return null;
  if (url.pathname === window.location.pathname) return null;
  if (/\.[a-z0-9]+$/i.test(url.pathname)) return null;

  return url.pathname + url.hash;
}
