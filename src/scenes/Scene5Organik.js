/*
 * SZENE 5 — Organik. Interaktion: drei C₂-Molekuele in der Reihenfolge STEIGENDER
 * Oxidationszahl des C anklicken (Alkohol < Aldehyd < Carbonsaeure).
 * Richtige Reihenfolge -> Ziffern 1,4,7 -> Code 147. Animierte Bunsenflamme.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Group, Path } from '@shopify/react-native-skia';

import SceneShell from './SceneShell';
import { useSpriteFrame } from '../engine/useSprite';
import { poly } from '../engine/skiaUtil';
import { PUZZLES } from '../config/game';

const P = PUZZLES[5];
const CARDS = [{ x: 56, y: 132, w: 120, h: 112 }, { x: 192, y: 132, w: 120, h: 112 }, { x: 328, y: 132, w: 120, h: 112 }];
const DISPLAY = { x: 470, y: 60, w: 140, h: 56 };
const BX = 520; // Brenner-x (wie im Generator)

export default function Scene5Organik({ room, onBack, onReveal, initiallySolved, emergencyLight, danger }) {
  const [seq, setSeq] = useState(initiallySolved ? [0, 1, 2] : []);
  const [wrong, setWrong] = useState(false);
  const flame = useSpriteFrame(4, 9);
  const solved = seq.length === 3;

  useEffect(() => { if (solved) onReveal && onReveal(room.id); }, [solved]);

  const tap = (mol) => {
    if (mol.order === seq.length) { setWrong(false); setSeq((s) => [...s, mol.order]); }
    else { setWrong(true); setSeq([]); setTimeout(() => setWrong(false), 500); }
  };

  // Ziffern in Klick-Reihenfolge (fuer die Anzeige)
  const byOrder = [...P.molecules].sort((a, b) => a.order - b.order);
  const built = seq.map((o) => byOrder[o].digit).join('');

  const renderScene = () => {
    const h = 16 + flame * 4;             // flackernde Hoehe
    const outer = poly([[BX - 6, 196], [BX + 14, 196], [BX + 4, 196 - h]]);
    const inner = poly([[BX, 196], [BX + 8, 196], [BX + 4, 196 - h * 0.55]]);
    return (
      <Group>
        <Path path={outer} color="#f0913a" opacity={0.95} />
        <Path path={inner} color="#5b9bf0" opacity={0.9} />
      </Group>
    );
  };

  const renderOverlay = (L, { busy }) => {
    const disp = L.toScreen(DISPLAY);
    return (
      <>
        {/* Karten-Inhalte */}
        {P.molecules.map((mol, i) => {
          const s = L.toScreen(CARDS[i]);
          const picked = seq.includes(mol.order);
          const pos = seq.indexOf(mol.order);
          return (
            <View key={mol.name} pointerEvents="none" style={[styles.card, s, picked && styles.cardPicked]}>
              <Text style={styles.cName}>{mol.name}</Text>
              <Text style={styles.cForm}>{mol.formula}</Text>
              <Text style={styles.cGroup}>{mol.group}</Text>
              <Text style={styles.cDigit}>{mol.digit}</Text>
              {picked && <Text style={styles.badge}>{pos + 1}.</Text>}
            </View>
          );
        })}

        {/* Code-Aufbau-Display */}
        <View pointerEvents="none" style={[styles.disp, disp]}>
          <Text style={styles.dispLbl}>CODE</Text>
          <Text style={styles.dispVal}>{built.padEnd(3, '·')}</Text>
        </View>

        {!busy && (
          <>
            <View style={styles.banner}>
              <Text style={styles.bannerTxt}>Klicke nach STEIGENDER Oxidationszahl des C-Atoms</Text>
              {wrong && <Text style={styles.wrong}>Falsche Reihenfolge — neu beginnen</Text>}
            </View>
            {P.molecules.map((mol, i) => {
              const s = L.toScreen(CARDS[i]);
              return <Pressable key={'h' + mol.name} style={[styles.hit, s]} onPress={() => tap(mol)} />;
            })}
          </>
        )}
      </>
    );
  };

  return (
    <SceneShell
      room={room}
      bgSource={require('../../assets/scenes/scene_05_apparatus.png')}
      introLines={P.intro}
      hintLines={P.hint}
      solved={solved}
      solvedLines={['Alkohol → Aldehyd → Carbonsaeure.', 'Ethanol(1) · Ethanal(4) · Essigsaeure(7) → 147.']}
      onBack={onBack}
      emergencyLight={emergencyLight}
      danger={danger}
      renderScene={renderScene}
      renderOverlay={renderOverlay}
    />
  );
}

const styles = StyleSheet.create({
  card: { position: 'absolute', alignItems: 'center', paddingTop: 4, borderWidth: 2, borderColor: 'transparent' },
  cardPicked: { borderColor: '#6fe08a' },
  cName: { color: '#6fe08a', fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold' },
  cForm: { color: '#eafcff', fontFamily: 'monospace', fontSize: 13, marginTop: 8 },
  cGroup: { color: '#6fd3dd', fontFamily: 'monospace', fontSize: 12, marginTop: 4 },
  cDigit: { color: '#f0b23a', fontFamily: 'monospace', fontSize: 20, fontWeight: 'bold', position: 'absolute', bottom: 2 },
  badge: { position: 'absolute', top: 2, right: 4, color: '#6fe08a', fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold' },
  disp: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  dispLbl: { color: '#2f8f3a', fontFamily: 'monospace', fontSize: 9, letterSpacing: 2 },
  dispVal: { color: '#6fe87a', fontFamily: 'monospace', fontSize: 26, fontWeight: 'bold', letterSpacing: 4 },
  hit: { position: 'absolute' },
  banner: { position: 'absolute', bottom: 16, left: 0, right: 0, alignItems: 'center' },
  bannerTxt: { color: '#eafcff', fontFamily: 'monospace', fontSize: 12 },
  wrong: { color: '#f06b6b', fontFamily: 'monospace', fontSize: 12, marginTop: 4 },
});
