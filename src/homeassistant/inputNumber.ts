export const invalidInputNumberMessage =
  "input number value must be a finite number";

export const parseInputNumberValue = (value: string): number | undefined => {
  if (value === "" || value.trim() !== value) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
};
