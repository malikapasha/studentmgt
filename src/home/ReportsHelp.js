/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */

import {View, Modal, ScrollView, Image} from 'react-native';
import React from 'react';
import IconAnt from 'react-native-vector-icons/AntDesign';
import {Title, Appbar, Text} from 'react-native-paper';
export default class ReportsHelp extends React.Component {
  constructor(props) {
    super(props);
    this._renderReport = this._renderReport.bind(this);
    this._renderClass = this._renderClass.bind(this);
    this._renderStudent = this._renderStudent.bind(this);
    this._renderClassOperation = this._renderClassOperation.bind(this);
    this._renderAttendance = this._renderAttendance.bind(this);
    this._renderAttendanceOperation = this._renderAttendanceOperation.bind(
      this,
    );
    this._renderUpdateStudent = this._renderUpdateStudent.bind(this);
  }
  _renderClass() {
    return (
      <View
        style={{
          //   backgroundColor: '#d3d3d330',
          flex: 1,
          alignItems: 'center',
          paddingTop: 15,
          paddingHorizontal: 25,
          justifyContent: 'flex-start',
        }}>
        <Text style={{color: 'white', textAlign: 'center'}}>
          To create a class, press:
        </Text>
        <Image
          resizeMode="stretch"
          source={require('../../assets/classcreate.jpg')}
          style={{height: 40, width: '80%', marginTop: 10}}
        />
        <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
          To delete/archive a class, long press it and tap appropriate button:
        </Text>
        <Image
          resizeMode="stretch"
          source={require('../../assets/archiveclass.jpg')}
          style={{height: 100, width: '80%', marginTop: 10}}
        />
        <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
          When the class is archived - it becomes inactive and does not appear
          on the calendar:
        </Text>
        <Image
          resizeMode="stretch"
          source={require('../../assets/viewarchive.jpg')}
          style={{height: 40, width: '80%', marginTop: 10}}
        />
        <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
          To unarchive the class - long press it and tap "Unarchive" button:
        </Text>
        <Image
          resizeMode="stretch"
          source={require('../../assets/unarchive.jpg')}
          style={{height: 80, width: '80%', marginTop: 10}}
        />
      </View>
    );
  }
  _renderClassOperation() {
    return (
      <View
        style={{
          //   backgroundColor: '#d3d3d330',
          flex: 1,
          alignItems: 'center',
          paddingTop: 15,
          paddingHorizontal: 25,
          justifyContent: 'flex-start',
        }}>
        <Text style={{color: 'white', textAlign: 'center'}}>
          To add/edit information - tap on an appropriate row:
        </Text>
        <Image
          resizeMode="stretch"
          source={require('../../assets/classfields.jpg')}
          style={{height: 100, width: '80%', marginTop: 10}}
        />
        <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
          To edit days of the week when your class appears on the calendar,
          press here:
        </Text>
        <Image
          resizeMode="stretch"
          source={require('../../assets/weekdays.jpg')}
          style={{height: 60, width: '80%', marginTop: 10}}
        />
        <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
          To create sessions, press here:
        </Text>
        <Image
          resizeMode="stretch"
          source={require('../../assets/createsession.jpg')}
          style={{height: 50, width: '80%', marginTop: 10}}
        />
        <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
          To save your changes press "Save" button:
        </Text>
        <Image
          resizeMode="stretch"
          source={require('../../assets/createclass.jpg')}
          style={{height: 40, width: '80%', marginTop: 10}}
        />
      </View>
    );
  }
  _renderReport() {
    return (
      <View
        style={{
          //   backgroundColor: '#d3d3d330',
          flex: 1,
          alignItems: 'center',
          paddingTop: 15,
          paddingHorizontal: 25,
          justifyContent: 'flex-start',
        }}>
        <Text style={{color: 'white', textAlign: 'center'}}>
          You can create a report for certain date range and send it to your
          email. The report includes daily attendance for all classes recorded
          for the date range you choose.
        </Text>
        <Text style={{color: 'white', textAlign: 'center', marginTop: 20}}>
          Choose a date for the report.
        </Text>
        <Image
          resizeMode="stretch"
          source={require('../../assets/times.jpg')}
          style={{height: 40, width: '80%', marginTop: 10}}
        />
        <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
          To change settings of the report, press:
        </Text>
        <Image
          resizeMode="stretch"
          source={require('../../assets/dailyHeader.jpg')}
          style={{height: 40, width: '80%', marginTop: 10}}
        />
        <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
          To generate a report, press:
        </Text>
        <Image
          resizeMode="stretch"
          source={require('../../assets/continue.jpg')}
          style={{height: 35, width: 100, marginTop: 10}}
        />
      </View>
    );
  }
  _renderStudent() {
    return (
      <View
        style={{
          //   backgroundColor: '#d3d3d330',
          flex: 1,
          alignItems: 'center',
          paddingTop: 15,
          paddingHorizontal: 25,
          justifyContent: 'flex-start',
        }}>
        <Text style={{color: 'white', textAlign: 'center'}}>
          To add a new student, press "Plus" button:
        </Text>
        <Image
          resizeMode="stretch"
          source={require('../../assets/createstudent.jpg')}
          style={{height: 40, width: '80%', marginTop: 10}}
        />
        <Text style={{color: 'white', textAlign: 'center', marginTop: 20}}>
          To delete a student, long press the name and press "Delete":
        </Text>
        <Image
          resizeMode="stretch"
          source={require('../../assets/deletestudent.jpg')}
          style={{height: 100, width: '80%', marginTop: 10}}
        />
        <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
          To edit student's info, tap on the student. You may use search if your
          student's list is too long:
        </Text>
        <Image
          resizeMode="stretch"
          source={require('../../assets/searchstudent.jpg')}
          style={{height: 100, width: '80%', marginTop: 10}}
        />
      </View>
    );
  }
  _renderAttendance() {
    return (
      <ScrollView style={{flex: 1}}>
        <View
          style={{
            //   backgroundColor: '#d3d3d330',
            flex: 1,
            alignItems: 'center',
            paddingTop: 15,
            paddingHorizontal: 25,
            justifyContent: 'flex-start',
          }}>
          <Text style={{color: 'white', textAlign: 'center'}}>
            To pick a date press on the calendar like this:
          </Text>
          <Image
            source={require('../../assets/calendar.jpg')}
            style={{height: 140, width: '80%', marginTop: 10}}
          />
          <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
            To change a month, swipe the calendar to the left/right:
          </Text>
          <Image
            resizeMode="contain"
            source={require('../../assets/swipe.jpg')}
            style={{height: 40, width: '80%', marginTop: 10}}
          />
          <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
            You may see a checkmark next to the class. It means that you took
            attendance for this class already in minimum one of its section.
          </Text>
          <Image
            resizeMode="stretch"
            source={require('../../assets/takeattendance.jpg')}
            style={{height: 40, width: '80%', marginTop: 10}}
          />
          <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
            To take/edit attendance for the class, tap:
          </Text>
          <Image
            resizeMode="stretch"
            source={require('../../assets/takeattendance.jpg')}
            style={{height: 40, width: '80%', marginTop: 10}}
          />
        </View>
        <View style={{height: 20}} />
      </ScrollView>
    );
  }
  _renderAttendanceOperation() {
    return (
      <ScrollView style={{flex: 1}}>
        <View
          style={{
            //   backgroundColor: '#d3d3d330',
            flex: 1,
            alignItems: 'center',
            paddingTop: 15,
            paddingHorizontal: 25,
            justifyContent: 'flex-start',
          }}>
          <Text style={{color: 'white', textAlign: 'center'}}>
            To add an existing student to the event tap on the search bar and
            type first or last name:
          </Text>
          <Image
            resizeMode="stretch"
            source={require('../../assets/searchstudentattendance.jpg')}
            style={{height: 150, width: '80%', marginTop: 10}}
          />
          <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
            To change the status to present/absent tap on the student:
          </Text>
          <Image
            resizeMode="stretch"
            source={require('../../assets/changesstatus.jpg')}
            style={{height: 40, width: '80%', marginTop: 10}}
          />
          <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
            To add a note to the student or give other specific status tap on
            the icon:
          </Text>
          <Image
            resizeMode="stretch"
            source={require('../../assets/addnote.jpg')}
            style={{height: 150, width: '80%', marginTop: 10}}
          />
        </View>
        <View style={{height: 20}} />
      </ScrollView>
    );
  }
  _renderUpdateStudent() {
    return (
      <ScrollView style={{flex: 1}}>
        <View
          style={{
            //   backgroundColor: '#d3d3d330',
            flex: 1,
            alignItems: 'center',
            paddingTop: 15,
            paddingHorizontal: 25,
            justifyContent: 'flex-start',
          }}>
          <Text style={{color: 'white', textAlign: 'center'}}>
            To add/edit information - tap on an appropriate row:
          </Text>
          <Image
            resizeMode="stretch"
            source={require('../../assets/field.jpg')}
            style={{height: 40, width: '80%', marginTop: 10}}
          />
          <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
            To add/edit/delete a student photo tap here:
          </Text>
          <Image
            resizeMode="stretch"
            source={require('../../assets/studentpic.jpg')}
            style={{height: 100, width: '80%', marginTop: 10}}
          />
          <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
            To call a student using provided phone number press:
          </Text>
          <Image
            resizeMode="stretch"
            source={require('../../assets/phonestudent.jpg')}
            style={{height: 50, width: '80%', marginTop: 10}}
          />
          <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
            To email a student using provided email address press:
          </Text>
          <Image
            resizeMode="stretch"
            source={require('../../assets/mailstudent.jpg')}
            style={{height: 50, width: '80%', marginTop: 10}}
          />
          <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
            To view event notes for the student press:
          </Text>
          <Image
            resizeMode="stretch"
            source={require('../../assets/notes.jpg')}
            style={{height: 50, width: '80%', marginTop: 10}}
          />
          <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>
            To save your changes press:
          </Text>
          <Image
            resizeMode="stretch"
            source={require('../../assets/savestudent.jpg')}
            style={{height: 40, width: '80%', marginTop: 10}}
          />
          <View style={{height: 20}} />
        </View>
      </ScrollView>
    );
  }
  render() {
    const {reportQuestionModal, component} = this.props;
    return (
      <Modal
        supportedOrientations="landscape-left"
        animationType="slide"
        transparent
        visible={reportQuestionModal}
        onRequestClose={() => this.props.hideModal()}>
        <View style={{flex: 1, backgroundColor: '#000000', opacity: 0.9}}>
          <View
            style={{
              maxHeight: 60,
              flexDirection: 'row',
              flex: 1,
              alignItems: 'center',
              paddingLeft: 10,
              justifyContent: 'space-between',
            }}>
            <Title style={{color: 'white'}}>Quick Introduction Tour</Title>

            <Appbar.Action
              style={{}}
              onPress={() => {
                this.props.hideModal();
              }}
              icon={() => (
                <IconAnt name={'close'} size={24} color={'#fafafa'} />
              )}
            />
          </View>
          {component === 'reports' && this._renderReport()}
          {component === 'students' && this._renderStudent()}
          {component === 'classes' && this._renderClass()}
          {component === 'classoperations' && this._renderClassOperation()}
          {component === 'attendance' && this._renderAttendance()}
          {component === 'attendanceoperations' &&
            this._renderAttendanceOperation()}
          {component === 'updatestudent' && this._renderUpdateStudent()}
        </View>
      </Modal>
    );
  }
}
