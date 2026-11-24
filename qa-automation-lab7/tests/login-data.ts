// Облікові дані, які стенд The Internet публікує на сторінці /login
export const VALID_USER = {
  username: 'tomsmith',
  password: 'SuperSecretPassword!',
};

export const INVALID_CASES = [
  {
    name: 'неправильний пароль',
    username: 'tomsmith',
    password: 'WrongPassword!',
    message: 'Your password is invalid!',
  },
  {
    name: 'неіснуючий користувач',
    username: 'unknown_user',
    password: 'SuperSecretPassword!',
    message: 'Your username is invalid!',
  },
] as const;
