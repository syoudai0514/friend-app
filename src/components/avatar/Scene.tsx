"use client";

import type { CSSProperties, ReactNode } from "react";
import { useAssets } from "@/lib/assets";

/**
 * 背景シーン。CSSグラデーション＋図形を重ねて描くので、
 * 画面いっぱい（フルブリード）でもサムネイルでも同じ見た目になる。
 */

const layer = (style: CSSProperties): CSSProperties => ({
  position: "absolute",
  inset: 0,
  ...style,
});

function Room() {
  return (
    <>
      <div style={layer({ background: "linear-gradient(#2b7f8c 0%, #2b7f8c 62%, #d9b891 62%, #c9a077 100%)" })} />
      {/* 窓 */}
      <div
        style={{
          position: "absolute",
          left: "4%",
          top: "8%",
          width: "34%",
          height: "34%",
          background: "linear-gradient(#a8dcf5, #d9f0ff 60%, #bfe6c8)",
          border: "3px solid #4a4a4a",
          borderRadius: 3,
          boxShadow: "0 0 30px rgba(255,255,255,.35)",
        }}
      />
      <div style={{ position: "absolute", left: "20.5%", top: "8%", width: 3, height: "34%", background: "#4a4a4a" }} />
      {/* 棚 */}
      <div
        style={{
          position: "absolute",
          right: "5%",
          top: "10%",
          width: "26%",
          height: "30%",
          background: "linear-gradient(#f2ece0, #e0d6c4)",
          borderRadius: 4,
        }}
      />
      <div style={{ position: "absolute", right: "5%", top: "24%", width: "26%", height: 4, background: "#cbbda4" }} />
    </>
  );
}

