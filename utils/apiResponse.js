export const apiError = ({
  status = 500,
  code = 'SERVER_ERROR',
  message = 'Something went wrong',
  userMessage = 'An unexpected error occurred. Please try again.',
  details = null
}) => ({
  success: false,
  error: {
    code,
    message,
    userMessage,
    details
  }
});
