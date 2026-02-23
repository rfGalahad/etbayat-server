export const mapError = (error) => {

  console.error('🔥 RAW ERROR:', {
    message: error.message,
    code: error.code,
    errno: error.errno,
    sqlMessage: error.sqlMessage,
    sql: error.sql
  });
  
  // 🌐 Network
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return {
      status: 503,
      code: 'NETWORK_ERROR',
      message: error.message,
      userMessage:
        'The connection was interrupted. Please check your internet connection and try again.'
    };
  }

  // 🖼 Cloudinary
  if (error.name === 'CloudinaryError') {
    return {
      status: 500,
      code: 'IMAGE_UPLOAD_FAILED',
      message: error.message,
      userMessage:
        'Some images could not be uploaded. Please try again.'
    };
  }

  // 🗄 Duplicate entry (must come BEFORE ER_)
  if (error.code === 'ER_DUP_ENTRY') {
    return {
      status: 409,
      code: 'DUPLICATE_ENTRY',
      message: error.message,
      userMessage:
        'This record already exists.'
    };
  }

  // 🗄 MySQL
  if (error.code?.startsWith('ER_')) {
    return {
      status: 500,
      code: 'DATABASE_ERROR',
      message: error.message,
      userMessage:
        'We could not save your data due to a server issue. Please try again.'
    };
  }

  // 📦 Invalid JSON
  if (error instanceof SyntaxError) {
    return {
      status: 400,
      code: 'INVALID_PAYLOAD',
      message: error.message,
      userMessage:
        'Some data is invalid. Please reload the page and try again.'
    };
  }

  // 🔥 Fallback
  return {
    status: 500,
    code: 'SERVER_ERROR',
    message: error.message,
    userMessage:
      'The server encountered an unexpected error. Please try again later.'
  };
};
