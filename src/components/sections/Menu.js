// src/components/sections/Menu.js
/* eslint-disable @next/next/no-img-element */
export const Marquee = () => (
  <div className="marquee">
    <div className="mq-in">
      مخبوزة بفرن الحطب 450° <i>★</i> عجينة متخمرة 48 ساعة <i>★</i> جبنة موتزاريلا طبيعية <i>★</i> فروع القاهرة <i>★</i> فورنو بيتزا نابوليتان <i>★</i> 
      مخبوزة بفرن الحطب 450° <i>★</i> عجينة متخمرة 48 ساعة <i>★</i> جبنة موتزاريلا طبيعية <i>★</i> فروع القاهرة <i>★</i> فورنو بيتزا نابوليتان <i>★</i>
    </div>
  </div>
);

export const Menu = () => (
  <>
    <Marquee />
    <section id="menu">
      <div className="menu-pin">
        <div className="m-head" data-rev="true">
          <span className="kicker">قائمة الطعام</span>
          <h2>مش عايز تبني بيتزتك بنفسك؟<br/><em>جهزنا لك أشهى وصفات البيتزا</em></h2>
        </div>
        <div id="menuTabs">
          <button className="tab active" data-cat="signature">المميزة</button>
          <button className="tab" data-cat="classic">كلاسيك</button>
          <button className="tab" data-cat="spicy">سبايسي</button>
          <button className="tab" data-cat="vegetarian">خضار وجبن</button>
          <button className="tab" data-cat="sides">مقبلات</button>
          <button className="tab" data-cat="drinks">مشروبات</button>
          <button className="tab" data-cat="desserts">حلويات</button>
        </div>
        <div className="menu-view">
          <div id="menuTrack"></div>
        </div>
        <div className="menu-bar"><i id="menuBar"></i></div>
      </div>
    </section>
  </>
);

export default Menu;
