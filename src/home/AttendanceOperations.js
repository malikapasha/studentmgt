/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Fragment, useState} from 'react';
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Picker,
  Image,
  ToastAndroid,
  Alert,
} from 'react-native';
import {
  TouchableRipple,
  Appbar,
  Button,
  Paragraph,
  Dialog,
  Portal,
  TextInput as TIPaper,
} from 'react-native-paper';
import IconAnt from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/Feather';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconFoundation from 'react-native-vector-icons/Foundation';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Axios from '../Axios';
import orderBy from 'lodash/orderBy';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment';
import ReportsHelp from './ReportsHelp';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
const TabIcon = props => (
  <Icon
    name={'users'}
    size={25}
    color={props.focused ? '#3dafe4' : '#929292'}
  />
);
const RenderStatusIcons = React.memo(
  ({id, notes, status, updateStudent, children, updateNotesHandler}) => {
    let menuRef = null;
    let [visible, setVisible] = useState(false);
    let [note, setNote] = useState(notes);
    const _showDialog = () => {
      menuRef.close();
      setVisible(true);
    };

    const _hideDialog = () => {
      menuRef.close();
      setNote(notes);
      setVisible(false);
    };
    const _saveDialog = () => {
      menuRef.close();
      updateNotesHandler(id, note);
      setVisible(false);
    };
    const renderIcon = (name, color, FontClass, newStatus) => {
      return (
        <TouchableOpacity
          onPress={() => {
            menuRef.close();
            updateStudent(id, status, newStatus);
          }}
          style={{
            width: 50,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 5,
          }}>
          <FontClass name={name} style={{fontSize: 36, color}} />
        </TouchableOpacity>
      );
    };
    return (
      <Fragment>
        <Portal>
          <Dialog visible={visible} onDismiss={_hideDialog}>
            <Dialog.Title>Your Note</Dialog.Title>
            <Dialog.Content>
              <TextInput
                multiline
                value={note}
                onChangeText={text => setNote(text)}
                style={{borderWidth: 1, borderColor: 'lightgrey'}}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={_hideDialog}>Cancel</Button>
              <Button onPress={_saveDialog}>Save</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Menu
          ref={input => {
            menuRef = input;
          }}>
          <MenuTrigger>{children}</MenuTrigger>
          <MenuOptions>
            <MenuOption>
              <View
                style={{
                  height: 110,
                  width: 160,
                  flex: 1,
                  flexWrap: 'wrap',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignSelf: 'center',
                }}>
                {renderIcon('check', 'green', IconMaterial, 1)}
                {renderIcon('close', 'red', IconMaterial, 0)}
                {renderIcon('exclamation', 'blue', IconAnt, 2)}
                {renderIcon('pill', 'purple', IconMaterialCommunityIcons, 3)}
                {renderIcon('thumbs-o-up', 'orange', IconFontAwesome, 4)}
                {renderIcon('thumbs-o-down', 'brown', IconFontAwesome, 5)}
              </View>

              <Button
                color="red"
                mode="contained"
                labelStyle={{textTransform: 'capitalize'}}
                style={{alignSelf: 'center'}}
                // onPress={() => updateNotesHandler(id, notes + '123')}>
                onPress={_showDialog}>
                Add note
              </Button>
              <View style={{height: 10}} />
            </MenuOption>
          </MenuOptions>
        </Menu>
      </Fragment>
    );
  },
);
let classID = null;
//create update attendance class
export default class AttendanceOperations extends React.Component {
  static navigationOptions = {
    tabBarIcon: TabIcon,
  };

  allStudents = [];
  constructor(props) {
    super(props);
    this.state = {
      students: [],
      loading: true,
      uploading: false,
      dateSelected: null,
      pickerSelectedValue: '',
      currentSessionStatus: null,
      pickerList: [],
      statusCount: {
        check: 0,
        close: 0,
        exclamation: 0,
        pill: 0,
        thumbsUp: 0,
        thumbsDown: 0,
      },
      search: '',
      reportQuestionModal: false,
    };
    this.renderStudent = this.renderStudent.bind(this);
    this.updateStudent = this.updateStudent.bind(this);
    this.createAttendanceHandler = this.createAttendanceHandler.bind(this);
    this.updateAttendanceHandler = this.updateAttendanceHandler.bind(this);
    this.getStudentsAndAttendances = this.getStudentsAndAttendances.bind(this);
    this.renderStatusCountEach = this.renderStatusCountEach.bind(this);
    this.getPreviousAttendances = this.getPreviousAttendances.bind(this);
    this.filterSession = this.filterSession.bind(this);
    this.searchHandler = this.searchHandler.bind(this);
    this.updateNotesHandler = this.updateNotesHandler.bind(this);
    this.showQuestionModal = this.showQuestionModal.bind(this);
  }

