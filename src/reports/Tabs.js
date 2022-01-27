/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View} from 'react-native';
import {TabView, TabBar} from 'react-native-tab-view';
const renderScene = ({route}) => {
  return null;
};
export default function Tabs({getTabId, initialLayout}) {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: -1, title: 'All'},
    {key: 1, title: 'P'},
    {key: 0, title: 'A'},
    {key: 2, title: 'L'},
    {key: 3, title: 'M'},
    {key: 4, title: 'TU'},
    {key: 5, title: 'TD'},
  ]);

  return (
    <View style={{height: 49}}>
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        style={{maxHeight: 150, width: '100%'}}
        sceneContainerStyle={{
          height: 100,
          width: '100%',
        }}
        renderTabBar={prop => {
          return (
            <TabBar
              {...prop}
              onTabPress={({route}) => {
                getTabId(route);
              }}
              indicatorStyle={{backgroundColor: '#fafafa'}}
              style={{backgroundColor: 'red'}}
              labelStyle={{fontSize: 13}}
            />
          );
        }}
      />
    </View>
  );
}
