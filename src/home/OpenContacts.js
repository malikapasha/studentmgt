/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable handle-callback-err */
import React, {useState, useEffect, Fragment, useContext} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  TextInput,
  PermissionsAndroid,
} from 'react-native';
import IconFeather from 'react-native-vector-icons/Feather';
import {Appbar} from 'react-native-paper';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
var Contacts = require('react-native-contacts');
let isUndefined = require('lodash/isUndefined');
import {NavigationEvents} from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import isEmpty from 'lodash/isEmpty';
import _ from 'lodash';
let allContacts = [];
export default function OpenContacts(props) {
  let [loader, setLoader] = useState(true);
  let [users, setUsers] = useState([]);
  let [search, setSearch] = useState('');
  const getContacts = () => {
    // console.log('TCL: contacts');
    Contacts.getAll((err, contacts) => {
      // console.log('TCL: getContacts -> err', err);
      // console.log('TCL: getContacts -> contacts', contacts);
      let phoneNumbersArray = [];
      contacts.map(x => {
        if (err === 'denied') {
          Alert.alert('Error', 'Get Contacts Permission Denied');
        } else {
          if (!isUndefined(x.phoneNumbers)) {
            x.phoneNumbers.map(n => {
              phoneNumbersArray.push({
                id: n.id,
                firstName: x.givenName,
                lastName: x.familyName === null ? '' : x.familyName,
                phone: n.number.replace(/\s/g, ''),
                email: x.emailAddresses.length ? x.emailAddresses[0].email : '',
              });
            });
          }
        }
      });
      phoneNumbersArray = _.sortBy(phoneNumbersArray, [
        'firstName',
        'lastName',
      ]);
      allContacts = phoneNumbersArray;
      setUsers(phoneNumbersArray);
      setLoader(false);
    });
  };
  const requestReadContactsPermission = async () => {
    AsyncStorage.removeItem('@contacts');
    // console.log('here');
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'App Premission',
          message: 'App need permission.',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getContacts();
      } else {
        setLoader(false);
      }
    } catch (err) {
      setLoader(false);
    }
  };
  function saveAsyncContact({firstName, lastName, id, phone, email}) {
    const {students} = props.navigation.state.params;
    // console.log('TCL: saveAsyncContact -> students', students);
    for (const std of students) {
      if (std.email !== '' && email !== '' && std.email === email) {
        Alert.alert('Error', 'Student with this email already exist!');
        return;
      }
      if (std.phone !== '' && phone !== '' && std.phone === phone) {
        Alert.alert('Error', 'Student with this phone num already exist!');
        return;
      }
    }
    AsyncStorage.setItem(
      '@contacts',
      JSON.stringify({id, firstName, lastName, phone, email}),
    );
    props.navigation.goBack();
  }
  function searchHandler(text) {
    setSearch(text);
    if (!isEmpty(allContacts)) {
      let filteredStudents = allContacts.filter(o => {
        return o.firstName.includes(text) || o.lastName.includes(text);
      });
      setUsers(filteredStudents);
    }
  }
  function renderContact(obj) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        key={obj.id}
        onPress={() => saveAsyncContact(obj)}
        style={[
          styles.shadow,
          {
            height: 60,
            backgroundColor: '#fafafa',
            flexDirection: 'row',
          },
        ]}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <IconFeather
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
        </View>
        <View style={{flex: 4, flexDirection: 'column'}}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}>
            <Text style={{fontWeight: 'bold', fontSize: 15}}>
              {`${obj.firstName} ${obj.lastName}`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  return (
    <Fragment>
      <NavigationEvents onDidFocus={() => requestReadContactsPermission()} />
      <StatusBar backgroundColor="red" barStyle="light-content" />
      <Appbar.Header style={{backgroundColor: 'red'}}>
        <Appbar.Action
          icon={() => (
            <IconMaterial name={'arrow-back'} size={24} color={'#fafafa'} />
          )}
          onPress={() => props.navigation.goBack()}
        />
        <Appbar.Content
          title="Contacts"
          titleStyle={{color: '#fafafa', fontWeight: '600', fontSize: 24}}
        />
      </Appbar.Header>
      {loader === true ? (
        <ActivityIndicator style={{marginTop: 5}} size="large" color="red" />
      ) : (
        <Fragment>
          <View style={{height: 60, backgroundColor: 'rgba(255, 93, 98,0.5)'}}>
            <TextInput
              placeholder="Search Contact"
              style={{
                marginHorizontal: 10,
                marginVertical: 8,
                borderRadius: 6,
                backgroundColor: '#fafafa',
                paddingLeft: 10,
              }}
              value={search}
              onChangeText={searchHandler}
              placeholderTextColor="#9e9e9e"
            />
          </View>
          {!isUndefined(users) && (
            <FlatList
              data={users}
              renderItem={({item}) => renderContact(item)}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={{
                flexGrow: 1,
              }}
            />
          )}
        </Fragment>
      )}
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scene: {
    flex: 1,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.6,
    shadowRadius: 1,
    elevation: 2,
  },
  flex1: {flex: 1},
});
