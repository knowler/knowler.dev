/*
|-----------------------------------------------------------------------------
| Text sizes                         https://tailwindcss.com/docs/text-sizing
|-----------------------------------------------------------------------------
|
| Here is where you define your text sizes. Name these in whatever way
| makes the most sense to you. We use size names by default, but
| you're welcome to use a numeric scale or even something else
| entirely.
|
| By default Tailwind uses the "rem" unit type for most measurements.
| This allows you to set a root font size which all other sizes are
| then based on. That said, you are free to use whatever units you
| prefer, be it rems, ems, pixels or other.
|
| Class name: .text-{size}
|
*/

const typeScale = 1.414;

module.exports = {
  'xs':    `${Math.pow(typeScale, -2)}rem`,
  'sm':    `${Math.pow(typeScale, -1)}rem`,
  'base':  `${Math.pow(typeScale,  0)}rem`,
  'lg':    `${Math.pow(typeScale,  1)}rem`,
  'xl':    `${Math.pow(typeScale,  2)}rem`,
  '2xl':   `${Math.pow(typeScale,  3)}rem`,
  '3xl':   `${Math.pow(typeScale,  4)}rem`,
  '4xl':   `${Math.pow(typeScale,  5)}rem`,
  '5xl':   `${Math.pow(typeScale,  6)}rem`,
};
