"use client";

import { Controller, type Control, type FieldErrors } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDropzone } from "@/features/requests/components/file-dropzone";

export function DynamicField({
  field,
  control,
  errors,
  disabled = false,
}: {
  field: FieldConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  errors: FieldErrors;
  disabled?: boolean;
}) {
  const error = errors[field.id];

  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhf }) => {
        switch (field.type) {
          case "textarea":
            return (
              <Field data-invalid={!!error} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id}>
                  {field.label}
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  )}
                </FieldLabel>
                <FieldContent>
                  {field.helpText && !disabled && (
                    <FieldDescription>{field.helpText}</FieldDescription>
                  )}
                  <Textarea
                    id={field.id}
                    placeholder={field.placeholder}
                    rows={3}
                    value={(rhf.value as string) ?? ""}
                    onChange={rhf.onChange}
                    disabled={disabled}
                    aria-invalid={!!error}
                  />
                  {!disabled && (
                    <FieldError errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );

          case "number":
            return (
              <Field data-invalid={!!error} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id}>
                  {field.label}
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  )}
                </FieldLabel>
                <FieldContent>
                  {field.helpText && !disabled && (
                    <FieldDescription>{field.helpText}</FieldDescription>
                  )}
                  <Input
                    id={field.id}
                    type="number"
                    placeholder={field.placeholder}
                    value={(rhf.value as number | string) ?? ""}
                    onChange={rhf.onChange}
                    disabled={disabled}
                    aria-invalid={!!error}
                  />
                  {!disabled && (
                    <FieldError errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );

          case "select":
            return (
              <Field data-invalid={!!error} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id}>
                  {field.label}
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  )}
                </FieldLabel>
                <FieldContent>
                  {field.helpText && !disabled && (
                    <FieldDescription>{field.helpText}</FieldDescription>
                  )}
                  <Select
                    items={field.options}
                    value={(rhf.value as string) ?? ""}
                    onValueChange={rhf.onChange}
                    disabled={disabled}
                  >
                    <SelectTrigger
                      id={field.id}
                      className="w-full"
                      aria-invalid={!!error}
                      disabled={disabled}
                    >
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!disabled && (
                    <FieldError errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );

          case "radio":
            return (
              <Field data-invalid={!!error} data-disabled={disabled}>
                <FieldLabel>
                  {field.label}
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  )}
                </FieldLabel>
                <FieldContent>
                  {field.helpText && !disabled && (
                    <FieldDescription>{field.helpText}</FieldDescription>
                  )}
                  <RadioGroup
                    value={(rhf.value as string) ?? ""}
                    onValueChange={rhf.onChange}
                    disabled={disabled}
                  >
                    {field.options?.map((opt) => (
                      <FieldLabel
                        key={opt.value}
                        htmlFor={`${field.id}-${opt.value}`}
                        className="flex-row items-center gap-2 font-normal"
                      >
                        <RadioGroupItem
                          id={`${field.id}-${opt.value}`}
                          value={opt.value}
                          disabled={disabled}
                        />
                        {opt.label}
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                  {!disabled && (
                    <FieldError errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );

          case "checkbox":
            return (
              <Field data-invalid={!!error} data-disabled={disabled}>
                <FieldLabel>
                  {field.label}
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  )}
                </FieldLabel>
                <FieldContent>
                  {field.helpText && !disabled && (
                    <FieldDescription>{field.helpText}</FieldDescription>
                  )}
                  <div className="flex flex-col gap-2">
                    {field.options?.map((opt) => {
                      const current: string[] = Array.isArray(rhf.value)
                        ? rhf.value
                        : [];
                      const checked = current.includes(opt.value);
                      return (
                        <FieldLabel
                          key={opt.value}
                          htmlFor={`${field.id}-${opt.value}`}
                          className="flex-row items-center gap-2 font-normal"
                        >
                          <Checkbox
                            id={`${field.id}-${opt.value}`}
                            checked={checked}
                            disabled={disabled}
                            onCheckedChange={(isChecked) => {
                              const next = isChecked
                                ? [...current, opt.value]
                                : current.filter((v) => v !== opt.value);
                              rhf.onChange(next);
                            }}
                          />
                          {opt.label}
                        </FieldLabel>
                      );
                    })}
                  </div>
                  {!disabled && (
                    <FieldError errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );

          case "date":
            return (
              <Field data-invalid={!!error} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id}>
                  {field.label}
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  )}
                </FieldLabel>
                <FieldContent>
                  {field.helpText && !disabled && (
                    <FieldDescription>{field.helpText}</FieldDescription>
                  )}
                  <Input
                    id={field.id}
                    type="date"
                    value={(rhf.value as string) ?? ""}
                    onChange={rhf.onChange}
                    disabled={disabled}
                    aria-invalid={!!error}
                  />
                  {!disabled && (
                    <FieldError errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );

          case "file":
            return (
              <Field data-invalid={!!error} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id}>
                  {field.label}
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  )}
                </FieldLabel>
                <FieldContent>
                  {field.helpText && !disabled && (
                    <FieldDescription>{field.helpText}</FieldDescription>
                  )}
                  <FileDropzone
                    value={(rhf.value as DropzoneFile[]) ?? []}
                    onChange={rhf.onChange}
                    accept={field.accept}
                    multiple={field.multiple}
                    disabled={disabled}
                    invalid={!disabled && !!error}
                  />
                  {!disabled && (
                    <FieldError errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );

          default:
            return (
              <Field data-invalid={!!error} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id}>
                  {field.label}
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  )}
                </FieldLabel>
                <FieldContent>
                  {field.helpText && !disabled && (
                    <FieldDescription>{field.helpText}</FieldDescription>
                  )}
                  <Input
                    id={field.id}
                    placeholder={field.placeholder}
                    value={(rhf.value as string) ?? ""}
                    onChange={rhf.onChange}
                    disabled={disabled}
                    aria-invalid={!!error}
                  />
                  {!disabled && (
                    <FieldError errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );
        }
      }}
    />
  );
}
