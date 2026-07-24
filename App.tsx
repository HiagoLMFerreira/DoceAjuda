import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppProviders from './src/app/providers/AppProviders';
import AppNavigator from './src/app/navigation/AppNavigator';

export default function App() {
  return (
    <AppProviders>
      <StatusBar
        style="dark"
        backgroundColor="#ebebeb"
      />
      <AppNavigator />
    </AppProviders>
  );
}
