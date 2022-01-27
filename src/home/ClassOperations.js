/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Fragment, useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StatusBar,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
  ToastAndroid,
  Alert,
} from 'react-native';
import {
  Modal,
  Portal,
  Button,
  TextInput as TextInputPaper,
  Appbar,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import GradientView from '../ui/GradientView';
import AsyncStorage from '@react-native-community/async-storage';
import Axios from '../Axios';
import ReportsHelp from './ReportsHelp';
import moment from 'moment';
const TabIcon = props => (
  <Icon name={'doc'} size={20} color={props.focused ? '#3dafe4' : '#929292'} />
);
let didFocusSubscription = null;
let self = null;
export default class ClassOperations extends React.Component {
  static navigationOptions = {
    tabBarIcon: TabIcon,
  };
  constructor(props) {
    super(props);
    this.state = {
      studentsLength: 0,
      name: '',
      info: '',
      students: [],
      loading: false,
      showModal: false,
      sessionModal: false,
      sessionStartTime: '',
      sessionActiveId: '',
      sessionEndTime: '',
      sessionArray: [],
      weekDays: {
        sunday: false,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
      },
      reportQuestionModal: false,
    };
    this.handleBackPress = this.handleBackPress.bind(this);
    this.createSessionHandler = this.createSessionHandler.bind(this);
    this.updateSessionHandler = this.updateSessionHandler.bind(this);
    this.deleteSessionHandler = this.deleteSessionHandler.bind(this);
    this.showQuestionModal = this.showQuestionModal.bind(this);
    self = this;
  }
  showQuestionModal(visible) {
    this.setState({reportQuestionModal: visible});
  }
  _hideWeekModalChild = () => {
    self.setState({showModal: false});
  };
  _hideSessionModalChild = () => {
    self.setState({
      sessionModal: false,
      sessionEndTime: '',
      sessionStartTime: '',
      sessionActiveId: '',
    });
  };
  updateWeekDays(weekDays) {
    self.setState({showModal: false, weekDays});
  }
  handleBackPress() {
    const {showModal} = this.state;
    if (showModal) {
      self.setState({showModal: false});
      return true;
    }
    return false;
  }
  componentDidMount() {
    let a = false;
    let {
      students,
      token,
      title,
      newClass,
      info,
      session,
      weekDays,
    } = this.props.navigation.state.params;
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
    Axios.defaults.headers.common = {Authorization: `Bearer ${token}`};
    // console.warn('session', session);
    if (newClass) {
      this.setState({studentsLength: students.length, students});
    } else {
      this.setState({
        studentsLength: students.length,
        students,
        name: title,
        sessionArray: session,
        info,
        weekDays: {
          sunday: weekDays.sunday,
          monday: weekDays.monday,
          tuesday: weekDays.tuesday,
          wednesday: weekDays.wednesday,
          thursday: weekDays.thursday,
          friday: weekDays.friday,
          saturday: weekDays.saturday,
        },
      });
    }
    const self = this;
    AsyncStorage.setItem('@classStudents', JSON.stringify(students));
    didFocusSubscription = this.props.navigation.addListener('didFocus', () => {
      if (a) {
        self.getAsyncStudents();
      }
      a = true;
    });
  }
  componentWillUnmount() {
    AsyncStorage.removeItem('@classStudents');
    didFocusSubscription.remove();
    self.backHandler.remove();
  }
  getAsyncStudents = async () => {
    const self = this;
    try {
      const value = await AsyncStorage.getItem('@classStudents');
      // console.warn('didFocus val', value);
      if (value !== null) {
        let studentsAsyncData = JSON.parse(value);
        self.setState({
          studentsLength: studentsAsyncData.length,
          students: studentsAsyncData,
        });
      } else {
        ToastAndroid.show('Error: Data Not Accessible', ToastAndroid.SHORT);
      }
    } catch (e) {
      ToastAndroid.show('Error: Data Not Accessible', ToastAndroid.SHORT);
    }
  };
  updateSessionHandler(id, startTime, endTime) {
    let sessions = [...this.state.sessionArray];
    sessions = sessions.map(item => {
      if (item.id === id) {
        let obj = {id, startTime, endTime};
        return obj;
      }
      return item;
    });
    this.setState({sessionArray: sessions});
  }
  deleteSessionHandler(id) {
    this.setState({
      sessionArray: this.state.sessionArray.filter(item => item.id !== id),
      sessionModal: false,
      sessionEndTime: '',
      sessionStartTime: '',
      sessionActiveId: '',
    });
  }
  createSessionHandler(startTime, endTime) {
    let sessions = [...this.state.sessionArray];
    sessions.push({id: new Date().getTime(), startTime, endTime});
    this.setState({sessionArray: sessions});
  }
  createCLass = () => {
    const self = this;
    const {students, name, info, weekDays, sessionArray} = this.state;
    // console.log('TCL: -> sessionArray', sessionArray);

    this.setState({loading: true});
    // console.warn('cre', students, name, info);
    if (name === '' || info === '') {
      this.setState({loading: false});
      Alert.alert('Error', 'Required fields are empty');
      return;
    }
    if (students.length === 0) {
      this.setState({loading: false});
      Alert.alert('Error', 'No student added');
      return;
    }
    if (sessionArray.length === 0) {
      this.setState({loading: false});
      Alert.alert('Error', 'No sessions created');
      return;
    }
    let studentsIds = [];
    for (let i = 0; i < students.length; i++) {
      studentsIds.push(students[i].id);
    }
    Axios.post('class/create', {
      studentList: studentsIds,
      name,
      info,
      weekDays,
      sessions: sessionArray,
    })
      .then(res => {
        // console.warn('res', res);
        self.setState({loading: false});
        if (res.status === 200) {
          ToastAndroid.show('Class Created Successfully', ToastAndroid.SHORT);
          self.props.navigation.goBack();
        } else {
          ToastAndroid.show('Class Create Failed', ToastAndroid.SHORT);
          self.setState({loading: false});
        }
      })
      .catch(() => {
        // console.warn('er', err);
        ToastAndroid.show('Class Create Failed', ToastAndroid.SHORT);
        self.setState({loading: false});
      });
  };
  updateClass = () => {
    const self = this;
    this.setState({loading: true});
    let {id} = this.props.navigation.state.params;
    if (id === undefined) {
      ToastAndroid.show('Error: Something Wrong!', ToastAndroid.SHORT);
      this.props.navigation.goBack();
      return;
    }
    const {
      studentsLength,
      students,
      name,
      info,
      weekDays,
      sessionArray,
    } = this.state;
    if (name === '' || info === '') {
      this.setState({loading: false});
      Alert.alert('Error', 'Required fields are empty');
      return;
    }
    if (students.length === 0) {
      this.setState({loading: false});
      Alert.alert('Error', 'No student added');
      return;
    }
    if (sessionArray.length === 0) {
      this.setState({loading: false});
      Alert.alert('Error', 'No sessions created');
      return;
    }
    let studentsIds = [];
    for (let i = 0; i < studentsLength; i++) {
      studentsIds.push(students[i].id);
    }
    // console.warn('sessionArray', sessionArray);
    Axios.put(`class/update/${id}`, {
      studentList: studentsIds,
      name,
      info,
      weekDays,
      id,
      sessions: sessionArray,
    })
      .then(res => {
        self.setState({loading: false});
        if (res.status === 200) {
          ToastAndroid.show('Class Updated Successfully', ToastAndroid.SHORT);
          self.props.navigation.goBack();
        } else {
          ToastAndroid.show('Class Update Failed', ToastAndroid.SHORT);
        }
      })
      .catch(() => {
        // console.warn('er', err);
        ToastAndroid.show('Class Update Failed', ToastAndroid.SHORT);
        self.setState({loading: false});
      });
  };

  render() {
    let {
      title,
      newClass,
      classPermissions,
    } = this.props.navigation.state.params;
    // console.log('TCL: ClassOperations -> classPermissions', classPermissions);
    const {
      studentsLength,
      name,
      info,
      loading,
      showModal,
      weekDays,
      sessionModal,
      sessionArray,
      sessionEndTime,
      sessionStartTime,
      sessionActiveId,
      reportQuestionModal,
    } = this.state;
    return (
      <Fragment>
        {showModal && (
          <ModalWeekDays
            showModal={showModal}
            _hideWeekModalChild={this._hideWeekModalChild}
            weekDays={weekDays}
            updateWeekDays={this.updateWeekDays}
          />
        )}
        {sessionModal && (
          <ModalSessionDays
            showModal={sessionModal}
            sessionStartTime={
              sessionStartTime === '' ? '' : new Date(sessionStartTime)
            }
            sessionEndTime={
              sessionEndTime === '' ? '' : new Date(sessionEndTime)
            }
            sessionArray={sessionArray}
            _hideSessionModalChild={this._hideSessionModalChild}
            createSessionHandler={this.createSessionHandler}
            updateSessionHandler={this.updateSessionHandler}
            sessionActiveId={sessionActiveId}
            deleteSessionHandler={this.deleteSessionHandler}
          />
        )}
        <ReportsHelp
          reportQuestionModal={reportQuestionModal}
          hideModal={() => this.showQuestionModal(false)}
          component="classoperations"
        />
        <StatusBar backgroundColor="red" barStyle="light-content" />
        <Appbar.Header style={{backgroundColor: 'red'}}>
          <Appbar.Action
            icon={() => (
              <IconMaterial name={'arrow-back'} size={22} color={'#fafafa'} />
            )}
            onPress={() => this.props.navigation.goBack()}
          />
          <Appbar.Content
            title={title}
            titleStyle={{
              color: '#fafafa',
              fontWeight: '600',
              fontSize: 20,
              width: 140,
            }}
          />
          <Appbar.Action />
          <Appbar.Action />
          <Appbar.Action
            onPress={() => this.showQuestionModal(true)}
            icon={() => (
              <IconAnt name={'question'} size={24} color={'#fafafa'} />
            )}
          />
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#fafafa"
              style={{width: 48}}
            />
          ) : (
            <Appbar.Content
              onPress={() => {
                classPermissions
                  ? newClass
                    ? this.createCLass()
                    : this.updateClass()
                  : Alert.alert(
                      'Unauthorized Access',
                      'You dont have this permission',
                    );
              }}
              title={newClass ? 'Save' : 'Update'}
              style={{alignItems: 'flex-end'}}
              titleStyle={{
                color: '#fff',
                width: 70,
                fontSize: 18,
                textAlign: 'right',
              }}
            />
          )}
        </Appbar.Header>
        <View style={{flex: 1}}>
          <GradientView
            title="Class Name:"
            titleColor="#4a4a4c"
            height={18}
            marginTop={5}
            marginHorizontal={10}
          />
          <TextInput
            placeholder="Required"
            titleColor="#4a4a4c"
            style={{marginHorizontal: 15}}
            placeholderTextColor="#9e9e9e"
            value={name}
            onChangeText={e => this.setState({name: e})}
          />
          <GradientView
            title="Additional Info:"
            titleColor="#4a4a4c"
            height={18}
            marginTop={0}
            marginHorizontal={10}
          />
          <TextInput
            placeholder="Required"
            style={{marginHorizontal: 15}}
            placeholderTextColor="#9e9e9e"
            value={info}
            onChangeText={e => this.setState({info: e})}
          />
          <GradientView
            title="Class Students:"
            titleColor="#4a4a4c"
            height={18}
            marginTop={0}
            marginHorizontal={10}
          />
          <View
            style={{
              marginTop: 10,
              marginHorizontal: 10,
              borderRadius: 5,
              height: 30,
              flexDirection: 'row',
              paddingLeft: 10,
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
            onStartShouldSetResponder={() =>
              this.props.navigation.navigate('ClassStudents', {status: 'New'})
            }>
            <Text style={{fontSize: 18, fontWeight: '800', color: '#4a4a4c'}}>
              {studentsLength}
              {studentsLength > 1 ? ' students' : ' student'} (tap to manage)
            </Text>

            <IconMaterial name={'chevron-right'} size={24} color={'#3dafe4'} />
          </View>
          <GradientView
            title="Weekdays:"
            titleColor="#4a4a4c"
            height={20}
            marginTop={0}
            marginHorizontal={10}
          />
          <TouchableOpacity
            style={{
              marginTop: 10,
              marginHorizontal: 10,
              borderRadius: 5,
              height: 30,
              flexDirection: 'row',
              paddingLeft: 10,
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
            onPress={() => this.setState({showModal: true})}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '800',
                color: '#4a4a4c',
                width: '90%',
              }}>
              {Object.keys(weekDays).map(function(key) {
                return weekDays[key] ? `${key.substring(0, 3)}, ` : null;
              })}
            </Text>
            <IconMaterial name={'chevron-right'} size={24} color={'#3dafe4'} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '800',
              color: 'grey',
              marginHorizontal: 20,
            }}>
            Pick days of the week for the class.
          </Text>
          <GradientView
            title="Sessions:"
            titleColor="#4a4a4c"
            height={18}
            marginTop={10}
            marginHorizontal={10}
          />
          {sessionArray.length
            ? sessionArray.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    marginTop: 10,
                    color: '#4a4a4c',
                    marginHorizontal: 20,
                    borderRadius: 5,
                    height: 30,
                    flexDirection: 'row',
                    paddingLeft: 10,
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                  onPress={() =>
                    this.setState({
                      sessionModal: true,
                      sessionStartTime: item.startTime,
                      sessionEndTime: item.endTime,
                      sessionActiveId: item.id,
                    })
                  }>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '800',
                      color: '#4a4a4c',
                      width: '90%',
                    }}>
                    {`${
                      item.startTime === ''
                        ? 'date'
                        : moment(item.startTime).format('hh:mm a')
                    } - ${
                      item.endTime === ''
                        ? 'date'
                        : moment(item.endTime).format('hh:mm a')
                    }`}
                  </Text>
                  <IconMaterial
                    name={'more-horiz'}
                    size={24}
                    color={'#3dafe4'}
                  />
                </TouchableOpacity>
              ))
            : null}
          <Button
            icon="plus"
            mode="text"
            onPress={() =>
              this.setState({
                sessionModal: true,
                sessionEndTime: '',
                sessionStartTime: '',
                sessionActiveId: '',
              })
            }
            style={{marginHorizontal: 10, marginTop: 10}}>
            Create
          </Button>
        </View>
      </Fragment>
    );
  }
}
const ModalWeekDays = React.memo(
  ({showModal, _hideWeekModalChild, weekDays, updateWeekDays}) => {
    let [visible, setVisible] = useState(showModal);
    let [rerender, setRerender] = useState(false);
    let [weekDayState, setWeekDayState] = useState({...weekDays});
    function _hideModal() {
      setVisible(false);
      _hideWeekModalChild();
    }
    function changeWeekDay(key) {
      let modifyWeekDays = weekDayState;
      modifyWeekDays[key] = !weekDayState[key];
      setWeekDayState(modifyWeekDays);
      setRerender(!rerender);
    }
    function updateParentWeekDays() {
      updateWeekDays(weekDayState);
    }
    return (
      <Portal>
        <Modal visible={visible} onDismiss={_hideModal}>
          <View
            style={{
              backgroundColor: '#fafafa',
              height: 370,
              marginHorizontal: 40,
              flexDirection: 'column',
            }}>
            <View
              style={{
                flex: 1,
                maxHeight: 40,
                padding: 0,
                flexDirection: 'row',
              }}>
              <View
                style={{
                  flex: 1,
                  width: 100,
                  height: 40,
                  flexGrow: 1,
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: 'black',
                    fontSize: 18,
                    marginLeft: 20,
                  }}>
                  Weekdays:
                </Text>
              </View>
              <View
                style={{
                  width: 40,
                  height: 40,
                }}
              />
            </View>
            {Object.keys(weekDayState).map(function(key) {
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => changeWeekDay(key)}
                  style={{
                    flex: 1,
                    maxHeight: 40,
                    padding: 0,
                    flexDirection: 'row',
                  }}>
                  <View
                    style={{
                      flex: 1,
                      width: 100,
                      height: 40,
                      flexGrow: 1,
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        color: 'black',
                        fontSize: 18,
                        marginLeft: 20,
                      }}>
                      {key}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text>
                      {weekDayState[key] ? (
                        <IconMaterial
                          name={'check'}
                          size={25}
                          color={'#3dafe4'}
                        />
                      ) : null}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
              }}>
              <Button mode="text" onPress={_hideModal}>
                Cancel
              </Button>
              <Button mode="text" onPress={updateParentWeekDays}>
                Ok
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    );
  },
);

