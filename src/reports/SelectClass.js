/* eslint-disable consistent-this */
/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Fragment} from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ToastAndroid,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {Button, Appbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-community/async-storage';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import Axios from '../Axios';
const TabIcon = props => (
  <Icon name={'doc'} size={20} color={props.focused ? 'red' : '#424242'} />
);
let tokenizer = null;
let setng = 'unarchive';
export default class SelectClass extends React.Component {
  static navigationOptions = {
    tabBarIcon: TabIcon,
  };
  constructor(props) {
    super(props);
    this.state = {classes: [], loading: true};
    this.classRender = this.classRender.bind(this);
    this.saveClassId = this.saveClassId.bind(this);
    this.getClasses = this.getClasses.bind(this);
  }
  componentDidMount() {
    this.getToken();
  }
  getToken = async () => {
    const self = this;
    try {
      const value = await AsyncStorage.multiGet(['@token', '@settings']);
      if (value[0][1] !== null) {
        this.setState({loading: true});
        if (value[1][1] !== null) {
          const settingsAsync = JSON.parse(value[1][1]);
          setng = settingsAsync.classArchiveSwitch;
        }
        Axios.defaults.headers.common = {
          Authorization: `Bearer ${value[0][1]}`,
        };

        this.getClasses();
      } else {
        ToastAndroid.show('SignIn Expired', ToastAndroid.SHORT);
        self.props.navigation.navigate('Auth');
      }
    } catch (e) {
      console.log(e, 'ee');
    }
  };
  getClasses() {
    const self = this;
    console.log('s', setng);
    Axios.get(`class/findAll?activeStatus=${setng}`)
      .then(res => {
        // console.log('TCL: Classes -> getClasses -> res', res.data.length);
        if (res.status === 200) {
          self.setState({loading: false, classes: res.data});
        } else {
          ToastAndroid.show('Classes Fetch Failed', ToastAndroid.SHORT);
          self.setState({loading: false, classes: []});
        }
      })
      .catch(e => {
        console.log('errorget', e);
        ToastAndroid.show('Classes Fetch Failed', ToastAndroid.SHORT);
        self.setState({loading: false, classes: []});
      });
  }
  async saveClassId(id, name, info, student) {
    let {studentReports, studentObj} = this.props.navigation.state.params;
    if (studentReports) {
      studentObj = {
        id: null,
        firstName: '',
        lastName: '',
        studentClassAsync: {id, name, info, student},
      };
      await AsyncStorage.setItem('@studentAsync', JSON.stringify(studentObj));
      this.props.navigation.goBack();
      return;
    }
    await AsyncStorage.setItem('@classAsync', JSON.stringify({id, name, info}));
    this.props.navigation.goBack();
  }
  saveAllClasses = async () => {
    let {studentReports, studentObj} = this.props.navigation.state.params;
    studentObj = {
      id: null,
      firstName: '',
      lastName: '',
      studentClassAsync: 'All Classes',
    };
    await AsyncStorage.setItem('@studentAsync', JSON.stringify(studentObj));
    this.props.navigation.goBack();
    return;
  };
  classRender({id, name, info, student, activeStatus, session, ...weekDays}) {
    // console.log('TCL: ->  ', student, name, info);
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={{
          marginTop: 10,
          marginHorizontal: 10,
          borderRadius: 5,
          minHeight: 50,
          flexDirection: 'row',
          paddingLeft: 10,
          borderColor: 'lightgrey',
          borderBottomWidth: 0.4,
        }}
        onPress={() => this.saveClassId(id, name, info, student)}>
        <View
          style={{
            flex: 3,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}>
          <Text style={{fontSize: 20, fontWeight: '800', color: '#4a4a4c'}}>
            {name}
          </Text>
          <Text style={{fontSize: 16, fontWeight: '800', color: 'lightgray'}}>
            {info}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            height: 50,
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingRight: 10,
          }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '800',
              color: '#4a4a4c',
              width: 100,
              textAlign: 'right',
            }}>
            {`${student.length} `}
            {student.length > 1 ? 'students  ' : 'student'}
            {activeStatus === 2 && (
              <IconIonicons name={'md-archive'} size={30} color={'red'} />
            )}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
  render() {
    const {classes, loading} = this.state;
    let {studentReports, studentObj} = this.props.navigation.state.params;
    return (
      <Fragment>
        <StatusBar backgroundColor="red" barStyle="light-content" />
        <Appbar.Header style={{backgroundColor: 'red'}}>
          <Appbar.Action
            icon={() => (
              <IconMaterial name={'arrow-back'} size={22} color={'#fafafa'} />
            )}
            onPress={() => this.props.navigation.goBack()}
          />
          <Appbar.Content
            title="Select Class"
            titleStyle={{color: '#fafafa', fontWeight: '600', fontSize: 24}}
          />
        </Appbar.Header>
        <View style={{flex: 1}}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="red"
              style={{
                marginTop: 10,
              }}
            />
          ) : !classes.length ? (
            <Text style={{marginLeft: 20, marginTop: 10}}>
              No Classes Found
            </Text>
          ) : (
            <Fragment>
              {studentReports ? (
                <TouchableOpacity
                  activeOpacity={1}
                  style={{
                    marginTop: 10,
                    marginHorizontal: 10,
                    borderRadius: 5,
                    minHeight: 50,
                    flexDirection: 'row',
                    paddingLeft: 10,
                    borderColor: 'lightgrey',
                    borderBottomWidth: 0.4,
                  }}
                  onPress={() => this.saveAllClasses()}>
                  <View
                    style={{
                      flex: 3,
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                    }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: '800',
                        color: '#4a4a4c',
                      }}>
                      All Classes
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : null}
              <FlatList
                data={classes}
                renderItem={({item}) => this.classRender(item)}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{
                  flexGrow: 1,
                }}
              />
            </Fragment>
          )}
        </View>
      </Fragment>
    );
  }
}
