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
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
  Image,
  Alert,
} from 'react-native';
import {Appbar} from 'react-native-paper';
import IconAnt from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/Feather';
// import GradientView from '../ui/GradientView';
import AsyncStorage from '@react-native-community/async-storage';
import {NavigationEvents} from 'react-navigation';
import Menu, {MenuItem} from 'react-native-material-menu';
import Axios from '../Axios';
import isEmpty from 'lodash/isEmpty';
import orderBy from 'lodash/orderBy';
import isEqual from 'lodash/isEqual';
import ReportsHelp from '../home/ReportsHelp';
const TabIcon = props => (
  <Icon name={'users'} size={25} color={props.focused ? 'red' : '#424242'} />
);
let token = null;

let self = null;
let studentPermissions = null;
let studentsArray = [];
export default class Students extends React.Component {
  static navigationOptions = {
    tabBarIcon: TabIcon,
  };
  _menu = {};
  allStudents = [];
  setMenuRef = (id, ref) => {
    this._menu[id] = ref;
  };

  hideMenu = id => {
    this._menu[id].hide();
    this.delete(id);
  };

  showMenu = id => {
    this._menu[id].show();
  };
  constructor(props) {
    super(props);
    self = this;
    this.state = {
      loading: true,
      students: [],
      search: '',
      reportQuestionModal: false,
    };
    this.renderStudent = this.renderStudent.bind(this);
    this.getStudents = this.getStudents.bind(this);
    this.delete = this.delete.bind(this);
    this.searchHandler = this.searchHandler.bind(this);
    this.findAllActualImages = this.findAllActualImages.bind(this);
    this.showQuestionModal = this.showQuestionModal.bind(this);
  }
  showQuestionModal(visible) {
    this.setState({reportQuestionModal: visible});
  }
  // componentDidMount() {
  //   this.getToken();
  // }
  getToken = async () => {
    try {
      studentPermissions = null;
      const value = await AsyncStorage.multiGet([
        '@token',
        '@switchPermissions',
      ]);
      if (value[0][1] !== null) {
        if (token !== value[0][1] && token !== null) {
          this.setState({loading: true});
        }
        token = value[0][1];
        //getting student permissions
        studentPermissions = JSON.parse(value[1][1]).studentPermission;
        // console.log('TCL: -> Permissions', JSON.parse(value[1][1]));
        Axios.defaults.headers.common = {Authorization: `Bearer ${token}`};
        this.getStudents();
      } else {
        ToastAndroid.show('SignIn Expired', ToastAndroid.SHORT);
        self.props.navigation.navigate('Auth');
      }
    } catch (e) {}
  };
  getStudentsListener = () => {
    // if (token !== null) {
    this.getToken();
    // }
  };
  delete(id) {
    Axios.delete('student/delete', {data: {id}})
      .then(res => {
        if (res.status === 200) {
          const {students} = this.state;
          let filteredStudents = students.filter(item => item.id !== id);
          this.allStudents = filteredStudents;
          studentsArray = filteredStudents;
          this.setState({loading: false, students: filteredStudents});
          ToastAndroid.show('Student Deleted Sucessfully', ToastAndroid.SHORT);
        } else {
          ToastAndroid.show('Student Delete Failed', ToastAndroid.SHORT);
          this.setState({loading: false});
        }
      })
      .catch(() => {
        ToastAndroid.show('Student Delete Failed', ToastAndroid.SHORT);
        this.setState({loading: false});
      });
  }
  getStudents() {
    const {students} = self.state;
    Axios.get('student/findAll')
      .then(res => {
        if (res.status === 200) {
          const studentsOrdered = orderBy(
            res.data,
            ['firstName', 'lastName'],
            ['asc', 'asc'],
          );
          // console.log('TCL: getStudents -> studentsOrdered', studentsOrdered);
          if (studentsArray.length) {
            // console.log('TCL: getStudents -> studentsArray.length', res.data);
            let updateFilteredStudents = [];
            let exists = false;
            // console.log(studentsArray[0].compressedImage);
            // console.log(studentsOrdered[0]);
            for (let p of studentsOrdered) {
              exists = false;
              studentsArray.forEach((oldStudent, key) => {
                // console.log('TCL: getStudents -> key', key);
                // for (let ob in oldStudent) {
                //   // console.log('TCL: getStudents -> ob', ob);
                // }
                if (isEqual(p.imageUrl, oldStudent.compressedImage)) {
                  p.compressedImage = oldStudent.compressedImage;
                  p.imageUrl = oldStudent.imageUrl;
                  exists = true;
                  // console.log('TCL: getStudents -> exists', exists);
                  updateFilteredStudents.push(p);
                }
              });
              if (!exists) {
                // console.log('TCL: exists  ', studentsArray.length);
                updateFilteredStudents.push(p);
              }
            }
            studentsArray = updateFilteredStudents;
            self.allStudents = studentsOrdered;
            self.setState({loading: false, students: updateFilteredStudents});
          } else {
            // console.log('TCL: getStudents -> else', studentsArray.length);
            studentsArray = studentsOrdered;
            self.allStudents = studentsOrdered;
            self.setState({loading: false, students: studentsOrdered});
          }
          self.findAllActualImages();
        } else {
          ToastAndroid.show('Student Fetch Failed', ToastAndroid.SHORT);
          this.allStudents = [];
          studentsArray = [];
          self.setState({loading: false, students: []});
        }
      })
      .catch(e => {
        // console.log('TCL: getStudents -> catch', e);
        ToastAndroid.show('Student Fetch Failed', ToastAndroid.SHORT);
        this.allStudents = [];
        studentsArray = [];
        self.setState({loading: false, students: []});
      });
  }
  findAllActualImages() {
    Axios.get('student/findAllActualImage')
      .then(res => {
        if (res.status === 200) {
          let students = [...this.state.students];
          for (let p of res.data) {
            students.map((item, key) => {
              if (p.id === item.id) {
                if (
                  !students[key].compressedImage &&
                  students[key].imageUrl !== p.actualImage
                )
                  students[key].compressedImage = students[key].imageUrl;
                students[key].imageUrl = p.actualImage;
              }
            });
          }

          studentsArray = students;
          this.setState({students});
        }
      })
      .catch(() => {});
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
  renderStudent(item) {
    let image = null;
    if (!isEmpty(item.imageUrl)) {
      image = item.imageUrl;
    }
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() =>
          this.props.navigation.navigate('UpdateStudent', {
            item,
            token,
            students: studentsArray,
            studentPermissions,
          })
        }
        onLongPress={() => this.showMenu(item.id)}
        style={{
          height: 60,
          borderBottomColor: '#00000010',

          marginHorizontal: 15,
          borderBottomWidth: 1,
        }}>
        <Menu
          ref={r => this.setMenuRef(item.id, r)}
          button={
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
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
                <Text style={{fontSize: 18, color: '#4a4a4c'}}>
                  {item.firstName}
                </Text>
                <Text style={{fontSize: 18, color: '#4a4a4c'}}>
                  {item.lastName}
                </Text>
              </View>
            </View>
          }>
          <MenuItem onPress={() => this.hideMenu(item.id)}>
            Delete {item.firstName}
          </MenuItem>
        </Menu>
      </TouchableOpacity>
    );
  }
  render() {
    const {loading, students, search, reportQuestionModal} = this.state;
    // console.log('TCL: render -> students', students.length);
    return (
      <Fragment>
        <NavigationEvents onDidFocus={() => this.getStudentsListener()} />
        <ReportsHelp
          reportQuestionModal={reportQuestionModal}
          hideModal={() => this.showQuestionModal(false)}
          component="students"
        />
        <StatusBar backgroundColor="red" barStyle="light-content" />
        <Appbar.Header style={{backgroundColor: 'red'}}>
          <Appbar.Content
            title="Students"
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
              studentPermissions
                ? this.props.navigation.navigate('CreateStudent', {
                    token,
                    students,
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
          <View style={{height: 60, backgroundColor: 'rgba(255, 93, 98,0.5)'}}>
            <TextInput
              placeholder="Search Students"
              style={{
                marginHorizontal: 10,
                marginVertical: 8,
                borderRadius: 6,
                backgroundColor: '#fafafa',
                paddingLeft: 10,
              }}
              value={search}
              onChangeText={this.searchHandler}
              placeholderTextColor="#9e9e9e"
            />
          </View>
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