  showQuestionModal(visible) {
    this.setState({reportQuestionModal: visible});
  }
  updateAttendanceHandler() {
    // console.log('TCL: > updateAttendanceHandler');
    this.setState({uploading: true});
    const {students, pickerSelectedValue, dateSelected} = this.state;
    if (!students.length) {
      Alert.alert('Error', 'Please Add Students First');
      this.setState({uploading: false});
      return;
    }
    if (!pickerSelectedValue) {
      Alert.alert('Error', 'No Session Selected');
      return;
    }
    const attendance = students.map(item => {
      return {student: item.id, status: item.status, notes: item.notes};
    });
    Axios.put('attendance/update', {
      // classId, replace with current session Id
      sessionId: pickerSelectedValue,
      attendance: attendance,
      date: dateSelected,
    })
      .then(res => {
        this.setState({uploading: false});
        if (res.status === 200) {
          ToastAndroid.show(
            'Attendance Updated Successfully',
            ToastAndroid.SHORT,
          );
          this.props.navigation.goBack();
        } else {
          ToastAndroid.show('Update Attendance Failed', ToastAndroid.SHORT);
          this.allStudents = [];
          this.setState({uploading: false, students: []});
        }
      })
      .catch(e => {
        this.setState({uploading: false});
        ToastAndroid.show('Update Attendance Failed', ToastAndroid.SHORT);
      });
  }
  createAttendanceHandler() {
    // console.log('TCL: > createAttendanceHandler');
    this.setState({uploading: true});
    const {students, pickerSelectedValue, dateSelected} = this.state;
    if (!students.length) {
      Alert.alert('Error', 'Please Add Students First');
      this.setState({uploading: false});
      return;
    }
    if (!pickerSelectedValue) {
      Alert.alert('Error', 'No Session Selected');
      return;
    }
    const attendance = students.map(item => {
      return {student: item.id, status: item.status, notes: item.notes};
    });
    Axios.post('attendance/create', {
      // classId, replace with sessionId
      sessionId: pickerSelectedValue,
      attendance: attendance,
      date: dateSelected,
      classId: classID,
    })
      .then(res => {
        this.setState({uploading: false});
        if (res.status === 200) {
          ToastAndroid.show(
            'Attendance Created Successfully',
            ToastAndroid.SHORT,
          );
          this.props.navigation.goBack();
        } else {
          this.allStudents = [];
          ToastAndroid.show('Create Attendance Failed', ToastAndroid.SHORT);
          this.setState({uploading: false, students: []});
        }
      })
      .catch(e => {
        this.setState({uploading: false});
        ToastAndroid.show('Create Attendance Failed', ToastAndroid.SHORT);
      });
  }
  updateStudent(id, previousStatus, status) {
    if (previousStatus === status) {
      return;
    }
    const students = [...this.state.students];
    const {statusCount} = this.state;
    if (previousStatus === 0) {
      statusCount.close -= 1;
    } else if (previousStatus === 1) {
      statusCount.check -= 1;
    } else if (previousStatus === 2) {
      statusCount.exclamation -= 1;
    } else if (previousStatus === 3) {
      statusCount.pill -= 1;
    } else if (previousStatus === 4) {
      statusCount.thumbsUp -= 1;
    } else if (previousStatus === 5) {
      statusCount.thumbsDown -= 1;
    }
    if (status === 0) {
      statusCount.close += 1;
    } else if (status === 1) {
      statusCount.check += 1;
    } else if (status === 2) {
      statusCount.exclamation += 1;
    } else if (status === 3) {
      statusCount.pill += 1;
    } else if (status === 4) {
      statusCount.thumbsUp += 1;
    } else if (status === 5) {
      statusCount.thumbsDown += 1;
    }
    const updatedStudents = students.map(item => {
      if (item.id === id) {
        item.status = status;
      }
      return item;
    });
    this.setState({students: updatedStudents, statusCount});
  }
  updateNotesHandler(id, notes) {
    const students = [...this.state.students];
    const updatedStudents = students.map(item => {
      if (item.id === id) {
        item.notes = notes;
      }
      return item;
    });
    this.setState({students: updatedStudents});
  }
  componentDidMount() {
    const {
      classId,
      token,
      status,
      selectedDate,
      session,
    } = this.props.navigation.state.params;
    classID = classId;
    Axios.defaults.headers.common = {Authorization: `Bearer ${token}`};
    let sessionId = session[0];
    // console.log('TCL: sessionId', session, sessionId);
    var current = moment(selectedDate, 'YYYY/MM/DD');
    let dateSelected =
      current.format('YYYY') +
      '-' +
      current.format('M') +
      '-' +
      current.format('D');
    let updatedSession = session.map(item => {
      item.startTime = moment(item.startTime).format('hh:mm a');
      item.endTime = moment(item.endTime).format('hh:mm a');
      return item;
    });
    this.setState({
      dateSelected,
      pickerSelectedValue: sessionId,
      pickerList: updatedSession,
      currentSessionStatus: sessionId ? sessionId.attendanceStatus : null,
    });
    //initially getting students and setting status false default
    if (!status) {
      this.getStudentsAndAttendances(classId);
    }

    //getting previous attendance details
    else {
      //date format updating

      this.getPreviousAttendances(sessionId.id, dateSelected);
    }
  }
  getPreviousAttendances(sessionId, dateSelected) {
    // get previous attendance
    Axios.get(`attendance/findone?sessionId=${sessionId}&date=${dateSelected}`)
      .then(res => {
        let statusCount = {...this.state.statusCount};
        statusCount.close = 0;
        statusCount.check = 0;
        statusCount.exclamation = 0;
        statusCount.pill = 0;
        statusCount.thumbsUp = 0;
        statusCount.thumbsDown = 0;
        if (res.status === 200) {
          res.data.forEach(({status}) => {
            if (status === 0) {
              statusCount.close += 1;
            } else if (status === 1) {
              statusCount.check += 1;
            } else if (status === 2) {
              statusCount.exclamation += 1;
            } else if (status === 3) {
              statusCount.pill += 1;
            } else if (status === 4) {
              statusCount.thumbsUp += 1;
            } else if (status === 5) {
              statusCount.thumbsDown += 1;
            }
          });

          this.allStudents = res.data;
          // console.log('TCL: attendance', res.data);
          this.setState({loading: false, students: res.data, statusCount});
        } else {
          this.allStudents = [];
          ToastAndroid.show('Students Fetch Failed', ToastAndroid.SHORT);
          this.setState({loading: false, students: [], statusCount});
        }
      })
      .catch(e => {
        this.allStudents = [];
        ToastAndroid.show('Students Fetch Failed', ToastAndroid.SHORT);
        this.setState({loading: false, students: []});
      });
  }
  getStudentsAndAttendances(classId) {
    // getting students initially bcz not getting from attendance collection as not attendance added yet
    Axios.get(`class/findOne/?id=${classId}`)
      .then(res => {
        if (res.status === 200) {
          let students = orderBy(
            res.data.student,
            ['firstName', 'lastName'],
            ['asc', 'asc'],
          );
          // creating attendance status initially bcz not getting from server RightNow
          students = students.map(item => {
            item.status = 0;
            return item;
          });
          const {statusCount} = this.state;
          statusCount.close = students.length;
          statusCount.check = 0;
          statusCount.exclamation = 0;
          statusCount.pill = 0;
          statusCount.thumbsUp = 0;
          statusCount.thumbsDown = 0;
          this.allStudents = students;
          this.setState({loading: false, students, statusCount});
        } else {
          this.allStudents = [];
          ToastAndroid.show('Students Fetch Failed', ToastAndroid.SHORT);
          this.setState({loading: false, students: []});
        }
      })
      .catch(() => {
        this.allStudents = [];
        ToastAndroid.show('Students Fetch Failed', ToastAndroid.SHORT);
        this.setState({loading: false, students: []});
      });
  }
  searchHandler(text) {
    this.setState({search: text});
    if (!isEmpty(this.allStudents)) {
      let filteredStudents = this.allStudents.filter(o => {
        return o.firstName.includes(text) || o.lastName.includes(text);
      });
      this.setState({students: filteredStudents});
    }
  }
  filterSession(itemValue, itemIndex) {
    const {classId, session} = this.props.navigation.state.params;
    this.setState({
      pickerSelectedValue: itemValue,
      loading: true,
      currentSessionStatus: session[itemIndex].attendanceStatus,
    });
    if (!session[itemIndex].attendanceStatus) {
      this.getStudentsAndAttendances(classId);
    } else {
      this.getPreviousAttendances(itemValue, this.state.dateSelected);
    }
  }
  renderStudent({firstName, lastName, id, status, imageUrl, notes}) {
    if (!id) {
      return null;
    }
    let image = null;
    if (!isEmpty(imageUrl)) {
      image = imageUrl;
    }
    return (
      <TouchableOpacity
        activeOpacity={1}
        key={id}
        onPress={() => this.updateStudent(id, status, status === 0 ? 1 : 0)}
        style={{
          height: 60,
          borderBottomColor: '#00000010',
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 15,
          borderBottomWidth: 1,
        }}>
        {image ? (
          <Image
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              borderWidth: 0.5,
              borderColor: 'red',
            }}
            source={{
              uri: `data:image/jpeg;base64,${image}`,
            }}
          />
        ) : (
          <Icon
            name={'user'}
            size={28}
            color={'red'}
            style={{
              width: 44,
              height: 44,
              textAlign: 'center',
              textAlignVertical: 'center',
              borderRadius: 10,
              borderWidth: 0.5,
              borderColor: 'red',
            }}
          />
        )}
        <View style={{flex: 1, marginLeft: 20}}>
          <Text style={{fontSize: 18, color: '#4a4a4c'}}>{firstName}</Text>
          <Text style={{fontSize: 18, color: '#4a4a4c'}}>{lastName}</Text>
        </View>
        {notes ? (
          <TouchableRipple
            borderless
            rippleColor="rgba(0, 0, 0, .32)"
            onPress={() =>
              Alert.alert(
                'Notes',
                notes === ''
                  ? 'There is no notes associated with this record'
                  : notes,
              )
            }
            style={{
              width: 25,
              height: 'auto',
              justifyContent: 'center',
              alignContent: 'center',
              marginRight: 12,
            }}>
            <IconFoundation name={'pencil'} size={25} color={'red'} />
          </TouchableRipple>
        ) : null}
        <View
          style={{
            width: 25,
            height: 'auto',
          }}>
          {status === 1 && (
            <IconMaterial name={'check'} size={25} color={'green'} />
          )}
          {status === 0 && (
            <IconMaterial name={'close'} size={25} color={'red'} />
          )}
          {status === 2 && (
            <IconAnt name={'exclamation'} size={25} color={'blue'} />
          )}
          {status === 3 && (
            <IconMaterialCommunityIcons
              name={'pill'}
              size={25}
              color={'purple'}
            />
          )}
          {status === 4 && (
            <IconFontAwesome name={'thumbs-o-up'} size={25} color={'orange'} />
          )}
          {status === 5 && (
            <IconFontAwesome name={'thumbs-o-down'} size={25} color={'brown'} />
          )}
        </View>
        <RenderStatusIcons
          id={id}
          notes={notes}
          status={status}
          updateStudent={this.updateStudent}
          updateNotesHandler={this.updateNotesHandler}>
          <TouchableRipple
            borderless
            rippleColor="rgba(0, 0, 0, .32)"
            style={{
              width: 25,
              marginLeft: 12,
              height: 'auto',
              justifyContent: 'center',
              alignContent: 'center',
              marginRight: 5,
            }}>
            <Icon name={'more-horizontal'} size={25} color={'red'} />
          </TouchableRipple>
        </RenderStatusIcons>
      </TouchableOpacity>
    );
  }
  renderStatusCountEach(color, value) {
    return (
      <Text
        style={{
          fontSize: 18,
          color: '#fafafa',
          backgroundColor: color,
          borderRadius: 30,
          width: 30,
          height: 30,
          marginRight: 10,
          textAlign: 'center',
          textAlignVertical: 'center',
        }}>
        {value}
      </Text>
    );
  }
  render() {
    const {title, attendancePermissions} = this.props.navigation.state.params;
    const {
      students,
      loading,
      uploading,
      search,
      pickerSelectedValue,
      pickerList,
      currentSessionStatus,
      reportQuestionModal,
    } = this.state;
    const {
      check,
      close,
      exclamation,
      pill,
      thumbsUp,
      thumbsDown,
    } = this.state.statusCount;
    // console.log('TCL: currentSessionStatus', currentSessionStatus);
    return (
      <Fragment>
        <ReportsHelp
          reportQuestionModal={reportQuestionModal}
          hideModal={() => this.showQuestionModal(false)}
          component="attendanceoperations"
        />
        <StatusBar backgroundColor="red" barStyle="light-content" />
        <Appbar.Header style={{backgroundColor: 'red'}}>
          <Appbar.Action
            icon={() => (
              <IconMaterial name={'arrow-back'} size={24} color={'#fafafa'} />
            )}
            onPress={() => this.props.navigation.goBack()}
          />
          <Appbar.Content
            title={title}
            titleStyle={{
              color: '#fafafa',
              fontWeight: '600',
              fontSize: 18,
              width: 140,
            }}
            style={{
              margin: 0,
            }}
          />
          <Appbar.Action
            onPress={() => this.showQuestionModal(true)}
            icon={() => (
              <IconAnt name={'question'} size={24} color={'#fafafa'} />
            )}
          />
          {loading || uploading ? (
            <ActivityIndicator
              size="small"
              color="#fafafa"
              style={{width: 40, marginLeft: 10}}
            />
          ) : (
            <Appbar.Content
              title="Save"
              onPress={() =>
                attendancePermissions
                  ? currentSessionStatus !== null
                    ? currentSessionStatus === 0
                      ? this.createAttendanceHandler()
                      : this.updateAttendanceHandler()
                    : Alert.alert('Error', 'No Session Found')
                  : Alert.alert(
                      'Unauthorized Access',
                      'You dont have this permission',
                    )
              }
              style={{
                alignItems: 'flex-start',
                maxWidth: 60,
                margin: 0,
                padding: 0,
              }}
              titleStyle={{
                color: '#fff',
                fontWeight: '600',
                fontSize: 16,
                textAlign: 'left',
              }}
            />
          )}
        </Appbar.Header>
        <View
          style={{
            flex: 1,
          }}>
          <View style={{height: 60, backgroundColor: 'rgba(255, 93, 98,0.5)'}}>
            <TextInput
              placeholder="Pick Students"
              style={{
                marginHorizontal: 10,
                marginVertical: 8,
                borderRadius: 6,
                backgroundColor: '#fafafa',
                paddingLeft: 10,
              }}
              placeholderTextColor="#9e9e9e"
              value={search}
              onChangeText={this.searchHandler}
            />
          </View>
          <View
            style={{
              minHeight: 40,
              paddingHorizontal: 10,
              backgroundColor: 'rgba(255, 93, 98,0.5)',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                flex: 1,
              }}>
              {check > 0 && this.renderStatusCountEach('green', check)}
              {close > 0 && this.renderStatusCountEach('red', close)}
              {exclamation > 0 &&
                this.renderStatusCountEach('blue', exclamation)}
              {pill > 0 && this.renderStatusCountEach('purple', pill)}
              {thumbsUp > 0 && this.renderStatusCountEach('orange', thumbsUp)}
              {thumbsDown > 0 &&
                this.renderStatusCountEach('brown', thumbsDown)}
            </View>
            <Text
              style={{
                fontSize: 18,
                color: '#4a4a4c',
                marginRight: 12,
              }}>
              Total: {students.length}
            </Text>
          </View>

          <Picker
            selectedValue={pickerSelectedValue}
            style={{
              maxHeight: 50,
              marginHorizontal: 50,
              width: 'auto',
            }}
            onValueChange={this.filterSession}
            enabled={!loading}>
            {pickerList.length
              ? pickerList.map(pick => {
                  return (
                    <Picker.Item
                      key={pick.id}
                      label={`${pick.startTime} - ${pick.endTime}`}
                      value={pick.id}
                    />
                  );
                }, this)
              : null}
          </Picker>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="red"
              style={{
                marginTop: 10,
              }}
            />
          ) : !students.length ? (
            <Text style={{marginLeft: 20, marginTop: 10}}>
              No Students Found
            </Text>
          ) : (
            <FlatList
              data={students}
              renderItem={({item}) => this.renderStudent(item)}
              //change it to id.toString()
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
