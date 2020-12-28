export const CLASS_PREFIX = "react-images";

export function getSource(source) {
  if (typeof source === "string") return source;

  return source.regular;
}

export function className(name, state) {
  const arr = Array.isArray(name) ? name : [name];

  // loop through state object, remove falsey values and combine with name
  if (state && typeof name === "string") {
    for (let key in state) {
      if (state.hasOwnProperty(key) && state[key]) {
        arr.push(`${name}--${key}`);
      }
    }
  }

  // prefix everything and return a string
  return arr.map(cn => `${CLASS_PREFIX}__${cn}`).join(" ");
}
