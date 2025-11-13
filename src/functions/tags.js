export const applyScaling = (scaling, value) => {
  try {
    if (scaling === "") return value;
    if (typeof scaling !== "string") return NaN;

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return NaN;

    const trimmed = scaling.trim();
    if (trimmed === "") return numericValue.toFixed(3);

    const operator = trimmed[0];
    const simpleOps = "+-*/";

    if (!trimmed.includes("x") && simpleOps.includes(operator)) {
      const operand = Number(trimmed.slice(1));
      if (!Number.isFinite(operand)) return NaN;

      let result;
      switch (operator) {
        case "+":
          result = numericValue + operand;
          break;
        case "-":
          result = numericValue - operand;
          break;
        case "*":
          result = numericValue * operand;
          break;
        case "/":
          result = operand === 0 ? NaN : numericValue / operand;
          break;
        default:
          result = NaN;
      }

      return Number.isFinite(result) ? result.toFixed(3) : NaN;
    }

    const normalized = trimmed.includes("x") ? trimmed : `x${trimmed}`;
    const fn = new Function("x", `return ${normalized};`);
    const evaluated = Number(fn(numericValue));
    return Number.isFinite(evaluated) ? evaluated.toFixed(3) : NaN;
  } catch (err) {
    return NaN;
  }
};
