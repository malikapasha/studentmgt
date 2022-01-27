import React from 'react';
import ClassOperation from './src/home/ClassOperations';
import CreateStudent from './src/home/CreateStudent';
import UpdateStudent from './src/home/UpdateStudent';
import OpenContacts from './src/home/OpenContacts';
import Settings from './src/home/Settings';
import AttendanceOperations from './src/home/AttendanceOperations';
import AuthLoading from './src/auth/AuthLoading';
import SignIn from './src/auth/SignIn';
import ForgotPassword from './src/auth/ForgotPassword';
import Attendance from './src/tabs/Attendance';
import Classes from './src/tabs/Classes';
import More from './src/tabs/More';
import Reports from './src/tabs/Reports';
import Students from './src/tabs/Students';
import ClassStudents from './src/home/ClassStudents';
import ClassStudentsAdd from './src/home/ClassStudentsAdd';
// import EditWorkspace from './src/workspace/EditWorkspace';
// import SaveWorkspace from './src/workspace/SaveWorkspace';
// import ManageMembers from './src/workspace/ManageMembers';
// import InviteMember from './src/workspace/InviteMember';
// import SwitchWorkspaces from './src/workspace/SwitchWorkspaces';
import DailyReports from './src/reports/DailyReports';
import ClassReports from './src/reports/ClassReports';
import StudentReports from './src/reports/StudentReports';
import SelectClass from './src/reports/SelectClass';
import createAnimatedSwitchNavigator from 'react-navigation-animated-switch';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {Transition} from 'react-native-reanimated';
import {Animated, Easing} from 'react-native';
import {createBottomTabNavigator} from 'react-navigation-tabs';
// switch navigate animation
const transitionConfig = () => {
  return {
    transitionSpec: {
      duration: 400,
      easing: Easing.out(Easing.poly(4)),
      timing: Animated.timing,
      useNativeDriver: true,
    },
    screenInterpolator: sceneProps => {
      const {position, layout, scene, index, scenes} = sceneProps;
      const toIndex = index;
      const thisSceneIndex = scene.index;
      const height = layout.initHeight;
      const width = layout.initWidth;

      const translateX = position.interpolate({
        inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
        outputRange: [width, 0, 0],
      });

      // Since we want the card to take the same amount of time
      // to animate downwards no matter if it's 3rd on the stack
      // or 53rd, we interpolate over the entire range from 0 - thisSceneIndex
      const translateY = position.interpolate({
        inputRange: [0, thisSceneIndex],
        outputRange: [height, 0],
      });

      const slideFromRight = {transform: [{translateX}]};
      const slideFromBottom = {transform: [{translateY}]};

      const lastSceneIndex = scenes[scenes.length - 1].index;

      // Test whether we're skipping back more than one screen
      if (lastSceneIndex - toIndex > 1) {
        // Do not transoform the screen being navigated to
        if (scene.index === toIndex) return;
        // Hide all screens in between
        if (scene.index !== lastSceneIndex) return {opacity: 0};
        // Slide top screen down
        return slideFromBottom;
      }

      return slideFromRight;
    },
  };
};

// dashboard tabs
const TabNavigator = createBottomTabNavigator(
  {
    Classes: {screen: Classes},
    Reports: {screen: Reports},
    Attendance: {screen: Attendance},
    Students: {screen: Students},
    More: {screen: More},
  },
  {
    initialRouteName: 'Attendance',
    tabBarOptions: {
      activeTintColor: 'red',
      inactiveTintColor: '#929292',
      // tabStyle: {borderTopColor: 'red', borderTopWidth: 0.6},
      tabStyle: {
        borderTopColor: '#f5f5f5',
        borderTopWidth: 0.8,
      },
      labelPosition: 'below-icon',
      // labelStyle: {marginBottom: 3},
      showLabel: false,
      style: {
        backgroundColor: 'white',
        borderTopColor: 'transparent',
      },
    },
  },
);
//custom pages
const HomeStack = createStackNavigator(
  {
    Home: {screen: TabNavigator},
    Settings: {screen: Settings},
    ClassOperation: {screen: ClassOperation},
    AttendanceOperations: {screen: AttendanceOperations},
    CreateStudent: {screen: CreateStudent},
    UpdateStudent: {screen: UpdateStudent},
    ClassStudents: {screen: ClassStudents},
    ClassStudentsAdd: {screen: ClassStudentsAdd},
    OpenContacts: {screen: OpenContacts},
    // EditWorkspace: {screen: EditWorkspace},
    // SaveWorkspace: {screen: SaveWorkspace},
    // ManageMembers: {screen: ManageMembers},
    // InviteMember: {screen: InviteMember},
    // SwitchWorkspaces: {screen: SwitchWorkspaces},
    DailyReports: {screen: DailyReports},
    ClassReports: {screen: ClassReports},
    SelectClass: {screen: SelectClass},
    StudentReports: {screen: StudentReports},
  },
  {
    initialRouteName: 'Home',
    headerMode: 'none',
    transitionConfig,
  },
);
const AuthStack = createStackNavigator(
  {
    SignIn: {screen: SignIn},
    ForgotPassword: {screen: ForgotPassword},
  },
  {
    initialRouteName: 'SignIn',
    headerMode: 'none',
    cardStyle: {opacity: 1},
    transitionConfig,
  },
);
const AppContainer = createAppContainer(
  createAnimatedSwitchNavigator(
    {
      AuthLoading: AuthLoading,
      Home: HomeStack,
      Auth: AuthStack,
    },
    {
      initialRouteName: 'AuthLoading',
      transition: (
        <Transition.Together>
          <Transition.Out
            type="slide-bottom"
            durationMs={250}
            interpolation="easeIn"
          />
          <Transition.In type="fade" durationMs={500} />
        </Transition.Together>
      ),
    },
  ),
);

// const prefix = 'hlattendance://';
// adb shell am start -W -a android.intent.action.VIEW -d "hlattendance://more" com.hybridlogics.attendance
export default () => <AppContainer enableURLHandling={false} />;
