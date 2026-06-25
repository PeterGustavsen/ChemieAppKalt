/*
 * SceneBackdrop — füllt die Letterbox-Ränder JEDER Szene, damit KEINE schwarzen
 * Balken entstehen, wenn das Fenster-Seitenverhältnis nicht 16:9 (640×360) ist.
 *
 * Dazu wird DASSELBE Szenen-Hintergrundbild bildschirmfüllend (cover), weich
 * und abgedunkelt HINTER die zentrierte, scharfe Bühne gelegt. Die Bühne bleibt
 * unbeschnitten und pixelgenau zentriert — die Ränder zeigen einfach eine
 * verlängerte, ruhige Version desselben Raums.
 *
 * Verallgemeinert das, was HubBackdrop für die Hub-Szene tut, auf alle übrigen
 * Bühnen-Szenen (Räume, Start, Win, Fail). Rein dekorativ, pointerEvents=none.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import {
  Canvas, Image as SkImage, Group, Rect, Paint, Blur,
  FilterMode, MipmapMode,
} from '@shopify/react-native-skia';
import { usePixelImage } from '../engine/usePixelImage';
import { useStageLayout } from '../engine/layout';
import { SCENE_W, SCENE_H } from '../config/game';

const NEAREST = { filter: FilterMode.Nearest, mipmap: MipmapMode.None };

export default function SceneBackdrop({ source, darken = 0.5, blur = 6 }) {
  const { width: W, height: H } = useStageLayout();
  const img = usePixelImage(source);
  if (!W || !H) return null;

  // "cover": Bild so skalieren, dass es den ganzen Viewport füllt (größerer
  // Skalierungsfaktor gewinnt), und zentrieren. Überstand wird beschnitten —
  // das ist hier gewollt, denn dies ist nur der Rand-Füller.
  const scale = Math.max(W / SCENE_W, H / SCENE_H);
  const dw = SCENE_W * scale;
  const dh = SCENE_H * scale;
  const dx = (W - dw) / 2;
  const dy = (H - dh) / 2;

  return (
    <Canvas style={styles.fill} pointerEvents="none">
      {img && (
        <Group layer={blur ? <Paint><Blur blur={blur} /></Paint> : undefined}>
          <SkImage image={img} x={dx} y={dy} width={dw} height={dh} fit="fill" sampling={NEAREST} />
        </Group>
      )}
      {/* Abdunkeln, damit der Rand zurücktritt und die scharfe Bühne im Fokus bleibt. */}
      <Rect x={0} y={0} width={W} height={H} color={`rgba(0,0,0,${darken})`} />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
});
