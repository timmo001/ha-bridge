// Parses an `--answer` value, `id=sentence,sentence`. Core rejects punctuation
// in answer sentences, so a comma always separates two of them.
const parseAnswerOption = (value: string) => {
  const separator = value.indexOf("=");

  if (separator <= 0) {
    return undefined;
  }

  return {
    id: value.slice(0, separator),
    sentences: value
      .slice(separator + 1)
      .split(",")
      .map((sentence) => sentence.trim()),
  };
};

// Parses every `--answer` value, or none if any is malformed.
export const parseAnswerOptions = (values: ReadonlyArray<string>) => {
  const options = values.map(parseAnswerOption);

  return options.every((option) => option !== undefined) ? options : undefined;
};

export const invalidAnswerOptionMessage =
  "answer must look like id=sentence,sentence";
