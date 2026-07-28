import type { CSSProperties } from "react";
import type { FaceAnchor } from "@/lib/face-anchors";
import type { Expression } from "@/lib/expressions";

/**
 * 表情の記号。
 *
 * 写真の立ち絵は顔が描き込まれていて変えられないので、
 * アニメでおなじみの記号（照れ線、♪、怒りマーク、zzz…）を顔の上に重ねて
 * 気持ちを伝える。位置は face-anchors で割り出した顔の座標に合わせる。
 *
 * 大きさはすべて --u（＝絵の高さの1％）を基準にしているので、
 * 画面の大小にかかわらず顔とのバランスが変わらない。
 */

/** 絵が描かれている枠。この中に記号を置く */
export interface FitBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

const pos = (x: number, y: number): CSSProperties => ({
  position: "absolute",
  left: `${x * 100}%`,
  top: `${y * 100}%`,
  transform: "translate(-50%, -50%)",
});

/* ------------------------------ 部品 ------------------------------ */

/** 怒りマーク。外に向いた4つの山を十字に並べる */
function AngerMark({ style }: { style: CSSProperties }) {
  return (
    <svg viewBox="-14 -14 28 28" style={style} aria-hidden="true">
      {/* 四方に膨らんだ十字。線で描くと飾りに見えるので塗りでどっしり出す */}
      <path
        d="M 0,-11.5 C 1.6,-6.6 6.6,-1.6 11.5,0
           C 6.6,1.6 1.6,6.6 0,11.5
           C -1.6,6.6 -6.6,1.6 -11.5,0
           C -6.6,-1.6 -1.6,-6.6 0,-11.5 Z"
        fill="#e8455f"
      />
      <path
        d="M 0,-7.4 C 0.9,-4.2 4.2,-0.9 7.4,0
           C 4.2,0.9 0.9,4.2 0,7.4
           C -0.9,4.2 -4.2,0.9 -7.4,0
           C -4.2,-0.9 -0.9,-4.2 0,-7.4 Z"
        fill="#ff8095"
        opacity="0.55"
      />
    </svg>
  );
}

/** 涙のしずく */
function Teardrop({ style }: { style: CSSProperties }) {
  return (
    <svg viewBox="0 0 16 22" style={style} aria-hidden="true">
      <path
        d="M 8,1 C 8,6.5 14,9.5 14,14.5 A 6 6 0 1 1 2,14.5 C 2,9.5 8,6.5 8,1 Z"
        fill="#7fc8f0"
        opacity="0.85"
      />
      <ellipse cx="5.6" cy="14" rx="1.7" ry="2.6" fill="#ffffff" opacity="0.7" />
    </svg>
  );
}

/** きらきら */
function Sparkle({ style }: { style: CSSProperties }) {
  return (
    <svg viewBox="-10 -10 20 20" style={style} aria-hidden="true">
      <path
        d="M 0,-10 C 1.4,-3.4 3.4,-1.4 10,0 C 3.4,1.4 1.4,3.4 0,10 C -1.4,3.4 -3.4,1.4 -10,0 C -3.4,-1.4 -1.4,-3.4 0,-10 Z"
        fill="#ffe9a3"
      />
    </svg>
  );
}

/* ------------------------------ 本体 ------------------------------ */

