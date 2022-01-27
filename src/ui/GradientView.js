/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
export default function(props) {
  return (
    // 'rgba(1,119,181,0.05)',
    // 'rgba(1,119,181,0.1)',
    // 'rgba(1,119,181,0.25)',
    // 'rgba(1,119,181,0.2)',
    // 'rgba(1,119,181,0.1)',
    // 'rgba(1,119,181,0.05)',
    // 'rgba(1,119,181,0.02)',
    <LinearGradient
      colors={[
        'rgba(255, 97, 99,0.05)',
        'rgba(255, 91, 97,0.1)',
        'rgba(255, 93, 98,0.25)',
        'rgba(255, 95, 98,0.2)',
        'rgba(255, 97, 99,0.1)',
        'rgba(255, 97, 99,0.05)',
        'rgba(199, 99, 100,0.02)',
      ]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={{
        marginTop: props.marginTop,
        marginHorizontal: props.marginHorizontal,
        borderRadius: 10,
        height: props.height,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: 10,
      }}>
      <Text style={{color: props.titleColor}}>{props.title}</Text>
    </LinearGradient>
  );
}
