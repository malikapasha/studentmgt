/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, {Fragment} from 'react';
import {View, Text, StatusBar, TouchableOpacity} from 'react-native';
import {Appbar, Switch} from 'react-native-paper';
import IconEntypo from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/Feather';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import GradientView from '../ui/GradientView';
import AsyncStorage from '@react-native-community/async-storage';
const TabIcon = props => (
  <Icon
    name={'more-horizontal'}
    size={25}
    color={props.focused ? 'red' : '#929292'}
  />
);

export default class Settings extends React.Component {
  static navigationOptions = {
    tabBarIcon: TabIcon,
  };
  constructor(props) {
    super(props);
    this.state = {
      classArchiveSwitch: false,
      sort: false,
      settings: {},
    };
    this.asyncClassArchive = this.asyncClassArchive.bind(this);
    this.renderGradient = this.renderGradient.bind(this);
    this.renderSwitchSection = this.renderSwitchSection.bind(this);
    this.changeSwitchState = this.changeSwitchState.bind(this);
  }
  async componentDidMount() {
    try {
      const value = await AsyncStorage.getItem('@settings');
      if (value !== null) {
        const settings = JSON.parse(value);
        // console.log('TCL: componentDidMount -> settings', settings);
        let classSwitch = false;
        if (settings.classArchiveSwitch === 'archive') {
          classSwitch = true;
        }
        this.setState({classArchiveSwitch: classSwitch, settings});
      }
    } catch (e) {}
  }
  asyncClassArchive(switchValue) {
    let settings = {...this.state.settings};
    let classSwitch = 'unarchive';
    if (switchValue === false) {
      classSwitch = 'archive';
    }
    settings.classArchiveSwitch = classSwitch;
    this.setState({settings, classArchiveSwitch: !switchValue});
    AsyncStorage.setItem('@settings', JSON.stringify(settings));
  }
  changeSwitchState(name, switchValue) {
    if (name === 'classArchiveSwitch') {
      this.asyncClassArchive(switchValue);
    }
    // this.setState({[`${name}`]: !switchValue});
  }
  renderGradient(title) {
    return (
      <View style={{height: 14}}>
        <GradientView
          title={title}
          titleColor="#4a4a4c"
          height={14}
          marginTop={0}
          marginHorizontal={10}
        />
      </View>
    );
  }
  renderSwitchSection(text, name, switchValue) {
    return (
      <View
        style={{
          height: 50,
          borderBottomColor: '#00000010',
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 5,
          marginHorizontal: 20,
        }}>
        <View style={{flex: 1}}>
          <Text style={{fontSize: 18, color: '#4a4a4c'}}>{text}</Text>
        </View>
        <Switch
          color="red"
          value={switchValue}
          onValueChange={() => this.changeSwitchState(name, switchValue)}
        />
      </View>
    );
  }
  render() {
    const {classArchiveSwitch, sort} = this.state;
    return (
      <Fragment>
        <StatusBar backgroundColor="red" barStyle="light-content" />
        <Appbar.Header style={{backgroundColor: 'red'}}>
          <Appbar.Action
            icon={() => (
              <IconMaterial name={'arrow-back'} size={24} color={'#fafafa'} />
            )}
            onPress={() => this.props.navigation.goBack()}
          />
          <Appbar.Content
            title="Settings"
            titleStyle={{color: '#fafafa', fontWeight: '600', fontSize: 24}}
          />
        </Appbar.Header>
        {this.renderGradient('Students')}
        {this.renderSwitchSection('Sort By Last Name', 'sort', sort)}
        {this.renderGradient('Classes')}
        {this.renderSwitchSection(
          'Show Archived Classes',
          'classArchiveSwitch',
          classArchiveSwitch,
        )}
      </Fragment>
    );
  }
}
