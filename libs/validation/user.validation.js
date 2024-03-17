const { z } = require("zod");

exports.RegisterSchema = z
  .object({
    username: z
      .string({
        required_error: "username is required",
        invalid_type_error: "username must be string",
      })
      .trim()
      .min(5, "username must be at least 5 characters long"),
    email: z
      .string({
        required_error: "email is required",
        invalid_type_error: "email must be a string",
      })
      .trim()
      .email("please enter a valid email")
      .toLowerCase(),
    password: z
      .string({
        required_error: "password is required",
        invalid_type_error: "password must be string",
      })
      .regex(
        /^\S{8,}$/,
        "password must contain at least 8 characters with no space"
      ),
    confirmPassword: z.string(),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    validation: "password",
    path: ["confirmPassword"],
    message: "password and confirm password must be same!",
  });

exports.LoginSchema = z.object({
  username: z
    .string({
      required_error: "username is required",
      invalid_type_error: "username must be string",
    })
    .trim()
    .min(5, "username must be at least 5 characters long"),
  password: z
    .string({
      required_error: "password is required",
      invalid_type_error: "password must be string",
    })
    .min(8, "password must be at least 8 characters long"),
});

exports.UpdateSchema = z.object({
  username: z
    .string({
      required_error: "username is required",
      invalid_type_error: "username must be string",
    })
    .trim()
    .min(5, "username must be at least 5 characters long"),
  email: z
    .string({
      required_error: "email is required",
      invalid_type_error: "email must be a string",
    })
    .trim()
    .email("please enter a valid email")
    .toLowerCase(),
});

exports.ForgotPasswordSchema = z.object({
  email: z
    .string({
      required_error: "email is required",
      invalid_type_error: "email must be a string",
    })
    .trim()
    .email("please enter a valid email")
    .toLowerCase(),
});

exports.VerifyOTPSchema = z.object({
  email: z
    .string({
      required_error: "email is required",
      invalid_type_error: "email must be a string",
    })
    .trim()
    .email("please enter a valid email")
    .toLowerCase(),

  OTP: z
    .string({
      required_error: "OTP is required",
      invalid_type_error: "OTP must be a string",
    })
    .trim()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits"),
});

exports.ResetPasswordSchema = z
  .object({
    email: z
      .string({
        required_error: "email is required",
        invalid_type_error: "email must be a string",
      })
      .trim()
      .email("please enter a valid email")
      .toLowerCase(),
    password: z
      .string({
        required_error: "password is required",
        invalid_type_error: "password must be string",
      })
      .regex(
        /^\S{8,}$/,
        "password must contain at least 8 characters with no space"
      ),
    confirmPassword: z.string(),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    validation: "password",
    path: ["confirmPassword"],
    message: "password and confirm password must be same!",
  });
