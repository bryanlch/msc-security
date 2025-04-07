type ErrorResult = {
  data: null;
  error: string;
};

type SuccessResult<T> = {
  data: T;
  error: null;
};

type Result<T> = SuccessResult<T> | ErrorResult;
