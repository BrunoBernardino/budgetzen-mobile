import 'react-native-get-random-values';
import 'intl';

try {
  (Intl as any).__disableRegExpRestore();
} catch (error) {
  // Ignore, it's only used in Android
}

import 'intl/locale-data/jsonp/en';

import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RxDatabase } from 'rxdb';

import { withLayout } from './hocs';
import SettingsPage from './pages/settings';
import BudgetsPage from './pages/budgets';
import ExpensesPage from './pages/expenses';
import AddPage from './pages/add';

const db: RxDatabase = null;
const sharedOptions = { db };

const TabNavigator = createBottomTabNavigator(
  {
    Settings: withLayout(SettingsPage, sharedOptions),
    Budgets: withLayout(BudgetsPage, sharedOptions),
    Expenses: withLayout(ExpensesPage, sharedOptions),
    Add: withLayout(AddPage, sharedOptions),
  },
  {
    initialRouteName: 'Add',
    defaultNavigationOptions: ({ navigation }) => ({
      // eslint-disable-next-line
      tabBarIcon: ({ tintColor }) => {
        const { routeName } = navigation.state;
        let iconName: string;
        if (routeName === 'Add') {
          iconName = 'ios-add-circle';
        } else if (routeName === 'Expenses') {
          iconName = 'ios-albums';
        } else if (routeName === 'Budgets') {
          iconName = 'ios-apps';
        } else if (routeName === 'Settings') {
          iconName = 'ios-settings';
        }

        return <Ionicons name={iconName} size={30} color={tintColor} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: '#80A881',
      inactiveTintColor: 'gray',
      showLabel: false,
      style: {
        paddingTop: 8,
      },
    },
  },
);

const App = createAppContainer(TabNavigator);

export default App;
