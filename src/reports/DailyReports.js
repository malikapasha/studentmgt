/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
import React, {Fragment} from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Appbar} from 'react-native-paper';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Feather';
import Axios from '../Axios';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import Share from 'react-native-share';
const {Parser} = require('json2csv');
var base64 = require('base-64');
var utf8 = require('utf8');
export default class DailyReports extends React.Component {
  constructor(props) {
    super(props);
    this.state = {loading: true, reports: [], downloading: false};
    this._renderReportItem = this._renderReportItem.bind(this);
    this.renderStatusCountEach = this.renderStatusCountEach.bind(this);
    this.renderStudent = this.renderStudent.bind(this);
    this.getDailyReports = this.getDailyReports.bind(this);
    this.reportDownload = this.reportDownload.bind(this);
    this.shareHandler = this.shareHandler.bind(this);
  }
  componentDidMount() {
    const {userToken, startDate, endDate} = this.props.navigation.state.params;
    Axios.defaults.headers.common = {Authorization: `Bearer ${userToken}`};
    this.getDailyReports(startDate, endDate);
  }

  getDailyReports(startDate, endDate) {
    let current = moment(startDate, 'YYYY/MM/DD');
    let startDateModified =
      current.format('YYYY') +
      '-' +
      current.format('MM') +
      '-' +
      current.format('DD');
    current = moment(endDate, 'YYYY/MM/DD');
    let endDateModified =
      current.format('YYYY') +
      '-' +
      current.format('MM') +
      '-' +
      current.format('DD');
    // console.log('TCL: -> param', endDateModified, startDateModified);
    Axios.get('report/daily', {
      params: {
        startDate: startDateModified,
        endDate: endDateModified,
        download: false,
      },
    })
      .then(res => {
        const parsed = res.data;
        this.setState({loading: false, reports: parsed});
      })
      .catch(e => {
        this.setState({loading: false, reports: []});
      });
  }
  reportDownload() {
    const {reports} = this.state;
    if (isEmpty(reports)) {
      alert('No Data Found');
      return;
    }
    this.setState({downloading: true});
    const {startDate, endDate} = this.props.navigation.state.params;
    let current = moment(startDate, 'YYYY/MM/DD');
    let startDateModified =
      current.format('YYYY') +
      '-' +
      current.format('MM') +
      '-' +
      current.format('DD');
    current = moment(endDate, 'YYYY/MM/DD');
    let endDateModified =
      current.format('YYYY') +
      '-' +
      current.format('MM') +
      '-' +
      current.format('DD');
    let param = {
      startDate: startDateModified,
      endDate: endDateModified,
    };
    Axios.get('report/dailyReportDownload', {
      params: {...param},
    })
      .then(res => {
        const csvData = res.data;
        if (csvData.length) {
          this.setState({downloading: false});
          // console.log('csv response');
          // console.log(csvData);
          const filteredCSV = csvData.map(({status, ...item}) => {
            delete item.session;
            delete item.class_ID;
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
              item.notes,
            ];
          });
          // console.log('filteredCSV');
          // console.log(filteredCSV);
          this.shareHandler(startDate, endDate, filteredCSV);
        }
      })
      .catch(e => {
        this.setState({
          downloading: false,
        });
        // console.log(e);
      });
  }
  shareHandler = (startDate, endDate, filteredCSV) => {
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
      [''],
      [
        'AttendanceDate',
        'ClassName',
        'StartTime',
        'EndTime',
        'Student',
        'Status',
        'Notes',
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

    Share.open({
      urls: [shareUrl],
      title: 'ClassReport',
      subject: 'Daily Report Summary',
    })
      .then(r => {
        // console.log('share success: ');
      })
      .catch(e => {
        // console.log('share err: ', e);
      });
  };
  renderStatusCountEach(color, value) {
    return (
      <Text
        style={{
          fontSize: 13,
          color: '#fafafa',
          backgroundColor: color,
          borderRadius: 30,
          width: 22,
          height: 22,
          marginRight: 10,
          textAlign: 'center',
          textAlignVertical: 'center',
        }}>
        {value}
      </Text>
    );
  }
  renderStudent({status, notes, ...item}, key) {
    // console.log('TCL: -> item', item);
    return (
      <View
        key={key}
        style={{
          height: 45,
          marginBottom: 2,
          flexDirection: 'row',
        }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: '#ff000030',
            marginRight: 3,
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
            <Text>{item.student_name}</Text>
            {/* <Text>Ali</Text> */}
          </View>
        </View>
        <View
          style={{
            width: 40,
            borderWidth: 1,
            marginRight: 3,
            borderColor: '#ff000030',
            justifyContent: 'center',
            alignItems: 'center',
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
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Notes',
              notes === ''
                ? 'There is no notes associated with this record'
                : notes,
            )
          }
          activeOpacity={1}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#ff000030',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 2,
          }}>
          <Text>
            {notes.substring(0, 8)}
            {notes.length > 8 && '...'}
          </Text>
          <IconMaterial name={'info'} size={28} color={'grey'} />
        </TouchableOpacity>
      </View>
    );
  }
  _renderReportItem(classes) {
    // console.log('TCL: DailyReports -> classes', classes);
    let res = Object.keys(classes).map(obj => {
      let sessions = classes[obj];
      // console.log('o', obj, sessions);
      return Object.keys(sessions).map((s, k) => {
        // console.log('s', s, sessions[s]);
        let students = sessions[s];
        let classObj = students[0];
        let statusCount = {
          close: 0,
          check: 0,
          exclamation: 0,
          pill: 0,
          thumbsUp: 0,
          thumbsDown: 0,
        };
        let studentsView = students.map(({status, ...restData}, key) => {
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
          return this.renderStudent({...restData, status: status}, key);
        });
        const {
          check,
          close,
          exclamation,
          pill,
          thumbsUp,
          thumbsDown,
        } = statusCount;
        return (
          <View key={k}>
            <View
              style={{
                height: 50,
                borderWidth: 1,
                borderColor: '#ff000030',
                paddingHorizontal: 15,
                marginTop: 2,
                justifyContent: 'center',
              }}>
              <Text style={{fontWeight: '800', fontSize: 16}}>
                {classObj.class_name}
              </Text>
              <Text style={{color: 'grey', marginTop: 4}}>
                {`${moment(classObj.startTime).format('hh:mm a')} - ${moment(
                  classObj.endTime,
                ).format('hh:mm a')}`}
              </Text>
            </View>
            <View
              style={{
                minHeight: 40,
                paddingHorizontal: 10,
                marginTop: 2,
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
            {studentsView}
          </View>
        );
      });
    });
    return res;
  }
  render() {
    const {loading, downloading, reports} = this.state;
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
            title="Daily Report"
            titleStyle={{
              color: '#fafafa',
              fontWeight: '600',
              fontSize: 20,
              width: 140,
            }}
          />
          {downloading ? (
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
        </Appbar.Header>
        <ScrollView>
          <View
            style={{
              flex: 1,
              backgroundColor: '#fafafa',
              paddingHorizontal: 20,
            }}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="red"
                style={{marginTop: 10}}
              />
            ) : !isEmpty(reports) ? (
              reports.map(item => {
                return (
                  <Fragment key={item.date}>
                    <Text
                      style={{
                        height: 20,
                        paddingHorizontal: 15,
                        marginTop: 4,
                        textAlignVertical: 'center',
                        backgroundColor: '#ff000050',
                      }}>
                      {item.date}
                    </Text>
                    {this._renderReportItem(item.classes)}
                  </Fragment>
                );
              })
            ) : (
              <Text style={{marginTop: 10}}>No Data Found</Text>
            )}
            <View style={{marginTop: 20}} />
          </View>
        </ScrollView>
      </View>
    );
  }
}
