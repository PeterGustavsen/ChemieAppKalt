import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { useWorld } from '../engine/WorldContext';
import { useSpriteFrame } from '../engine/useSprite';
import PixelDialog from '../ui/PixelDialog';
import ClipboardNote from '../ui/ClipboardNote';
import { FX } from '../fx/feedback';

/*
 * SceneShell — Rahmen der 6 Rätsel-Stationen. Zeichnet KEINE eigene Canvas
 * mehr: das Spiel ist EINE durchgehende Laborhalle (WorldLab), und die Kamera
 * fährt zur Station. SceneShell publiziert den Skia-Rätsel-Layer über den
 * WorldContext in die Welt-Canvas und rendert selbst nur noch die DOM-Teile:
 * Topbar, Lab-Notiz, Overlays der Szene, Hinweis/Intro-Dialoge, Code-Panel.
 * Die Rätsel-Szenen selbst bleiben unverändert.
 */

// Über das gemalte Klemmbrett auf der Werkbank (Mitte unten) gelegt.
const NOTE = { x: 286, y: 222, w: 68, h: 36 };

export default function SceneShell({
  room, introLines, hintLines, solved, solvedLines,
  onBack, renderScene, renderOverlay,
}) {
  const world = useWorld();
  const [dialog, setDialog] = useState(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [introRead, setIntroRead] = useState(false);

  // Rätsel-Layer in die Welt-Canvas publizieren (Ref-basiert, jede Renderrunde
  // aktuell — die Welt liest ihn bei ihrem nächsten Frame).
  const renderSceneRef = useRef(renderScene);
  renderSceneRef.current = renderScene;
  useEffect(() => {
    world.setLayer((L) => (renderSceneRef.current ? renderSceneRef.current(L) : null));
    return () => world.setLayer(null);
  }, [world]);

  const busy = !!dialog || hintOpen || solved || world.traveling;
  // Aufmerksamkeits-Puls der Notiz: 1×/s Toggle statt 18-fps-Ticker (DOM-Ruhe)
  const pulse = useSpriteFrame(2, 0.9);
  const noteGlow = !introRead && pulse === 0;

  const openIntro = () => { FX.click(); setIntroRead(true); setDialog({ lines: introLines }); };
  const openHint = () => { FX.click(); setHintOpen(true); };

  const L = world.L;
  const note = L.toScreen(NOTE);

  // Während der Kamerafahrt nur die (leere) Hülle — alles DOM ist busy.
  return (
    <View style={styles.root} pointerEvents="box-none">
      {!world.traveling && (
        <View style={styles.topbar} pointerEvents="box-none">
          <Pressable style={({ pressed }) => [styles.tbBtn, pressed && styles.tbPressed]} onPress={onBack}>
            <Text style={styles.tbTxt}>◀ TERMINAL</Text>
          </Pressable>
          <Text style={[styles.title, { color: room.accent }]}>{room.title.toUpperCase()}</Text>
          <Pressable style={({ pressed }) => [styles.tbBtn, pressed && styles.tbPressed]} onPress={openHint}>
            <Text style={styles.tbTxt}>HINWEIS ?</Text>
          </Pressable>
        </View>
      )}

      {renderOverlay && renderOverlay(L, { busy })}

      {/* In-world Lab-Notiz (Klemmbrett) als Intro-Einstieg */}
      {introLines && !busy && (
        <ClipboardNote rect={note} label="LAB-NOTIZ" glow={noteGlow} onPress={openIntro} />
      )}

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
  root: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
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
