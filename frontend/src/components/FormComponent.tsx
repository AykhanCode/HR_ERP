import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'

export interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'date' | 'select' | 'number' | 'tel'
  required?: boolean
  placeholder?: string
  options?: { value: string | number; label: string }[]
}

interface FormComponentProps {
  fields: FieldConfig[]
  initialValues?: Record<string, string | number | boolean>
  onSubmit: (values: Record<string, string | number>) => Promise<void> | void
  onCancel: () => void
  submitLabel?: string
  isLoading?: boolean
}

export default function FormComponent({
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  isLoading = false,
}: FormComponentProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(
      fields.map((f) => [
        f.name,
        initialValues[f.name] !== undefined ? String(initialValues[f.name]) : '',
      ])
    )
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    fields.forEach((f) => {
      if (f.required && !values[f.name]) {
        newErrors[f.name] = `${f.label} is required`
      }
      if (f.type === 'email' && values[f.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[f.name])) {
        newErrors[f.name] = 'Enter a valid email address'
      }
    })
    return newErrors
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    const parsed: Record<string, string | number> = {}
    fields.forEach((f) => {
      parsed[f.name] = f.type === 'number' ? Number(values[f.name]) : values[f.name]
    })
    await onSubmit(parsed)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.name}
            className={field.type === 'text' && field.name.includes('notes') ? 'sm:col-span-2' : ''}
          >
            <label
              htmlFor={field.name}
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {field.label}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={values[field.name] ?? ''}
                onChange={handleChange}
                className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${
                  errors[field.name]
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                aria-invalid={!!errors[field.name]}
                aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={values[field.name] ?? ''}
                onChange={handleChange}
                placeholder={field.placeholder}
                className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${
                  errors[field.name]
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                aria-invalid={!!errors[field.name]}
                aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
              />
            )}
            {errors[field.name] && (
              <p id={`${field.name}-error`} className="mt-1 text-xs text-red-600" role="alert">
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
