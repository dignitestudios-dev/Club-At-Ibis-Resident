"use client";

import { useMemo } from "react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import {
  Field,
  FieldContent,
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
import { FieldHelpTooltip } from "@/components/shared/field-help-tooltip";
import { formatUsPhone } from "@/features/requests/schemas/request-step.schema";

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
  const errorId = hasError ? `${field.id}-error` : undefined;

  const normalizedOptions: FieldOption[] = useMemo(() => {
    if (!field.options) return [];
    return field.options.map((opt) =>
      typeof opt === "string" ? { label: opt, value: opt } : opt
    );
  }, [field.options]);

  const normalizedAccept = useMemo(() => {
    if (!field.accept) return undefined;
    if (Array.isArray(field.accept)) {
      return field.accept
        .map((a) => (a === "images" ? "image/*" : a === "pdf" ? ".pdf" : a))
        .join(",");
    }
    return field.accept;
  }, [field.accept]);

  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhf }) => {
        switch (field.type) {
          case "email":
            return (
              <Field data-invalid={hasError} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id} className="flex items-center gap-1">
                  <span>{field.label}</span>
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold text-sm leading-none" aria-hidden="true">*</span>
                  )}
                  {!disabled && <FieldHelpTooltip content={field.helpText} />}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id={field.id}
                    type="email"
                    autoComplete="email"
                    maxLength={255}
                    placeholder={field.placeholder || "name@example.com"}
                    value={(rhf.value as string) ?? ""}
                    onChange={rhf.onChange}
                    disabled={disabled}
                    aria-required={field.required}
                    aria-invalid={hasError}
                    aria-describedby={errorId}
                  />
                  {hasError && (
                    <FieldError id={errorId} errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );

          case "phone":
            return (
              <Field data-invalid={hasError} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id} className="flex items-center gap-1">
                  <span>{field.label}</span>
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold text-sm leading-none" aria-hidden="true">*</span>
                  )}
                  {!disabled && <FieldHelpTooltip content={field.helpText} />}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id={field.id}
                    type="tel"
                    inputMode="tel"
                    maxLength={14}
                    placeholder={field.placeholder || "(555) 000-0000"}
                    value={formatUsPhone((rhf.value as string) ?? "")}
                    onChange={(e) => {
                      const formatted = formatUsPhone(e.target.value);
                      rhf.onChange(formatted);
                    }}
                    disabled={disabled}
                    aria-required={field.required}
                    aria-invalid={hasError}
                    aria-describedby={errorId}
                  />
                  {hasError && (
                    <FieldError id={errorId} errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );

          case "date":
            return (
              <Field data-invalid={hasError} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id} className="flex items-center gap-1">
                  <span>{field.label}</span>
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold text-sm leading-none" aria-hidden="true">*</span>
                  )}
                  {!disabled && <FieldHelpTooltip content={field.helpText} />}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id={field.id}
                    type="date"
                    value={(rhf.value as string) ?? ""}
                    onChange={rhf.onChange}
                    disabled={disabled}
                    aria-required={field.required}
                    aria-invalid={hasError}
                    aria-describedby={errorId}
                  />
                  {hasError && (
                    <FieldError id={errorId} errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );

          case "time":
            return (
              <Field data-invalid={hasError} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id} className="flex items-center gap-1">
                  <span>{field.label}</span>
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold text-sm leading-none" aria-hidden="true">*</span>
                  )}
                  {!disabled && <FieldHelpTooltip content={field.helpText} />}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id={field.id}
                    type="time"
                    value={(rhf.value as string) ?? ""}
                    onChange={rhf.onChange}
                    disabled={disabled}
                    aria-required={field.required}
                    aria-invalid={hasError}
                    aria-describedby={errorId}
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
                <FieldLabel htmlFor={field.id} className="flex items-center gap-1">
                  <span>{field.label}</span>
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold text-sm leading-none" aria-hidden="true">*</span>
                  )}
                  {!disabled && <FieldHelpTooltip content={field.helpText} />}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id={field.id}
                    type="number"
                    step="any"
                    placeholder={field.placeholder}
                    value={(rhf.value as number | string) ?? ""}
                    onChange={rhf.onChange}
                    disabled={disabled}
                    aria-required={field.required}
                    aria-invalid={hasError}
                    aria-describedby={errorId}
                  />
                  {hasError && (
                    <FieldError id={errorId} errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );

          case "textarea":
            return (
              <Field data-invalid={hasError} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id} className="flex items-center gap-1">
                  <span>{field.label}</span>
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold text-sm leading-none" aria-hidden="true">*</span>
                  )}
                  {!disabled && <FieldHelpTooltip content={field.helpText} />}
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    id={field.id}
                    placeholder={field.placeholder}
                    rows={3}
                    maxLength={5000}
                    value={(rhf.value as string) ?? ""}
                    onChange={rhf.onChange}
                    disabled={disabled}
                    aria-required={field.required}
                    aria-invalid={hasError}
                    aria-describedby={errorId}
                  />
                  {!disabled && (
                    <div className="flex justify-end mt-1">
                      <span className="text-[11px] text-muted-foreground/70 tabular-nums">
                        {((rhf.value as string) ?? "").length}/5000
                      </span>
                    </div>
                  )}
                  {hasError && (
                    <FieldError id={errorId} errors={error ? [error as { message?: string }] : []} />
                  )}
                </FieldContent>
              </Field>
            );

          case "select":
            return (
              <Field data-invalid={hasError} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id} className="flex items-center gap-1">
                  <span>{field.label}</span>
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold text-sm leading-none" aria-hidden="true">*</span>
                  )}
                  {!disabled && <FieldHelpTooltip content={field.helpText} />}
                </FieldLabel>
                <FieldContent>
                  <Select
                    items={normalizedOptions}
                    value={(rhf.value as string) ?? ""}
                    onValueChange={rhf.onChange}
                    disabled={disabled}
                  >
                    <SelectTrigger
                      id={field.id}
                      className="w-full"
                      aria-required={field.required}
                      aria-invalid={hasError}
                      aria-describedby={errorId}
                      disabled={disabled}
                    >
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {normalizedOptions.map((opt) => (
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
              <FieldSet data-invalid={hasError} data-disabled={disabled} aria-describedby={errorId}>
                <FieldLegend variant="label" className="flex items-center gap-1 text-sm font-medium text-foreground">
                  <span>{field.label}</span>
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold text-sm leading-none" aria-hidden="true">*</span>
                  )}
                  {!disabled && <FieldHelpTooltip content={field.helpText} />}
                </FieldLegend>
                <FieldContent>
                  <RadioGroup
                    value={(rhf.value as string) ?? ""}
                    onValueChange={rhf.onChange}
                    disabled={disabled}
                    aria-required={field.required}
                  >
                    {normalizedOptions.map((opt) => (
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
              <FieldSet data-invalid={hasError} data-disabled={disabled} aria-describedby={errorId}>
                <FieldLegend variant="label" className="flex items-center gap-1 text-sm font-medium text-foreground">
                  <span>{field.label}</span>
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold text-sm leading-none" aria-hidden="true">*</span>
                  )}
                  {!disabled && <FieldHelpTooltip content={field.helpText} />}
                </FieldLegend>
                <FieldContent>
                  <div className="flex flex-col gap-2">
                    {normalizedOptions.map((opt) => {
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

          case "file":
            return (
              <Field data-invalid={hasError} data-disabled={disabled}>
                <FieldLabel htmlFor={field.id} className="flex items-center gap-1">
                  <span>{field.label}</span>
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold text-sm leading-none" aria-hidden="true">*</span>
                  )}
                  {!disabled && <FieldHelpTooltip content={field.helpText} />}
                </FieldLabel>
                <FieldContent>
                  <FileDropzone
                    value={(rhf.value as DropzoneFile[]) ?? []}
                    onChange={rhf.onChange}
                    accept={normalizedAccept}
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
                <FieldLabel htmlFor={field.id} className="flex items-center gap-1">
                  <span>{field.label}</span>
                  {field.required && !disabled && (
                    <span className="text-red-500 font-bold text-sm leading-none" aria-hidden="true">*</span>
                  )}
                  {!disabled && <FieldHelpTooltip content={field.helpText} />}
                </FieldLabel>
                <FieldContent>
                  <Input
                    id={field.id}
                    type="text"
                    maxLength={255}
                    placeholder={field.placeholder}
                    value={(rhf.value as string) ?? ""}
                    onChange={rhf.onChange}
                    disabled={disabled}
                    aria-required={field.required}
                    aria-invalid={hasError}
                    aria-describedby={errorId}
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

