export function getErrorMessage(code: string) {
  switch (code) {
    case "CredentialsSignin":
      return "Invalid email or password.";
    case "OAuthAccountNotLinked":
      return "This email is already registered using another login method.";
    case "AccessDenied":
      return "You do not have permission to access this account.";
    case "Configuration":
      return "Server configuration error.";
    default:
      return "Something went wrong. Please try again.";
  }
}