// src/components/layout/Footer.js
import siteConfig from '@/config/site';

export const Footer = () => (
  <footer id="siteFooter" className="luxury-footer">
    <div className="lf-inner">
      <div className="lf-top">
        {/* Brand Column */}
        <div className="lf-brand">
          <div className="lf-logo">FORNO<span>.</span></div>
          <p className="lf-motto" id="footerDesc">
            Pure Neapolitan craft, baked at 450°C in a live wood-fired oven.
          </p>
        </div>

        {/* Quick Nav */}
        <div className="lf-col">
          <h4 className="lf-heading">EXPLORE</h4>
          <ul className="lf-nav">
            <li><button type="button" data-go="#builder">Build Pizza</button></li>
            <li><button type="button" data-go="#menu">Our Menu</button></li>
            <li><button type="button" data-go="#contact">Contact & Location</button></li>
          </ul>
        </div>

        {/* Connect & Social */}
        <div className="lf-col">
          <h4 className="lf-heading" id="footerSocialTitle">CONNECT</h4>
          <div className="lf-socials">
            <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="lf-soc-link" aria-label="Instagram">
              Instagram
            </a>
            <a href={`https://wa.me/${siteConfig.contact.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="lf-soc-link wa" aria-label="WhatsApp">
              WhatsApp
            </a>
          </div>
          <div className="lf-phone">
            <a href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`}>📞 {siteConfig.contact.phone}</a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="lf-bottom">
        <div className="lf-copy">
          © {siteConfig.year} {siteConfig.fullName}. <span id="footerRights">ALL RIGHTS RESERVED.</span>
        </div>
        <div className="lf-origin">
          CAIRO, EGYPT
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
