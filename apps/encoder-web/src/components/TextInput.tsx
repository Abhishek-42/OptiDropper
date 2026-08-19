import type { ChangeEvent } from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * The text entry area where users type or paste the message
 * they want to transmit visually.
 */
export function TextInput({ value, onChange, disabled }: TextInputProps) {
  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
  }

  return (
    <textarea
      id="text-input"
      className="text-input"
      placeholder="Type or paste the text you want to transmit…"
      value={value}
      onChange={handleChange}
      disabled={disabled}
    />
  );
}
