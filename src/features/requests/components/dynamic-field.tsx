"use client";

import { Controller, type Control, type FieldErrors } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldLegend,
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
  const hasError = !disabled && !!error;
  const descriptionId = field.helpText && !disabled ? `${field.id}-description` : undefined;
  const errorId = hasError ? `${field.id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhf }) => {
        switch (field.type) {
          case "textarea":
            return (
              <Field data-invalid={hasError} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id}>
                  {field.label}
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  )}
                </FieldLabel>
                <FieldContent>
                  {field.helpText && !disabled && (
                    <FieldDescription id={descriptionId}>{field.helpText}</FieldDescription>
                  )}
                  <Textarea
                    id={field.id}
                    placeholder={field.placeholder}
                    rows={3}
                    value={(rhf.value as string) ?? ""}
                    onChange={rhf.onChange}
                    disabled={disabled}
                    aria-required={field.required}
                    aria-invalid={hasError}
                    aria-describedby={describedBy}
                  />
                  {hasError && (
                    <FieldError id={errorId} errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );

          case "number":
            return (
              <Field data-invalid={hasError} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id}>
                  {field.label}
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  )}
                </FieldLabel>
                <FieldContent>
                  {field.helpText && !disabled && (
                    <FieldDescription id={descriptionId}>{field.helpText}</FieldDescription>
                  )}
                  <Input
                    id={field.id}
                    type="number"
                    placeholder={field.placeholder}
                    value={(rhf.value as number | string) ?? ""}
                    onChange={rhf.onChange}
                    disabled={disabled}
                    aria-required={field.required}
                    aria-invalid={hasError}
                    aria-describedby={describedBy}
                  />
                  {hasError && (
                    <FieldError id={errorId} errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );

          case "select":
            return (
              <Field data-invalid={hasError} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id}>
                  {field.label}
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  )}
                </FieldLabel>
                <FieldContent>
                  {field.helpText && !disabled && (
                    <FieldDescription id={descriptionId}>{field.helpText}</FieldDescription>
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
                      aria-required={field.required}
                      aria-invalid={hasError}
                      aria-describedby={describedBy}
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
                  {hasError && (
                    <FieldError id={errorId} errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );

          case "radio":
            return (
              <FieldSet data-invalid={hasError} data-disabled={disabled} aria-describedby={describedBy}>
                <FieldLegend variant="label" className="text-sm font-medium text-foreground">
                  {field.label}
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  )}
                </FieldLegend>
                <FieldContent>
                  {field.helpText && !disabled && (
                    <FieldDescription id={descriptionId}>{field.helpText}</FieldDescription>
                  )}
                  <RadioGroup
                    value={(rhf.value as string) ?? ""}
                    onValueChange={rhf.onChange}
                    disabled={disabled}
                    aria-required={field.required}
                  >
                    {field.options?.map((opt) => (
                      <FieldLabel
                        key={opt.value}
                        htmlFor={`${field.id}-${opt.value}`}
                        className="flex-row items-center gap-2 font-normal cursor-pointer"
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
                  {hasError && (
                    <FieldError id={errorId} errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </FieldSet>
            );

          case "checkbox":
            return (
              <FieldSet data-invalid={hasError} data-disabled={disabled} aria-describedby={describedBy}>
                <FieldLegend variant="label" className="text-sm font-medium text-foreground">
                  {field.label}
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  )}
                </FieldLegend>
                <FieldContent>
                  {field.helpText && !disabled && (
                    <FieldDescription id={descriptionId}>{field.helpText}</FieldDescription>
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
                          className="flex-row items-center gap-2 font-normal cursor-pointer"
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
                  {hasError && (
                    <FieldError id={errorId} errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </FieldSet>
            );

          case "date":
            return (
              <Field data-invalid={hasError} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id}>
                  {field.label}
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  )}
                </FieldLabel>
                <FieldContent>
                  {field.helpText && !disabled && (
                    <FieldDescription id={descriptionId}>{field.helpText}</FieldDescription>
                  )}
                  <Input
                    id={field.id}
                    type="date"
                    value={(rhf.value as string) ?? ""}
                    onChange={rhf.onChange}
                    disabled={disabled}
                    aria-required={field.required}
                    aria-invalid={hasError}
                    aria-describedby={describedBy}
                  />
                  {hasError && (
                    <FieldError id={errorId} errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );

          case "file":
            return (
              <Field data-invalid={hasError} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id}>
                  {field.label}
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  )}
                </FieldLabel>
                <FieldContent>
                  {field.helpText && !disabled && (
                    <FieldDescription id={descriptionId}>{field.helpText}</FieldDescription>
                  )}
                  <FileDropzone
                    value={(rhf.value as DropzoneFile[]) ?? []}
                    onChange={rhf.onChange}
                    accept={field.accept}
                    multiple={field.multiple}
                    disabled={disabled}
                    invalid={hasError}
                  />
                  {hasError && (
                    <FieldError id={errorId} errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );

          default:
            return (
              <Field data-invalid={hasError} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id}>
                  {field.label}
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold ml-0.5 text-sm leading-none" aria-hidden="true">*</span>
                  )}
                </FieldLabel>
                <FieldContent>
                  {field.helpText && !disabled && (
                    <FieldDescription id={descriptionId}>{field.helpText}</FieldDescription>
                  )}
                  <Input
                    id={field.id}
                    placeholder={field.placeholder}
                    value={(rhf.value as string) ?? ""}
                    onChange={rhf.onChange}
                    disabled={disabled}
                    aria-required={field.required}
                    aria-invalid={hasError}
                    aria-describedby={describedBy}
                  />
                  {hasError && (
                    <FieldError id={errorId} errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );
        }
      }}
    />
  );
}
