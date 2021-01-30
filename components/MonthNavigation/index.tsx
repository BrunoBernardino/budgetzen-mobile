import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import moment from 'moment';

import IconButton from '../IconButton';

interface MonthNavigationProps {
  currentMonth: string;
  handleChangeMonth: (newMonth: string) => void;
}
interface MonthNavigationState {}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    alignItems: 'center',
  },
  text: {
    width: '70%',
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

class MonthNavigation extends Component<
  MonthNavigationProps,
  MonthNavigationState
> {
  goBack = () => {
    const { currentMonth } = this.props;
    const previousMonth = moment(currentMonth, 'YYYY-MM')
      .subtract(1, 'month')
      .format('YYYY-MM');
    this.props.handleChangeMonth(previousMonth);
  };

  goForward = () => {
    const { currentMonth } = this.props;
    const nextMonth = moment(currentMonth, 'YYYY-MM')
      .add(1, 'month')
      .format('YYYY-MM');
    this.props.handleChangeMonth(nextMonth);
  };

  render() {
    const { currentMonth } = this.props;
    return (
      <View style={styles.container}>
        <IconButton
          style={styles.button}
          onPress={this.goBack}
          icon="ios-chevron-back-sharp"
          size={32}
          color="#000"
        />
        <Text style={styles.text}>
          {moment(currentMonth, 'YYYY-MM').format('MMMM YYYY')}
        </Text>
        <IconButton
          style={styles.button}
          onPress={this.goForward}
          icon="ios-chevron-forward-sharp"
          size={32}
          color="#000"
        />
      </View>
    );
  }
}

export default MonthNavigation;
