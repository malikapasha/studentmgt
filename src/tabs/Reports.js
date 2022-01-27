/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/react-in-jsx-scope */
import React, {Fragment} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {FAB, Appbar, Button, Dialog, Portal} from 'react-native-paper';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import GradientView from '../ui/GradientView';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-community/async-storage';
import {NavigationEvents} from 'react-navigation';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import ReportsHelp from '../home/ReportsHelp';
// import PaymentModal from '../home/PaymentModal';
import Modal from 'react-native-modal';
let userToken = null;
const TabIcon = props => (
  <Icon name={'graph'} size={20} color={props.focused ? 'red' : '#424242'} />
);
export default class Reports extends React.Component {
  static navigationOptions = {
    tabBarIcon: TabIcon,
  };
  constructor(props) {
    super(props);
    this.state = {
      fabActive: 1,
      startDate: new Date(),
      endDate: new Date(),
      showStartDate: false,
      showEndDate: false,
      classObj: {id: null, name: '', info: ''},
      studentObj: {
        id: null,
        firstName: '',
        lastName: '',
        studentClassAsync: null,
      },
      reportQuestionModal: false,
      visible: true,
      loading: true,
    };
    this._dailyReport = this._dailyReport.bind(this);
    this._studentReport = this._studentReport.bind(this);
    this._classReport = this._classReport.bind(this);
    this.datePickerHandler = this.datePickerHandler.bind(this);
    this.getToken = this.getToken.bind(this);
    this.getClassAsync = this.getClassAsync.bind(this);
    this.getStudentAsync = this.getStudentAsync.bind(this);
    this.classReportNavigation = this.classReportNavigation.bind(this);
    this.studentReportNavigation = this.studentReportNavigation.bind(this);
    this.dailyReportNavigation = this.dailyReportNavigation.bind(this);
    this.showQuestionModal = this.showQuestionModal.bind(this);
    this.paymentModalVisibility = this.paymentModalVisibility.bind(this);
  }
  showQuestionModal(visible) {
    this.setState({reportQuestionModal: visible});
  }
  async componentDidMount() {
    try {
      await AsyncStorage.removeItem('@studentAsync');
      await AsyncStorage.removeItem('@classAsync');
      this.getToken();
    } catch (ex) {
      this.getToken();
      // console.log('TCL: ex', ex);
    }
  }
  getListener = async () => {
    if (userToken !== null) {
      this.getClassAsync();
      this.getStudentAsync();
    }
    try {
      const value = await AsyncStorage.getItem('@payment');
      if (value !== null) {
        userToken = value;
        this.setState({visible: false, loading: false});
      } else {
        this.setState({visible: true, loading: false});
      }
    } catch (e) {
      this.setState({visible: true, loading: false});
    }
  };
  async componentWillUnmount() {
    await AsyncStorage.removeItem('@classAsync');
    await AsyncStorage.removeItem('@studentAsync');
  }
  getToken = async () => {
    try {
      const value = await AsyncStorage.getItem('@token');
      if (value !== null) {
        userToken = value;
      } else {
      }
    } catch (e) {}
  };
  async getClassAsync() {
    try {
      const value = await AsyncStorage.getItem('@classAsync');
      if (value !== null) {
        const parsed = JSON.parse(value);
        console.log('TCL: getClassAsync -> parsed', parsed);
        if (parsed) {
          this.setState({
            classObj: {id: parsed.id, name: parsed.name, info: parsed.info},
          });
        }
      } else {
        this.setState({classObj: {id: null, name: ''}});
      }
    } catch (e) {
      this.setState({classObj: {id: null, name: ''}});
    }
  }
  async getStudentAsync() {
    try {
      const value = await AsyncStorage.getItem('@studentAsync');
      if (value !== null) {
        const parsed = JSON.parse(value);
        // console.log('TCL: getStudentAsync -> parsed', parsed);
        if (parsed) {
          this.setState({
            studentObj: {
              id: parsed.id,
              firstName: parsed.firstName,
              lastName: parsed.lastName,
              studentClassAsync: parsed.studentClassAsync,
            },
          });
        }
      } else {
        this.setState({
          studentObj: {
            id: null,
            firstName: '',
            lastName: '',
            studentClassAsync: null,
          },
        });
      }
    } catch (e) {
      this.setState({
        studentObj: {
          id: null,
          firstName: '',
          lastName: '',
          studentClassAsync: null,
        },
      });
    }
  }
  dailyReportNavigation(startDate, endDate) {
    var momentA = moment(startDate).format('DD.MM.YYYY');
    var momentB = moment(endDate).format('DD.MM.YYYY');
    if (moment(momentA, 'DD.MM.YYYY').isAfter(moment(momentB, 'DD.MM.YYYY'))) {
      alert('Error: start date greator than end date');
      return;
    } else {
      this.props.navigation.navigate('DailyReports', {
        userToken,
        startDate,
        endDate,
      });
    }
  }
  studentReportNavigation(studentObj, startDate, endDate) {
    var momentA = moment(startDate).format('DD.MM.YYYY');
    var momentB = moment(endDate).format('DD.MM.YYYY');
    if (moment(momentA, 'DD.MM.YYYY').isAfter(moment(momentB, 'DD.MM.YYYY'))) {
      Alert.alert('Error', 'start date greator than end date');
      return;
    } else {
      if (studentObj.studentClassAsync === null) {
        Alert.alert('Error', 'Please Select Class');
        return;
      }
      if (studentObj)
        studentObj.id
          ? this.props.navigation.navigate('StudentReports', {
              userToken,
              startDate,
              endDate,
              studentObj,
            })
          : Alert.alert('Error', 'Please Select Student');
    }
  }
  classReportNavigation(classObj, startDate, endDate) {
    var momentA = moment(startDate).format('DD.MM.YYYY');
    var momentB = moment(endDate).format('DD.MM.YYYY');
    if (moment(momentA, 'DD.MM.YYYY').isAfter(moment(momentB, 'DD.MM.YYYY'))) {
      alert('Error: start date greator than end date');
      return;
    } else {
      classObj.id
        ? this.props.navigation.navigate('ClassReports', {
            userToken,
            startDate,
            endDate,
            classObj,
          })
        : alert('Please Select Class');
    }
  }
  _dailyReport(startDate, endDate) {
    return (
      <View style={{flex: 1}}>
        <GradientView
          title=""
          titleColor="#40c4ff"
          height={20}
          marginTop={0}
          marginHorizontal={0}
        />
        <TouchableOpacity
          style={{
            height: 50,
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingLeft: 20,
          }}>
          <Text style={{fontSize: 18, color: 'grey'}}>
            Select start and end dates for the report
          </Text>
        </TouchableOpacity>
        <GradientView
          title=""
          titleColor="#40c4ff"
          height={20}
          marginTop={0}
          marginHorizontal={0}
        />
        <TouchableOpacity
          onPress={() => this.setState({showTypeDate: 'start'})}
          style={{
            height: 40,
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            marginHorizontal: 20,
          }}>
          <Text style={{fontSize: 18}}>Start Date:</Text>
          <Text style={{fontSize: 18}}>
            {moment(startDate).year()}-{moment(startDate).month() + 1}-
            {moment(startDate).date()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.setState({showTypeDate: 'end'})}
          style={{
            height: 40,
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            marginHorizontal: 20,
          }}>
          <Text style={{fontSize: 18}}>End Date:</Text>
          <Text style={{fontSize: 18}}>
            {moment(endDate).year()}-{moment(endDate).month() + 1}-
            {moment(endDate).date()}
          </Text>
        </TouchableOpacity>
        <GradientView
          title=""
          titleColor="#40c4ff"
          height={20}
          marginTop={0}
          marginHorizontal={0}
        />
        <Button
          mode="contained"
          onPress={() => this.dailyReportNavigation(startDate, endDate)}
          uppercase={false}
          style={{
            marginTop: 20,
            alignSelf: 'center',
            width: 110,
          }}>
          Continue
        </Button>
      </View>
    );
  }
  _studentReport(startDate, endDate) {
    const {studentObj} = this.state;
    return (
      <View style={{flex: 1}}>
        <GradientView
          title=""
          titleColor="#40c4ff"
          height={20}
          marginTop={0}
          marginHorizontal={0}
        />
        <TouchableOpacity
          onPress={() =>
            this.props.navigation.navigate('SelectClass', {
              studentReports: true,
              studentObj,
            })
          }
          style={{
            height: 50,
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            marginHorizontal: 20,
          }}>
          <Text style={{fontSize: 18, color: 'grey'}}>
            {studentObj.studentClassAsync
              ? studentObj.studentClassAsync.name
                ? studentObj.studentClassAsync.name
                : 'All Classes'
              : 'Press to select class for your report'}
          </Text>
        </TouchableOpacity>
        <GradientView
          title=""
          titleColor="#40c4ff"
          height={20}
          marginTop={0}
          marginHorizontal={0}
        />
        <TouchableOpacity
          onPress={() =>
            studentObj.studentClassAsync === null
              ? Alert.alert('Error', 'Please Select Class First')
              : this.props.navigation.navigate('ClassStudentsAdd', {
                  report: true,
                  studentObj,
                })
          }
          style={{
            height: 50,
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingLeft: 20,
          }}>
          <Text style={{fontSize: 18, color: 'grey'}}>
            {studentObj.id
              ? `${studentObj.firstName} ${studentObj.lastName}`
              : 'Press to select student for your report'}
          </Text>
        </TouchableOpacity>
        <GradientView
          title=""
          titleColor="#40c4ff"
          height={20}
          marginTop={0}
          marginHorizontal={0}
        />
        <TouchableOpacity
          onPress={() => this.setState({showTypeDate: 'start'})}
          style={{
            height: 40,
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            marginHorizontal: 20,
          }}>
          <Text style={{fontSize: 18}}>Start Date:</Text>
          <Text style={{fontSize: 18}}>
            {moment(startDate).year()}-{moment(startDate).month() + 1}-
            {moment(startDate).date()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.setState({showTypeDate: 'end'})}
          style={{
            height: 40,
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            marginHorizontal: 20,
          }}>
          <Text style={{fontSize: 18}}>End Date:</Text>
          <Text style={{fontSize: 18}}>
            {moment(endDate).year()}-{moment(endDate).month() + 1}-
            {moment(endDate).date()}
          </Text>
        </TouchableOpacity>
        <GradientView
          title=""
          titleColor="#40c4ff"
          height={20}
          marginTop={0}
          marginHorizontal={0}
        />
        <Button
          mode="contained"
          onPress={() =>
            this.studentReportNavigation(studentObj, startDate, endDate)
          }
          uppercase={false}
          style={{
            marginTop: 20,
            alignSelf: 'center',
            width: 110,
          }}>
          Continue
        </Button>
      </View>
    );
  }
  _classReport(startDate, endDate) {
    const {classObj} = this.state;
    // console.log('TCL: _classReport -> classObj', classObj);
    return (
      <View style={{flex: 1}}>
        <GradientView
          title=""
          titleColor="#40c4ff"
          height={20}
          marginTop={0}
          marginHorizontal={0}
        />
        <TouchableOpacity
          onPress={() =>
            this.props.navigation.navigate('SelectClass', {class: true})
          }
          style={{
            height: 50,
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingLeft: 20,
          }}>
          <Text style={{fontSize: 18, color: 'grey', textAlign: 'left'}}>
            {classObj.id
              ? classObj.name
              : 'Press to select class for your report'}
          </Text>
        </TouchableOpacity>
        <GradientView
          title=""
          titleColor="#40c4ff"
          height={20}
          marginTop={0}
          marginHorizontal={0}
        />
        <TouchableOpacity
          onPress={() => this.setState({showTypeDate: 'start'})}
          style={{
            height: 40,
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            marginHorizontal: 20,
          }}>
          <Text style={{fontSize: 18}}>Start Date:</Text>
          <Text style={{fontSize: 18}}>
            {moment(startDate).year()}-{moment(startDate).month() + 1}-
            {moment(startDate).date()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.setState({showTypeDate: 'end'})}
          style={{
            height: 40,
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            marginHorizontal: 20,
          }}>
          <Text style={{fontSize: 18}}>End Date:</Text>
          <Text style={{fontSize: 18}}>
            {moment(endDate).year()}-{moment(endDate).month() + 1}-
            {moment(endDate).date()}
          </Text>
        </TouchableOpacity>
        <GradientView
          title=""
          titleColor="#40c4ff"
          height={20}
          marginTop={0}
          marginHorizontal={0}
        />
        <Button
          mode="contained"
          onPress={() =>
            this.classReportNavigation(classObj, startDate, endDate)
          }
          uppercase={false}
          style={{
            marginTop: 20,
            alignSelf: 'center',
            width: 110,
          }}>
          Continue
        </Button>
      </View>
    );
  }
  renderFab(id, icon, color, bgColor, fabNum) {
    return (
      <FAB
        style={[fabNum, styles.fabStyle, {backgroundColor: bgColor}]}
        color={color}
        icon={icon}
        onPress={() => this.setState({fabActive: id})}
      />
    );
  }

