/*
 * HubWindow — Fenster + Stahl-Rollladen des Hubs (Story-Objekte!), geteilt
 * zwischen Scene1Hub und SceneWin. Koordinaten (WIN) sind unverändert aus dem
 * Original übernommen — die Rollladen-Mechanik in den Szenen rechnet damit.
 *
 * Getrennt exportiert, weil Scene1Hub zwischen Fenster und Rollladen noch die
 * Notbeleuchtungs-Ebene zeichnet:
 *   <HubWindowView t={t} />   … Himmel, Wolken, Skyline, Rahmen
 *   <HubShutter shutterY={y} redTint />   … Rollladen (clippt sich selbst)
 */
import React from 'react';
import { Group, Rect, LinearGradient, Oval } from '@shopify/react-native-skia';

export const WIN = { x: 205, y: 14, w: 230, h: 94 };

export function HubWindowView({ t = 0 }) {
  return (
    <Group>
      <Group clip={{ x: WIN.x, y: WIN.y, width: WIN.w, height: WIN.h }}>
        {/* Himmel */}
        <Rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h}>
          <LinearGradient
            start={{ x: WIN.x, y: WIN.y }} end={{ x: WIN.x, y: WIN.y + WIN.h }}
            colors={['#b8e0f7', '#6aaed6']}
          />
        </Rect>
        {/* Wolken — driften langsam durchs Fenster */}
        {[0, 1].map((k) => {
          const drift = ((t * 2.2 + k * 130) % (WIN.w + 90)) - 70;
          return (
            <Group key={k}>
              <Oval x={WIN.x + drift} y={WIN.y + 8 + k * 8} width={54} height={14}
                color="rgba(255,255,255,0.8)" />
              <Oval x={WIN.x + drift + 12} y={WIN.y + 3 + k * 8} width={38} height={12}
                color="rgba(255,255,255,0.6)" />
            </Group>
          );
        })}
        {/* Industrie-Silhouetten */}
        <Rect x={WIN.x + 10}  y={WIN.y + 58} width={28} height={36} color="#3a4d58" />
        <Rect x={WIN.x + 20}  y={WIN.y + 42} width={8}  height={16} color="#3a4d58" />
        <Rect x={WIN.x + 45}  y={WIN.y + 48} width={38} height={46} color="#2d3f4a" />
        <Rect x={WIN.x + 52}  y={WIN.y + 32} width={7}  height={17} color="#2d3f4a" />
        <Rect x={WIN.x + 67}  y={WIN.y + 28} width={7}  height={21} color="#2d3f4a" />
        <Rect x={WIN.x + 92}  y={WIN.y + 52} width={30} height={42} color="#38505c" />
        <Rect x={WIN.x + 88}  y={WIN.y + 48} width={38} height={8}  color="#38505c" />
        <Rect x={WIN.x + 132} y={WIN.y + 62} width={60} height={32} color="#324550" />
        <Rect x={WIN.x + 148} y={WIN.y + 46} width={9}  height={17} color="#324550" />
        <Rect x={WIN.x + 170} y={WIN.y + 40} width={9}  height={23} color="#324550" />
        {/* Bodenstreifen */}
        <Rect x={WIN.x} y={WIN.y + 88} width={WIN.w} height={6} color="#26363f" />
      </Group>
      {/* Stahlrahmen mit Bolzen */}
      <Rect x={WIN.x - 6} y={WIN.y - 6} width={WIN.w + 12} height={WIN.h + 12}
        color="#3e4d58" style="stroke" strokeWidth={12} />
      <Rect x={WIN.x - 1} y={WIN.y - 1} width={WIN.w + 2} height={WIN.h + 2}
        color="#5a6e7c" style="stroke" strokeWidth={2} />
      <Rect x={WIN.x + WIN.w / 3 - 2} y={WIN.y} width={4} height={WIN.h} color="#3e4d58" />
      <Rect x={WIN.x + WIN.w * 2 / 3 - 2} y={WIN.y} width={4} height={WIN.h} color="#3e4d58" />
      <Rect x={WIN.x} y={WIN.y + WIN.h / 2 - 2} width={WIN.w} height={4} color="#3e4d58" />
      {[[-5, -5], [WIN.w - 1, -5], [-5, WIN.h - 1], [WIN.w - 1, WIN.h - 1]].map(([dx, dy], i) => (
        <Rect key={i} x={WIN.x + dx} y={WIN.y + dy} width={6} height={6} color="#6a8090" />
      ))}
    </Group>
  );
}

export function HubShutter({ shutterY, redTint = false }) {
  return (
    <Group clip={{ x: WIN.x - 6, y: WIN.y - 6, width: WIN.w + 12, height: WIN.h + 12 }}>
      <Rect x={WIN.x - 6} y={shutterY} width={WIN.w + 12} height={WIN.h + 14} color="#3e3e3e" />
      {[...Array(10)].map((_, i) => (
        <Rect key={i} x={WIN.x - 6} y={shutterY + i * 11} width={WIN.w + 12} height={2} color="#2e2e2e" />
      ))}
      {/* Unterkante */}
      <Rect x={WIN.x - 6} y={shutterY + WIN.h + 10} width={WIN.w + 12} height={4} color="#606060" />
      {redTint && (
        <Rect x={WIN.x - 6} y={shutterY} width={WIN.w + 14} height={WIN.h + 14}
          color="rgba(180,30,0,0.18)" />
      )}
    </Group>
  );
}
