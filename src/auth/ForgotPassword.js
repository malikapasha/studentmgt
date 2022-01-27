/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {StyleSheet, StatusBar, View} from 'react-native';
import {Button, Searchbar, Title} from 'react-native-paper';
export default class ForgotPassword extends React.Component {
  constructor() {
    super();
    this.state = {email: '', error: false};
  }
  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'black'}}>
        <StatusBar backgroundColor="#121211" barStyle="light-content" />
        <View
          style={{
            marginTop: 30,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Title style={{color: 'white'}}>Forgot Password</Title>
        </View>
        <View style={{flex: 3, paddingHorizontal: 20}}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 3,
              paddingTop: 10,
              width: '100%',
            }}>
            <Searchbar
              icon={() => <Icon name="user" size={22} color="grey" />}
              placeholder="Email"
              style={[
                styles.card,
                styles.inputBG,
                this.state.error === true ? styles.errorInput : {},
              ]}
              onChangeText={name => this.setState({name})}
              value={this.state.name}
            />
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 3,
              width: '100%',
            }}>
            <Button
              style={[
                styles.card,
                {
                  marginTop: 20,
                  justifyContent: 'center',
                  backgroundColor: '#cc8400',
                  height: 50,
                  width: '100%',
                  borderRadius: 3,
                },
              ]}
              dark={true}
              labelStyle={{fontSize: 20}}
              mode="contained">
              Forgot Password
            </Button>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputBG: {
    backgroundColor: 'white',
    borderRadius: 3,
    height: 50,
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
    borderColor: 'black',
  },
  card: {
    shadowColor: 'rgba(0, 0, 0, 0.07)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  errorInput: {
    borderColor: 'red',
    borderWidth: 1,
  },
});
