/* eslint-disable no-alert */
/* eslint-disable prettier/prettier */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
import React, {Fragment} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Appbar, TouchableRipple} from 'react-native-paper';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/Feather';
import GradientView from '../ui/GradientView';
import Tabs from './Tabs';
import {PieChart} from 'react-native-svg-charts';
import Axios from '../Axios';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';

let allStudentReports = [];
let statusCount = {
  close: 0,
  check: 0,
  exclamation: 0,
  pill: 0,
  thumbsUp: 0,
  thumbsDown: 0,
};
const initialLayout = {height: 0, width: Dimensions.get('window').width};
function alertUI(note) {
  Alert.alert(
    'Notes',
    note === '' ? 'There is no notes associated with this record' : note,
  );
}
function renderStudent({firstName, lastName, image}) {
  return (
    <View
      style={{
        height: 60,
        marginHorizontal: 10,
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
          <Text style={styles.studentName}>{firstName}</Text>
          <Text style={styles.studentName}>{lastName}</Text>
        </View>
      </View>
    </View>
  );
}
function renderStatusCountEach(color, value, status) {
  return (
    <View style={{flexDirection: 'row', marginTop: 2}}>
      <Text
        style={{
          fontSize: 12,
          color: '#fafafa',
          backgroundColor: color,
          borderRadius: 30,
          width: 20,
          height: 20,
          marginHorizontal: 5,
          textAlign: 'center',
          textAlignVertical: 'center',
        }}>
        {value}
      </Text>
      <Text
        style={{
          textAlign: 'center',
          fontSize: 13,
          textAlignVertical: 'center',
        }}>
        {status}
      </Text>
    </View>
  );
}

function renderChartSection(tabStatus) {
  const {check, close, exclamation, pill, thumbsUp, thumbsDown} = statusCount;
  const list = [
    {
      value: check,
      key: 1,
      svg: {fill: 'green'},
      arc: tabStatus === 'P' ? {outerRadius: 90 + 25 + '%', padAngle: 0.1} : {},
    },
    {
      value: close,
      key: 0,
      svg: {fill: 'red'},
      arc: tabStatus === 'A' ? {outerRadius: 90 + 25 + '%', padAngle: 0.1} : {},
    },
    {
      value: exclamation,
      key: 2,
      svg: {fill: 'blue'},
      arc: tabStatus === 'L' ? {outerRadius: 90 + 25 + '%', padAngle: 0.1} : {},
    },
    {
      value: pill,
      key: 3,
      svg: {fill: 'purple'},
      arc: tabStatus === 'M' ? {outerRadius: 90 + 25 + '%', padAngle: 0.1} : {},
    },
    {
      value: thumbsUp,
      key: 4,
      svg: {fill: 'orange'},
      arc:
        tabStatus === 'TU' ? {outerRadius: 90 + 25 + '%', padAngle: 0.1} : {},
    },
    {
      value: thumbsDown,
      key: 5,
      svg: {fill: 'brown'},
      arc:
        tabStatus === 'TD' ? {outerRadius: 90 + 25 + '%', padAngle: 0.1} : {},
    },
  ];
  return (
    <View
      style={{
        marginHorizontal: 10,
        flexDirection: 'row',
        minHeight: 230,
        flex: 1,
      }}>
      <View
        style={{
          flexDirection: 'row',
          flex: 2,
          borderColor: '#d3d3d360',
          borderWidth: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <PieChart
          style={{height: 200, width: 180}}
          animate
          padAngle={0}
          animationDuration={300}
          data={list}
          labelRadius={40}
          innerRadius={'0%'}
          outerRadius={'85%'}
        />
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
        }}>
        <Text style={{fontSize: 13, marginLeft: 6, marginBottom: 2}}>
          Total: {allStudentReports.length}
        </Text>
        {check > 0 && renderStatusCountEach('green', check, 'Present')}
        {close > 0 && renderStatusCountEach('red', close, 'Absent')}
        {exclamation > 0 && renderStatusCountEach('blue', exclamation, 'Late')}
        {pill > 0 && renderStatusCountEach('purple', pill, 'Medical')}
        {thumbsUp > 0 && renderStatusCountEach('orange', thumbsUp, 'Thumb Up')}
        {thumbsDown > 0 &&
          renderStatusCountEach('brown', thumbsDown, 'Thumb Down')}
      </View>
    </View>
  );
}
export default class StudentReports extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      studentsReport: [],
      chartVisibility: true,
      tabStatus: 'All',
    };
    this.studentItem = this.studentItem.bind(this);

    this.getStudentReports = this.getStudentReports.bind(this);
    this.filterStudentReports = this.filterStudentReports.bind(this);
  }
  componentDidMount() {
    allStudentReports = [];
    const {
      userToken,
      startDate,
      endDate,
      studentObj,
    } = this.props.navigation.state.params;
    Axios.defaults.headers.common = {Authorization: `Bearer ${userToken}`};
    const {studentClassAsync} = studentObj;
    let classId = null;
    if (studentClassAsync.id) {
      classId = studentClassAsync.id;
    }
    statusCount = {
      close: 0,
      check: 0,
      exclamation: 0,
      pill: 0,
      thumbsUp: 0,
      thumbsDown: 0,
    };
    this.getStudentReports(startDate, endDate, studentObj.id, classId);
  }
  componentWillUnmount() {
    allStudentReports = [];
    statusCount = {
      close: 0,
      check: 0,
      exclamation: 0,
      pill: 0,
      thumbsUp: 0,
      thumbsDown: 0,
    };
  }
  getStudentReports(startDate, endDate, studentId, classId) {
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
      studentId,
      download: false,
    };
    if (classId) {
      param.classId = classId;
    }
    Axios.get('report/student', {
      params: {...param},
    })
      .then(res => {
        const parsed = res.data;
        // console.log('TCL: -> res:', parsed.length);
        allStudentReports = res.data;
        allStudentReports.forEach(({status}) => {
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
        this.setState({loading: false, studentsReport: allStudentReports});
      })
      .catch(e => {
        this.setState({loading: false, studentsReport: []});
        // console.log(e);
      });
  }
  filterStudentReports({key, title}) {
    // console.log('TCL: filterStudentReports -> id', key);
    if (key === -1) {
      this.setState({studentsReport: allStudentReports, tabStatus: title});
      return;
    }
    const filteredReports = allStudentReports.filter(
      item => item.status === key,
    );
    this.setState({studentsReport: filteredReports, tabStatus: title});
  }
  studentItem({status, ...item}) {
    return (
      <View style={styles.parent}>
        <Text style={styles.date}>{item.attendence_date}</Text>
        <View style={styles.status}>
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
        <View style={styles.notes}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
            }}>
            <Text style={styles.className}>{item.class_name}</Text>
            <Text style={styles.note}>{`${moment(item.startTime).format(
              'hh:mm a',
            )} - ${moment(item.endTime).format('hh:mm a')}`}</Text>
          </View>
          <TouchableRipple
            borderless
            rippleColor="rgba(0, 0, 0, .62)"
            style={styles.icon}>
            <IconMaterial
              onPress={() => alertUI(item.notes)}
              name={'info-outline'}
              size={25}
              color={'grey'}
            />
          </TouchableRipple>
        </View>
      </View>
    );
  }
  render() {
    const {loading, tabStatus, chartVisibility, studentsReport} = this.state;
    // console.log('TCL: render -> studentsReport', studentsReport);
    const {studentObj} = this.props.navigation.state.params;

    return (
      <View style={{flex: 1}}>
        <Appbar.Header
          style={{
            backgroundColor: 'red',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          }}>
          <Appbar.Action
            icon={() => (
              <IconMaterial name={'arrow-back'} size={22} color={'#fafafa'} />
            )}
            onPress={() => this.props.navigation.goBack()}
          />
          <Appbar.Content
            title="Student Report"
            titleStyle={{
              color: '#fafafa',
              fontWeight: '600',
              fontSize: 20,
              width: 140,
            }}
          />
          {!isEmpty(allStudentReports) && (
            <Appbar.Action
              icon="chart-pie"
              onPress={() => this.setState({chartVisibility: !chartVisibility})}
            />
          )}
        </Appbar.Header>
        {loading ? (
          <ActivityIndicator color="red" size="large" style={{marginTop: 10}} />
        ) : isEmpty(allStudentReports) ? (
          <Text style={{margin: 10}}>No Data Found</Text>
        ) : (
          <Fragment>
            <Tabs
              {...this.props}
              initialLayout={initialLayout}
              getTabId={id => {
                this.filterStudentReports(id);
              }}
            />
            <GradientView
              title=""
              titleColor="#40c4ff"
              height={10}
              marginTop={0}
              marginHorizontal={0}
            />
            {renderStudent(studentObj)}
            <GradientView
              title=""
              titleColor="#40c4ff"
              height={10}
              marginTop={0}
              marginHorizontal={0}
            />
            {chartVisibility && (
              <ScrollView
                style={{flex: 1}}
                contentContainerStyle={{flexWrap: 'wrap'}}>
                {renderChartSection(tabStatus)}
              </ScrollView>
            )}
            <View style={{marginHorizontal: 10, flex: 1}}>
              <View style={styles.header}>
                <Text style={{width: 80, textAlign: 'center'}}>Date</Text>
                <Text style={{width: 45, textAlign: 'center'}}>Status</Text>
                <Text style={{flex: 1, textAlign: 'center'}}>Notes</Text>
              </View>
              <FlatList
                data={studentsReport}
                renderItem={({item}) => this.studentItem(item)}
                keyExtractor={(item, index) => 'key' + index}
                contentContainerStyle={{
                  flexGrow: 1,
                }}
              />
            </View>
          </Fragment>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  studentName: {
    fontSize: 18,
    color: '#4a4a4c',
    textTransform: 'capitalize',
  },
  header: {
    flexDirection: 'row',
    height: 30,
    backgroundColor: '#eceff1',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  parent: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  date: {
    width: 80,
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 4,
    height: 40,
    fontSize: 12,
    backgroundColor: '#eceff1',
  },
  status: {
    width: 40,
    backgroundColor: '#eceff1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    height: 40,
  },
  notes: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#eceff1',
  },
  className: {
    textAlignVertical: 'center',
    fontSize: 14,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  note: {
    textAlignVertical: 'center',
    fontSize: 12,
    color: 'grey',
    textTransform: 'lowercase',
  },
  icon: {
    width: 35,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
});