const ModalSessionDays = React.memo(
  ({
    showModal,
    _hideSessionModalChild,
    createSessionHandler,
    sessionStartTime,
    sessionEndTime,
    sessionActiveId,
    updateSessionHandler,
    deleteSessionHandler,
    sessionArray,
  }) => {
    let [visible, setVisible] = useState(showModal);
    let [startTime, setStartTime] = useState(sessionStartTime);
    let [endTime, setEndTime] = useState(sessionEndTime);
    let [showDate, setShowDate] = useState({
      state: false,
      dateType: null,
      pickerDate: new Date(),
    });
    function _hideModal() {
      setVisible(false);
      _hideSessionModalChild();
    }
    console.log(sessionActiveId, 'sessionArray', sessionArray);
    function createSession() {
      if (startTime === '' || endTime === '') {
        Alert.alert('Error', "Don't leave empty fields");
        return;
      }
      var momentA = moment(startTime).format('HH:mm a');
      var momentB = moment(endTime).format('HH:mm a');
      // console.log('TCL:momentA', momentA, momentB);
      if (!moment(momentA, 'HH:mm a').isBefore(moment(momentB, 'HH:mm a'))) {
        Alert.alert('Error', 'Start time is not less than end time');
        return;
      }
      for (let obj of sessionArray) {
        var objA = moment(obj.startTime).format('HH:mm a');
        var objB = moment(obj.endTime).format('HH:mm a');
        if (sessionActiveId === obj.id) {
          continue;
        }
        if (
          moment(momentA, 'HH:mm a').isSame(moment(objA, 'HH:mm a')) ||
          (moment(momentA, 'HH:mm a').isAfter(moment(objA, 'HH:mm a')) &&
            moment(momentA, 'HH:mm a').isBefore(moment(objB, 'HH:mm a')))
        ) {
          Alert.alert('Error', 'Start time exists in another session time');
          return;
        }
        if (
          moment(momentB, 'HH:mm a').isSame(moment(objB, 'HH:mm a')) ||
          (moment(momentB, 'HH:mm a').isAfter(moment(objA, 'HH:mm a')) &&
            moment(momentB, 'HH:mm a').isBefore(moment(objB, 'HH:mm a')))
        ) {
          Alert.alert('Error', 'End time exists in another session time');
          return;
        }
        if (
          moment(momentA, 'HH:mm a').isBefore(moment(objA, 'HH:mm a')) &&
          moment(momentB, 'HH:mm a').isAfter(moment(objB, 'HH:mm a'))
        ) {
          Alert.alert('Error', 'Session exists between this time');
          return;
        }
      }
      setVisible(false);
      _hideSessionModalChild();
      if (sessionActiveId) {
        updateSessionHandler(sessionActiveId, startTime, endTime);
      } else {
        createSessionHandler(startTime, endTime);
      }
    }
    function deleteHandler() {
      setVisible(false);
      deleteSessionHandler(sessionActiveId);
    }
    function datePickerHandler(event, dob) {
      setShowDate({state: false, dateType: null, pickerDate: new Date()});
      if (dob && showDate.dateType === 'start') {
        setStartTime(dob);
      }
      if (dob && showDate.dateType === 'end') {
        setEndTime(dob);
      }
    }
    return (
      <Portal>
        <Modal visible={visible} onDismiss={_hideModal}>
          <View
            style={{
              backgroundColor: '#fafafa',
              height: 200,
              marginHorizontal: 40,
              flexDirection: 'column',
            }}>
            <View
              style={{
                flex: 1,
                padding: 0,
                flexDirection: 'column',
              }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  color: 'black',
                  fontSize: 18,
                  marginHorizontal: 20,
                  marginVertical: 10,
                }}>
                Session:
              </Text>
              <View
                style={{
                  paddingHorizontal: 20,
                }}>
                <TouchableOpacity
                  style={{
                    marginTop: 5,
                    backgroundColor: '#fafafa',
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                  }}
                  onPress={() =>
                    setShowDate({
                      state: true,
                      dateType: 'start',
                      pickerDate: startTime === '' ? new Date() : startTime,
                    })
                  }>
                  <Text
                    style={{
                      fontSize: 18,
                    }}>
                    {startTime === ''
                      ? 'Select Start Time'
                      : moment(startTime).format('hh:mm a')}
                  </Text>
                </TouchableOpacity>
                {showDate.state && (
                  <DateTimePicker
                    value={showDate.pickerDate}
                    mode={'time'}
                    is24Hour={false}
                    display="default"
                    onChange={datePickerHandler}
                  />
                )}
                <TouchableOpacity
                  style={{
                    marginTop: 5,
                    backgroundColor: '#fafafa',
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                  }}
                  onPress={() =>
                    setShowDate({
                      state: true,
                      dateType: 'end',
                      pickerDate: endTime === '' ? new Date() : endTime,
                    })
                  }>
                  <Text
                    style={{
                      fontSize: 18,
                    }}>
                    {endTime === ''
                      ? 'Select End Time'
                      : moment(endTime).format('hh:mm a')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                marginTop: 10,
              }}>
              {sessionActiveId ? (
                <Button mode="text" onPress={deleteHandler}>
                  Delete
                </Button>
              ) : null}
              <Button mode="text" onPress={_hideModal}>
                Cancel
              </Button>
              <Button mode="text" onPress={createSession}>
                Ok
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    );
  },
);
