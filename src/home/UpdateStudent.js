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
  ScrollView,
  Text,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Platform,
  ActivityIndicator,
  ToastAndroid,
  Image,
  Linking,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import {TouchableRipple, Appbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconFeather from 'react-native-vector-icons/Feather';
import GradientView from '../ui/GradientView';
import IconAnt from 'react-native-vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImagePicker from 'react-native-image-crop-picker';
import Axios from '../Axios';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import isString from 'lodash/isString';
import moment from 'moment';
import ReportsHelp from './ReportsHelp';
import ImageResizer from 'react-native-image-resizer';
var RNFS = require('react-native-fs');
const TabIcon = props => (
  <Icon name={'doc'} size={20} color={props.focused ? 'red' : '#929292'} />
);

export default class UpdateStudent extends React.Component {
  static navigationOptions = {
    tabBarIcon: TabIcon,
  };
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      notes: '',
      id: null,
      dob: '',
      mode: 'date',
      show: false,
      token: null,
      loading: false,
      isModalVisible: false,
      image: null,
      imageResized: null,
      studentPermissions: false,
      reportQuestionModal: false,
    };
    this.updateHandler = this.updateHandler.bind(this);
    this.renderModal = this.renderModal.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.galleryOpener = this.galleryOpener.bind(this);
    this.cameraOpener = this.cameraOpener.bind(this);
    this.imageCompressor = this.imageCompressor.bind(this);
    this.dialerLinking = this.dialerLinking.bind(this);
    this.mailLinking = this.mailLinking.bind(this);
    this.showQuestionModal = this.showQuestionModal.bind(this);
  }
  componentDidMount() {
    const {
      token,
      item,
      studentPermissions,
    } = this.props.navigation.state.params;
    let {firstName, lastName, dob, phone, email, notes, id, imageUrl} = item;
    // console.log('TCL: componentDidMount -> dob', dob);

    if (isNull(dob)) {
      // console.log('TCL: null -> dob', dob);
      dob = null;
    } else {
      dob = new Date(dob);
      // console.log('TCL: empty -> dob', dob);
    }
    this.setState({
      studentPermissions,
      firstName,
      lastName,
      dob,
      phone,
      email,
      notes,
      token,
      id,
      image: isEmpty(imageUrl) ? null : imageUrl,
    });
  }
  showQuestionModal(visible) {
    this.setState({reportQuestionModal: visible});
  }
  dialerLinking() {
    const {phone} = this.state;
    if (phone === '') {
      Alert.alert('Error', 'Empty Phone Number');
      return;
    }
    // console.log(phone, 'here');
    Linking.openURL(`tel:${phone}`);
  }
  mailLinking() {
    const {email} = this.state;
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(email) === false) {
      Alert.alert('Error', 'Invalid Email');
    } else {
      Linking.openURL(`mailto:${email}?subject=SendMail&body=Description`);
    }
  }
  cameraOpener() {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
      includeBase64: true,
    })
      .then(image => {
        this.setState({
          image: image,
          isModalVisible: false,
        });
      })
      .catch(() => {});
  }
  galleryOpener() {
    ImagePicker.openPicker({
      mediaType: 'photo',
      includeBase64: true,
    })
      .then(image => {
        this.setState({
          image: image,
          isModalVisible: false,
        });
      })
      .catch(() => {});
  }
  async imageCompressor(image) {
    const resizedImageUrl = await ImageResizer.createResizedImage(
      image.path,
      40,
      40,
      'JPEG',
      100,
      0,
      RNFS.DocumentDirectoryPath,
    );
    const base64 = await RNFS.readFile(resizedImageUrl.uri, 'base64');
    // console.log('TCL: imageCompressor -> base64', base64);
    return base64;
  }
  toggleModal() {
    const {studentPermissions} = this.state;
    if (studentPermissions) {
      this.setState({isModalVisible: !this.state.isModalVisible});
    } else {
      Alert.alert('Unauthorized Access', 'You dont have this permission');
    }
  }
  async updateHandler() {
    const {token} = this.state;
    this.setState({loading: true});
    const {students, item} = this.props.navigation.state.params;
    const {imageUrl, compressedImage} = item;
    Axios.defaults.headers.common = {Authorization: `Bearer ${token}`};
    const {
      firstName,
      lastName,
      dob,
      phone,
      email,
      notes,
      id,
      image,
    } = this.state;
    const self = this;

    if (firstName === '' || lastName === '') {
      Alert.alert('Error', "Don't Leave Name Field Empty");
      self.setState({loading: false});
      return;
    }
    for (const std of students) {
      // console.log('TCL: UpdateStudent -> updateHandler -> std', std);
      if (std.email !== '' && std.email === email && std.id !== id) {
        Alert.alert('Error', 'Student with this email already exist!');
        self.setState({loading: false});
        return;
      }
      if (std.phone !== '' && std.phone === phone && std.id !== id) {
        Alert.alert('Error', 'Student with this phone num already exist!');
        self.setState({loading: false});
        return;
      }
    }
    try {
      let props = {
        firstName,
        lastName,
        dob: dob,
        phone,
        email,
        notes,
        id,
      };
      if (imageUrl !== image && image !== compressedImage) {
        if (!isEmpty(image)) {
          const imageCompressed = await this.imageCompressor(image);
          props.imageUrl = imageCompressed;
          props.actualImage = image.data;
        } else {
          props.imageUrl = '';
          props.actualImage = '';
        }
      }
      Axios.post('student/update', {...props})
        .then(res => {
          self.setState({loading: false});
          if (res.status === 200) {
            ToastAndroid.show(
              'Student Updated Successfully',
              ToastAndroid.SHORT,
            );
            self.props.navigation.goBack();
          } else {
            ToastAndroid.show('Student Update Failed', ToastAndroid.SHORT);
          }
        })
        .catch(() => {
          ToastAndroid.show('Student Update Failed', ToastAndroid.SHORT);
          self.setState({loading: false});
        });
    } catch (e) {
      // console.log('TCL: try catch updateHandler -> e', e);
      ToastAndroid.show('Student Update Failed', ToastAndroid.SHORT);
      self.setState({loading: false});
    }
  }
  setDate = (event, dob) => {
    dob = dob || this.state.dob;
    this.setState({
      show: Platform.OS === 'ios' ? true : false,
      dob,
    });
  };
  showDate = () => {
    this.setState({
      show: true,
    });
  };
  renderModal() {
    return (
      <Modal
        isVisible={this.state.isModalVisible}
        onSwipeComplete={() => this.setState({isModalVisible: false})}
        onBackdropPress={() => this.setState({isModalVisible: false})}
        swipeDirection={['left', 'right', 'down']}
        useNativeDriver
        style={{
          justifyContent: 'flex-end',
          margin: 0,
        }}>
        <View
          style={{
            height: 90,
            backgroundColor: '#fafafa',
            justifyContent: 'space-evenly',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => this.cameraOpener()}
            style={{
              height: 60,
              width: 75,
              alignItems: 'center',
            }}>
            <IconFontAwesome name={'camera'} size={30} color={'black'} />
            <Text style={{marginTop: 5, color: '#7a7474'}}>Take Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.galleryOpener()}
            style={{
              height: 60,
              width: 75,
              alignItems: 'center',
            }}>
            <IconFontAwesome name={'image'} size={30} color={'black'} />
            <Text style={{marginTop: 5, color: '#7a7474'}}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.setState({isModalVisible: false, image: null})}
            style={{
              height: 60,
              width: 75,
              alignItems: 'center',
            }}>
            <IconFontAwesome name={'trash'} size={30} color={'black'} />
            <Text style={{marginTop: 5, color: '#7a7474'}}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
  render() {
    const {
      show,
      dob,
      mode,
      loading,
      image,
      studentPermissions,
      reportQuestionModal,
    } = this.state;
    return (
      <Fragment>
        <ReportsHelp
          reportQuestionModal={reportQuestionModal}
          hideModal={() => this.showQuestionModal(false)}
          component="updatestudent"
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
            title={'Student Info'}
            titleStyle={{
              color: '#fafafa',
              fontWeight: '600',
              fontSize: 24,
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
              onPress={() =>
                studentPermissions
                  ? this.updateHandler()
                  : Alert.alert(
                      'Unauthorized Access',
                      'You dont have this permission',
                    )
              }
              title="Save"
              style={{alignItems: 'flex-end'}}
              titleStyle={{
                color: '#fff',
                width: 50,
                fontSize: 18,
                textAlign: 'right',
              }}
            />
          )}
        </Appbar.Header>
        {this.renderModal()}
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          style={{flex: 1, backgroundColor: '#fafafa'}}>
          <View style={{flexDirection: 'row-reverse'}}>
            <View style={{flex: 1, marginTop: 7}}>
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
                onChangeText={text => {
                  this.setState({firstName: text});
                }}
                value={this.state.firstName}
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
                onChangeText={text => {
                  this.setState({lastName: text});
                }}
                value={this.state.lastName}
              />
            </View>
            <TouchableOpacity
              onPress={this.toggleModal}
              style={{
                width: 110,
                marginTop: 10,
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
              {image ? (
                <Image
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 10,
                    borderWidth: 0.5,
                    borderColor: 'red',
                  }}
                  source={{
                    uri: image.path
                      ? `data:${image.mime};base64,${image.data}`
                      : `data:image/jpeg;base64,${image}`,
                  }}
                />
              ) : (
                <IconFeather
                  name={'user'}
                  size={50}
                  color={'red'}
                  style={{
                    width: 80,
                    height: 80,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    borderRadius: 10,
                    borderWidth: 0.5,
                    borderColor: 'red',
                  }}
                />
              )}
            </TouchableOpacity>
          </View>
          <GradientView
            title="Date of Birth"
            titleColor="#4a4a4c"
            height={18}
            marginTop={5}
            marginHorizontal={10}
          />
          <TouchableOpacity
            style={{
              marginHorizontal: 16,
              height: 40,
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}
            onPress={this.showDate}>
            {isNull(dob) ? (
              <Text
                style={{
                  fontSize: 18,
                  color: '#00000050',
                }}>
                e.g. 12-11-2000
              </Text>
            ) : (
              <Text
                style={{
                  fontSize: 18,
                }}>
                {moment(dob).format('DD-MM-YYYY')}
              </Text>
            )}
          </TouchableOpacity>
          {show && (
            <DateTimePicker
              value={isNull(dob) ? new Date() : dob}
              mode={mode}
              is24Hour={true}
              display="default"
              onChange={this.setDate}
            />
          )}
          <GradientView
            title="Phone:"
            titleColor="#4a4a4c"
            height={18}
            marginTop={5}
            marginHorizontal={10}
          />

          <View
            style={{
              height: 40,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TextInput
              placeholder="(344) 558-5825"
              keyboardType="phone-pad"
              style={{
                marginHorizontal: 16,
                color: '#4a4a4c',
                flex: 1,
                fontSize: 18,
              }}
              onChangeText={text => {
                this.setState({phone: text});
              }}
              value={this.state.phone}
            />
            <TouchableRipple
              borderless
              onPress={() => this.dialerLinking()}
              rippleColor="rgba(0, 0, 0, .32)"
              style={{marginRight: 20}}>
              <IconMaterial
                name={'phone'}
                size={24}
                color={'rgba(255, 40, 24,1)'}
              />
            </TouchableRipple>
          </View>
          <GradientView
            title="Email:"
            titleColor="#4a4a4c"
            height={18}
            marginTop={5}
            marginHorizontal={10}
          />

          <View
            style={{
              height: 40,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TextInput
              placeholder="e.g. john@gmail.com"
              style={{
                marginHorizontal: 16,
                color: '#4a4a4c',
                flex: 1,
                fontSize: 18,
              }}
              onChangeText={text => {
                this.setState({email: text});
              }}
              value={this.state.email}
            />
            <TouchableRipple
              borderless
              onPress={() => this.mailLinking()}
              rippleColor="rgba(0, 0, 0, .32)"
              style={{marginRight: 20}}>
              <IconMaterial
                name={'email'}
                size={24}
                color={'rgba(255, 40, 24,1)'}
              />
            </TouchableRipple>
          </View>
          <GradientView
            title="Events Notes:"
            titleColor="#4a4a4c"
            height={18}
            marginTop={5}
            marginHorizontal={10}
          />
          <View
            style={{
              height: 40,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              placeholder="Required"
              style={{
                marginHorizontal: 16,
                color: '#4a4a4c',
                flex: 1,
                fontSize: 18,
              }}>
              Events Notes:
            </Text>
            <IconMaterial
              style={{marginRight: 20}}
              name={'chevron-right'}
              size={24}
              color={'rgba(255, 40, 24,1)'}
            />
          </View>
          <GradientView
            title="Notes:"
            titleColor="#4a4a4c"
            height={18}
            marginTop={5}
            marginHorizontal={10}
          />
          <TextInput
            multiline
            placeholder="Add notes here..."
            style={{
              marginHorizontal: 16,
              color: '#4a4a4c',

              fontSize: 18,
            }}
            onChangeText={text => {
              this.setState({notes: text});
            }}
            value={this.state.notes}
          />
        </ScrollView>
      </Fragment>
    );
  }
}
