// Utility function to decode JWT and return payload as a JSON object
export function decodeJwtPayload(jwt: string): any {
  const token = atob(jwt);
  return JSON.parse(atob(token.split('.')[1]));
}

//Texts
export const beautifyText = (str: string) => {
  return (str.charAt(0).toUpperCase() + str.slice(1)).replaceAll('_', ' ');
};

//Arrays
export const arraysEqual = (a: Array<any>, b: Array<any>) => {
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  const newA = [...a].sort();
  const newB = [...b].sort();
  for (let i = 0; i < newA.length; ++i) {
    if (newA[i] !== newB[i]) return false;
  }
  return true;
};

//Date
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions) => {
  const currentDate = new Date(date);
  const currentOptions =
    options && Object?.keys(options)?.length
      ? options
      : ({ year: 'numeric', month: 'short', day: '2-digit' } as Intl.DateTimeFormatOptions);
  return currentDate.toLocaleDateString('en-US', currentOptions);
};
