import React from 'react';
import moment from 'moment';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import { formatNumber } from '../../lib/utils';

import * as T from '../../lib/types';

interface ExpenseProps extends T.Expense {
  currency: string;
  onPress: () => void;
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
    flex: 0.5,
  },

  cost: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
  },

  budget: {
    color: '#999',
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'left',
    marginTop: 6,
  },

  description: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'left',
    flex: 1,
  },

  date: {
    color: '#999',
    fontSize: 20,
    fontWeight: 'normal',
    textAlign: 'right',
    textTransform: 'uppercase',
  },
});

const Expense: React.SFC<ExpenseProps> = (props: ExpenseProps): JSX.Element => {
  const expenseDate = moment(props.date, 'YYYY-MM-DD');
  return (
    <TouchableOpacity style={styles.container} onPress={props.onPress}>
      <View style={styles.leftColumn}>
        <Text style={styles.cost}>
          {formatNumber(props.currency, props.cost)}
        </Text>
        <Text style={styles.budget}>{props.budget}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {props.description}
      </Text>
      <Text style={styles.date}>
        {expenseDate.format('DD')}
        {'\n'}
        {expenseDate.format('MMM')}
      </Text>
    </TouchableOpacity>
  );
};

export default Expense;
