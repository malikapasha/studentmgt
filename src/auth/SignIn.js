/* eslint-disable react-native/no-inline-styles */
import SplashScreen from 'react-native-splash-screen';
import React, {Fragment} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ToastAndroid,
  Alert,
} from 'react-native';
import {Button, TextInput} from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';

import Axios from '../Axios';
export default class SignIn extends React.Component {
  constructor() {
    super();
    this.state = {
      email: 'ehtisham@gmail.com',
      password: 'Qwerty123+',
      errorEmail: false,
      errorPass: false,
      signIn: true,
      loading: false,
      blurEmail: false,
      blurPass: false,
    };
    this.textInputComponent = this.textInputComponent.bind(this);
    this.loginHandler = this.loginHandler.bind(this);
    this.validateEmail = this.validateEmail.bind(this);
    this.validatePass = this.validatePass.bind(this);
  }
  componentDidMount() {
    SplashScreen.hide();
  }
  validatePass(text) {
    this.setState({password: text, errorPass: text.length > 3 ? false : true});
  }
  validateEmail(text) {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(text) === false) {
      // console.log('Email is Not Correct');
      this.setState({email: text, errorEmail: true});
      return false;
    } else {
      this.setState({email: text, errorEmail: false});
      // console.log('Email is Correct');
    }
  }
  textInputComponent(label, stateName) {
    return (
      <View style={[styles.inputContainer]}>
        <TextInput
          label={label}
          mode="flat"
          underlineColor={
            stateName === 'email'
              ? this.state.blurEmail && this.state.errorEmail
                ? 'red'
                : 'darkgrey'
              : this.state.blurPass && this.state.errorPass
              ? 'red'
              : 'darkgrey'
          }
          selectionColor={'pink'}
          secureTextEntry={stateName === 'password' ? true : false}
          style={[styles.inputBG]}
          onChangeText={text => {
            stateName === 'email'
              ? this.validateEmail(text)
              : this.validatePass(text);
          }}
          onFocus={() =>
            this.setState(
              stateName === 'email' ? {blurEmail: false} : {blurPass: false},
            )
          }
          onBlur={() =>
            this.setState(
              stateName === 'email' ? {blurEmail: true} : {blurPass: true},
            )
          }
          value={this.state[`${stateName}`]}
          theme={{
            colors: {
              primary: 'darkgrey',
            },
          }}
        />
      </View>
    );
  }
  loginHandler() {
    const {email, password, signIn, errorEmail, errorPass} = this.state;
    if (errorEmail) {
      Alert.alert('Error', 'Please Enter Proper Email');
      return;
    }
    if (errorPass) {
      Alert.alert('Error', 'Password minimum length is 4');
      return;
    }
    this.setState({loading: true});
    if (signIn) {
      this.loginRequest(email, password);
    } else {
      this.signUpRequest(email, password);
    }
  }
  loginRequest = (email, password) => {
    Axios.post('user/login', {email, password})
      .then(res => {
        this.setState({loading: false});
        if (res.status === 200) {
          ToastAndroid.show('Login Success', ToastAndroid.SHORT);
          AsyncStorage.setItem('@token', res.data.token);
          AsyncStorage.setItem('@userId', res.data.user.id.toString());
          AsyncStorage.setItem('@email', res.data.user.email);
          AsyncStorage.setItem(
            '@copyUser',
            JSON.stringify({
              token: res.data.token,
              userId: res.data.user.id.toString(),
              email: res.data.user.email,
            }),
          );
          AsyncStorage.setItem(
            '@switchPermissions',
            JSON.stringify({
              currentWorkspace: 'none',
              attendancePermission: true,
              classPermission: true,
              studentPermission: true,
              switched: false,
            }),
          );
          // console.log('TCL: SignIn -> loginRequest -> res.data', res.data);
          AsyncStorage.setItem(
            '@settings',
            JSON.stringify({classArchiveSwitch: 'unarchive'}),
          );
          this.props.navigation.navigate('Home');
        } else {
          ToastAndroid.show('Login Failed', ToastAndroid.SHORT);
        }
      })
      .catch(() => {
        ToastAndroid.show('Login Failed', ToastAndroid.SHORT);
        this.setState({loading: false});
      });
  };
  signUpRequest = (email, password) => {
    Axios.post('user/signup', {email, password})
      .then(res => {
        this.setState({loading: false});
        if (res.status === 200) {
          ToastAndroid.show('Account Created Successfully', ToastAndroid.LONG);
        } else {
          ToastAndroid.show('Account Create Failed', ToastAndroid.SHORT);
        }
      })
      .catch(() => {
        ToastAndroid.show('Account Create Failed', ToastAndroid.SHORT);
        this.setState({loading: false});
      });
  };
  render() {
    const {signIn, loading} = this.state;
    return (
      <ScrollView
        contentContainerStyle={{flex: 1}}
        style={{flex: 1, backgroundColor: '#fafafa'}}>
        <StatusBar backgroundColor="grey" barStyle="light-content" />
        <View style={{flex: 1, minHeight: 400}}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 30,
            }}>
            <View
              style={[
                styles.card,
                {
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'red',
                  borderRadius: 20,
                  height: 110,
                  width: 120,
                },
              ]}>
              <Image
                resizeMode="contain"
                source={require('../../assets/splashred.png')}
                style={{
                  height: 70,
                  width: 70,
                }}
              />
            </View>
          </View>
          <View style={{flex: 1, paddingHorizontal: 55}}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                marginTop: 10,
              }}>
              {this.textInputComponent('Email', 'email')}
              {this.textInputComponent('Password', 'password')}
            </View>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 3,
                width: '100%',
                marginTop: 18,
              }}>
              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="white"
                  style={[
                    styles.card,
                    {
                      justifyContent: 'center',
                      backgroundColor: 'red',
                      height: 50,
                      width: '100%',
                      borderRadius: 7,
                    },
                  ]}
                />
              ) : (
                <Button
                  style={[
                    styles.card,
                    {
                      justifyContent: 'center',
                      backgroundColor: 'red',
                      height: 50,
                      width: '100%',
                      borderRadius: 7,
                    },
                  ]}
                  dark={true}
                  labelStyle={{fontSize: 14}}
                  mode="contained"
                  onPress={this.loginHandler}>
                  <Text
                    style={{
                      textTransform: 'capitalize',
                      fontSize: 16,
                      letterSpacing: 0,
                    }}>
                    {signIn ? `Log In` : `Sign Up`}
                  </Text>
                </Button>
              )}
              {signIn ? (
                <Text
                  style={{
                    color: 'grey',
                    marginTop: 10,
                    alignSelf: 'flex-start',
                    fontSize: 16,
                  }}>
                  Forgot password?
                </Text>
              ) : null}
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBotom: 20,
            height: 50,
          }}>
          <Text style={{color: 'black', fontSize: 16}}>
            {signIn ? `Don't have an account? ` : `Have an account? `}
          </Text>
          <TouchableOpacity onPress={() => this.setState({signIn: !signIn})}>
            <Text style={{color: 'red', fontSize: 16}}>
              {signIn ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  inputBG: {
    backgroundColor: '#fafafa',
    height: 50,
    overflow: 'hidden',
    width: '100%',
  },
  inputContainer: {
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  card: {
    shadowColor: 'rgba(255, 0, 0, 0.07)',
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
    borderBottomWidth: 1,
  },
});
