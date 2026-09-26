// src/components/modals/SavedDrawer.js
export const SavedDrawer = () => (
  <>
    <div id="savedOverlay"></div>
    <aside id="savedDrawer" role="dialog" aria-modal="true" aria-label="Saved Pizzas">
      <div className="cd-head">
        <h3 id="savedDrawerTitle">MY SAVED PIZZAS</h3>
        <button id="savedClose" aria-label="Close saved pizzas drawer">✕</button>
      </div>
      <div id="savedItems"></div>
      <div className="cd-foot">
        <button id="savedBuild" className="btn solid">BUILD A NEW ONE</button>
      </div>
    </aside>
  </>
);

export default SavedDrawer;