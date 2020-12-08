import React, { Component } from 'react';
import moment from 'moment';
import {
  StyleSheet,
  Text,
  TextInput,
  SafeAreaView,
  View,
  InputAccessoryView,
  ScrollView,
  Keyboard,
  Button,
  Image,
  RefreshControl,
  Platform,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import PrimaryButton from '../components/Button';
import Logo from '../assets/logo.png';

import * as T from '../lib/types';

interface AddPageProps extends T.WrappedComponentProps {}
interface AddPageState {
  isSubmitting: boolean;
  isDatePickerVisible: boolean;
  cost: string;
  description: string;
  budget: string;
  date: string;
}

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

  label: {
    color: '#000',
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 38,
  },

  input: {
    color: '#999',
    fontSize: 26,
    fontWeight: 'normal',
    textAlign: 'left',
    marginTop: 4,
  },

  inputAccessoryContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#efefef',
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  inputButton: {
    color: '#000',
  },

  picker: {
    color: '#999',
    fontSize: 26,
    fontWeight: 'normal',
    textAlign: 'left',
  },

  addButton: {
    marginVertical: 10,
    minHeight: 16,
  },
});

class AddPage extends Component<AddPageProps, AddPageState> {
  inputAccessoryViewID = 'doneViewID';

  inputRefs: {
    budget: any;
  };

  constructor(props: AddPageProps) {
    super(props);

    this.inputRefs = {
      budget: null,
    };

    this.state = {
      isSubmitting: false,
      isDatePickerVisible: false,
      cost: '',
      description: '',
      budget: '',
      date: '',
    };
  }

  addExpense = async () => {
    const { saveExpense, showNotification } = this.props;
    const { isSubmitting, cost, description, budget, date } = this.state;

    if (isSubmitting) {
      // Ignore sequential taps
      return;
    }

    this.setState({ isSubmitting: true });

    const parsedExpense: T.Expense = {
      id: 'newExpense',
      cost: Number.parseFloat(cost.replace(',', '.')),
      description,
      budget,
      date,
    };

    try {
      const success = await saveExpense(parsedExpense);

      if (success) {
        this.setState({ cost: '', description: '', budget: '', date: '' });
        this.inputRefs.budget.onValueChange('Misc', 0);
        showNotification('Expense added successfully.');
      }
    } catch (error) {
      console.log('Failed to add expense');
      console.log(error);
    }

    this.setState({ isSubmitting: false });
  };

  InputAccessoryView() {
    return (
      <InputAccessoryView nativeID={this.inputAccessoryViewID}>
        <View style={styles.inputAccessoryContainer}>
          <Button
            color={styles.inputButton.color}
            onPress={() => Keyboard.dismiss()}
            title="Cancel"
          />
          <Button
            color={styles.inputButton.color}
            onPress={() => Keyboard.dismiss()}
            title="Done"
          />
        </View>
      </InputAccessoryView>
    );
  }

  render() {
    const { isLoading, isUsingDarkMode, budgets, loadData } = this.props;
    const {
      isDatePickerVisible,
      cost,
      description,
      date,
      isSubmitting,
    } = this.state;

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
            removeClippedSubviews={false}
          >
            <Text style={styles.label}>Cost</Text>
            <TextInput
              placeholderTextColor="#CCC"
              style={styles.input}
              placeholder="10.99"
              onChangeText={(text) => this.setState({ cost: text })}
              value={cost}
              autoCapitalize="none"
              autoCompleteType="off"
              keyboardType="decimal-pad"
              onSubmitEditing={() => Keyboard.dismiss()}
              inputAccessoryViewID={this.inputAccessoryViewID}
              returnKeyType="done"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              placeholderTextColor="#CCC"
              style={styles.input}
              placeholder="Lunch"
              onChangeText={(text) => this.setState({ description: text })}
              value={description}
              onSubmitEditing={() => Keyboard.dismiss()}
              returnKeyType="done"
            />

            <Text style={styles.label}>Budget</Text>
            <RNPickerSelect
              itemKey="key"
              placeholder={{ label: 'Misc', value: 'Misc' }}
              ref={(element: any) => {
                this.inputRefs.budget = element;
              }}
              // InputAccessoryView={this.InputAccessoryView}
              style={{
                inputIOS: styles.picker,
                inputAndroid: styles.picker,
                placeholder: { color: '#ccc' },
              }}
              onValueChange={(value: string) => {
                this.setState({ budget: value }, () => {
                  // this.inputRefs.budget.togglePicker();
                });
              }}
              items={budgets.map((budgetOption: T.Budget) => ({
                label: budgetOption.name,
                value: budgetOption.name,
                key: budgetOption.name,
              }))}
            />

            <Text style={styles.label}>Date</Text>
            {!isDatePickerVisible && (
              <TextInput
                placeholderTextColor="#CCC"
                style={styles.input}
                placeholder="Today"
                value={
                  date ? moment(date, 'YYYY-MM-DD').format('D MMMM YYYY') : ''
                }
                onFocus={() => this.setState({ isDatePickerVisible: true })}
              />
            )}
            <DateTimePickerModal
              isDarkModeEnabled={isUsingDarkMode}
              isVisible={isDatePickerVisible}
              date={date ? moment(date, 'YYYY-MM-DD').toDate() : new Date()}
              mode="date"
              onCancel={() => this.setState({ isDatePickerVisible: false })}
              onConfirm={(chosenDate: Date) => {
                this.setState({
                  isDatePickerVisible: false,
                  date: moment(chosenDate).format('YYYY-MM-DD'),
                });
              }}
            />

            {Platform.OS === 'ios' ? this.InputAccessoryView() : null}
          </ScrollView>
          <PrimaryButton
            isDisabled={isSubmitting}
            style={styles.addButton}
            onPress={() => this.addExpense()}
            text={isSubmitting ? 'Adding...' : 'Add Expense'}
            type="primary"
          />
        </View>
      </SafeAreaView>
    );
  }
}

export default AddPage;
