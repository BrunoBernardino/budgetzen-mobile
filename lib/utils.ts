export const formatNumber = (currency = 'USD', number: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);

type SortableByDate = { date: string };
export const sortByDate = (
  objectA: SortableByDate,
  objectB: SortableByDate,
) => {
  if (objectA.date < objectB.date) {
    return -1;
  }
  if (objectA.date > objectB.date) {
    return 1;
  }
  return 0;
};

type SortableByName = { name: string };
export const sortByName = (
  objectA: SortableByName,
  objectB: SortableByName,
) => {
  const nameA = objectA.name.toUpperCase();
  const nameB = objectB.name.toUpperCase();
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
};

type SortableByMissingBudget = { expensesCost: number; value: number };
export const sortByMissingBudget = (
  objectA: SortableByMissingBudget,
  objectB: SortableByMissingBudget,
) => {
  const valueA = objectA.value - objectA.expensesCost;
  const valueB = objectB.value - objectB.expensesCost;
  return valueB - valueA;
};
