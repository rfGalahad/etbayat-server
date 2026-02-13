import { apiError } from "../utils/apiResponse";
import { mapError } from "../utils/mapError";


export const errorHandler = (error, req, res, next) => {
  console.error(error);

  const mapped = mapError(error);

  return res.status(mapped.status).json(
    apiError(mapped)
  );
};