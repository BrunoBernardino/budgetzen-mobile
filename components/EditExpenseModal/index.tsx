import React, { Component } from 'react';
import moment from 'moment';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  InputAccessoryView,
  Keyboard,
  Button,
  Alert,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import BasicModal from '../BasicModal';
import PrimaryButton from '../Button';

import * as T from '../../lib/types';

interface EditExpenseModalProps {
  isUsingDarkMode: boolean;
  isVisible: boolean;
  onDismiss: () => void;
  onSaveExpense: (newExpense: T.Expense) => Promise<boolean>;
  onDeleteExpense: (expenseId: string) => Promise<boolean>;
  budgets: T.Budget[];
  expense: T.Expense;
}
interface EditExpenseModalState {
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

  deleteButton: {
    marginTop: 68,
  },
});

class EditExpenseModal extends Component<
  EditExpenseModalProps,
  EditExpenseModalState
> {
  inputAccessoryViewID = 'doneViewID';

  constructor(props: EditExpenseModalProps) {
    super(props);

    const { cost, description, budget, date } = props.expense;

    this.state = {
      isSubmitting: false,
      isDatePickerVisible: false,
      cost: cost.toString(),
      description,
      budget,
      date,
    };
  }

  onSaveExpense = async () => {
    const { onSaveExpense, onDismiss, expense } = this.props;
    const { isSubmitting, cost, description, budget, date } = this.state;

    if (isSubmitting) {
      // Ignore sequential taps
      return;
    }

    this.setState({ isSubmitting: true });

    const newExpense: T.Expense = {
      id: expense.id,
      cost: Number.parseFloat(cost.replace(',', '.')),
      description,
      budget,
      date,
    };

    const success = await onSaveExpense(newExpense);
    this.setState({ isSubmitting: false });

    if (success) {
      onDismiss();
    }
  };

  requestExpenseDelete = () => {
    const { expense, onDismiss, onDeleteExpense } = this.props;

    Alert.alert(
      'Are you sure?',
      'Are you sure you want to delete this expense?\nThis action is irreversible.',
      [
        {
          text: 'No, cancel.',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Yes!',
          onPress: async () => {
            this.setState({ isSubmitting: true });
            const success = await onDeleteExpense(expense.id);
            this.setState({ isSubmitting: false });

            if (success) {
              onDismiss();
            }
          },
          style: 'destructive',
        },
      ],
      {
        cancelable: false,
      },
    );
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
    const { isUsingDarkMode, isVisible, onDismiss, budgets } = this.props;
    const {
      isSubmitting,
      isDatePickerVisible,
      budget,
      cost,
      description,
      date,
    } = this.state;

    return (
      <BasicModal
        isVisible={isVisible}
        isSubmitting={isSubmitting}
        onDismiss={onDismiss}
        onConfirm={this.onSaveExpense}
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
          placeholder={{ label: budget, value: budget }}
          // InputAccessoryView={this.InputAccessoryView}
          style={{
            inputIOS: styles.picker,
            placeholder: { color: '#999' },
          }}
          onValueChange={(value: string) => {
            this.setState({ budget: value });
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
            value={date ? moment(date, 'YYYY-MM-DD').format('D MMMM YYYY') : ''}
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

        <PrimaryButton
          style={styles.deleteButton}
          type="delete"
          text="Delete Expense"
          onPress={this.requestExpenseDelete}
        />

        {this.InputAccessoryView()}
      </BasicModal>
    );
  }
}

export default EditExpenseModal;
