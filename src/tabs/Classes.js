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
  Alert,
} from 'react-native';
import {Button, Appbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-community/async-storage';
import {NavigationEvents} from 'react-navigation';
import Axios from '../Axios';
import ReportsHelp from '../home/ReportsHelp';
import Menu, {MenuItem} from 'react-native-material-menu';
const TabIcon = props => (
  <Icon name={'doc'} size={20} color={props.focused ? 'red' : '#424242'} />
);
let tokenizer = null;
let settings = 'unarchive';
let classPermissions = null;
export default class Classes extends React.Component {
  static navigationOptions = {
    tabBarIcon: TabIcon,
  };
  constructor(props) {
    super(props);
    this.state = {classes: [], loading: true, reportQuestionModal: false};
    this.classRender = this.classRender.bind(this);
    this.delete = this.delete.bind(this);
    this.filterClass = this.filterClass.bind(this);
    this.showQuestionModal = this.showQuestionModal.bind(this);
  }
  showQuestionModal(visible) {
    this.setState({reportQuestionModal: visible});
  }
  _menu = {};
  setMenuRef = (id, ref) => {
    this._menu[id] = ref;
  };

  hideMenu = (id, activeStatus) => {
    this._menu[id].hide();
    this.delete(id, activeStatus);
  };
  showMenu = id => {
    this._menu[id].show();
  };
  getToken = async () => {
    const self = this;
    try {
      classPermissions = null;
      const value = await AsyncStorage.multiGet([
        '@token',
        '@settings',
        '@switchPermissions',
      ]);
      // console.log('TCL:  getToken   ', value);
      if (value[0][1] !== null) {
        if (tokenizer !== value[0][1] && tokenizer !== null) {
          this.setState({loading: true});
        }
        tokenizer = value[0][1];
        classPermissions = JSON.parse(value[2][1]).classPermission;
        // console.log('TCL: classPermissions', classPermissions);
        if (value[1][1] !== null) {
          const settingsAsync = JSON.parse(value[1][1]);
          settings = settingsAsync.classArchiveSwitch;
        }
        this.getClasses();
      } else {
        ToastAndroid.show('SignIn Expired', ToastAndroid.SHORT);
        self.props.navigation.navigate('Auth');
      }
    } catch (e) {}
  };
  // getClassesListener = async () => {
  //   if (tokenizer !== null) {
  //     try {
  //       const value = await AsyncStorage.getItem('@settings');
  //       if (value !== null) {
  //         settings = JSON.parse(value);
  //         if (settings.classArchiveSwitch === 'archive') {
  //           settings = 'archive';
  //         } else if (settings.classArchiveSwitch === 'unarchive') {
  //           settings = 'unarchive';
  //         }
  //         this.getClasses();
  //       }
  //     } catch (e) {}
  //   }
  // };
  getClasses() {
    const self = this;
    Axios.defaults.headers.common = {Authorization: `Bearer ${tokenizer}`};
    Axios.get(`class/findAll?activeStatus=${settings}`)
      .then(res => {
        // console.log('TCL: Classes -> getClasses -> res', res.data.length);
        if (res.status === 200) {
          self.setState({loading: false, classes: res.data});
        } else {
          ToastAndroid.show('Classes Fetch Failed', ToastAndroid.SHORT);
          self.setState({loading: false, classes: []});
        }
      })
      .catch(() => {
        ToastAndroid.show('Classes Fetch Failed', ToastAndroid.SHORT);
        self.setState({loading: false, classes: []});
      });
  }
  filterClass = id => {
    let classes = [...this.state.classes];
    let filteredClasses = classes.filter(item => item.id !== id);
    this.setState({loading: false, classes: filteredClasses});
  };
  delete(id, activeStatus) {
    Axios.put(`class/statusUpdate/${id}?activeStatus=${activeStatus}`)
      .then(res => {
        if (res.status === 200) {
          let classes = [...this.state.classes];
          let message = '';
          if (activeStatus === 0) {
            message = 'Class Deleted Sucessfully';
            this.filterClass(id);
          } else if (activeStatus === 1) {
            message = 'Class UnArchived Sucessfully';
            // console.log(classes, id);
            if (settings === 'archive') {
              const newClasses = classes.map(classItem => {
                if (classItem.id === id) {
                  classItem.activeStatus = 1;
                  return classItem;
                }
                return classItem;
              });
              this.setState({loading: false, classes: newClasses});
            }
          } else if (activeStatus === 2) {
            message = 'Class Archived Sucessfully';
            if (settings === 'unarchive') {
              this.filterClass(id);
            }
            if (settings === 'archive') {
              const newClasses = classes.map(classItem => {
                if (classItem.id === id) {
                  classItem.activeStatus = 2;
                  return classItem;
                }
                return classItem;
              });
              this.setState({loading: false, classes: newClasses});
            }
          }
          ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
          ToastAndroid.show('Operation Failed', ToastAndroid.SHORT);
          this.setState({loading: false});
        }
      })
      .catch(() => {
        ToastAndroid.show('Operation Failed', ToastAndroid.SHORT);
        this.setState({loading: false});
      });
  }
  classRender({id, name, info, student, activeStatus, session, ...weekDays}) {
    // console.log(session, 'TCL: classRender -> weekDays');
    return (
      <Menu
        ref={r => this.setMenuRef(id, r)}
        button={
          <TouchableOpacity
            onLongPress={() => this.showMenu(id)}
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
            onPress={() =>
              this.props.navigation.navigate('ClassOperation', {
                title: name,
                newClass: false,
                students: student,
                token: tokenizer,
                id,
                session,
                weekDays,
                info,
                classPermissions,
              })
            }>
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
              <Text
                style={{fontSize: 16, fontWeight: '800', color: 'lightgray'}}>
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
        }>
        <MenuItem onPress={() => this.hideMenu(id, 0)}>Delete {name}</MenuItem>
        {activeStatus === 1 && (
          <MenuItem onPress={() => this.hideMenu(id, 2)}>
            Achive {name}
          </MenuItem>
        )}
        {activeStatus === 2 && (
          <MenuItem onPress={() => this.hideMenu(id, 1)}>
            UnAchive {name}
          </MenuItem>
        )}
      </Menu>
    );
  }
  render() {
    const {classes, loading, reportQuestionModal} = this.state;
    return (
      <Fragment>
        <NavigationEvents onDidFocus={() => this.getToken()} />
        <ReportsHelp
          reportQuestionModal={reportQuestionModal}
          hideModal={() => this.showQuestionModal(false)}
          component="classes"
        />
        <StatusBar backgroundColor="red" barStyle="light-content" />
        <Appbar.Header style={{backgroundColor: 'red'}}>
          <Appbar.Content
            title="Classes"
            titleStyle={{color: '#fafafa', fontWeight: '600', fontSize: 24}}
          />
          <Appbar.Action
            onPress={() => this.showQuestionModal(true)}
            icon={() => (
              <IconAnt name={'question'} size={24} color={'#fafafa'} />
            )}
          />
          <Appbar.Action
            onPress={() =>
              classPermissions
                ? this.props.navigation.navigate('ClassOperation', {
                    title: 'New Class',
                    newClass: true,
                    students: [],
                    token: tokenizer,
                    classPermissions,
                  })
                : Alert.alert(
                    'Unauthorized Access',
                    'You dont have this permission',
                  )
            }
            icon={() => <IconAnt name={'plus'} size={24} color={'#fafafa'} />}
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
            <FlatList
              data={classes}
              renderItem={({item}) => this.classRender(item)}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={{
                flexGrow: 1,
              }}
            />
          )}
        </View>
      </Fragment>
    );
  }
}
