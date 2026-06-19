/*
 * ERROR BOUNDARY
 * One scene throwing should not white-screen the whole demo. Catches render
 * errors below it and shows a recoverable fallback with a restart button.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || String(error) };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.warn('[ErrorBoundary]', error, info?.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, message: '' });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.root}>
        <Text style={styles.title}>[ ! ] SYSTEMFEHLER</Text>
        <Text style={styles.sub}>Ein Modul ist abgestürzt.</Text>
        {!!this.state.message && (
          <Text style={styles.detail} numberOfLines={3}>{this.state.message}</Text>
        )}
        <Pressable style={styles.btn} onPress={this.reset}>
          <Text style={styles.btnTxt}>▶ NEU STARTEN</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: '#0d0f17',
    alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24,
  },
  title: {
    color: '#d41808', fontFamily: 'monospace', fontSize: 22,
    fontWeight: '900', letterSpacing: 2,
  },
  sub: { color: '#dbe4f0', fontFamily: 'monospace', fontSize: 14 },
  detail: {
    color: '#4a6070', fontFamily: 'monospace', fontSize: 11,
    textAlign: 'center', maxWidth: 420,
  },
  btn: {
    marginTop: 14, borderWidth: 2, borderColor: '#6fd3dd',
    borderRadius: 6, paddingVertical: 10, paddingHorizontal: 20,
  },
  btnTxt: {
    color: '#6fd3dd', fontFamily: 'monospace', fontSize: 14,
    fontWeight: 'bold', letterSpacing: 1,
  },
});
