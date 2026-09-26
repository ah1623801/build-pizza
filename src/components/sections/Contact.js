// src/components/sections/Contact.js
import siteConfig from '@/config/site';

export const Contact = () => (
  <section id="contact">
    <div className="c-grid">
      <div className="c-info" data-rev="true">
        <span className="kicker">CONTACT US</span>
        <h2>GOT SOMETHING<br/><em>TO SAY?</em></h2>
        <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email.toUpperCase()}</a>
        <a href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`}>{siteConfig.contact.phone}</a>
        <span className="c-loc">{siteConfig.contact.location.toUpperCase()}</span>
      </div>
      <form id="cForm" data-rev="true" noValidate>
        <div className="f-row">
          <input id="fName" placeholder="NAME" aria-label="Your Name" required />
          <input id="fPhone" placeholder="PHONE" aria-label="Phone Number" type="tel" />
        </div>
        <input id="fEmail" placeholder="EMAIL" aria-label="Email Address" type="email" required />
        <div className="topics" id="topics">
          <button type="button" className="on">GENERAL</button>
          <button type="button">ORDER</button>
          <button type="button">CATERING</button>
          <button type="button">FEEDBACK</button>
          <button type="button">PARTNERSHIP</button>
        </div>
        <textarea id="fMsg" placeholder="MESSAGE" aria-label="Your Message" required></textarea>
        <button className="btn solid" type="submit">SEND MESSAGE</button>
      </form>
      <div id="cThanks">
        <h3>THANK YOU.</h3>
        <p>WE&apos;LL BE IN TOUCH.</p>
      </div>
    </div>
  </section>
);

export default Contact;
