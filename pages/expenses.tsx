import React, { Component } from 'react';
import {
  StyleSheet,
  TextInput,
  SafeAreaView,
  View,
  Keyboard,
  FlatList,
  Text,
} from 'react-native';

import IconButton from '../components/IconButton';
import MonthNavigation from '../components/MonthNavigation';
import Expense from '../components/Expense';
import FilterBudgetModal from '../components/FilterBudgetModal';
import EditExpenseModal from '../components/EditExpenseModal';

import * as T from '../lib/types';

interface ExpensesPageProps extends T.WrappedComponentProps {}
interface ExpensesPageState {
  filterExpenseDescription: string;
  filterBudgets: Set<string>;
  isFilterBudgetsModalVisible: boolean;
  isEditExpenseModalVisible: boolean;
  chosenExpense: null | T.Expense;
  currency: string;
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

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },

  searchInput: {
    color: '#999',
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'left',
    borderWidth: 1,
    borderColor: '#efefef',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flex: 1,
    minWidth: '70%',
  },

  filterButtonActive: {
    color: '#000',
  },

  filterButtonInactive: {
    color: '#999',
  },

  noExpensesFound: {
    color: '#999',
    textAlign: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

interface NoExpensesFoundProps {
  hasFiltersOrSearch: boolean;
}

const NoExpensesFound: React.SFC<NoExpensesFoundProps> = (
  props: NoExpensesFoundProps,
): JSX.Element => {
  return (
    <>
      {props.hasFiltersOrSearch ? (
        <Text style={styles.noExpensesFound}>
          No expenses found matching those filters.{'\n'}Try changing them!
        </Text>
      ) : (
        <Text style={styles.noExpensesFound}>
          No expenses found for this month.{'\n'}Go add one!
        </Text>
      )}
    </>
  );
};

class ExpensesPage extends Component<ExpensesPageProps, ExpensesPageState> {
  constructor(props: ExpensesPageProps) {
    super(props);
    this.state = {
      filterExpenseDescription: '',
      filterBudgets: new Set(),
      isFilterBudgetsModalVisible: false,
      isEditExpenseModalVisible: false,
      chosenExpense: null,
      currency: '',
    };
  }

  async componentDidMount() {
    const { getSetting } = this.props;
    const currency = await getSetting('currency');

    this.setState({ currency });
  }

  saveExpense = async (newExpense: T.Expense) => {
    const { saveExpense } = this.props;
    return saveExpense(newExpense);
  };

  deleteExpense = async (expenseId: string) => {
    const { deleteExpense } = this.props;
    return deleteExpense(expenseId);
  };

  render() {
    const {
      isUsingDarkMode,
      isLoading,
      budgets,
      expenses,
      monthInView,
      changeMonthInView,
      loadData,
    } = this.props;
    const {
      filterExpenseDescription,
      filterBudgets,
      isFilterBudgetsModalVisible,
      isEditExpenseModalVisible,
      chosenExpense,
      currency,
    } = this.state;

    let expensesToShow = expenses;

    if (filterExpenseDescription) {
      expensesToShow = expensesToShow.filter((expense) =>
        expense.description
          .toLowerCase()
          .includes(filterExpenseDescription.toLowerCase()),
      );
    }

    if (filterBudgets.size > 0) {
      expensesToShow = expensesToShow.filter((expense) =>
        filterBudgets.has(expense.budget),
      );
    }

    return (
      <SafeAreaView style={styles.wrapper} removeClippedSubviews={false}>
        <View style={styles.container} removeClippedSubviews={false}>
          <MonthNavigation
            currentMonth={monthInView}
            handleChangeMonth={changeMonthInView}
          />
          <View style={styles.headerContainer} removeClippedSubviews={false}>
            <TextInput
              placeholderTextColor="#CCC"
              style={styles.searchInput}
              placeholder="Search for an expense"
              onChangeText={(text) =>
                this.setState({ filterExpenseDescription: text })
              }
              value={filterExpenseDescription}
              autoCapitalize="none"
              autoCompleteType="off"
              keyboardType="default"
              onSubmitEditing={() => Keyboard.dismiss()}
              returnKeyType="done"
            />
            <IconButton
              icon="ios-options"
              size={32}
              color={
                filterBudgets.size > 0
                  ? styles.filterButtonActive.color
                  : styles.filterButtonInactive.color
              }
              onPress={() =>
                this.setState({ isFilterBudgetsModalVisible: true })
              }
            />
          </View>
          <FlatList
            refreshing={isLoading}
            onRefresh={() => loadData({ forceReload: true })}
            data={expensesToShow}
            renderItem={({ item }) => (
              <Expense
                {...item}
                currency={currency}
                onPress={() =>
                  this.setState({
                    isEditExpenseModalVisible: true,
                    chosenExpense: item,
                  })
                }
              />
            )}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <NoExpensesFound
                hasFiltersOrSearch={
                  filterExpenseDescription.length > 0 || filterBudgets.size > 0
                }
              />
            }
          />
          <FilterBudgetModal
            isVisible={isFilterBudgetsModalVisible}
            onHide={() => this.setState({ isFilterBudgetsModalVisible: false })}
            onFilterBudgetToggle={(budgetName, newValue) => {
              const newFilterBudgets = new Set(filterBudgets);
              if (newValue) {
                newFilterBudgets.add(budgetName);
              } else {
                newFilterBudgets.delete(budgetName);
              }

              this.setState({ filterBudgets: newFilterBudgets });
            }}
            budgets={budgets}
            filterBudgets={filterBudgets}
          />
          {chosenExpense && (
            <EditExpenseModal
              isUsingDarkMode={isUsingDarkMode}
              isVisible={isEditExpenseModalVisible}
              onDismiss={() =>
                this.setState({
                  isEditExpenseModalVisible: false,
                  chosenExpense: null,
                })
              }
              onSaveExpense={this.saveExpense}
              onDeleteExpense={this.deleteExpense}
              budgets={budgets}
              expense={chosenExpense}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }
}

export default ExpensesPage;
