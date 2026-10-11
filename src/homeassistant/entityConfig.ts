// A script key from its alias, as Home Assistant's slugify makes one:
// lower case, accents dropped, and runs of anything else as one underscore.
export const configSlug = (alias: string) =>
  alias
    .normalize("NFKD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "_")
    .replaceAll(/^_+|_+$/g, "");
