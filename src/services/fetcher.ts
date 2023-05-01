interface IConfig<U extends object | undefined> {
  method: string;
  data: U;
}

const fetcher = async<T, U extends object | undefined = undefined>
(url: string, config: IConfig<U>) => {
  return fetch(url, {
    method: config.method,
    body: JSON.stringify(config.data)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json() as Promise<T>;
    });
};

export default fetcher;
