/* eslint-disable react-native/no-inline-styles */
import {Appbar, TextInput} from 'react-native-paper';
import {View} from 'react-native';
import React from 'react';
export default function(props) {
  return (
    <View
      style={{
        marginVertical: 8,
      }}>
      <TextInput {...props} mode="outlined" selectionColor={'red'} />
    </View>
  );
}
