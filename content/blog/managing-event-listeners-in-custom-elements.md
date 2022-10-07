---
title: "Managing Event Listeners in Custom Elements"
date: "2022-10-06T23:33:00-05:00"
---

When managing event listeners in custom elements, there tends to be a
bit of boilerplate that needs to be done for _every_ event listener:

- Storing the bound event listener as a property of the class inevitably
	in the constructor (so remember to call `super()`);
- Adding the event listener;
- Removing the event listener.

It might not seem like a lot, but your custom element’s class can easily
get a bit bloated.

A little known and newer feature of [`EventTarget.addEventListener()`][]
is the `signal` property in the options object which it takes as a third
paramter. It expects an [`AbortSignal`][] which it will use to remove
the event listener. You can get and call an `AbortSignal` with an
[`AbortController`][]. I store this on a base class which extends
`HTMLElement`, create an easy accessor for the `AbortSignal`, and then
call [`AbortController.abort()`][] in `disconnectedCallback()`:

[`EventTarget.addEventListener()`]: http://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
[`AbortSignal`]: http://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
[`AbortController`]: http://developer.mozilla.org/en-US/docs/Web/API/AbortController
[`AbortController.abort()`]: http://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort

```javascript
class BaseElement extends HTMLElement {
	#disconnectionController = new AbortController();

	get disconnectSignal() {
		return this.#disconnectionController.signal;
	}

	disconnectedCallback() {
		this.#disconnectionController.abort();
	}
}
```

My custom elements can just extend the base element class and use the
`AbortSignal` when adding event listeners:

```javascript
class MyButton extends BaseElement {
	get button() {
		return this.querySelector(':scope > button');
	}

	connectedCallback() {
		this.button.addEventListener(
			'click',
			this.#onClick.bind(this),
			{ signal: this.disconnectSignal },
		);
	}

	#onClick(event) { /* Handle event */ }
}
``` 

Since you don’t need to remove the event listener manually, you can even
use a closure instead of creating a class method. It’s up to you.

## Browser Support

If you don’t need to support Safari prior to 15 on macOS and iOS then
you are good to go. [Take a look at the support table](https://caniuse.com/mdn-api_eventtarget_addeventlistener_options_parameter_options_signal_parameter).
