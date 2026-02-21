import { apiError } from "../utils/apiResponse.js";
import { mapError } from "../utils/mapError.js";


export const errorHandler = (error, req, res, next) => {
  console.error(error);

  const mapped = mapError(error);

  return res.status(mapped.status).json(
    apiError(mapped)
  );
};