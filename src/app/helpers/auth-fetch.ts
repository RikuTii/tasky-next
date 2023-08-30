export const authFetch = async (
  path: string,
  body?: any,
  type?: string,
  result?: boolean
) => {
  const res = await fetch("auth/fetch" + path, {
    method: type ? type : "GET",
    body: body
      ? JSON.stringify({
          body,
        })
      : null,
  });

  if (result) {
    return res;
  }

  if (!res.ok && res.status !== 400) {
    throw new Error("Unknown error occured");
  }
  const data = await res.json();
  return data;
};
