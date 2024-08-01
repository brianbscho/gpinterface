export function getDateString(d: Date) {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const date = d.getDate().toString().padStart(2, "0");

  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");

  return `${year}.${month}.${date} ${h}:${m}`;
}

export function getInterpolatedString(originalString: string, body: any) {
  let interpolatedString = originalString;
  Object.keys(body).forEach((key) => {
    interpolatedString = interpolatedString.replaceAll(`{{${key}}}`, body[key]);
  });

  return interpolatedString;
}
