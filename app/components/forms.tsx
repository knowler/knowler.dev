export function TextField({
	label,
	name,
	id,
	required,
	minLength,
	maxLength,
	defaultValue,
}: {
		label: string;
		name: string;
		id?: string;
		required?: boolean;
		minLength?: number;
		maxLength?: number;
		defaultValue?: string;
	}) {
	return (
		<form-field>
			<label htmlFor={id ?? name}>{label}</label>
			<input id={id ?? name} name={name} defaultValue={defaultValue} required={required} minLength={minLength} maxLength={maxLength} />
		</form-field>
	);
}

export function TextareaField({label, name, id, required, minLength, maxLength, defaultValue}: {
	label: string;
	name: string;
	id?: string;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	defaultValue?: string;
}) {
	return (
		<form-field>
			<label htmlFor={id ?? name}>{label}</label>
			<textarea id={id ?? name} name={name} defaultValue={defaultValue} required={required} minLength={minLength} maxLength={maxLength} />
		</form-field>
	);
}

export function SlugField({label, defaultValue, name, id, required}: {
	defaultValue?: string;
	label: string;
	name: string;
	id?: string;
	required?: boolean;
}) {

	return (
		<form-field>
			<label htmlFor={id ?? name}>{label}</label>
			<input id={id ?? name} name={name} pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$" defaultValue={defaultValue} required={required} />
		</form-field>
	);
}
