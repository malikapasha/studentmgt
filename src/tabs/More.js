/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import SplashScreen from 'react-native-splash-screen';
import React, {Fragment} from 'react';
import {View, Text, Alert, StatusBar, TouchableOpacity} from 'react-native';
import {Appbar} from 'react-native-paper';
import IconEntypo from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import GradientView from '../ui/GradientView';
import AsyncStorage from '@react-native-community/async-storage';
import {NavigationEvents} from 'react-navigation';
const TabIcon = props => (
  <Icon
    name={'more-horizontal'}
    size={25}
    color={props.focused ? 'red' : '#424242'}
  />
);
let morePermissions = {};
export default class More extends React.Component {
  static navigationOptions = {
    tabBarIcon: TabIcon,
  };
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.logoutConfirmation = this.logoutConfirmation.bind(this);
    this.getPermissions = this.getPermissions.bind(this);
  }
  componentDidMount() {
    SplashScreen.hide();
    // this.getToken();
  }
  logoutConfirmation() {
    Alert.alert(
      'Logout',
      'Are you sure!',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {text: 'OK', onPress: () => this.logout()},
      ],
      {cancelable: false},
    );
  }
  logout() {
    AsyncStorage.removeItem('@token');
    this.props.navigation.navigate('Auth');
  }
  async getPermissions() {
    try {
      const value = await AsyncStorage.getItem('@switchPermissions');
      if (value !== null) {
        morePermissions = JSON.parse(value).switched;
        // console.log(
        //   'TCL: componentDidMount -> morePermissions',
        //   morePermissions,
        // );
      } else {
      }
    } catch (e) {}
  }
  render() {
    return (
      <Fragment>
        <NavigationEvents onDidFocus={() => this.getPermissions()} />
        <StatusBar backgroundColor="red" barStyle="light-content" />
        <Appbar.Header style={{backgroundColor: 'red'}}>
          <Appbar.Content
            title="More"
            titleStyle={{color: '#fafafa', fontWeight: '600', fontSize: 24}}
            // onPress={() => this.props.navigation.navigate('SwitchWorkspaces')}
          />
          <Appbar.Content
            onPress={this.logoutConfirmation}
            title="Logout"
            style={{alignItems: 'flex-end'}}
            titleStyle={{color: '#fafafa', fontSize: 18}}
          />
        </Appbar.Header>
        <TouchableOpacity
          // onPress={() =>
          //   morePermissions
          //     ? Alert.alert(
          //         'Unauthorized Access',
          //         'You dont have this permission',
          //       )
          //     : this.props.navigation.navigate('EditWorkspace')
          // }
          style={{
            height: 50,
            borderBottomColor: '#00000010',
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 15,
            marginTop: 5,
          }}>
          <IconEntypo name={'users'} size={27} color={'rgba(255, 40, 24,1)'} />
          <View style={{flex: 1, marginLeft: 20}}>
            <Text style={{fontSize: 18, color: '#4a4a4c'}}>Workspace</Text>
          </View>
        </TouchableOpacity>
        <View style={{height: 10, marginLeft: 42}}>
          <GradientView
            title=""
            titleColor="#40c4ff"
            height={10}
            marginTop={0}
            marginHorizontal={10}
          />
        </View>

        <TouchableOpacity
          onPress={() => this.props.navigation.navigate('Settings')}
          style={{
            height: 50,
            borderBottomColor: '#00000010',
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 15,
            marginTop: 5,
          }}>
          <IconAnt name={'setting'} size={27} color={'rgba(255, 40, 24,1)'} />
          <View style={{flex: 1, marginLeft: 20}}>
            <Text style={{fontSize: 18, color: '#4a4a4c'}}>Settings</Text>
          </View>
        </TouchableOpacity>
        <View style={{height: 10, marginLeft: 42}}>
          <GradientView
            title=""
            titleColor="#40c4ff"
            height={10}
            marginTop={0}
            marginHorizontal={10}
          />
        </View>
        <TouchableOpacity
          style={{
            height: 50,
            borderBottomColor: '#00000010',
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 15,
            marginTop: 5,
          }}>
          <IconMaterial
            name={'feedback'}
            size={27}
            color={'rgba(255, 40, 24,1)'}
          />
          <View style={{flex: 1, marginLeft: 20}}>
            <Text style={{fontSize: 18, color: '#4a4a4c'}}>Send Feedback</Text>
          </View>
        </TouchableOpacity>
        <View style={{height: 10, marginLeft: 42}}>
          <GradientView
            title=""
            titleColor="#40c4ff"
            height={10}
            marginTop={0}
            marginHorizontal={10}
          />
        </View>
        <TouchableOpacity
          style={{
            height: 50,
            borderBottomColor: '#00000010',
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 15,
            marginTop: 5,
          }}>
          <IconMaterial
            name={'star-border'}
            size={27}
            color={'rgba(255, 40, 24,1)'}
          />
          <View style={{flex: 1, marginLeft: 20}}>
            <Text style={{fontSize: 18, color: '#4a4a4c'}}>Rate Us</Text>
          </View>
        </TouchableOpacity>
        <View style={{height: 10, marginLeft: 42}}>
          <GradientView
            title=""
            titleColor="#40c4ff"
            height={10}
            marginTop={0}
            marginHorizontal={10}
          />
        </View>
        <TouchableOpacity
          style={{
            height: 50,
            borderBottomColor: '#00000010',
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 15,
            marginTop: 5,
          }}>
          <IconFontAwesome
            name={'graduation-cap'}
            size={27}
            color={'rgba(255, 40, 24,1)'}
          />
          <View style={{flex: 1, marginLeft: 20}}>
            <Text style={{fontSize: 18, color: '#4a4a4c'}}>About</Text>
          </View>
        </TouchableOpacity>
        <View style={{height: 10, marginLeft: 42}}>
          <GradientView
            title=""
            titleColor="#40c4ff"
            height={10}
            marginTop={0}
            marginHorizontal={10}
          />
        </View>
      </Fragment>
    );
  }
}
