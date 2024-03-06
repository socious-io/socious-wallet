// Utility function to decode JWT and return payload as a JSON object
export function decodeJwtPayload(jwt: string): any {
  const token = atob(jwt);
  return JSON.parse(atob(token.split('.')[1]));
}

//Texts
export const beautifyText = (str: string) => {
  return (str.charAt(0).toUpperCase() + str.slice(1)).replaceAll('_', ' ');
};
