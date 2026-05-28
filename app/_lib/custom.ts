export type TryCatchResult<T> = [unknown | null, T | null];

type AsyncFunction<T> = () => Promise<T>;

export const tryIt = async <T>(
  fn: AsyncFunction<T>,
): Promise<TryCatchResult<T>> => {
  try {
    return [null, await fn()];
  } catch (error) {
    return [error, null];
  }
};
