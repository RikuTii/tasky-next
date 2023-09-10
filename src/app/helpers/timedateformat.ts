export const formatDate = (date: string | undefined, locale: string = "") => {
  if (date) {
    let jsDate = new Date(date);
    return jsDate.toLocaleDateString() + " " + jsDate.toLocaleTimeString();
  }

  return "";
};

export const utcToLocalTime = (date: string | undefined) => {
  if (date) {
    const d = new Date(date);
    const dtOffset = new Date(
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    );
    return dtOffset.toLocaleString(undefined, {
      dateStyle: "long",
      timeStyle: "short",
    });
  }

  return "";
};
