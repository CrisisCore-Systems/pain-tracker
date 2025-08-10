/** @crisiscore-hardened: SafeCartSystem */
export const SafeCartSystem = (() => {
  const base = window.CartSystem;
  const need = () => {
    const e = window?.voidBloom?.epoch?.current?.();
    if (!e) throw new Error('Cart mutation rejected: no epoch');
    return e;
  };
  const deepFreeze = (o) => {
    if (!o || typeof o !== 'object') return o;
    Object.freeze(o);
    for (const k of Object.keys(o)) deepFreeze(o[k]);
    return o;
  };
  return Object.freeze({
    getCart: () => deepFreeze(JSON.parse(JSON.stringify(base.getCart()))),
    addItem: (item, q = 1) => { need(); return base.addItem(item, q); },
    updateItem: (id, props) => { need(); return base.updateItem(id, props); },
    removeItem: (id) => { need(); return base.removeItem(id); },
    resetQuantumState: () => { const e = need(); console.info('Reset cart quantum in epoch', e); }
  });
})();
