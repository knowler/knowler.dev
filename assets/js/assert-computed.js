const elementsMap = new WeakMap();

export function assertComputed({element, pseudo, property, value}) {
	let computedStyle;
	if (elementsMap.has(element)) {
		computedStyle = elementsMap.get(element)
	} else {
		computedStyle = window.getComputedStyle(element, pseudo);
		elementsMap.set(element, computedStyle);
	}

	const computedValue = computedStyle.getPropertyValue(property);

	console.assert(computedValue === value, `expected ${value}, but computed ${computedValue} for ${property} of`, element);
}
