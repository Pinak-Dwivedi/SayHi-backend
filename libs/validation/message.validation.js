const { z } = require("zod");

exports.AddMessageSchema = z.object({
  message: z
    .string({
      required_error: "message is required",
      invalid_type_error: "message must be string",
    })
    .trim()
    .min(1, "message must be at least 1 character long"),
});
