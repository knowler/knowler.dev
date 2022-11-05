export function Editor(props) {
	return (
		<>
			<markdown-editor>
				<template>
					<div role="toolbar" tabIndex={0} aria-orientation="horizontal" aria-label="Formatting options">
						<button type="button" name="hgroup">Hgroup</button>
					</div>
					<div contentEditable />
				</template>
				<textarea {...props} />
			</markdown-editor>
			<script type="module" src="/elements/markdown-editor.js" />
		</>
	);
}
