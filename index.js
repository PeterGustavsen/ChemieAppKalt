import { registerRootComponent } from 'expo';
import React, { useState, useEffect } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import App from './App';

// On web, Skia WASM must be fully loaded before any Canvas mounts.
// SkiaGate holds a null render until global.CanvasKit is set.
function SkiaGate() {
  const ready0 = typeof global !== 'undefined' && !!global.CanvasKit;
  const [ready, setReady] = useState(ready0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (ready) return;
    const { LoadSkiaWeb } = require('@shopify/react-native-skia/lib/module/web');
    LoadSkiaWeb()
      .then(() => setReady(true))
      // Mounting App without CanvasKit would crash on the first <Canvas>.
      // Show a fallback instead of white-screening the demo.
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>[ ! ] GRAFIK KONNTE NICHT LADEN</Text>
        <Text style={styles.sub}>
          CanvasKit (Skia) wurde nicht geladen. Bitte Seite neu laden.
        </Text>
      </View>
    );
  }

  if (!ready) return null;
  return <App />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: '#0d0f17',
    alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24,
  },
  title: {
    color: '#d41808', fontFamily: 'monospace', fontSize: 18,
    fontWeight: '900', letterSpacing: 1, textAlign: 'center',
  },
  sub: {
    color: '#dbe4f0', fontFamily: 'monospace', fontSize: 13, textAlign: 'center',
  },
});

const Root = Platform.OS === 'web' ? SkiaGate : App;
registerRootComponent(Root);
