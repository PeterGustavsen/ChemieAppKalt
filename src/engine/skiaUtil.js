/*
 * Kleine Skia-Helfer.
 */
import { Skia } from '@shopify/react-native-skia';

// Polygon aus [[x,y], ...] -> SkPath
export function poly(points) {
  const p = Skia.Path.Make();
  points.forEach(([x, y], i) => (i === 0 ? p.moveTo(x, y) : p.lineTo(x, y)));
  p.close();
  return p;
}
