export const Navbar = () => (
  <header id="nav">
    <div className="logo">FORNO<span>.</span></div>
    <nav className="nav-links">
      <button data-go="#builder">BUILD</button>
      <button data-go="#menu">MENU</button>
      <button data-go="#contact">CONTACT</button>
    </nav>
    <div className="nav-acts">
      <button id="savedBtn">SAVED <span id="savedCount">0</span></button>
      <button id="cartBtn">
        <svg className="cb-ico" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1.6"/>
          <circle cx="19" cy="21" r="1.6"/>
          <path d="M2 2h3l2.6 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
        </svg>
        <span className="cb-txt">CART</span> <span id="cartCount">0</span>
      </button>
      <button id="burgerBtn" aria-label="MENU"><i></i><i></i><i></i></button>
    </div>
  </header>
);