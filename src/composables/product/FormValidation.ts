import { z } from "zod";

type ValidationError = { [key: string]: string };

export const validateForm = <T>(
  formSchema: z.ZodObject<any>,
  formData: T,
  setErrors: (errors: ValidationError) => void,
) => {
  try {
    formSchema.parse(formData);

    setErrors({});
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};

      error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message;
        }
      });

      setErrors(fieldErrors);
    }

    return false;
  }
};
