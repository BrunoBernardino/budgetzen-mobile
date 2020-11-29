import React, { Component } from 'react';
import { StyleSheet, SafeAreaView, View, FlatList, Text } from 'react-native';

import PrimaryButton from '../components/Button';
import MonthNavigation from '../components/MonthNavigation';
import Budget from '../components/Budget';
import EditBudgetModal from '../components/EditBudgetModal';
import { sortByMissingBudget } from '../lib/utils';

import * as T from '../lib/types';

interface BudgetsPageProps extends T.WrappedComponentProps {}
interface BudgetsPageState {
  isEditBudgetModalVisible: boolean;
  chosenBudget: null | T.Budget;
}

interface BudgetsToShow extends T.Budget {
  expensesCost: number;
  style?: any;
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

  listContainer: {
    flex: 1,
    marginTop: 28,
  },

  noBudgetsFound: {
    flex: 1,
    color: '#999',
    textAlign: 'center',
    alignItems: 'center',
  },

  button: {
    flex: 1,
    marginTop: 10,
    maxHeight: 70,
  },
});

const NoBudgetsFound: React.SFC<any> = (): JSX.Element => {
  return (
    <Text style={styles.noBudgetsFound}>
      No budgets found for this month.{'\n'}Add one below!
    </Text>
  );
};

class BudgetsPage extends Component<BudgetsPageProps, BudgetsPageState> {
  constructor(props: BudgetsPageProps) {
    super(props);
    this.state = {
      isEditBudgetModalVisible: false,
      chosenBudget: null,
    };
  }

  saveBudget = async (newBudget: T.Budget) => {
    const { saveBudget } = this.props;
    return saveBudget(newBudget);
  };

  deleteBudget = async (budgetId: string) => {
    const { deleteBudget } = this.props;
    return deleteBudget(budgetId);
  };

  render() {
    const {
      isUsingDarkMode,
      isLoading,
      currency,
      budgets,
      expenses,
      monthInView,
      changeMonthInView,
      showAlert,
      loadData,
    } = this.props;
    const { isEditBudgetModalVisible, chosenBudget } = this.state;

    let totalCost = 0;
    let totalBudget = 0;

    const budgetsToShow: BudgetsToShow[] = [...budgets]
      .map((budget) => {
        const budgetToShow = {
          expensesCost: 0,
          ...budget,
        };

        // Calculate expenses cost
        expenses.forEach((expense) => {
          if (expense.budget === budget.name) {
            budgetToShow.expensesCost += expense.cost;
          }
        });

        totalCost += budgetToShow.expensesCost;
        totalBudget += budgetToShow.value;

        return budgetToShow;
      })
      .sort(sortByMissingBudget);

    // Add Total budget
    if (budgetsToShow.length > 0) {
      budgetsToShow.unshift({
        id: 'total',
        name: 'Total',
        value: totalBudget,
        expensesCost: totalCost,
        month: monthInView,
        style: {
          backgroundColor: '#efefef',
          shadowOpacity: 0.2,
        },
      });
    }

    return (
      <SafeAreaView style={styles.wrapper} removeClippedSubviews={false}>
        <View style={styles.container} removeClippedSubviews={false}>
          <MonthNavigation
            currentMonth={monthInView}
            handleChangeMonth={changeMonthInView}
          />
          <View style={styles.listContainer} removeClippedSubviews={false}>
            <FlatList
              refreshing={isLoading}
              onRefresh={() => loadData({ forceReload: true })}
              data={budgetsToShow}
              renderItem={({ item }) => (
                <Budget
                  {...item}
                  currency={currency}
                  onPress={() => {
                    if (item.name === 'Total') {
                      showAlert(
                        'Warning',
                        "You can't edit the Total budget, it's an automatic calculation.",
                      );
                      return;
                    }

                    this.setState({
                      isEditBudgetModalVisible: true,
                      chosenBudget: item,
                    });
                  }}
                />
              )}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={<NoBudgetsFound />}
            />
          </View>
          <PrimaryButton
            style={styles.button}
            type="primary"
            text="Add New Budget"
            onPress={() => {
              this.setState({
                isEditBudgetModalVisible: true,
                chosenBudget: {
                  id: 'newBudget',
                  name: '',
                  value: 100,
                  month: monthInView,
                },
              });
            }}
          />
          {chosenBudget && (
            <EditBudgetModal
              isUsingDarkMode={isUsingDarkMode}
              isVisible={isEditBudgetModalVisible}
              onDismiss={() =>
                this.setState({
                  isEditBudgetModalVisible: false,
                  chosenBudget: null,
                })
              }
              onSaveBudget={this.saveBudget}
              onDeleteBudget={this.deleteBudget}
              budget={chosenBudget}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }
}

export default BudgetsPage;
