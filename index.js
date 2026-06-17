import { registerRootComponent } from 'expo';
import React, { useState, useEffect } from 'react';
import { Platform, View } from 'react-native';
import App from './App';

// On web, Skia WASM must be fully loaded before any Canvas mounts.
// SkiaGate holds a null render until global.CanvasKit is set.
function SkiaGate() {
  const [ready, setReady] = useState(typeof global !== 'undefined' && !!global.CanvasKit);

  useEffect(() => {
    if (ready) return;
    const { LoadSkiaWeb } = require('@shopify/react-native-skia/lib/module/web');
    LoadSkiaWeb().then(() => setReady(true)).catch(() => setReady(true));
  }, []);

  if (!ready) return null;
  return <App />;
}

const Root = Platform.OS === 'web' ? SkiaGate : App;
registerRootComponent(Root);
