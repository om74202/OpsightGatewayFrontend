export const applyScaling=(scaling, value)=> {
  try {
    if(scaling==="") return value;
    if (typeof scaling !== 'string') return NaN;

    // Add implicit 'x' if user doesn't write it
    const normalized = scaling.includes('x') ? scaling : 'x' + scaling;

    // Build a function safely
    const fn = new Function('x', `return ${normalized};`);
    
    const result = fn(value);
    return isNaN(result) ? NaN : result.toFixed(3);
  } catch (err) {
    return NaN;
  }
}
