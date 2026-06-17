/*
 * usePixelImage — useImage wrapper that resolves Expo web asset objects.
 * On native, require() returns a number; on web it returns { uri, width, height }.
 * Skia's Platform.resolveAsset doesn't handle the web object format, so we
 * extract the uri string ourselves before handing it to useImage.
 */
import { useImage } from '@shopify/react-native-skia';

export function usePixelImage(source) {
  const resolved =
    source !== null &&
    source !== undefined &&
    typeof source === 'object' &&
    typeof source.uri === 'string'
      ? source.uri
      : source;
  return useImage(resolved);
}
