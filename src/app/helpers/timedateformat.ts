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


export const formatTimeString = (time: number) => {
  const seconds = Math.floor(time / 1000) % 60;
  const minutes = Math.floor(time / 60000) % 60;
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24);

  const formatArray = [`${hours > 9 ? "" : 0}${hours}`, `${minutes > 9 ? "" : 0}${minutes}`,`${seconds > 9 ? "" : 0}${seconds}`];


  return formatArray.join(":");
};
