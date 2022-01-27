/* eslint-disable no-alert */
/* eslint-disable react/no-string-refs */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
import React, {Fragment} from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  PermissionsAndroid,
  // Share,
  Platform,
} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import {Appbar} from 'react-native-paper';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import Axios from '../Axios';
import IconAnt from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/Feather';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
const {Parser} = require('json2csv');
var base64 = require('base-64');
var utf8 = require('utf8');

function statusIcon(status, key) {
  return (
    <View key={key} style={[styles.itemStyle2]}>
      {status === 1 && (
        <IconMaterial name={'check'} size={25} color={'green'} />
      )}
      {status === 0 && <IconMaterial name={'close'} size={25} color={'red'} />}
      {status === 2 && (
        <IconAnt name={'exclamation'} size={25} color={'blue'} />
      )}
      {status === 3 && (
        <IconMaterialCommunityIcons name={'pill'} size={25} color={'purple'} />
      )}
      {status === 4 && (
        <IconFontAwesome name={'thumbs-o-up'} size={25} color={'orange'} />
      )}
      {status === 5 && (
        <IconFontAwesome name={'thumbs-o-down'} size={25} color={'brown'} />
      )}
    </View>
  );
}
let rs = null;
export default class DailyReports extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      sharing: false,
      downloading: false,
      classReports: [],
      screenShot: '',
      reportHeader: {},
      reportItems: {},
    };
    this.getClassReports = this.getClassReports.bind(this);
    this.renderReportHeader = this.renderReportHeader.bind(this);
    this.renderReportItem = this.renderReportItem.bind(this);
    this.screenShotHandler = this.screenShotHandler.bind(this);
    this.shareHandler = this.shareHandler.bind(this);
    this.reportDownload = this.reportDownload.bind(this);
  }
  componentDidMount() {
    const {
      userToken,
      startDate,
      endDate,
      classObj,
    } = this.props.navigation.state.params;
    Axios.defaults.headers.common = {Authorization: `Bearer ${userToken}`};
    // console.log('TCL: classObj', classObj);
    this.getClassReports(startDate, endDate, classObj.id);
  }
  componentWillUnmount() {
    rs = null;
  }
  reportDownload() {
    const {startDate, endDate, classObj} = this.props.navigation.state.params;
    const {reportHeader} = this.state;
    if (isEmpty(reportHeader)) {
      alert('No Data Found');
      return;
    }
    this.setState({sharing: true});
    const classId = classObj.id;
    let current = moment(startDate, 'YYYY/MM/DD');
    let startDateModified =
      current.format('YYYY') +
      '-' +
      current.format('M') +
      '-' +
      current.format('D');
    current = moment(endDate, 'YYYY/MM/DD');
    let endDateModified =
      current.format('YYYY') +
      '-' +
      current.format('M') +
      '-' +
      current.format('D');
    let param = {
      startDate: startDateModified,
      endDate: endDateModified,
      classId,
    };
    Axios.get('report/classDownload', {
      params: {...param},
    })
      .then(res => {
        const csvData = res.data;
        // console.log('csv response');
        // console.log(csvData);
        const filteredCSV = csvData.map(({status, ...item}) => {
          delete item.session;
          delete item.class_ID;
          delete item.notes;
          item.startTime = moment(item.startTime).format('hha');
          item.endTime = moment(item.endTime).format('hha');
          let val = 'A';
          if (status === 1) {
            val = 'P';
          } else if (status === 2) {
            val = 'L';
          } else if (status === 3) {
            val = 'M';
          } else if (status === 4) {
            val = 'TU';
          } else if (status === 5) {
            val = 'TD';
          }
          item.status = val;
          return [
            item.attendence_date,
            item.class_name,
            item.startTime,
            item.endTime,
            item.student_name,
            item.status,
          ];
        });
        // console.log(filteredCSV);
        this.shareHandler(startDate, endDate, classObj, filteredCSV);
        this.setState({sharing: false});
      })
      .catch(e => {
        this.setState({
          sharing: false,
        });
        // console.log(e);
      });
  }
  getClassReports(startDate, endDate, classId) {
    // console.log('TCL: classId', classId);
    let current = moment(startDate, 'YYYY/MM/DD');
    let startDateModified =
      current.format('YYYY') +
      '-' +
      current.format('M') +
      '-' +
      current.format('D');
    current = moment(endDate, 'YYYY/MM/DD');
    let endDateModified =
      current.format('YYYY') +
      '-' +
      current.format('M') +
      '-' +
      current.format('D');
    let param = {
      startDate: startDateModified,
      endDate: endDateModified,
      classId,
      download: false,
    };
    Axios.get('report/class', {
      params: {...param},
    })
      .then(res => {
        // console.log(parsed);
        let reportHeader = {p: 0, a: 0, l: 0, m: 0, tu: 0, td: 0, dates: []};
        let reportItems = {};
        let allDateSessions = {};
        // console.log('res.data.length', res.data.length);
        if (res.data.length) {
          res.data.forEach(date => {
            let dateItem = {key: date.key, sessions: []};
            date.values[0].values.forEach((session, key) => {
              // console.log('TCL: session', date.key, session.key);
              allDateSessions = {
                ...allDateSessions,
                [date.key]: {
                  ...allDateSessions[date.key],
                  [session.key]: {},
                },
              };
            });
          });
          // console.log('allDateSessions', allDateSessions);
          res.data.forEach(date => {
            let dateItem = {key: date.key, sessions: []};
            date.values[0].values.forEach((session, key) => {
              //getting unique sessions per date
              if (session.values && session.values.length) {
                dateItem.sessions.push({
                  id: session.values[0].session,
                  startTime: session.values[0].startTime,
                  endTime: session.values[0].endTime,
                });
              }
              //getting attendanceStatuses
              session.values.forEach(
                ({
                  status,
                  student_name,
                  session,
                  attendence_date,
                  startTime,
                  endTime,
                  ...attendance
                }) => {
                  if (status === 0) {
                    reportHeader.a += 1;
                  } else if (status === 1) {
                    reportHeader.p += 1;
                  } else if (status === 2) {
                    reportHeader.l += 1;
                  } else if (status === 3) {
                    reportHeader.m += 1;
                  } else if (status === 4) {
                    reportHeader.tu += 1;
                  } else if (status === 5) {
                    reportHeader.td += 1;
                  }
                  if (isEmpty(reportItems[student_name])) {
                    let std = {
                      [student_name]: {
                        p: status === 1 ? 1 : 0,
                        a: status === 0 ? 1 : 0,
                        l: status === 2 ? 1 : 0,
                        m: status === 3 ? 1 : 0,
                        tu: status === 4 ? 1 : 0,
                        td: status === 5 ? 1 : 0,
                        dates: {
                          ...allDateSessions,
                          [attendence_date]: {
                            ...allDateSessions[attendence_date],
                            [session]: {status, startTime, endTime},
                          },
                        },
                      },
                    };
                    reportItems = {...reportItems, ...std};
                  } else {
                    //get existing student
                    let existing = reportItems[student_name];
                    // console.log('TCL: existing', existing);
                    let std = {
                      [student_name]: {
                        p: status === 1 ? existing.p + 1 : existing.p,
                        a: status === 0 ? existing.a + 1 : existing.a,
                        l: status === 2 ? existing.l + 1 : existing.l,
                        m: status === 3 ? existing.m + 1 : existing.m,
                        tu: status === 4 ? existing.tu + 1 : existing.tu,
                        td: status === 5 ? existing.td + 1 : existing.td,
                        dates: {
                          ...existing.dates,
                          [attendence_date]: {
                            ...existing.dates[attendence_date],
                            [session]: {status, startTime, endTime},
                          },
                        },
                      },
                    };
                    reportItems = {...reportItems, ...std};
                  }
                },
              );
            });
            reportHeader.dates.push(dateItem);
          });
          this.setState({
            loading: false,
            reportHeader,
            reportItems,
            classReports: [],
          });
        } else {
          this.setState({
            loading: false,
            reportHeader: {},
            reportItems: {},
            classReports: [],
          });
        }

        // console.log('TCL:-> reportHeader', reportHeader);
        // console.log('TCL: reportItems', reportItems);
      })
      .catch(e => {
        this.setState({
          loading: false,
          reportHeader: {},
          reportItems: {},
          classReports: [],
        });
        // console.log(e);
      });
  }
  shareHandler = (startDate, endDate, classObj, filteredCSV) => {
    let csvOwn = [
      [
        'Description:',
        'P = Present',
        'A = Absent',
        'L = Late',
        'M = Medical',
        'TU = Thumb Up',
        'TD = Thumb Down',
      ],
      [''],
      ['Start Date', moment(startDate).format('DD/MM/YY')],
      ['End Date', moment(endDate).format('DD/MM/YY')],
      ['Class Name', classObj.name],
      ['Class Info', classObj.info],
      [''],
      [
        'AttendanceDate',
        'ClassName',
        'StartTime',
        'EndTime',
        'Student',
        'Status',
      ],
      ...filteredCSV,
    ];
    // console.log('csvOwn');
    // console.log(csvOwn);
    const parser = new Parser({});
    const csv = parser.parse(csvOwn);
    var n = csv.indexOf('"Description:"');
    const updateCSV = csv.substr(n);
    // console.log('TCL: updateCSV:', updateCSV);
    var bytes = utf8.encode(updateCSV);
    var encoded = base64.encode(bytes);
    const shareUrl = `data:text/comma-separated-values;base64,${encoded}`;
    this.refs.viewShot
      .capture()
      .then(uri => {
        Share.open({
          urls: [shareUrl, uri],
          title: 'ClassReport',
          subject: 'Class Report Summary',
        })
          .then(r => {
            // console.log('share success: ');
          })
          .catch(e => {
            // console.log('share err: ', e);
          });
      })
      .catch(e => {
        // console.log('image screen err: ', e);
      });
  };
  async screenShotHandler() {
    this.setState({downloading: true});
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          this.refs.viewShot.capture().then(uri => {
            CameraRoll.saveToCameraRoll(uri, 'photo').then(r => {
              this.setState({downloading: false});
              alert('Image Saved');
            });
          });
        } else {
          alert('Permission denied');
          this.setState({downloading: false});
        }
      } catch (err) {
        this.setState({downloading: false});
        // console.log('err', err);
      }
    }
  }
  renderReportItem(student, key) {
    const {dates, ...details} = this.state.reportItems[student];
    return (
      <View
        key={key}
        style={{
          flexDirection: 'row',
          backgroundColor: '#fafafa',
          height: 60,
          borderBottomWidth: 1,
          borderColor: '#d3d3d350',
        }}>
        <View
          style={{
            width: 200,
            justifyContent: 'center',
            flexDirection: 'row',
            borderLeftWidth: 1,
            borderColor: '#d3d3d350',
            borderRightWidth: 1,
          }}>
          <Icon
            name={'user'}
            size={28}
            color={'red'}
            style={{
              textAlign: 'center',
              textAlignVertical: 'center',
              borderWidth: 0.5,
              borderColor: 'red',
              width: 32,
              height: 32,
              marginHorizontal: 4,
              alignSelf: 'center',
              borderRadius: 4,
            }}
          />
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
            }}>
            <Text>{student}</Text>
          </View>
        </View>
        <View style={styles.itemStyle}>
          <Text style={{fontSize: 10, color: 'black'}}>{details.p}</Text>
        </View>
        <View style={styles.itemStyle}>
          <Text style={{fontSize: 10, color: 'black'}}>{details.a}</Text>
        </View>
        <View style={styles.itemStyle}>
          <Text style={{fontSize: 10, color: 'black'}}>{details.l}</Text>
        </View>
        <View style={styles.itemStyle}>
          <Text style={{fontSize: 10, color: 'black'}}>{details.m}</Text>
        </View>
        <View style={styles.itemStyle}>
          <Text style={{fontSize: 10, color: 'black'}}>{details.tu}</Text>
        </View>
        <View
          style={[
            styles.itemStyle,
            {
              borderColor: '#d3d3d350',
              borderRightWidth: 1,
            },
          ]}>
          <Text style={{fontSize: 10, color: 'black'}}>{details.td}</Text>
        </View>
        {Object.keys(dates).map(date => {
          return Object.keys(dates[date]).map((session, k) => {
            const sessions = dates[date];
            const {status} = sessions[session];
            return status !== undefined ? (
              statusIcon(status, k)
            ) : (
              <View key={k} style={[styles.itemStyle2]} />
            );
          });
        })}
      </View>
    );
  }
  renderReportHeader({p, a, l, m, tu, td, dates}) {
    const {classObj} = this.props.navigation.state.params;
    return (
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#eceff1',
          height: 65,
          alignItems: 'flex-start',
          paddingTop: 5,
        }}>
        <View
          style={{
            width: 200,
            paddingHorizontal: 15,
            marginTop: 4,
            justifyContent: 'center',
          }}>
          <Text style={{fontWeight: 'bold', color: 'grey', fontSize: 18}}>
            {classObj.name}
          </Text>
          <Text style={{fontSize: 16, color: 'grey'}}>{classObj.info}</Text>
        </View>
        <View style={styles.itemStyle}>
          <IconMaterial name={'check'} size={25} color={'green'} />
          <Text style={{fontSize: 10, color: 'black'}}>{p}</Text>
        </View>
        <View style={styles.itemStyle}>
          <IconMaterial name={'close'} size={25} color={'red'} />
          <Text style={{fontSize: 10, color: 'black'}}>{a}</Text>
        </View>
        <View style={styles.itemStyle}>
          <IconAnt name={'exclamation'} size={25} color={'blue'} />
          <Text style={{fontSize: 10, color: 'black'}}>{l}</Text>
        </View>
        <View style={styles.itemStyle}>
          <IconMaterialCommunityIcons
            name={'pill'}
            size={25}
            color={'purple'}
          />
          <Text style={{fontSize: 10, color: 'black'}}>{m}</Text>
        </View>
        <View style={styles.itemStyle}>
          <IconFontAwesome name={'thumbs-o-up'} size={25} color={'orange'} />
          <Text style={{fontSize: 10, color: 'black'}}>{tu}</Text>
        </View>
        <View
          style={[
            styles.itemStyle,
            {
              borderColor: '#d3d3d350',
              borderRightWidth: 1,
            },
          ]}>
          <IconFontAwesome name={'thumbs-o-down'} size={25} color={'brown'} />
          <Text style={{fontSize: 10, color: 'black'}}>{td}</Text>
        </View>
        {dates.map(date => {
          return (
            <View
              key={date.key}
              style={{
                width: 'auto',
                marginTop: 4,
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: '#d3d3d380',
                borderRightWidth: 1,
              }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: 'grey',
                  textAlign: 'center',
                }}>
                Tue
              </Text>
              <Text style={{fontSize: 13, color: 'black'}}>
                {moment(date.key, 'MMMM DD YYYY').format('DD/MM/YY')}
              </Text>
              <View style={styles.sessionParent}>
                {date.sessions.map((session, key) => {
                  if (
                    date.sessions.length > 0 &&
                    key === date.sessions.length - 1
                  ) {
                    let extraWidth = 1 * key;
                    return (
                      <Text
                        key={key}
                        style={{
                          fontSize: 10,
                          color: 'grey',
                          textAlign: 'center',
                          maxWidth: 75 + extraWidth,
                          width: 75 + extraWidth,
                        }}>{`${moment(session.startTime).format(
                        'hha',
                      )} - ${moment(session.endTime).format('hha')}`}</Text>
                    );
                  }
                  return (
                    <Text key={key} style={styles.sessionTime}>{`${moment(
                      session.startTime,
                    ).format('hha')} - ${moment(session.endTime).format(
                      'hha',
                    )}`}</Text>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    );
  }
  render() {
    const {
      loading,
      downloading,
      sharing,
      reportHeader,
      reportItems,
    } = this.state;
    return (
      <View style={{flex: 1}}>
        <Appbar.Header style={{backgroundColor: 'red'}}>
          <Appbar.Action
            icon={() => (
              <IconMaterial name={'arrow-back'} size={22} color={'#fafafa'} />
            )}
            onPress={() => this.props.navigation.goBack()}
          />
          <Appbar.Content
            title="Class Report"
            titleStyle={{
              color: '#fafafa',
              fontWeight: '600',
              fontSize: 20,
              width: 140,
            }}
          />
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#fafafa"
              style={{width: 48}}
            />
          ) : (
            <Fragment>
              {downloading ? (
                <ActivityIndicator
                  size="small"
                  color="#fafafa"
                  style={{width: 48}}
                />
              ) : (
                <Appbar.Action
                  color="#fafafa"
                  onPress={() => this.screenShotHandler()}
                  icon={'image-area'}
                />
              )}
              {sharing ? (
                <ActivityIndicator
                  size="small"
                  color="#fafafa"
                  style={{width: 48}}
                />
              ) : (
                <Appbar.Action
                  color="#fafafa"
                  onPress={() => this.reportDownload()}
                  icon={'share-variant'}
                />
              )}
            </Fragment>
          )}
        </Appbar.Header>
        {loading ? (
          <ActivityIndicator color="red" size="large" style={{marginTop: 10}} />
        ) : (
          <ScrollView contentContainerStyle={{flexGrow: 1}}>
            <ScrollView horizontal={true}>
              <ViewShot ref="viewShot">
                <View
                  style={{
                    flex: 1,
                    backgroundColor: '#fafafa',
                    paddingHorizontal: 4,
                  }}>
                  {isEmpty(reportHeader) ? (
                    <Text style={{margin: 10}}>No Data</Text>
                  ) : (
                    <Fragment>
                      {this.renderReportHeader(reportHeader)}
                      {isEmpty(reportItems)
                        ? null
                        : Object.keys(reportItems).map((student, key) =>
                            this.renderReportItem(student, key),
                          )}
                    </Fragment>
                  )}
                </View>
              </ViewShot>
            </ScrollView>
          </ScrollView>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  sessionParent: {
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  sessionTime: {
    fontSize: 10,
    color: 'grey',
    textAlign: 'center',
    maxWidth: 75,
    width: 75,
  },
  itemStyle: {
    width: 40,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemStyleH2: {
    width: 65,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemStyle2: {
    width: 76,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#d3d3d350',
    borderRightWidth: 1,
  },
});
