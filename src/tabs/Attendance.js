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
import {
  FlatList,
  View,
  Text,
  StatusBar,
  ToastAndroid,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {Appbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/AntDesign';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Calendar} from 'react-native-calendars';
import GradientView from '../ui/GradientView';
import Axios from '../Axios';
import orderBy from 'lodash/orderBy';
import AsyncStorage from '@react-native-community/async-storage';
import {NavigationEvents} from 'react-navigation';
import ReportsHelp from '../home/ReportsHelp';
import moment from 'moment';
import IconAnt from 'react-native-vector-icons/AntDesign';
const TabIcon = props => (
  <Icon name={'calendar'} size={25} color={props.focused ? 'red' : '#424242'} />
);

let attendancePermissions = null;
let settingAsyncStatus = 'unarchive';
export default class Attendance extends React.Component {
  static navigationOptions = {
    tabBarIcon: TabIcon,
  };
  token = null;
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      classes: [],
      selectedDate: new Date(),
      reportQuestionModal: false,
    };
    this.calenderRender = this.calenderRender.bind(this);
    this.classRender = this.classRender.bind(this);
    this.getToken = this.getToken.bind(this);
    this.getClassesListener = this.getClassesListener.bind(this);
    this.getClasses = this.getClasses.bind(this);
    this.showQuestionModal = this.showQuestionModal.bind(this);
  }
  showQuestionModal(visible) {
    this.setState({reportQuestionModal: visible});
  }
  componentDidMount() {
    SplashScreen.hide();
    // this.getToken();
  }
  getToken = async () => {
    try {
      attendancePermissions = null;
      const value = await AsyncStorage.multiGet([
        '@token',
        '@switchPermissions',
        '@settings',
      ]);
      if (value[0][1] !== null) {
        if (this.token !== value[0][1] && this.token !== null) {
          this.setState({loading: true});
        }
        this.token = value[0][1];
        attendancePermissions = JSON.parse(value[1][1]).attendancePermission;
        if (value[2][1] !== null) {
          const settingsAsync = JSON.parse(value[2][1]);
          settingAsyncStatus = settingsAsync.classArchiveSwitch;
        }
        // console.log('TCL: attendancePermissions', attendancePermissions);
        Axios.defaults.headers.common = {Authorization: `Bearer ${this.token}`};
        this.getClasses();
      } else {
        ToastAndroid.show('SignIn Expired', ToastAndroid.SHORT);
        this.props.navigation.navigate('Auth');
      }
    } catch (e) {}
  };
  getClassesListener = () => {
    if (this.token !== null) {
      this.getClasses();
    }
  };
  getClasses() {
    const {selectedDate} = this.state;
    const date = moment(selectedDate, 'YYYY/MM/DD');
    const day = date.format('dddd').toLowerCase();
    var current = moment(selectedDate, 'YYYY/MM/DD');
    let currentDate =
      current.format('YYYY') +
      '-' +
      current.format('M') +
      '-' +
      current.format('D');
    Axios.get(`class/findAttendanceClasses/?day=${day}&date=${currentDate}`)
      .then(res => {
        if (res.status === 200) {
          const classes = orderBy(res.data, ['name'], ['asc']);
          console.log(settingAsyncStatus, 'TCL:  -> classes', classes);
          // console.log(
          //   'TCL: Attendance -> getClasses -> classes',
          //   classes[1].session,
          // );
          let allClasses = [];
          let showStatus = 1;
          if (settingAsyncStatus === 'archive') {
            showStatus = 2;
          }
          if (settingAsyncStatus === 'unarchive') {
            showStatus = 1;
          }
          for (let obj of res.data) {
            if (showStatus === 2 && obj.activeStatus !== 0) {
              allClasses.push(obj);
            } else if (
              showStatus === 1 &&
              obj.activeStatus !== 0 &&
              obj.activeStatus !== 2
            ) {
              allClasses.push(obj);
            }
          }
          this.setState({loading: false, classes: allClasses});
        } else {
          ToastAndroid.show('Classes Fetch Failed', ToastAndroid.SHORT);
          this.setState({loading: false, classes: []});
        }
      })
      .catch(() => {
        this.setState({loading: false, classes: []});
      });
  }
  calenderRender(selectedDate) {
    var current = moment(new Date(), 'YYYY/MM/DD');
    var current2 = moment(selectedDate, 'YYYY/MM/DD');

    //creating date format 2000-12-12

    let currentDate =
      current.format('YYYY') +
      '-' +
      (current.format('M') < 10
        ? `0${current.format('M')}`
        : current.format('M')) +
      '-' +
      (current.format('D') < 10
        ? `0${current.format('D')}`
        : current.format('D'));
    let selectedDate2 =
      current2.format('YYYY') +
      '-' +
      (current2.format('M') < 10
        ? `0${current2.format('M')}`
        : current2.format('M')) +
      '-' +
      (current2.format('D') < 10
        ? `0${current2.format('D')}`
        : current2.format('D'));
    return (
      <Calendar
        style={{minHeight: 280}}
        onDayPress={day =>
          this.setState(
            {selectedDate: new Date(day.timestamp), loading: true},
            function() {
              this.getClassesListener();
            },
          )
        }
        monthFormat={'MMMM yyyy'}
        hideArrows={false}
        renderArrow={direction => {
          return direction === 'right' ? (
            <IconMaterial name="chevron-right" size={24} color="black" />
          ) : (
            <IconMaterial name="chevron-left" size={24} color="black" />
          );
        }}
        // Do not show days of other months in month page. Default = false
        hideExtraDays={true}
        // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out
        // day from another month that is visible in calendar page. Default = false
        // disableMonthChange={true}
        // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
        firstDay={1}
        // Hide day names. Default = false
        hideDayNames={false}
        // Show week numbers to the left. Default = false
        showWeekNumbers={false}
        markingType={'custom'}
        // Handler which gets executed when
        theme={{
          calendarBackground: '#fafafa',
          textSectionTitleColor: 'black',
          dayTextColor: 'black',
          todayTextColor: 'white',
          monthTextColor: 'grey',
          textMonthFontWeight: 'bold',
          indicatorColor: 'black',
          textDayFontSize: 10,
          textMonthFontSize: 12,
          arrowColor: 'black',
          dayHeader: {color: 'red'},
          'stylesheet.calendar.header': {
            week: {
              marginHorizontal: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
            },
          },
        }}
        markedDates={{
          //current
          [currentDate]: {
            customStyles: {
              container: {
                justifyContent: 'center',
              },
              text: {
                color: 'white',
                fontSize: 10,
                textAlignVertical: 'center',
                borderRadius: 50,
                backgroundColor: 'orange',
                width: 30,
                height: 30,
                textAlign: 'center',
              },
            },
          },
          // '2019-12-10': {disabled: true},
          [selectedDate2]: {
            customStyles: {
              container: {
                justifyContent: 'center',
              },
              text: {
                color: 'white',
                fontSize: 10,
                textAlignVertical: 'center',
                borderRadius: 50,
                backgroundColor: 'red',
                width: 30,
                height: 30,
                textAlign: 'center',
              },
            },
          },
        }}
      />
    );
  }
  classRender({name, info, status, id, session, ...rest}) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() =>
          this.props.navigation.navigate('AttendanceOperations', {
            classId: id,
            session,
            title: name,
            token: this.token,
            selectedDate: this.state.selectedDate,
            status,
            attendancePermissions,
          })
        }
        style={{
          marginTop: 10,
          marginHorizontal: 10,
          borderRadius: 5,
          minHeight: 50,
          flexDirection: 'row',
          paddingLeft: 10,
          borderColor: 'lightgrey',
          borderBottomWidth: 0.4,
        }}>
        <View
          style={{
            flex: 4,
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
        {status === 1 ? (
          <View
            style={{
              flex: 1,
              height: 50,
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingRight: 10,
            }}>
            <IconMaterialIcons name={'check'} size={25} color={'red'} />
          </View>
        ) : null}
      </TouchableOpacity>
    );
  }
  render() {
    const {classes, loading, selectedDate, reportQuestionModal} = this.state;
    return (
      <Fragment>
        <NavigationEvents onDidFocus={() => this.getToken()} />
        <ReportsHelp
          reportQuestionModal={reportQuestionModal}
          hideModal={() => this.showQuestionModal(false)}
          component="attendance"
        />
        <StatusBar backgroundColor="red" barStyle="light-content" />
        <Appbar.Header style={{backgroundColor: 'red'}}>
          <Appbar.Content
            title="Attendance"
            titleStyle={{color: '#fafafa', fontWeight: '600', fontSize: 24}}
          />
          <Appbar.Action
            onPress={() => this.showQuestionModal(true)}
            icon={() => (
              <IconAnt name={'question'} size={24} color={'#fafafa'} />
            )}
          />
        </Appbar.Header>
        <View style={{flex: 1}}>
          {this.calenderRender(selectedDate)}
          <GradientView
            title="classes"
            titleColor="#4a4a4c"
            height={25}
            marginTop={0}
            marginHorizontal={10}
          />
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
              endFillColor="green"
              renderItem={({item}) => this.classRender(item)}
              keyExtractor={item => item.name}
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
