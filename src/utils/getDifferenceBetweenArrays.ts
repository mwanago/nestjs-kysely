export function getDifferenceBetweenArrays<ListType>(
  firstArray: ListType[],
  secondArray: unknown[],
): ListType[] {
  return firstArray.filter((arrayElement) => {
    return !secondArray.includes(arrayElement);
  });
}
