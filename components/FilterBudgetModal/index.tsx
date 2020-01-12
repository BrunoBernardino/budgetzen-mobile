import React from 'react';
import { StyleSheet, Text, View, Switch } from 'react-native';

import BasicModal from '../BasicModal';

import * as T from '../../lib/types';

// TODO: Get these colors from the withLayout, according to the light/dark mode
const styles = StyleSheet.create({
  intro: { fontSize: 16, marginBottom: 20, color: '#999' },

  budgetContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
  },

  budgetContainerOdd: {
    backgroundColor: '#f9f9f9',
  },

  budgetName: { fontSize: 18 },
});

interface FilterBudgetModalProps {
  isVisible: boolean;
  onHide: () => void;
  onFilterBudgetToggle: (budgetName: string, newValue: boolean) => void;
  budgets: T.Budget[];
  filterBudgets: Set<string>;
}

const FilterBudgetModal: React.SFC<FilterBudgetModalProps> = (
  props: FilterBudgetModalProps,
): JSX.Element => {
  return (
    <BasicModal
      isVisible={props.isVisible}
      onDismiss={props.onHide}
      onConfirm={props.onHide}
    >
      <Text style={styles.intro}>Choose which budgets to filter by:</Text>
      {props.budgets.map((budget, index) => (
        <View
          key={budget.name}
          style={[
            styles.budgetContainer,
            index % 2 !== 0 ? styles.budgetContainerOdd : {},
          ]}
        >
          <Text style={styles.budgetName}>{budget.name}</Text>
          <Switch
            trackColor={{ false: '#CCC', true: '#000' }}
            value={props.filterBudgets.has(budget.name)}
            onValueChange={props.onFilterBudgetToggle.bind(null, budget.name)}
          />
        </View>
      ))}
    </BasicModal>
  );
};

export default FilterBudgetModal;