function Poolside() {
  return (
    <>
      <div style={layer({ background: "linear-gradient(#4fb8ec 0%, #9fdcf7 42%, #dff3fb 52%, #2fa4d8 58%, #1b7fb5 100%)" })} />
      {/* 太陽 */}
      <div
        style={{
          position: "absolute",
          right: "12%",
          top: "6%",
          width: "18%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: "radial-gradient(circle, #fffbe6 30%, rgba(255,246,190,0) 70%)",
        }}
      />
      {/* 雲 */}
      <div style={{ position: "absolute", left: "6%", top: "12%", width: "30%", height: "6%", background: "rgba(255,255,255,.85)", borderRadius: 999, filter: "blur(2px)" }} />
      <div style={{ position: "absolute", left: "48%", top: "22%", width: "24%", height: "5%", background: "rgba(255,255,255,.7)", borderRadius: 999, filter: "blur(2px)" }} />
      {/* 水面のきらめき */}
      <div style={layer({ top: "58%", background: "repeating-linear-gradient(105deg, rgba(255,255,255,.22) 0 6px, rgba(255,255,255,0) 6px 22px)" })} />
      {/* ヤシの葉 */}
      <div style={{ position: "absolute", left: "-6%", top: "-4%", width: "34%", height: "26%", background: "radial-gradient(ellipse at 30% 20%, #2f7a45 0%, rgba(47,122,69,0) 62%)" }} />
    </>
  );
}

function Arcade() {
  return (
    <>
      <div style={layer({ background: "linear-gradient(#2a1140 0%, #3d1a5c 45%, #24123a 100%)" })} />
      <div style={{ position: "absolute", left: "-10%", top: "18%", width: "48%", height: "40%", background: "radial-gradient(circle, rgba(255,74,180,.55) 0%, rgba(255,74,180,0) 68%)" }} />
      <div style={{ position: "absolute", right: "-10%", top: "10%", width: "50%", height: "44%", background: "radial-gradient(circle, rgba(74,214,255,.5) 0%, rgba(74,214,255,0) 68%)" }} />
      <div style={{ position: "absolute", left: "20%", bottom: "6%", width: "60%", height: "26%", background: "radial-gradient(ellipse, rgba(255,214,74,.35) 0%, rgba(255,214,74,0) 70%)" }} />
      <div style={layer({ background: "repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 2px, rgba(255,255,255,0) 2px 26px)" })} />
    </>
  );
}

function Office() {
  return (
    <>
      <div style={layer({ background: "linear-gradient(#eef2f6 0%, #e2e8ef 60%, #4d5560 60%, #3d444d 100%)" })} />
      <div
        style={{
          position: "absolute",
          left: "3%",
          top: "5%",
          width: "44%",
          height: "36%",
          background: "linear-gradient(#bfe0f5, #eaf6ff)",
          border: "2px solid #b7bfc9",
        }}
      />
      <div style={{ position: "absolute", left: "3%", top: "30%", width: "44%", height: "11%", background: "linear-gradient(rgba(160,180,200,.5), rgba(160,180,200,.1))" }} />
      <div style={{ position: "absolute", right: "4%", top: "34%", width: "40%", height: "8%", background: "#f4f6f8", borderRadius: 4, boxShadow: "0 2px 6px rgba(0,0,0,.12)" }} />
    </>
  );
}

function Izakaya() {
  return (
    <>
      <div style={layer({ background: "linear-gradient(#2a1a12 0%, #4a2f1e 40%, #6b452b 100%)" })} />
      <div style={{ position: "absolute", left: "6%", top: "3%", width: "16%", aspectRatio: "0.75", borderRadius: "45%", background: "linear-gradient(#e04a3a, #b8291c)", boxShadow: "0 0 40px rgba(255,120,80,.6)" }} />
      <div style={{ position: "absolute", right: "10%", top: "5%", width: "13%", aspectRatio: "0.75", borderRadius: "45%", background: "linear-gradient(#f2e3c4, #d9c193)", boxShadow: "0 0 40px rgba(255,220,150,.6)" }} />
      <div style={{ position: "absolute", left: "36%", top: "1%", width: "10%", aspectRatio: "0.8", borderRadius: "45%", background: "linear-gradient(#f5d98a, #e0b95f)", boxShadow: "0 0 34px rgba(255,210,120,.55)" }} />
      <div style={layer({ background: "radial-gradient(ellipse at 50% 20%, rgba(255,190,110,.25) 0%, rgba(0,0,0,0) 60%)" })} />
    </>
  );
}

function Classroom() {
  return (
    <>
      <div style={layer({ background: "linear-gradient(#ffb46b 0%, #ffd9a0 35%, #f7c98a 55%, #a8703f 100%)" })} />
      <div style={{ position: "absolute", left: "2%", top: "6%", width: "42%", height: "40%", background: "linear-gradient(#ffe3a8, #ffb877)", border: "3px solid #8a6540" }} />
      <div style={{ position: "absolute", left: "22.5%", top: "6%", width: 3, height: "40%", background: "#8a6540" }} />
      <div style={{ position: "absolute", left: "2%", top: "25%", width: "42%", height: 3, background: "#8a6540" }} />
      {/* 机のシルエット */}
      <div style={{ position: "absolute", left: "5%", bottom: "8%", width: "24%", height: "5%", background: "rgba(90,55,30,.55)", borderRadius: 3 }} />
      <div style={{ position: "absolute", right: "6%", bottom: "12%", width: "22%", height: "4.5%", background: "rgba(90,55,30,.45)", borderRadius: 3 }} />
      <div style={layer({ background: "linear-gradient(105deg, rgba(255,214,150,.35) 0%, rgba(255,214,150,0) 55%)" })} />
    </>
  );
}

function Sakura() {
  const petals = [
    [12, 14], [28, 32], [44, 9], [63, 26], [78, 44], [22, 55],
    [55, 62], [86, 18], [8, 38], [70, 8], [38, 74], [90, 60],
  ];
  return (
    <>
      <div style={layer({ background: "linear-gradient(#cfe9ff 0%, #f6d7e6 45%, #f0c3d8 62%, #b8a08e 100%)" })} />
      <div style={{ position: "absolute", left: "-8%", top: "-6%", width: "62%", height: "34%", background: "radial-gradient(ellipse, rgba(255,182,214,.95) 0%, rgba(255,182,214,0) 68%)" }} />
      <div style={{ position: "absolute", right: "-10%", top: "-4%", width: "58%", height: "30%", background: "radial-gradient(ellipse, rgba(255,205,228,.9) 0%, rgba(255,205,228,0) 68%)" }} />
      {petals.map(([l, t], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${l}%`,
            top: `${t}%`,
            width: 7,
            height: 7,
            borderRadius: "50% 0 50% 50%",
            background: "rgba(255,190,216,.9)",
            transform: `rotate(${i * 37}deg)`,
          }}
        />
      ))}
    </>
  );
}

function Night() {
  const lights = [
    [8, 62], [16, 70], [24, 58], [33, 74], [41, 64], [52, 78],
    [61, 60], [69, 72], [78, 56], [87, 68], [94, 76], [45, 55],
  ];
  return (
    <>
      <div style={layer({ background: "linear-gradient(#101a33 0%, #1b2a4d 55%, #2a3352 100%)" })} />
      {lights.map(([l, t], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${l}%`,
            top: `${t}%`,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: i % 3 === 0 ? "#ffd88a" : "#9fd0ff",
            boxShadow: `0 0 12px ${i % 3 === 0 ? "rgba(255,216,138,.9)" : "rgba(159,208,255,.9)"}`,
          }}
        />
      ))}
      <div style={layer({ background: "radial-gradient(ellipse at 50% 30%, rgba(120,160,255,.18) 0%, rgba(0,0,0,0) 65%)" })} />
    </>
  );
}

