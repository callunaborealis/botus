export const getNextLoopedIndex = <ListItem>(
  list: ListItem[],
  predicate: (l: ListItem, index: number, obj: ListItem[]) => boolean,
  step: number,
) => {
  const currentLoopIndex = list.findIndex(predicate);
  const nextLoopIndex = currentLoopIndex + step;
  // Loop forward
  if (nextLoopIndex > list.length - 1) {
    return nextLoopIndex % list.length;
  }
  // Loop backward
  if (nextLoopIndex < 0) {
    return nextLoopIndex + list.length;
  }
  return nextLoopIndex;
};
