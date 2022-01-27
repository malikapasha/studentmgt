/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';

import React from 'react';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import App from './App';
import {MenuProvider} from 'react-native-popup-menu';
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'red',
    accent: 'orange',
    placeholder: 'grey',
    text: 'black',
    underlineColor: 'transparent',
  },
};

export default function Main() {
  return (
    <MenuProvider>
      <PaperProvider theme={theme}>
        <App />
      </PaperProvider>
    </MenuProvider>
  );
}
AppRegistry.registerComponent(appName, () => Main);
