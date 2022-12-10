// Make the `request` function generic
// to specify the return data type:
export function request<T>(
  url: string,
  // `RequestInit` is a type for configuring
  // a `fetch` request. By default, an empty object.
  config: RequestInit = {}

  // This function is async, it will return a Promise:
): Promise<T> {
  // Inside, we call the `fetch` function with
  // a URL and config given:
  return (
    fetch(url, config)
      // When got a response call a `json` method on it
      .then((response) => response.json())
      // and return the result data.
      .then((data) => data as T)
  );

  // We also can use some post-response
  // data-transformations in the last `then` clause.
}

/**
 * Use when POSTing JSON with fetch so that servers properly parse the body as JSON
 * @param url - the api endpoint to POST to
 * @param payload  - the data you with to JSONify & send
 * @returns a promise, with the response of fetch(url, ..., payload)
 */
export function postJSON(url: string, payload: any) {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

export function putJSON(url: string, payload: any) {
  return fetch(url, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
