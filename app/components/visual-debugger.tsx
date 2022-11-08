export function VisualDebugger({code}: {code: any}) {
	return <pre><code>{JSON.stringify(code, null, 2)}</code></pre>;
}
