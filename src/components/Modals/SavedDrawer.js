export const SavedDrawer = () => (
  <aside id="savedDrawer">
    <div className="cd-head">
      <h3>MY SAVED PIZZAS</h3>
      <button id="savedClose">✕</button>
    </div>
    <div id="savedItems"></div>
    <div className="cd-foot">
      <button id="savedBuild" className="btn solid">BUILD A NEW ONE</button>
    </div>
  </aside>
);