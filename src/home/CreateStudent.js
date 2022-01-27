/* eslint-disable no-alert */
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
  TextInput,
  ToastAndroid,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {Button, Appbar, TouchableRipple} from 'react-native-paper';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import GradientView from '../ui/GradientView';
import {NavigationEvents} from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import Axios from '../Axios';
const isEmpty = require('lodash/isEmpty');

const TabIcon = props => (
  <Icon name={'doc'} size={20} color={props.focused ? '#3dafe4' : '#929292'} />
);
let componentDidAppearCheck = false;
let allStudentsYet = [];
export default class CreateStudent extends React.Component {
  static navigationOptions = {
    tabBarIcon: TabIcon,
  };
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      students: [],
      loading: false,
    };
    this.studentItem = this.studentItem.bind(this);
    this.addStudent = this.addStudent.bind(this);
    this.createStudentsHandler = this.createStudentsHandler.bind(this);
    this.filterStudent = this.filterStudent.bind(this);
    this.getAsyncStudents = this.getAsyncStudents.bind(this);
  }
  addStudent(id, firstName, lastName) {
    let {students} = this.state;
    students.unshift({id, firstName, lastName});
    this.setState({students});
  }
  filterStudent(id) {
    const {students} = this.state;
    this.setState({students: students.filter(item => item.id !== id)});
  }
  componentDidMount() {
    AsyncStorage.removeItem('@contacts');
    const {students} = this.props.navigation.state.params;
    // console.log('TCL: componentDidMount -> students', students.length);
    allStudentsYet = students;
  }
  componentWillUnmount() {
    AsyncStorage.removeItem('@contacts');
    allStudentsYet = [];
  }
  async getAsyncStudents() {
    try {
      const value = await AsyncStorage.getItem('@contacts');
      if (value !== null) {
        const contactAsync = JSON.parse(value);
        // console.log('TCL: getAsyncStudents -> contactAsync', contactAsync);
        allStudentsYet.push(contactAsync);
        this.setState({students: [...this.state.students, contactAsync]});
      } else {
      }
    } catch (e) {}
  }
  createStudentsHandler() {
    const self = this;
    self.setState({loading: true});
    const {token} = this.props.navigation.state.params;
    Axios.defaults.headers.common = {Authorization: `Bearer ${token}`};
    const {students} = this.state;
    // console.log('TCL: createStudentsHandler -> students', students);
    if (!students.length) {
      alert('Please Add Student');
      self.setState({loading: false});
      return;
    }
    Axios.post('student/create', {students})
      .then(res => {
        self.setState({loading: false});
        if (res.status === 200) {
          ToastAndroid.show('Student Created Successfully', ToastAndroid.SHORT);
          self.props.navigation.goBack();
        } else {
          ToastAndroid.show('Student Create Failed', ToastAndroid.SHORT);
        }
      })
      .catch(e => {
        // console.log('TCL: createStudentsHandler -> e', e);
        ToastAndroid.show('Student Create Failed', ToastAndroid.SHORT);
        self.setState({loading: false});
      });
  }
  studentItem(item) {
    return (
      <View
        key={item.id}
        style={{
          marginHorizontal: 10,
          borderRadius: 5,
          minHeight: 60,
          flexDirection: 'row',
          paddingLeft: 10,
          borderColor: 'lightgrey',
          borderBottomWidth: 0.4,
        }}>
        <View
          style={{
            flex: 4,
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}>
          <Text style={{fontSize: 20, fontWeight: '800', color: '#4a4a4c'}}>
            {`${item.firstName} ${item.lastName}`}
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
          <TouchableRipple
            borderless
            rippleColor="rgba(0, 0, 0, .32)"
            style={{backgroundColor: 'red', borderRadius: 100}}
            onPress={() => this.filterStudent(item.id)}>
            <IconMaterial name={'close'} size={22} color={'#fafafa'} />
          </TouchableRipple>
        </View>
      </View>
    );
  }
  render() {
    const {students, firstName, lastName, loading} = this.state;
    // console.log('allStudentsYet', allStudentsYet);
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
            title={'Add Students'}
            titleStyle={{
              color: '#fafafa',
              fontWeight: '600',
              fontSize: 20,
              width: 140,
            }}
          />
          <Appbar.Content
            title="Contacts"
            onPress={() =>
              this.props.navigation.navigate('OpenContacts', {
                students: allStudentsYet,
              })
            }
            style={{alignItems: 'flex-end'}}
            titleStyle={{
              color: '#fff',
              width: 80,
              fontSize: 16,
              textAlign: 'right',
            }}
          />
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#fafafa"
              style={{width: 48}}
            />
          ) : (
            <Appbar.Action
              onPress={this.createStudentsHandler}
              style={{alignItems: 'flex-end'}}
              icon={() => (
                <IconMaterial name={'check'} size={22} color={'#fafafa'} />
              )}
            />
          )}
        </Appbar.Header>
        <NavigationEvents onDidFocus={this.getAsyncStudents} />
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <GradientView
              title="First Name:"
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
              value={firstName}
              onChangeText={e => this.setState({firstName: e})}
            />
            <GradientView
              title="Last Name:"
              titleColor="#4a4a4c"
              height={18}
              marginTop={0}
              marginHorizontal={10}
            />
            <TextInput
              placeholder="Required"
              style={{marginHorizontal: 15}}
              placeholderTextColor="#9e9e9e"
              value={lastName}
              onChangeText={e => this.setState({lastName: e})}
            />
          </View>
          <View
            style={{
              width: 110,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Button
              mode="contained"
              color={'red'}
              disabled={isEmpty(firstName) || isEmpty(lastName) ? true : false}
              onPress={() => this.addStudent(new Date(), firstName, lastName)}
              style={{width: 80}}
              labelStyle={{color: '#fafafa', textTransform: 'capitalize'}}>
              Add
            </Button>
          </View>
        </View>
        <View
          style={{
            backgroundColor: 'rgba(255, 97, 99,0.4)',
            height: 20,
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: '#4a4a4c',
              textAlign: 'left',
              marginLeft: 10,
            }}>
            Total added: 0
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}>
          {students.length
            ? students.map(item => {
                return this.studentItem(item);
              })
            : null}
        </ScrollView>
      </Fragment>
    );
  }
}
