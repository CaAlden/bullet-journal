const LINK_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

export const useLinks = (text: string) => {
  const tokens = text.split(/\s+/);
  return tokens.filter(t => t.match(LINK_REGEX));
};
