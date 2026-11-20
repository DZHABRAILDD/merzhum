const $=s=>document.querySelector(s);
const icon=name=>'<i class="bi bi-'+name+'" aria-hidden="true"></i>';
let products=[],category='Все',cart={},favorites=[];
try{
 const savedCart=JSON.parse(localStorage.getItem('merzhum-cart')||'{}');
 const savedFavorites=JSON.parse(localStorage.getItem('merzhum-favorites')||'[]');
 cart=savedCart&&typeof savedCart==='object'&&!Array.isArray(savedCart)?savedCart:{};
 favorites=Array.isArray(savedFavorites)?savedFavorites:[];
 if(localStorage.getItem('merzhum-theme')==='dark')document.body.classList.add('dark');
}catch{}
const cats=['Все','Торты','Тарты','Десерты','Корпусные десерты','Подарочные боксы','Выпечка','Избранное'];
const symbols=['grid-3x3-gap','cake2','cake2','egg-fried','hexagon-fill','box','basket-fill','heart'];
const categoryFor=id=>[3,15,19,22,24,25,26].includes(id)?'Торты':[6,10,16,17,18,23].includes(id)?'Тарты':[4,7,11,14,20,21].includes(id)?'Подарочные боксы':[8,9,12,37,38,39,41].includes(id)?'Корпусные десерты':[29,30].includes(id)?'Выпечка':'Десерты';
const cakeOrder=[22,15,26,25,24,3,19];
const money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
const desc=p=>p.description||'Состав и наличие уточните при заказе.';
const image=p=>'<img class="photo" src="'+p.image+'" alt="'+p.name.replaceAll('"','&quot;')+'" width="1254" height="1254" loading="lazy" decoding="async">';
const price=(p,quantity=1)=>'<span class="price '+(p.price===null?'unknown':'')+'">'+(p.price===null?'Цена по запросу':money(p.price*quantity))+'</span>';
const qty=p=>cart[p.id]?'<div class="quantity"><button data-change="'+p.id+'" data-step="-1" aria-label="Уменьшить количество '+p.name+'">'+icon('dash')+'</button><span>'+cart[p.id]+'</span><button data-change="'+p.id+'" data-step="1" aria-label="Добавить ещё '+p.name+'">'+icon('plus')+'</button></div>':'';
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function render(){
 const term=$('#search').value.toLowerCase().trim();
 let visible=products.filter(p=>(category==='Все'||p.category===category||(category==='Избранное'&&favorites.includes(p.id)))&&p.name.toLowerCase().includes(term));
 const sort=$('#sort').value;
 if(sort==='default')visible.sort((a,b)=>a.category==='Торты'&&b.category==='Торты'?cakeOrder.indexOf(a.id)-cakeOrder.indexOf(b.id):a.category.localeCompare(b.category,'ru')||a.name.localeCompare(b.name,'ru'));
 if(sort==='name')visible.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
 if(sort==='new')visible.sort((a,b)=>b.id-a.id);
 if(sort==='asc'||sort==='desc')visible.sort((a,b)=>a.price===null?(b.price===null?0:1):b.price===null?-1:(a.price-b.price)*(sort==='asc'?1:-1));
 $('#title').textContent=category==='Все'?'Каталог':category;
 $('#categories').innerHTML=cats.slice(1).map((c,i)=>'<button data-category="'+c+'" class="'+(c===category?'active':'')+'">'+icon(symbols[i+1])+c+'</button>').join('');
 const groups=category==='Все'&&['default','name'].includes(sort)?cats.slice(1,-1):[category];
 $('#products').innerHTML=visible.length?groups.map(c=>{
  const items=groups.length===1?visible:visible.filter(p=>p.category===c);
  return items.length?'<section>'+(groups.length>1?'<h2>'+icon(symbols[cats.indexOf(c)])+c+'<small>'+items.length+'</small></h2>':'')+'<div class="grid">'+items.map(p=>'<article class="card"><div class="photo-wrap"><a href="#product-'+p.id+'" data-product="'+p.id+'">'+image(p)+'</a><button class="fav" data-fav="'+p.id+'" aria-label="'+(favorites.includes(p.id)?'Убрать из избранного':'В избранное')+'" aria-pressed="'+favorites.includes(p.id)+'">'+icon(favorites.includes(p.id)?'heart-fill':'heart')+'</button></div><div class="card-info"><h3><a href="#product-'+p.id+'" data-product="'+p.id+'">'+p.name+'</a></h3><p>'+desc(p)+'</p><div class="card-bottom">'+price(p,cart[p.id]||1)+'<div class="card-quantity" data-quantity="'+p.id+'">'+qty(p)+'</div></div></div></article>').join('')+'</div></section>':'';
 }).join(''):'<div class="no-results">Ничего не найдено.<br>Попробуйте другое название.</div>';
 renderCart();
}
function renderCart(){
 const entries=products.filter(p=>cart[p.id]>0);
 const count=entries.reduce((s,p)=>s+cart[p.id],0);
 const sum=entries.reduce((s,p)=>s+(p.price||0)*cart[p.id],0);
 const unknown=entries.some(p=>p.price===null);
 $('#count').textContent=count;$('#mobile-count').textContent=count;
 $('#mobile-count').hidden=count===0;
 const rows=[...document.querySelectorAll('#cart-content [data-cart-id]')];
 if(entries.length&&rows.length===entries.length&&rows.every((row,i)=>+row.dataset.cartId===entries[i].id)){
  rows.forEach((row,i)=>{const p=entries[i];row.querySelector('.quantity span').textContent=cart[p.id];row.querySelector('.item-price').textContent=p.price===null?'По запросу':money(p.price*cart[p.id])});
  document.querySelectorAll('#cart-content .total-row:first-child span:last-child,#cart-content .total-row.big span:last-child').forEach(el=>el.textContent=money(sum));return;
 }
 const oldScroll=$('#cart-content .cart-items')?.scrollTop||0;
 const focused=document.activeElement;const focusId=focused?.dataset.change,focusStep=focused?.dataset.step;const wasCart=$('#cart-content').contains(focused);
 $('#cart-content').innerHTML=entries.length?'<div class="cart-items">'+entries.map(p=>'<div class="cart-item" data-cart-id="'+p.id+'">'+image(p)+'<div class="cart-item-main"><h4>'+p.name+'</h4><div class="quantity"><button data-change="'+p.id+'" data-step="-1" aria-label="Уменьшить '+p.name+'">'+icon('dash')+'</button><span>'+cart[p.id]+'</span><button data-change="'+p.id+'" data-step="1" aria-label="Увеличить '+p.name+'">'+icon('plus')+'</button></div></div><span class="item-price">'+(p.price===null?'По запросу':money(p.price*cart[p.id]))+'</span></div>').join('')+'</div><div class="cart-total"><div class="total-row"><span>Товары:</span><span>'+money(sum)+'</span></div><div class="total-row"><span>Доставка:</span><span>Уточним при заказе</span></div><div class="total-row big"><span>'+(unknown?'Известная сумма:':'Итого:')+'</span><span>'+money(sum)+'</span></div><button class="gold-button" id="checkout">Оформить заявку '+icon('arrow-right')+'</button><small>'+(unknown?'Есть позиции с ценой по запросу. ':'')+'Наличие и итоговую стоимость подтвердит кондитерская.</small></div>':'<div class="empty"><div class="bag">'+icon('bag-x-fill')+'</div><h3>Корзина пуста</h3><p>Добавьте что-нибудь вкусненькое!</p></div>';
 const list=$('#cart-content .cart-items');if(list)list.scrollTop=oldScroll;
 if(wasCart){const next=document.querySelector('#cart-content [data-change="'+focusId+'"][data-step="'+focusStep+'"]')||document.querySelector('#cart-content button')||$('#cart [data-close-drawer]');next?.focus({preventScroll:true})}
}
let activeDrawer=null,drawerTrigger=null;
const compact=matchMedia('(max-width:991.98px)');
function syncLayout(){
 const search=$('.search');
 if(compact.matches){$('.mobile-search-slot').append(search)}
 else{$('.header-row').insertBefore(search,$('.header-actions'));closeDrawer()}
 for(const p of [$('#category-panel'),$('#cart')])p.inert=compact.matches&&p!==activeDrawer;
}
function openDrawer(id,trigger){
 if(!compact.matches)return;
 closeDrawer(false);
 activeDrawer=$(id);drawerTrigger=trigger;
 activeDrawer.inert=false;
 activeDrawer.classList.add('open');activeDrawer.setAttribute('role','dialog');activeDrawer.setAttribute('aria-modal','true');
 $('#drawer-backdrop').classList.add('show');document.body.classList.add('drawer-open');
 trigger.setAttribute('aria-expanded','true');
 $('main').inert=true;$('header').inert=true;
 activeDrawer.querySelector('[data-close-drawer]').focus();
}
function closeDrawer(restore=true){
 if(!activeDrawer)return;
 const prev=activeDrawer;
 prev.classList.remove('open');prev.removeAttribute('role');prev.removeAttribute('aria-modal');
 $('#drawer-backdrop').classList.remove('show');document.body.classList.remove('drawer-open');
 $('main').inert=false;$('header').inert=false;
 if(drawerTrigger){drawerTrigger.setAttribute('aria-expanded','false');if(restore)drawerTrigger.focus()}
 prev.inert=compact.matches;
 activeDrawer=null;
}
document.addEventListener('keydown',e=>{
 if(!activeDrawer)return;
 if(e.key==='Escape'){e.preventDefault();closeDrawer();return}
 if(e.key==='Tab'){
  const focusable=[...activeDrawer.querySelectorAll('button,a,input,select,textarea')].filter(el=>!el.disabled&&el.getClientRects().length);
  const first=focusable[0],last=focusable.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
 }
});
$('#drawer-backdrop').onclick=()=>closeDrawer();
compact.addEventListener('change',syncLayout);syncLayout();
function show(html){closeDrawer(false);$('#modal-content').innerHTML=html;if(!$('#modal').open)$('#modal').showModal()}
function detail(id){
 const p=products.find(p=>p.id===id);if(!p)return;
 show('<div class="product-detail">'+image(p)+'<div><span class="eyebrow">'+p.category+'</span><h1>'+p.name+'</h1><p>'+desc(p)+'</p>'+price(p)+'<button class="gold-button" data-change="'+p.id+'" data-step="1">Добавить в корзину '+icon('bag-plus')+'</button><small>Состав уточним перед заказом.</small></div></div>');
}
function localToday(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function checkout(){
 if(!products.some(p=>cart[p.id]>0))return;
 show('<form class="checkout" id="order-form"><h1>Оформление заявки</h1><label>Как к вам обращаться<input name="name" required autocomplete="given-name" maxlength="80"></label><label>Телефон<input name="phone" type="tel" required autocomplete="tel" maxlength="30" placeholder="+7 …"></label><label>Получение<select name="delivery" id="delivery"><option>Самовывоз</option><option>Доставка</option></select></label><label id="address-label" hidden>Адрес<input name="address" maxlength="250"></label><label>Желаемая дата<input name="date" type="date" required min="'+localToday()+'" value="'+localToday()+'"></label><label>Желаемое время<input name="time" type="time" required min="09:00" max="20:00" value="12:00"></label><label>Комментарий<textarea name="comment" rows="3" maxlength="1000" placeholder="Пожелания к заказу"></textarea></label><small>Откроется WhatsApp с составом заявки. Нажмите «Отправить» в WhatsApp — кондитерская подтвердит наличие, стоимость и время. Оплата на сайте не производится.</small><button class="gold-button" type="submit">Продолжить в WhatsApp '+icon('arrow-up-right')+'</button></form>');
}
const info={
 about:['О Merzhum','Кондитерская в Грозном. Торты, тарты, авторские корпусные десерты и подарочные наборы.'],
 delivery:['Получение заказа','Вы можете выбрать самовывоз или запросить доставку. Возможность, время и стоимость доставки кондитерская подтвердит в WhatsApp перед заказом.'],
 contacts:['Контакты','Грозный, ул. Муслима Гайрбекова, 68к2.<br>Каждый день с 9:00 до 20:00.<br><a href="tel:+79281233434">+7 (928) 123-34-34</a><br><a href="https://wa.me/79281233434" target="_blank" rel="noopener">Написать в WhatsApp ↗</a>']
};
document.addEventListener('click',e=>{
 const cat=e.target.closest('[data-category]'),add=e.target.closest('[data-change]'),fav=e.target.closest('[data-fav]'),product=e.target.closest('[data-product]'),i=e.target.closest('[data-info]');
 if(cat){category=cat.dataset.category;closeDrawer();render();window.scrollTo({top:0,behavior:'smooth'})}
 if(add){
  const id=+add.dataset.change;cart[id]=Math.min(99,Math.max(0,(cart[id]||0)+Number(add.dataset.step)));
  if(!cart[id])delete cart[id];save('merzhum-cart',cart);
  const slot=document.querySelector('[data-quantity="'+id+'"]');
  if(slot){const cardPrice=slot.closest('.card-bottom').querySelector('.price');if(cardPrice&&products.find(p=>p.id===id))cardPrice.outerHTML=price(products.find(p=>p.id===id),cart[id]||1);const counter=slot.querySelector('.quantity span');if(counter&&cart[id])counter.textContent=cart[id];else{const focused=slot.contains(document.activeElement);slot.innerHTML=qty(products.find(p=>p.id===id));if(focused)slot.querySelector('[data-step="1"]').focus({preventScroll:true})}}
  renderCart();
  if(add.dataset.step==='1'&&add.closest('.product-detail'))$('#modal').close();
  if(add.dataset.step==='1'){const t=$('#toast');t.textContent='Добавлено в корзину';t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),1500)}
 }
 if(fav){const id=+fav.dataset.fav;favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];save('merzhum-favorites',favorites);if(category==='Избранное')render();else{fav.setAttribute('aria-pressed',favorites.includes(id));fav.setAttribute('aria-label',favorites.includes(id)?'Убрать из избранного':'В избранное');fav.innerHTML=icon(favorites.includes(id)?'heart-fill':'heart')}}
 if(product){e.preventDefault();detail(+product.dataset.product)}
 if(i){const [title,body]=info[i.dataset.info];show('<div class="info"><h1>'+title+'</h1><p>'+body+'</p></div>')}
 if(e.target.closest('#checkout'))checkout();
 if(e.target.closest('.modal-close'))$('#modal').close();
 if(e.target.closest('#menu-toggle'))openDrawer('#category-panel',$('#menu-toggle'));
 if(e.target.closest('#mobile-cart'))openDrawer('#cart',$('#mobile-cart'));
 if(e.target.closest('[data-close-drawer]'))closeDrawer();
});
$('#modal').addEventListener('click',e=>{
 if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#modal').close()}
});
$('#search').addEventListener('input',render);$('#sort').addEventListener('change',render);
function syncTheme(){
 const dark=document.body.classList.contains('dark');
 $('#theme').innerHTML=icon(dark?'moon-fill':'sun-fill');
 $('#theme').setAttribute('aria-pressed',dark);
 $('meta[name="theme-color"]').content=dark?'#1A1612':'#FFFCF5';
}
$('#theme').onclick=()=>{document.body.classList.toggle('dark');try{localStorage.setItem('merzhum-theme',document.body.classList.contains('dark')?'dark':'light')}catch{}syncTheme()};
syncTheme();
document.addEventListener('change',e=>{
 if(e.target.name==='date')e.target.setCustomValidity('');
 if(e.target.id==='delivery'){$('#address-label').hidden=e.target.value!=='Доставка';$('#address-label input').required=e.target.value==='Доставка'}
});
document.addEventListener('submit',e=>{
 if(e.target.id!=='order-form')return;e.preventDefault();
 const d=new FormData(e.target);
 if(d.get('date')<localToday()){e.target.elements.date.setCustomValidity('Выберите сегодняшнюю или будущую дату');e.target.elements.date.reportValidity();return}
 e.target.elements.date.setCustomValidity('');
 const lines=products.filter(p=>cart[p.id]>0).map(p=>p.name+' × '+cart[p.id]+' — '+(p.price===null?'цена по запросу':money(p.price*cart[p.id])));
 const text='Здравствуйте! Хочу уточнить заказ Merzhum:\n'+lines.join('\n')+'\n\nИмя: '+d.get('name')+'\nТелефон: '+d.get('phone')+'\nПолучение: '+d.get('delivery')+'\n'+(d.get('delivery')==='Доставка'?'Адрес: '+d.get('address')+'\n':'')+'Дата: '+d.get('date')+'\nВремя: '+d.get('time')+'\nКомментарий: '+(d.get('comment')||'—');
 window.open('https://wa.me/79281233434?text='+encodeURIComponent(text),'_blank','noopener');
});
fetch('products.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{
 products=data.map(p=>({...p,category:categoryFor(p.id)}));
 const names={1:'Ягодный ирис',4:'Подарочный бокс · классика',7:'Подарочный бокс · шоколад',9:'Корпусной десерт на выбор',14:'Подарочный бокс · тарты',15:'Торт «Ягодный ирис»',20:'Набор корпусных десертов',21:'Подарочный бокс · фрукты',22:'Торт «Французский тирамису»'};
 products.forEach(p=>{if(names[p.id])p.name=names[p.id]});
 cart=Object.fromEntries(Object.entries(cart).filter(([id,n])=>products.some(p=>p.id===+id)&&Number.isInteger(n)&&n>0&&n<=99));
 render();
}).catch(()=>{$('#products').innerHTML='<p class="no-results">Не удалось загрузить каталог. Обновите страницу или напишите нам в WhatsApp.</p>'});

