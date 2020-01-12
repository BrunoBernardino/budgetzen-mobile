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
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import BasicModal from '../BasicModal';
import PrimaryButton from '../Button';

import * as T from '../../lib/types';

interface EditBudgetModalProps {
  isUsingDarkMode: boolean;
  isVisible: boolean;
  onDismiss: () => void;
  onSaveBudget: (newBudget: T.Budget) => Promise<boolean>;
  onDeleteBudget: (budgetId: string) => Promise<boolean>;
  budget: T.Budget;
}
interface EditBudgetModalState {
  isSubmitting: boolean;
  isDatePickerVisible: boolean;
  name: string;
  month: string;
  value: string;
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

class EditBudgetModal extends Component<
  EditBudgetModalProps,
  EditBudgetModalState
> {
  inputAccessoryViewID = 'doneViewID';

  constructor(props: EditBudgetModalProps) {
    super(props);

    const { name, value, month } = props.budget;

    this.state = {
      isSubmitting: false,
      isDatePickerVisible: false,
      name,
      value: value.toString(),
      month,
    };
  }

  onSaveBudget = async () => {
    const { onSaveBudget, onDismiss, budget } = this.props;
    const { isSubmitting, name, value, month } = this.state;

    if (isSubmitting) {
      // Ignore sequential taps
      return;
    }

    this.setState({ isSubmitting: true });

    const newBudget: T.Budget = {
      id: budget.id,
      name,
      value: Number.parseFloat(value.replace(',', '.')),
      month,
    };

    const success = await onSaveBudget(newBudget);
    this.setState({ isSubmitting: false });

    if (success) {
      onDismiss();
    }
  };

  requestBudgetDelete = () => {
    const { budget, onDismiss, onDeleteBudget } = this.props;

    Alert.alert(
      'Are you sure?',
      'Are you sure you want to delete this budget?\nThis action is irreversible.',
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
            const success = await onDeleteBudget(budget.id);
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
    const { budget, isUsingDarkMode, isVisible, onDismiss } = this.props;
    const {
      isSubmitting,
      isDatePickerVisible,
      name,
      value,
      month,
    } = this.state;

    return (
      <BasicModal
        isVisible={isVisible}
        isSubmitting={isSubmitting}
        onDismiss={onDismiss}
        onConfirm={this.onSaveBudget}
      >
        <Text style={styles.label}>Name</Text>
        <TextInput
          placeholderTextColor="#CCC"
          style={styles.input}
          placeholder="Food"
          onChangeText={(text) => this.setState({ name: text })}
          value={name}
          onSubmitEditing={() => Keyboard.dismiss()}
          returnKeyType="done"
        />

        <Text style={styles.label}>Value</Text>
        <TextInput
          placeholderTextColor="#CCC"
          style={styles.input}
          placeholder="100"
          onChangeText={(text) => this.setState({ value: text })}
          value={value}
          autoCapitalize="none"
          autoCompleteType="off"
          keyboardType="decimal-pad"
          onSubmitEditing={() => Keyboard.dismiss()}
          inputAccessoryViewID={this.inputAccessoryViewID}
          returnKeyType="done"
        />

        <Text style={styles.label}>Month</Text>
        {!isDatePickerVisible && (
          <TextInput
            placeholderTextColor="#CCC"
            style={styles.input}
            placeholder={moment().format('MMMM YYYY')}
            value={month ? moment(month, 'YYYY-MM-DD').format('MMMM YYYY') : ''}
            onFocus={() => this.setState({ isDatePickerVisible: true })}
          />
        )}
        <DateTimePickerModal
          isDarkModeEnabled={isUsingDarkMode}
          isVisible={isDatePickerVisible}
          date={month ? moment(month, 'YYYY-MM-DD').toDate() : new Date()}
          mode="date"
          onCancel={() => this.setState({ isDatePickerVisible: false })}
          onConfirm={(chosenDate: Date) => {
            this.setState({
              isDatePickerVisible: false,
              month: moment(chosenDate).format('YYYY-MM'),
            });
          }}
        />

        {budget.id !== 'newBudget' && (
          <PrimaryButton
            style={styles.deleteButton}
            type="delete"
            text="Delete Budget"
            onPress={this.requestBudgetDelete}
          />
        )}

        {this.InputAccessoryView()}
      </BasicModal>
    );
  }
}

export default EditBudgetModal;
