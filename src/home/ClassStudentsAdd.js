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
} from 'react-native';
import {Appbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-community/async-storage';
import {NavigationEvents} from 'react-navigation';
import isEmpty from 'lodash/isEmpty';
import orderBy from 'lodash/orderBy';
import Axios from '../Axios';

const differenceBy = require('lodash/differenceBy');
const TabIcon = props => (
  <Icon name={'users'} size={25} color={props.focused ? 'red' : '#929292'} />
);
let token = null;
let alreadyAdded = [];
export default class ClassStudentsAdd extends React.Component {
  allStudents = [];
  static navigationOptions = {
    tabBarIcon: TabIcon,
  };
  constructor(props) {
    super(props);
    this.state = {loading: true, students: [], search: ''};
    this.renderStudent = this.renderStudent.bind(this);
    this.getStudents = this.getStudents.bind(this);
    this.addStudentAsync = this.addStudentAsync.bind(this);
    this.searchHandler = this.searchHandler.bind(this);
    this.findAllActualImages = this.findAllActualImages.bind(this);
  }
  componentDidMount() {
    alreadyAdded = this.props.navigation.state.params.students;
    this.getToken();
  }
  componentWillUnmount() {
    alreadyAdded = [];
  }
  getToken = async () => {
    const self = this;
    try {
      const value = await AsyncStorage.getItem('@token');
      if (value !== null) {
        token = value;
        Axios.defaults.headers.common = {Authorization: `Bearer ${token}`};
        this.getStudents();
      } else {
        ToastAndroid.show('SignIn Expired', ToastAndroid.SHORT);
        self.props.navigation.navigate('Auth');
      }
    } catch (e) {}
  };
  getStudentsListener = () => {
    if (token !== null) {
      this.getStudents();
    }
  };
  getStudents() {
    //here filter endpoint results
    let {report, studentObj} = this.props.navigation.state.params;

    Axios.get('student/findAll')
      .then(res => {
        if (res.status === 200) {
          this.findAllActualImages();
          const filteredStudents = differenceBy(res.data, alreadyAdded, 'id');
          let studentsOrder = orderBy(
            filteredStudents,
            ['firstName', 'lastName'],
            ['asc', 'asc'],
          );
          if (report) {
            const {studentClassAsync} = studentObj;
            if (studentClassAsync === 'All Classes') {
              this.allStudents = [...studentsOrder];
            } else {
              let allStudentsWRTClass = [];
              for (let std of studentClassAsync.student) {
                const filteredStudentOfClass = studentsOrder.filter(
                  item => item.id === std.id,
                );
                if (filteredStudentOfClass.length) {
                  allStudentsWRTClass.push(filteredStudentOfClass[0]);
                }
              }
              studentsOrder = allStudentsWRTClass;
              this.allStudents = [...studentsOrder];
            }
          }
          this.setState({loading: false, students: studentsOrder});
        } else {
          ToastAndroid.show('Student Fetch Failed', ToastAndroid.SHORT);
          this.setState({loading: false});
        }
      })
      .catch(() => {
        ToastAndroid.show('Student Fetch Failed', ToastAndroid.SHORT);
        this.setState({loading: false});
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
                students[key].imageUrl = p.actualImage;
              }
            });
          }
          this.setState({students});
        }
      })
      .catch(() => {});
  }
  addStudentAsync(item) {
    let {report, studentObj} = this.props.navigation.state.params;
    // console.log('TCL: addStudentAsync -> report', report);
    if (report) {
      studentObj = {
        ...studentObj,
        id: item.id,
        firstName: item.firstName,
        lastName: item.lastName,
      };
      AsyncStorage.setItem('@studentAsync', JSON.stringify(studentObj));
      this.props.navigation.goBack();
      return;
    }
    const found = alreadyAdded.filter(obj => obj.id === item.id);
    if (!found.length) {
      alreadyAdded.unshift(item);
      AsyncStorage.setItem('@classStudents', JSON.stringify(alreadyAdded));
      const {students} = this.state;
      const filteredStudents = differenceBy(students, alreadyAdded, 'id');
      this.allStudents = filteredStudents;
      this.setState({students: filteredStudents});
      ToastAndroid.show('Student Added Successfully', ToastAndroid.SHORT);
    } else {
      ToastAndroid.show('Already Added', ToastAndroid.SHORT);
    }
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
    // console.log('TCL: renderStudent -> item', item);
    let image = null;
    if (!isEmpty(item.imageUrl)) {
      image = item.imageUrl;
    }
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => this.addStudentAsync(item)}
        style={{
          height: 60,
          borderBottomColor: '#00000010',

          marginHorizontal: 15,
          borderBottomWidth: 1,
        }}>
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
      </TouchableOpacity>
    );
  }
  render() {
    const {loading, students, search} = this.state;
    return (
      <Fragment>
        <NavigationEvents onDidFocus={() => this.getStudentsListener()} />
        <StatusBar backgroundColor="red" barStyle="light-content" />
        <Appbar.Header style={{backgroundColor: 'red'}}>
          <Appbar.Action
            icon={() => (
              <IconMaterial name={'arrow-back'} size={24} color={'#fafafa'} />
            )}
            onPress={() => this.props.navigation.goBack()}
          />
          <Appbar.Content
            title="Pick Students"
            titleStyle={{color: '#fafafa', fontWeight: '600', fontSize: 24}}
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
              placeholderTextColor="#9e9e9e"
              value={search}
              onChangeText={this.searchHandler}
            />
          </View>
          {/* <GradientView
              title="A"
              titleColor="red"
              height={18}
              marginTop={0}
              marginHorizontal={10}
            /> */}
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