function Cafe() {
  return (
    <>
      <div style={layer({ background: "linear-gradient(#f4e6d2 0%, #e6d2b8 55%, #8a6440 100%)" })} />
      <div style={{ position: "absolute", left: "8%", top: "8%", width: "30%", height: "26%", background: "linear-gradient(#d8bfa0, #c4a888)", borderRadius: 6 }} />
      <div style={{ position: "absolute", right: "8%", top: "6%", width: "26%", height: "30%", background: "linear-gradient(#fff6e4, #efdcc0)", borderRadius: 6, boxShadow: "0 0 26px rgba(255,220,170,.6)" }} />
      <div style={layer({ background: "radial-gradient(ellipse at 70% 20%, rgba(255,214,150,.35) 0%, rgba(0,0,0,0) 62%)" })} />
    </>
  );
}

function Washitsu() {
  return (
    <>
      <div style={layer({ background: "linear-gradient(#f0e6cf 0%, #e8dcc0 58%, #b5c48d 58%, #9db273 100%)" })} />
      {/* 障子の格子 */}
      <div
        style={layer({
          bottom: "42%",
          background:
            "repeating-linear-gradient(90deg, rgba(150,125,90,.5) 0 2px, rgba(0,0,0,0) 2px 46px), repeating-linear-gradient(0deg, rgba(150,125,90,.5) 0 2px, rgba(0,0,0,0) 2px 52px)",
        })}
      />
      {/* 畳の目 */}
      <div style={layer({ top: "58%", background: "repeating-linear-gradient(0deg, rgba(120,140,80,.35) 0 1px, rgba(0,0,0,0) 1px 14px)" })} />
      <div style={layer({ background: "radial-gradient(ellipse at 50% 25%, rgba(255,240,200,.35) 0%, rgba(0,0,0,0) 65%)" })} />
    </>
  );
}

const SCENES: Record<string, () => ReactNode> = {
  room: Room,
  poolside: Poolside,
  arcade: Arcade,
  office: Office,
  izakaya: Izakaya,
  classroom: Classroom,
  sakura: Sakura,
  night: Night,
  cafe: Cafe,
  washitsu: Washitsu,
};

export function Scene({
  id,
  className = "",
  blur = 0,
}: {
  id: string;
  className?: string;
  /** 背景をぼかす量(px)。キャラを手前に立たせたいときに使う */
  blur?: number;
}) {
  const { backgroundSrc } = useAssets();
  const photo = backgroundSrc(id);
  const Comp = SCENES[id] ?? Room;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* ぼかすと縁が透けるので、少し拡大してから掛ける */}
      <div
        className="absolute inset-0"
        style={
          blur
            ? { filter: `blur(${blur}px)`, transform: "scale(1.12)" }
            : undefined
        }
      >
        {/* public/backgrounds に画像があればそれを使い、無ければCSSで描く */}
        {photo ? (
          <div
            style={layer({
              backgroundImage: `url("${photo}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            })}
          />
        ) : (
          <Comp />
        )}
      </div>
      {blur > 0 && (
        <>
          {/* ビネット。四隅を落として視線を中央に集める */}
          <div
            style={layer({
              background:
                "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 40%, rgba(0,0,0,.28) 100%)",
            })}
          />
          {/* 足元を少し暗くして、床に立っている感じを出す */}
          <div
            style={layer({
              background:
                "linear-gradient(to top, rgba(0,0,0,.22) 0%, rgba(0,0,0,0) 26%)",
            })}
          />
        </>
      )}
    </div>
  );
}
