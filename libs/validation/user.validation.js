const { z } = require("zod");

exports.RegisterSchema = z
  .object({
    username: z
      .string({
        required_error: "username is required",
        invalid_type_error: "username must be string",
      })
      .min(5, "username must be at least 5 character long")
      .trim(),
    email: z
      .string({
        required_error: "email is required",
        invalid_type_error: "email must be a string",
      })
      .email("please enter a valid email")
      .trim()
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
    .min(5, "username must be at least 5 character long"),
  password: z
    .string({
      required_error: "password is required",
      invalid_type_error: "password must be string",
    })
    .min(8, "password must be at least 8 characters long"),
});
