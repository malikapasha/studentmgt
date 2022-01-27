/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React from 'react';
import {Platform, Linking} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {NavigationActions} from 'react-navigation';
// token check and email workspace routing
export default class AuthLoading extends React.Component {
  constructor(props) {
    super(props);
    console.log('this', this.props);
    this.getToken();
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenURL);
  }
  handleOpenURL = event => {
    this.navigate(event.url);
  };
  navigate = url => {
    console.log('TCL: AuthLoading -> url', url);
    const {navigate} = this.props.navigation;
    // Nadir Dabit Medium
    if (url) {
      // const route = url.replace(/.*?:\/\//g, '');
      // const id = route.match(/\/([^\/]+)\/?$/)[1];
      // const routeName = route.split('/');
      // console.log('TCL: -> routeName', routeName, '=>', route);
      this.props.navigation.navigate(
        NavigationActions.navigate({
          routeName: 'Home',
          action: NavigationActions.navigate({
            routeName: 'Home',
            action: NavigationActions.navigate({
              routeName: 'More',
            }),
          }),
        }),
      );
    } else {
      navigate('Home');
    }
  };
  getToken = async () => {
    try {
      const value = await AsyncStorage.getItem('@token');
      if (value !== null) {
        if (Platform.OS === 'android') {
          Linking.getInitialURL().then(url => {
            this.navigate(url);
          });
        } else {
          Linking.addEventListener('url', this.handleOpenURL);
        }
        // this.props.navigation.navigate('Home');
      } else {
        this.props.navigation.navigate('Auth');
      }
    } catch (e) {
      this.props.navigation.navigate('Auth');
    }
  };
  render() {
    return null;
  }
}
