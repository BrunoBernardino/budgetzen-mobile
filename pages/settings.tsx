import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  ScrollView,
  Image,
  RefreshControl,
  NativeSyntheticEvent,
  NativeSegmentedControlIOSChangeEvent,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import SegmentedControlIOS from '@react-native-community/segmented-control';
import { Linking } from 'expo';

import PrimaryButton from '../components/Button';
import SyncModal from '../components/SyncModal';
import ImportExportModal from '../components/ImportExportModal';
import Logo from '../assets/logo.png';
import appInfo from '../app.json';
import appPackage from '../package.json';

import * as T from '../lib/types';

interface SettingsPageProps extends T.WrappedComponentProps {}
interface SettingsPageState {
  isSubmitting: boolean;
  isSyncModalVisible: boolean;
  isImportExportModalVisible: boolean;
  syncToken: string;
  currency: string;
}

const {
  expo: { version: appVersion },
} = appInfo;

const { build: appBuild } = appPackage;

// TODO: Get these colors from the withLayout, according to the light/dark mode
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },

  logo: {
    marginTop: 40,
    height: 40,
    width: '100%',
    resizeMode: 'contain',
    alignSelf: 'center',
  },

  scrollContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },

  syncContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderRadius: 10,
  },

  label: {
    color: '#000',
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 38,
  },

  note: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'left',
    marginTop: 12,
  },

  input: {
    color: '#999',
    fontSize: 26,
    fontWeight: 'normal',
    textAlign: 'left',
    marginTop: 4,
  },

  currencyToggle: { height: 42, backgroundColor: '#000', marginTop: 4 },

  bottomContainer: {
    flex: 0.5,
  },

  version: {
    color: '#999',
    fontSize: 12,
    fontWeight: 'normal',
    textAlign: 'center',
    marginTop: 10,
  },

  importExportButton: {
    marginVertical: 0,
  },

  helpButton: {
    marginVertical: 0,
  },
});

const currencyLabels = ['$', '€', '£'];
const currencyValues = ['USD', 'EUR', 'GBP'];

class SettingsPage extends Component<SettingsPageProps, SettingsPageState> {
  constructor(props: SettingsPageProps) {
    super(props);
    this.state = {
      isSubmitting: false,
      isSyncModalVisible: false,
      isImportExportModalVisible: false,
      syncToken: '',
      currency: '',
    };
  }

  async componentDidMount() {
    const { getSetting } = this.props;
    const currency = await getSetting('currency');
    const syncToken = await getSetting('syncToken');

    this.setState({ syncToken, currency });
  }

  saveSetting = async (settingName: T.SettingOption) => {
    const { saveSetting, showNotification } = this.props;
    const { isSubmitting, syncToken, currency } = this.state;

    if (isSubmitting) {
      // Ignore sequential taps
      return;
    }

    this.setState({ isSubmitting: true });

    const parsedSetting: T.Setting = {
      name: settingName,
      value: settingName === 'syncToken' ? syncToken : currency,
    };

    const success = await saveSetting(parsedSetting);

    this.setState({ isSubmitting: false });

    if (success) {
      showNotification('Settings saved successfully.');
    }
  };

  exportData = async () => {
    const { exportAllData } = this.props;

    return exportAllData();
  };

  importData = async (
    replaceData: boolean,
    budgets: T.Budget[],
    expenses: T.Expense[],
  ) => {
    const { importData } = this.props;

    return importData(replaceData, budgets, expenses);
  };

  deleteData = async () => {
    const { deleteAllData } = this.props;

    return deleteAllData();
  };

  render() {
    const {
      isLoading,
      loadData,
      lastSyncDate,
      showAlert,
      isUsingDarkMode,
    } = this.props;
    const {
      isSyncModalVisible,
      isImportExportModalVisible,
      syncToken,
      currency,
    } = this.state;

    const selectedCurrencyIndex = currencyValues.findIndex(
      (_currency) => currency === _currency,
    );

    const extraSegmentedControlProps: any = {};

    if (isUsingDarkMode) {
      extraSegmentedControlProps.tintColor = '#000';
      if (Platform.OS === 'ios') {
        extraSegmentedControlProps.backgroundColor = '#fff';
      }
    } else {
      extraSegmentedControlProps.tintColor = '#fff';
      extraSegmentedControlProps.backgroundColor = '#000';
      if (Platform.OS === 'android') {
        extraSegmentedControlProps.tintColor = '#666';
      }
    }

    return (
      <SafeAreaView style={styles.wrapper} removeClippedSubviews={false}>
        <View style={styles.container} removeClippedSubviews={false}>
          <Image style={styles.logo} source={Logo} />
          <ScrollView
            keyboardDismissMode="interactive"
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() => loadData({ forceReload: true })}
              />
            }
            style={styles.scrollContainer}
          >
            <TouchableOpacity
              style={styles.syncContainer}
              onPress={() => this.setState({ isSyncModalVisible: true })}
            >
              <Text style={styles.label}>Sync</Text>
              <Switch
                trackColor={{ false: '#CCC', true: '#80A881' }}
                value={Boolean(syncToken) && Boolean(lastSyncDate)}
                disabled
              />
            </TouchableOpacity>
            <Text style={styles.note}>
              Sync expenses and budgets across devices.
            </Text>

            <Text style={styles.label}>Currency</Text>
            <SegmentedControlIOS
              values={currencyLabels}
              selectedIndex={
                selectedCurrencyIndex === -1 ? 0 : selectedCurrencyIndex
              }
              style={styles.currencyToggle}
              {...extraSegmentedControlProps}
              onChange={(
                event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>,
              ) => {
                this.setState(
                  {
                    currency:
                      currencyValues[event.nativeEvent.selectedSegmentIndex],
                  },
                  () => {
                    this.saveSetting('currency');
                  },
                );
              }}
            />
          </ScrollView>
          <View style={styles.bottomContainer}>
            <Text style={styles.version}>
              v{appVersion}-{appBuild}
            </Text>
            <PrimaryButton
              style={styles.importExportButton}
              onPress={() =>
                this.setState({ isImportExportModalVisible: true })
              }
              text="Import or Export Data"
              type="secondary"
            />
            <PrimaryButton
              style={styles.helpButton}
              onPress={() => Linking.openURL('mailto:help@budgetzen.net')}
              text="Get Help"
              type="primary"
            />
          </View>
          <SyncModal
            isVisible={isSyncModalVisible}
            onDismiss={() => this.setState({ isSyncModalVisible: false })}
            onConfirm={async (newSyncToken) => {
              this.setState(
                {
                  syncToken: newSyncToken,
                },
                () => {
                  this.saveSetting('syncToken');
                },
              );
            }}
            onSyncRequest={async () => {
              await loadData({ forceReload: true });
              this.setState({ isSyncModalVisible: false });
            }}
            onDeleteData={this.deleteData}
            syncToken={syncToken}
            lastSyncDate={lastSyncDate}
          />
          <ImportExportModal
            isVisible={isImportExportModalVisible}
            onDismiss={() =>
              this.setState({ isImportExportModalVisible: false })
            }
            onExportData={this.exportData}
            onImportData={this.importData}
            showAlert={showAlert}
          />
        </View>
      </SafeAreaView>
    );
  }
}

export default SettingsPage;
