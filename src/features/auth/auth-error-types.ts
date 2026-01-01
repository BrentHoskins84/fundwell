export type AuthErrorType =
  | 'email_already_exists'
  | 'invalid_credentials'
  | 'rate_limit_exceeded'
  | 'invalid_magic_link'
  | 'email_not_confirmed'
  | 'generic_error';

const ERROR_MESSAGES: Record<AuthErrorType, string> = {
  email_already_exists: 'This email is already registered. Try logging in instead.',
  invalid_credentials: 'Invalid email or password. Please try again.',
  rate_limit_exceeded: 'Too many requests. Please wait a minute and try again.',
  invalid_magic_link: 'This link has expired or is invalid. Please request a new one.',
  email_not_confirmed: 'Please check your email and confirm your account.',
  generic_error: 'Something went wrong. Please try again.',
};

export function getUserFriendlyErrorMessage(error: unknown): {
  type: AuthErrorType;
  message: string;
} {
  const errorMessage = (error as { message?: string })?.message?.toLowerCase() ?? '';
  const errorCode = (error as { code?: string })?.code ?? '';

  let type: AuthErrorType = 'generic_error';

  // Check errorCode first for precise matching
  if (errorCode === 'user_already_exists') {
    type = 'email_already_exists';
  } else if (errorCode === 'invalid_credentials') {
    type = 'invalid_credentials';
  } else if (errorCode === 'over_request_rate_limit' || errorCode === 'rate_limit_exceeded') {
    type = 'rate_limit_exceeded';
  } else if (errorCode === 'otp_expired' || errorCode === 'invalid_otp') {
    type = 'invalid_magic_link';
  } else if (errorCode === 'email_not_confirmed') {
    type = 'email_not_confirmed';
  }
  // Fall back to message-based matching with specific phrases/patterns
  else if (errorMessage.includes('user already registered')) {
    type = 'email_already_exists';
  } else if (errorMessage.includes('invalid login credentials')) {
    type = 'invalid_credentials';
  } else if (
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many requests')
  ) {
    type = 'rate_limit_exceeded';
  } else if (
    errorMessage.includes('magic link expired') ||
    errorMessage.includes('invalid magic link') ||
    errorMessage.includes('otp has expired')
  ) {
    type = 'invalid_magic_link';
  } else if (errorMessage.includes('email not confirmed')) {
    type = 'email_not_confirmed';
  }

  return {
    type,
    message: ERROR_MESSAGES[type],
  };
}

