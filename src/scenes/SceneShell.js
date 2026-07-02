import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Group, Rect, RadialGradient } from '@shopify/react-native-skia';
import LiveCanvas from '../engine/LiveCanvas';

import { useStageLayout } from '../engine/layout';
import { useAmbient } from '../engine/useAmbient';
import { useSpriteFrame } from '../engine/useSprite';
import PixelDialog from '../ui/PixelDialog';
import CRTOverlay from '../ui/CRTOverlay';
import ClipboardNote from '../ui/ClipboardNote';
import BackdropHD from '../ui/BackdropHD';
import RoomArtHD, { ROOM_HORIZON } from '../art/RoomArtHD';
import { SCENE_W, SCENE_H } from '../config/game';
import { FX } from '../fx/feedback';

const LAMP = { x: SCENE_W / 2, y: 8 };
// Über das gemalte Klemmbrett auf der Werkbank (Mitte unten) gelegt.
const NOTE = { x: 286, y: 222, w: 68, h: 36 };

export default function SceneShell({
  room, introLines, hintLines, solved, solvedLines,
  onBack, renderScene, renderOverlay, emergencyLight, danger,
}) {
  const L = useStageLayout();
  const t = useAmbient(30);
  // I4: Intro NICHT mehr automatisch als Vollbild-Box — antippbare Notiz im Bild.
  const [dialog, setDialog] = useState(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [introRead, setIntroRead] = useState(false);

  const busy = !!dialog || hintOpen || solved;
  const pulse = useSpriteFrame(40, 18);             // Aufmerksamkeit auf die Notiz
  const noteGlow = !introRead && (pulse % 40) < 20;

  // „Eintreten“: die ganze Bühne setzt sich weich (Zoom 1.12 → 1, Einblenden).
  // Der Transform liegt auf dem gemeinsamen Wrapper von Canvas UND Overlays,
  // dadurch bleibt alles pixelgenau ausgerichtet.
  const settle = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(settle, { toValue: 1, duration: 520, useNativeDriver: true }).start();
  }, []);

  // Alarm-Puls aus der Ambient-Uhr (statt eigenem Interval).
  const period = danger ? 0.7 : 2.0;
  const lo = danger ? 0.40 : 0.28;
  const hi = danger ? 0.75 : 0.55;
  const glow = emergencyLight
    ? lo + (hi - lo) * ((Math.sin((t / period) * Math.PI * 2) + 1) / 2)
    : 0;

  const openIntro = () => { FX.click(); setIntroRead(true); setDialog({ lines: introLines }); };
  const openHint = () => { FX.click(); setHintOpen(true); };

  const note = L.toScreen(NOTE);
  const horizon = ROOM_HORIZON[room.scene] || 258;

  return (
    <View style={styles.root}>
      {/* Verlängert den Raum in die Letterbox-Ränder → keine schwarzen Balken. */}
      <BackdropHD horizon={horizon} accent={room.accent} />

      <Animated.View
        style={[styles.stage, {
          opacity: settle.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.25, 1, 1] }),
          transform: [{ scale: settle.interpolate({ inputRange: [0, 1], outputRange: [1.12, 1] }) }],
        }]}
      >
        <LiveCanvas style={{ flex: 1 }}>
          <Group clip={{ x: L.offsetX, y: L.offsetY, width: L.stageW, height: L.stageH }}>
            <Group transform={[{ translateX: L.offsetX }, { translateY: L.offsetY }, { scale: L.scale }]}>
              <RoomArtHD sceneId={room.scene} accent={room.accent} t={t}
                emergencyLight={emergencyLight} danger={danger} />
              {renderScene && renderScene(L)}

              {emergencyLight && (
                <Group>
                  <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} color="rgba(0,0,0,0.52)" />
                  <Rect x={0} y={0} width={SCENE_W} height={SCENE_H} opacity={glow}>
                    <RadialGradient
                      c={{ x: LAMP.x, y: LAMP.y }}
                      r={300}
                      colors={['#e82010', '#00000000']}
                    />
                  </Rect>
                </Group>
              )}
            </Group>
          </Group>
        </LiveCanvas>

        {/* CRT-Scanlines + Vignette über die ganze Bühne */}
        <CRTOverlay L={L} intensity={emergencyLight ? 1 : 0.85} />

        {renderOverlay && renderOverlay(L, { busy })}

        {/* I4: In-world Lab-Notiz (Klemmbrett) als Intro-Einstieg (kein Auto-Vollbild) */}
        {introLines && !busy && (
          <ClipboardNote rect={note} label="LAB-NOTIZ" glow={noteGlow} onPress={openIntro} />
        )}
      </Animated.View>

      <View style={styles.topbar} pointerEvents="box-none">
        <Pressable style={({ pressed }) => [styles.tbBtn, pressed && styles.tbPressed]} onPress={onBack}>
          <Text style={styles.tbTxt}>◀ TERMINAL</Text>
        </Pressable>
        <Text style={[styles.title, { color: room.accent }]}>{room.title.toUpperCase()}</Text>
        <Pressable style={({ pressed }) => [styles.tbBtn, pressed && styles.tbPressed]} onPress={openHint}>
          <Text style={styles.tbTxt}>HINWEIS ?</Text>
        </Pressable>
      </View>

      {dialog && (
        <PixelDialog speaker="LAB-NOTIZ" lines={dialog.lines} onClose={() => setDialog(null)} />
      )}
      {hintOpen && (
        <PixelDialog speaker="Hinweis" lines={hintLines} onClose={() => setHintOpen(false)} />
      )}

      {solved && (
        <View style={styles.solvedWrap}>
          <View style={[styles.solvedBox, { borderColor: room.accent }]}>
            <Text style={styles.solvedKick}>RAETSEL GELOEST</Text>
            {(solvedLines || []).map((l, i) => (
              <Text key={i} style={styles.solvedTxt}>{l}</Text>
            ))}
            <Text style={styles.codeLabel}>CODE</Text>
            <Text style={[styles.code, { color: room.accent }]}>{room.code}</Text>
            <Pressable style={({ pressed }) => [styles.goBtn, { borderColor: room.accent }, pressed && styles.tbPressed]} onPress={onBack}>
              <Text style={[styles.goTxt, { color: room.accent }]}>◀ CODE AM TERMINAL EINGEBEN</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0d0f17' },
  stage: { flex: 1 },
  topbar: {
    position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', padding: 10,
  },
  tbBtn: {
    borderWidth: 1.5, borderColor: '#6fd3dd', backgroundColor: 'rgba(10,14,22,0.82)',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 6,
  },
  tbPressed: { backgroundColor: 'rgba(111,211,221,0.18)' },
  tbTxt: { color: '#6fd3dd', fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold' },
  title: {
    fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold', letterSpacing: 2,
    textShadowColor: '#000', textShadowRadius: 6,
  },
  solvedWrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(5,7,12,0.72)' },
  solvedBox: {
    backgroundColor: 'rgba(13,15,23,0.97)', borderWidth: 2, borderRadius: 10,
    padding: 22, alignItems: 'center', maxWidth: 460,
    shadowColor: '#000', shadowOpacity: 0.8, shadowRadius: 24,
  },
  solvedKick: { color: '#6fe87a', fontFamily: 'monospace', fontSize: 12, letterSpacing: 3, fontWeight: 'bold' },
  solvedTxt: { color: '#aab6c6', fontFamily: 'monospace', fontSize: 12, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  codeLabel: { color: '#718096', fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, marginTop: 16 },
  code: {
    fontFamily: 'monospace', fontSize: 44, fontWeight: 'bold', letterSpacing: 8, marginTop: 2,
    textShadowColor: 'rgba(255,255,255,0.25)', textShadowRadius: 12,
  },
  goBtn: { marginTop: 18, borderWidth: 2, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 10 },
  goTxt: { fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold' },
});
