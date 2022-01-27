/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/react-in-jsx-scope */
import React, {Fragment} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
} from 'react-native';
import {FAB, Button, Title, Dialog, Portal} from 'react-native-paper';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modal'; /* eslint-disable react/no-did-mount-set-state */

import RNIap, {
  InAppPurchase,
  PurchaseError,
  SubscriptionPurchase,
  acknowledgePurchaseAndroid,
  consumePurchaseAndroid,
  finishTransaction,
  finishTransactionIOS,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';
const TabIcon = props => (
  <Icon
    name={'more-horizontal'}
    size={25}
    color={props.focused ? 'red' : '#929292'}
  />
);
// App Bundle > com.dooboolab.test

const itemSubs = Platform.select({
  ios: ['yearly_subscription', 'monthly_subscription'],
  android: ['yearly_subscription', 'monthly_subscription'],
});

let purchaseUpdateSubscription;
let purchaseErrorSubscription;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.select({
      ios: 0,
      android: 24,
    }),
    paddingTop: Platform.select({
      ios: 0,
      android: 24,
    }),
    backgroundColor: 'white',
  },
  header: {
    flex: 20,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTxt: {
    fontSize: 26,
    color: 'green',
  },
  content: {
    flex: 80,
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  btn: {
    height: 48,
    width: 240,
    alignSelf: 'center',
    backgroundColor: '#00c40f',
    borderRadius: 0,
    borderWidth: 0,
  },
  txt: {
    fontSize: 16,
    color: 'white',
  },
});
export default class PaymentModal extends React.Component {
  static navigationOptions = {
    tabBarIcon: TabIcon,
  };
  constructor(props) {
    super(props);

    this.state = {
      productList: [],
      receipt: '',
      availableItemsMessage: '',
      visible: true,
    };
    this.cancelModal = this.cancelModal.bind(this);
  }

  async componentDidMount() {
    try {
      const result = await RNIap.initConnection();
      await RNIap.consumeAllItemsAndroid();
      console.log('result', result);
    } catch (err) {
      console.log('cdm', err.code, err.message);
    }

    purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: InAppPurchase | SubscriptionPurchase) => {
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          try {
            if (Platform.OS === 'ios') {
              finishTransactionIOS(purchase.transactionId);
            } else if (Platform.OS === 'android') {
              // If consumable (can be purchased again)
              // consumePurchaseAndroid(purchase.purchaseToken);
              // If not consumable
              acknowledgePurchaseAndroid(purchase.purchaseToken);
            }
            const ackResult = await finishTransaction(purchase);
          } catch (ackErr) {
            console.warn('ackErr', ackErr);
          }
          console.log('receipt', receipt);
          this.setState({receipt}, () => this.goNext());
        }
      },
    );

    purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.log('purchaseErrorListener', error);
        Alert.alert('purchase error', JSON.stringify(error));
      },
    );
    this.getSubscriptions();
  }

  componentWillUnmount() {
    if (purchaseUpdateSubscription) {
      purchaseUpdateSubscription.remove();
      purchaseUpdateSubscription = null;
    }
    if (purchaseErrorSubscription) {
      purchaseErrorSubscription.remove();
      purchaseErrorSubscription = null;
    }
  }
  cancelModal() {
    this.props.paymentModalVisibility();
    this.props.navigation.navigate('Attendance');
  }
  goNext = () => {
    Alert.alert('Receipt', this.state.receipt);
  };

  getItems = async () => {
    try {
      // const products = await RNIap.getProducts(itemSubs);
      const products = await RNIap.getSubscriptions(itemSubs);
      console.log('Products', products);
      this.setState({productList: products});
    } catch (err) {
      console.warn(err.code, err.message);
    }
  };

  getSubscriptions = async () => {
    try {
      const products = await RNIap.getSubscriptions(itemSubs);
      console.log('getSubscriptions', products);
      this.setState({productList: products});
    } catch (err) {
      console.warn(err.code, err.message);
    }
  };

  getAvailablePurchases = async () => {
    try {
      console.info(
        'Get available purchases (non-consumable or unconsumed consumable)',
      );
      const purchases = await RNIap.getAvailablePurchases();
      console.info('Available purchases :: ', purchases);
      if (purchases && purchases.length > 0) {
        this.setState({
          availableItemsMessage: `Got ${purchases.length} items.`,
          receipt: purchases[0].transactionReceipt,
        });
      }
    } catch (err) {
      console.warn(err.code, err.message);
      Alert.alert(err.message);
    }
  };

  // Version 3 apis
  requestPurchase = async sku => {
    try {
      RNIap.requestPurchase(sku);
    } catch (err) {
      console.log('cacenll');
      console.warn(err.code, err.message);
    }
  };

  requestSubscription = async sku => {
    console.log('TCL: requestSubscription');
    try {
      RNIap.requestSubscription(sku);
    } catch (err) {
      Alert.alert(err.message);
    }
  };
  render() {
    return (
      <Modal
        isVisible={this.state.visible}
        useNativeDriver
        style={{
          justifyContent: 'center',
          marginHorizontal: 50,
        }}>
        <View
          style={{
            height: 220,
            borderRadius: 10,
            backgroundColor: '#fafafa',
          }}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
            }}>
            <Title
              style={{
                textAlign: 'center',
                height: 50,
                textAlignVertical: 'center',
              }}>
              Select Subscription
            </Title>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                flex: 1,
              }}>
              <TouchableOpacity
                onPress={() => {
                  this.requestSubscription('monthly_subscription');
                }}
                style={{
                  height: 130,
                  width: 85,
                  alignItems: 'center',
                }}>
                <Title style={{textAlign: 'center', fontSize: 15}}>
                  Monthly
                </Title>
                <IconFontAwesome
                  name={'credit-card'}
                  size={30}
                  color={'grey'}
                />
                <Text
                  style={{marginTop: 5, color: 'black', textAlign: 'center'}}>
                  1 Month
                </Text>
                <Text
                  style={{marginTop: 5, color: 'black', textAlign: 'center'}}>
                  Rs 750.00/month
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.requestSubscription('yearly_subscription')}
                style={{
                  height: 130,
                  width: 85,
                  alignItems: 'center',
                }}>
                <Title style={{textAlign: 'center', fontSize: 15}}>
                  Yearly
                </Title>
                <IconFontAwesome
                  name={'credit-card'}
                  size={30}
                  color={'grey'}
                />
                <Text
                  style={{marginTop: 5, color: 'black', textAlign: 'center'}}>
                  12 Month
                </Text>
                <Text
                  style={{marginTop: 5, color: 'black', textAlign: 'center'}}>
                  Rs 9500.00/month
                </Text>
              </TouchableOpacity>
            </View>
            <Button icon="close" mode="text" onPress={this.cancelModal}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    );
  }
}
