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
import {Appbar, Button} from 'react-native-paper';
import IconAnt from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/Feather';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
// import GradientView from '../ui/GradientView';
import AsyncStorage from '@react-native-community/async-storage';
import Menu, {MenuItem, MenuDivider} from 'react-native-material-menu';
import isEmpty from 'lodash/isEmpty';
const axios = require('axios');

let didFocus = null;
export default class ClassStudents extends React.Component {
  _menu = {};
  allStudents = [];

  setMenuRef = (id, ref) => {
    this._menu[id] = ref;
  };

  hideMenu = id => {
    this._menu[id].hide();
    this.deleteStudent(id);
  };

  showMenu = id => {
    this._menu[id].show();
  };

  constructor(props) {
    super(props);
    this.state = {students: [], search: '', loading: true};
    this.renderStudent = this.renderStudent.bind(this);
    this.deleteStudent = this.deleteStudent.bind(this);
    this.searchHandler = this.searchHandler.bind(this);
  }
  componentDidMount() {
    const self = this;
    didFocus = this.props.navigation.addListener('didFocus', () => {
      self.getAsyncStudents();
    });
  }
  componentWillUnmount() {
    didFocus.remove();
  }
  getAsyncStudents = async () => {
    const self = this;
    try {
      const value = await AsyncStorage.getItem('@classStudents');
      if (value !== null) {
        let studentsAsyncData = JSON.parse(value);
        this.allStudents = studentsAsyncData;
        self.setState({
          students: studentsAsyncData,
          loading: false,
        });
      } else {
        ToastAndroid.show('Error: Data Not Accessible', ToastAndroid.SHORT);

        self.setState({
          loading: false,
        });
      }
    } catch (e) {
      self.setState({
        loading: false,
      });
    }
  };
  deleteStudent(id) {
    const {students} = this.state;
    let filteredStudents = students.filter(item => item.id !== id);
    this.allStudents = filteredStudents;
    this.setState({students: filteredStudents});
    AsyncStorage.setItem('@classStudents', JSON.stringify(filteredStudents));
    ToastAndroid.show('Student Deleted', ToastAndroid.SHORT);
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
    const {students, search, loading} = this.state;
    return (
      <Fragment>
        <StatusBar backgroundColor="red" barStyle="light-content" />
        <Appbar.Header style={{backgroundColor: 'red'}}>
          <Appbar.Action
            icon={() => (
              <IconMaterial name={'arrow-back'} size={24} color={'#fafafa'} />
            )}
            onPress={() => this.props.navigation.goBack()}
          />
          <Appbar.Content
            title="Students"
            titleStyle={{color: '#fafafa', fontWeight: '600', fontSize: 24}}
          />
          <Appbar.Action
            onPress={() =>
              this.props.navigation.navigate('ClassStudentsAdd', {students})
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
              placeholderTextColor="#9e9e9e"
              value={search}
              onChangeText={this.searchHandler}
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
            <View
              style={{flex: 1, justifyContent: 'center', marginHorizontal: 20}}>
              <Text
                style={{
                  color: 'grey',
                  fontSize: 20,
                  letterSpacing: 0,
                  textAlign: 'center',
                }}>
                Simplify attendance process by{`\n`} pre-populating class with
                default{`\n`}
                students{`\n`}
              </Text>
              <Button
                style={{
                  backgroundColor: 'red',
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                mode="contained"
                onPress={() =>
                  this.props.navigation.navigate('ClassStudentsAdd', {students})
                }>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 20,
                    letterSpacing: 0,
                    textTransform: 'capitalize',
                  }}>
                  Assign Students
                </Text>
              </Button>
            </View>
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
