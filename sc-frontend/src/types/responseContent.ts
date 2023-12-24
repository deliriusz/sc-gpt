export interface ResponseContent<T> {
   data?: T,
   isOk: boolean,
   status: number,
}