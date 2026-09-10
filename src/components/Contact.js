export const Contact = () => (
  <section id="contact">
    <div className="c-grid">
      <div className="c-info" data-rev="true">
        <span className="kicker">CONTACT US</span>
        <h2>GOT SOMETHING<br/><em>TO SAY?</em></h2>
        <a href="mailto:HELLO@FORNO.CO">HELLO@FORNO.CO</a>
        <a href="tel:+201001234567">+20 100 123 4567</a>
        <span className="c-loc">CAIRO, EGYPT</span>
      </div>
      <form id="cForm" data-rev="true" noValidate>
        <div className="f-row">
          <input id="fName" placeholder="NAME" required />
          <input id="fPhone" placeholder="PHONE" type="tel" />
        </div>
        <input id="fEmail" placeholder="EMAIL" type="email" required />
        <div className="topics" id="topics">
          <button type="button" className="on">GENERAL</button>
          <button type="button">ORDER</button>
          <button type="button">CATERING</button>
          <button type="button">FEEDBACK</button>
          <button type="button">PARTNERSHIP</button>
        </div>
        <textarea id="fMsg" placeholder="MESSAGE" required></textarea>
        <button className="btn solid" type="submit">SEND MESSAGE</button>
      </form>
      <div id="cThanks">
        <h3>THANK YOU.</h3>
        <p>WE'LL BE IN TOUCH.</p>
      </div>
    </div>
  </section>
);