export function ExpressionFx({
  expression,
  anchor,
  box,
}: {
  expression: Expression;
  anchor: FaceAnchor;
  box: FitBox;
}) {
  if (expression === "normal" || box.width <= 0) return null;

  const u = box.height / 100;
  const frame: CSSProperties = {
    position: "absolute",
    left: box.left,
    top: box.top,
    width: box.width,
    height: box.height,
    pointerEvents: "none",
    // 記号の大きさはすべてこの単位から決める
    ["--u" as string]: `${u}px`,
  };

  const cheekL = anchor.headX - anchor.cheekDX;
  const cheekR = anchor.headX + anchor.cheekDX;
  const markR = anchor.headX + anchor.markDX;
  const markL = anchor.headX - anchor.markDX;

  return (
    <div style={frame} aria-hidden="true">
      {/* ------------------------------ 照れ ------------------------------ */}
      {expression === "shy" && (
        <>
          {[cheekL, cheekR].map((cx, i) => (
            <div
              key={i}
              className="fx-blush"
              style={{
                ...pos(cx, anchor.cheekY),
                width: "calc(var(--u) * 5.6)",
                height: "calc(var(--u) * 3.3)",
              }}
            />
          ))}
          {/* 頬の斜線 */}
          {[cheekL, cheekR].map((cx, i) => (
            <svg
              key={`h${i}`}
              viewBox="0 0 20 12"
              className="fx-blush-lines"
              style={{
                ...pos(cx, anchor.cheekY),
                width: "calc(var(--u) * 4.2)",
                height: "calc(var(--u) * 2.5)",
              }}
            >
              {[3, 8, 13].map((x) => (
                <path
                  key={x}
                  d={`M ${x},9 L ${x + 4},2`}
                  stroke="#f06d92"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          ))}
          {/* 頭の上の湯気 */}
          {[0, 1, 2].map((i) => (
            <div
              key={`s${i}`}
              className="fx-steam"
              style={{
                ...pos(anchor.headX + (i - 1) * 0.09, anchor.markY - 0.02),
                width: "calc(var(--u) * 2.8)",
                height: "calc(var(--u) * 2.8)",
                animationDelay: `${i * 0.42}s`,
              }}
            />
          ))}
        </>
      )}

      {/* ----------------------------- うれしい ----------------------------- */}
      {expression === "happy" && (
        <>
          {[
            { x: markR, y: anchor.markY, d: 0, s: 4.6 },
            { x: markR + 0.05, y: anchor.markY - 0.045, d: 0.6, s: 3.6 },
            { x: markL, y: anchor.markY - 0.02, d: 1.1, s: 3.9 },
          ].map((n, i) => (
            <span
              key={i}
              className="fx-note"
              style={{
                ...pos(n.x, n.y),
                fontSize: `calc(var(--u) * ${n.s})`,
                animationDelay: `${n.d}s`,
              }}
            >
              ♪
            </span>
          ))}
          {[
            { x: markR - 0.04, y: anchor.markY + 0.05, d: 0.3, s: 3.2 },
            { x: markL + 0.03, y: anchor.markY + 0.02, d: 0.9, s: 2.4 },
          ].map((s, i) => (
            <Sparkle
              key={`k${i}`}
              style={{
                ...pos(s.x, s.y),
                width: `calc(var(--u) * ${s.s})`,
                height: `calc(var(--u) * ${s.s})`,
                animation: "fxTwinkle 1.6s ease-in-out infinite",
                animationDelay: `${s.d}s`,
              }}
            />
          ))}
          {/* うれしいときは頬もほんのり */}
          {[cheekL, cheekR].map((cx, i) => (
            <div
              key={`b${i}`}
              className="fx-blush fx-blush-soft"
              style={{
                ...pos(cx, anchor.cheekY),
                width: "calc(var(--u) * 5)",
                height: "calc(var(--u) * 3)",
              }}
            />
          ))}
        </>
      )}

      {/* ---------------------------- しょんぼり ---------------------------- */}
      {expression === "sad" && (
        <>
          <div
            className="fx-gloom"
            style={{
              position: "absolute",
              left: `${(anchor.headX - anchor.markDX * 0.72) * 100}%`,
              top: 0,
              width: `${anchor.markDX * 1.44 * 100}%`,
              height: `${(anchor.eyeY + 0.02) * 100}%`,
            }}
          />
          <Teardrop
            style={{
              ...pos(anchor.headX + anchor.cheekDX * 0.95, anchor.eyeY + 0.012),
              width: "calc(var(--u) * 2.3)",
              height: "calc(var(--u) * 3.2)",
              animation: "fxTear 2.6s ease-in infinite",
            }}
          />
        </>
      )}

      {/* ----------------------------- むくれ ----------------------------- */}
      {expression === "angry" && (
        <AngerMark
          style={{
            ...pos(markR - 0.06, anchor.markY + 0.014),
            width: "calc(var(--u) * 5.6)",
            height: "calc(var(--u) * 5.6)",
            animation: "fxThrob 0.9s ease-in-out infinite",
          }}
        />
      )}

      {/* ----------------------------- びっくり ----------------------------- */}
      {expression === "surprised" && (
        <>
          <span
            className="fx-bang"
            style={{
              ...pos(markR - 0.05, anchor.markY - 0.01),
              fontSize: "calc(var(--u) * 6)",
            }}
          >
            !
          </span>
          <svg
            viewBox="-14 -14 28 28"
            style={{
              ...pos(markR - 0.05, anchor.markY - 0.01),
              width: "calc(var(--u) * 10)",
              height: "calc(var(--u) * 10)",
              animation: "fxBurst 0.5s ease-out",
            }}
          >
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <path
                key={a}
                d="M 0,-9 L 0,-12.5"
                stroke="#ffd45e"
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${a})`}
              />
            ))}
          </svg>
        </>
      )}

      {/* ------------------------------ ねむい ------------------------------ */}
      {expression === "sleepy" &&
        [0, 1, 2].map((i) => (
          <span
            key={i}
            className="fx-zzz"
            style={{
              ...pos(markR - 0.06 + i * 0.03, anchor.markY + 0.02),
              fontSize: `calc(var(--u) * ${2.6 + i * 0.9})`,
              animationDelay: `${i * 0.75}s`,
            }}
          >
            z
          </span>
        ))}
    </div>
  );
}
