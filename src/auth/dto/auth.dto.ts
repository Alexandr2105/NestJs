export class LoginDto {
  loginOrEmail: string;
  password: string;
}

export class RegistrationConformation {
  code: string;
}

export class EmailResending {
  email: string;
}

export class NewPassword {
  newPassword: string;
  recoveryCode: string;
}