  datePickerHandler(event, dob) {
    if (event.type === 'dismissed') {
      this.setState({showTypeDate: null});
    }
    const {showTypeDate} = this.state;
    if (dob && showTypeDate === 'start') {
      this.setState({
        startDate: dob,
        showTypeDate: null,
      });
    }
    if (dob && showTypeDate === 'end') {
      this.setState({
        endDate: dob,
        showTypeDate: null,
      });
    }
  }
  paymentModalVisibility() {
    this.setState({visible: false});
  }
  render() {
    const {
      fabActive,
      startDate,
      showTypeDate,
      endDate,
      reportQuestionModal,
      visible,
      loading,
    } = this.state;
    let title = '';
    if (fabActive === 1) {
      title = 'Daily Report';
    } else if (fabActive === 2) {
      title = 'Student Report';
    } else if (fabActive === 3) {
      title = 'Class Report';
    }
    console.log('TCL: render -> reportQuestionModal', reportQuestionModal);
    return (
      <Fragment>
        <NavigationEvents
          onDidFocus={this.getListener}
          onDidBlur={() => this.setState({loading: true})}
        />
        {/* {visible && (
          <PaymentModal
            {...this.props}
            paymentModalVisibility={this.paymentModalVisibility}
          />
        )} */}
        <ReportsHelp
          reportQuestionModal={reportQuestionModal}
          hideModal={() => this.showQuestionModal(false)}
          component="reports"
        />
        <StatusBar backgroundColor="red" barStyle="light-content" />
        <Appbar.Header style={{backgroundColor: 'red'}}>
          <Appbar.Content
            title={title}
            titleStyle={{color: '#fafafa', fontWeight: '600', fontSize: 24}}
          />
          <Appbar.Action
            onPress={() => this.showQuestionModal(true)}
            icon={() => (
              <IconAnt name={'question'} size={24} color={'#fafafa'} />
            )}
          />
          <Appbar.Action
            icon={() => (
              <IconAnt name={'setting'} size={24} color={'#fafafa'} />
            )}
          />
        </Appbar.Header>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="red"
            style={{
              marginTop: 10,
            }}
          />
        ) : (
          <Fragment>
            {showTypeDate && (
              <DateTimePicker
                value={showTypeDate === 'start' ? startDate : endDate}
                mode={'date'}
                is24Hour={false}
                display="default"
                onChange={this.datePickerHandler}
              />
            )}
            {fabActive === 1 && this._dailyReport(startDate, endDate)}
            {fabActive === 2 && this._studentReport(startDate, endDate)}
            {fabActive === 3 && this._classReport(startDate, endDate)}
            <View
              style={{
                position: 'absolute',
                bottom: 12,
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'space-evenly',
              }}>
              {fabActive === 1
                ? this.renderFab(1, 'account-card-details', '#fafafa', 'red')
                : this.renderFab(
                    1,
                    'account-card-details',
                    'lightgrey',
                    '#f7fafa',
                  )}
              {fabActive === 2
                ? this.renderFab(2, 'chart-pie', '#fafafa', 'red')
                : this.renderFab(2, 'chart-pie', 'lightgrey', '#f7fafa')}
              {fabActive === 3
                ? this.renderFab(3, 'clipboard-text', '#fafafa', 'red')
                : this.renderFab(3, 'clipboard-text', 'lightgrey', '#f7fafa')}
            </View>
          </Fragment>
        )}
      </Fragment>
    );
  }
}
const styles = StyleSheet.create({
  fabStyle: {
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
