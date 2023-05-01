declare namespace CommonAPI {
  interface IResponse<T> {
    code: number;
    data: T;
    msg: string;
  }
}
