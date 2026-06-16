/*
 * PIXEL-ART SCENE BANNERS
 * Each lab area shows the corresponding hand-crafted PNG scene.
 * Assets are 256×224 px (SNES native), displayed as full-width banners.
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const SCENES = {
  hub:       require('../../assets/scenes/scene_01_lab_hub.png'),
  titration: require('../../assets/scenes/scene_02_titration.png'),
  cabinet:   require('../../assets/scenes/scene_03_cabinet.png'),
  periodic:  require('../../assets/scenes/scene_04_periodic.png'),
  apparatus: require('../../assets/scenes/scene_05_apparatus.png'),
};

function SceneBanner({ scene }) {
  return (
    <View style={styles.wrapper}>
      <Image
        source={SCENES[scene]}
        style={styles.img}
        resizeMode="cover"
      />
    </View>
  );
}

export function LabBench()    { return <SceneBanner scene="titration" />; }
export function LabCabinet()  { return <SceneBanner scene="cabinet"   />; }
export function LabDistill()  { return <SceneBanner scene="apparatus" />; }
export function LabBoard()    { return <SceneBanner scene="periodic"  />; }
export function LabTerminal() { return <SceneBanner scene="hub"       />; }

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 128,
    overflow: 'hidden',
    backgroundColor: '#080810',
  },
  img: {
    width: '100%',
    height: '100%',
  },
});
