export function validateEmail(email: string) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

export function validatePassword(password: string) {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

export function getRequiredKeys(body: string) {
  const regex = /{{([^}]*)}}/g;
  const matches = [];
  let match;

  while ((match = regex.exec(body)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}
