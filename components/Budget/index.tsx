import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import { formatNumber } from '../../lib/utils';

import * as T from '../../lib/types';

interface BudgetProps extends T.Budget {
  style?: any;
  currency: string;
  onPress: () => void;
  expensesCost: number;
}

// TODO: Get these colors from the withLayout, according to the light/dark mode
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowRadius: 4,
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 8,
  },

  leftColumn: {
    display: 'flex',
    flex: 1,
  },

  cost: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
  },

  name: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'left',
    marginTop: 6,
  },

  budgetMissing: {
    color: '#999',
    fontSize: 20,
    fontWeight: 'normal',
    textAlign: 'right',
  },
});

const Budget: React.SFC<BudgetProps> = (props: BudgetProps): JSX.Element => {
  const budgetMissing = props.value - props.expensesCost;
  return (
    <TouchableOpacity
      style={props.style ? [styles.container, props.style] : [styles.container]}
      onPress={props.onPress}
    >
      <View style={styles.leftColumn}>
        <Text style={styles.cost}>
          {formatNumber(props.currency, props.expensesCost)} of{' '}
          {formatNumber(props.currency, props.value)}
        </Text>
        <Text style={styles.name}>{props.name}</Text>
      </View>
      <Text style={styles.budgetMissing}>
        {formatNumber(props.currency, budgetMissing)}
      </Text>
    </TouchableOpacity>
  );
};

export default Budget;
