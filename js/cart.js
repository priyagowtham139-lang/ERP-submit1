/* =========================================================
   COREVO — bag (cart) logic
   Stored in localStorage under 'corevo_cart'
   ========================================================= */
(function(){
  "use strict";
  var KEY = 'corevo_cart';

  function getCart(){ try{ return JSON.parse(localStorage.getItem(KEY) || '[]'); }catch(e){ return []; } }
  function saveCart(cart){ localStorage.setItem(KEY, JSON.stringify(cart)); if(window.refreshBagBadge) window.refreshBagBadge(); }
  function addToCart(product){
    var cart = getCart();
    var existing = cart.find(function(i){ return i.id === product.id; });
    if(existing){ existing.qty += 1; }
    else{ cart.push({ id:product.id, name:product.name, cat:product.cat, price:product.price, icon:product.icon, qty:1 }); }
    saveCart(cart);
  }
  function removeFromCart(id){ saveCart(getCart().filter(function(i){ return i.id !== id; })); }
  function setQty(id, qty){
    var cart = getCart();
    var item = cart.find(function(i){ return i.id === id; });
    if(item){ item.qty = Math.max(1, qty); }
    saveCart(cart);
  }

  var ICONS = {
    crm: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#16C79A"/><circle cx="24" cy="19" r="7" fill="#062E24"/><path d="M10 38c2-8 8-12 14-12s12 4 14 12" stroke="#062E24" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
    sales: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#D4A548"/><path d="M10 30 L18 20 L26 26 L38 12" stroke="#2B1E05" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 12h8v8" stroke="#2B1E05" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    inventory: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#0B0F14"/><rect x="12" y="14" width="24" height="10" rx="2" fill="none" stroke="#16C79A" stroke-width="2.5"/><rect x="12" y="26" width="24" height="10" rx="2" fill="none" stroke="#D4A548" stroke-width="2.5"/></svg>',
    accounting: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#1A2332"/><circle cx="24" cy="24" r="11" fill="none" stroke="#D4A548" stroke-width="2.5"/><path d="M24 18v12M20 21h6a2.5 2.5 0 0 1 0 5h-4a2.5 2.5 0 0 0 0 5h7" stroke="#D4A548" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
    hr: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#16C79A"/><circle cx="18" cy="18" r="5" fill="#062E24"/><circle cx="30" cy="18" r="5" fill="#062E24"/><path d="M9 36c1.5-6 5-9 9-9s7.5 3 9 9M21 36c1.5-6 5-9 9-9s7.5 3 9 9" stroke="#062E24" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
    project: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#D4A548"/><rect x="10" y="12" width="10" height="10" rx="2" fill="#2B1E05"/><rect x="24" y="12" width="14" height="4" rx="2" fill="#2B1E05"/><rect x="24" y="20" width="14" height="4" rx="2" fill="#2B1E05"/><rect x="10" y="28" width="28" height="4" rx="2" fill="#2B1E05"/></svg>',
    manufacturing: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#0B0F14"/><path d="M10 34V22l6 5v-5l6 5v-5l6 5V16h8v18Z" fill="none" stroke="#16C79A" stroke-width="2.5" stroke-linejoin="round"/></svg>',
    website: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#1A2332"/><rect x="10" y="12" width="28" height="24" rx="3" fill="none" stroke="#D4A548" stroke-width="2.5"/><line x1="10" y1="19" x2="38" y2="19" stroke="#D4A548" stroke-width="2"/></svg>',
    helpdesk: '<svg viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#16C79A"/><path d="M24 12a12 12 0 0 0-12 12v6a4 4 0 0 0 4 4h2V24h-4a10 10 0 0 1 20 0h-4v10h2a4 4 0 0 0 4-4v-6a12 12 0 0 0-12-12Z" fill="#062E24"/></svg>'
  };

  document.querySelectorAll('.add-bag-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var product = {
        id: btn.getAttribute('data-id'),
        name: btn.getAttribute('data-name'),
        cat: btn.getAttribute('data-cat'),
        price: parseFloat(btn.getAttribute('data-price')),
        icon: btn.getAttribute('data-icon') || 'crm'
      };
      addToCart(product);
      var original = btn.innerHTML;
      btn.classList.add('added');
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
      setTimeout(function(){ btn.classList.remove('added'); btn.innerHTML = original; }, 1400);
    });
  });

  var bagList = document.querySelector('[data-bag-list]');
  if(bagList){
    function render(){
      var cart = getCart();
      var summaryCount = document.querySelector('[data-summary-count]');
      var summarySubtotal = document.querySelector('[data-summary-subtotal]');
      var summaryTotal = document.querySelector('[data-summary-total]');
      var emptyState = document.querySelector('[data-bag-empty]');
      var bagLayout = document.querySelector('[data-bag-layout]');

      if(!cart.length){
        if(bagLayout) bagLayout.style.display = 'none';
        if(emptyState) emptyState.style.display = 'block';
        return;
      }
      if(bagLayout) bagLayout.style.display = 'grid';
      if(emptyState) emptyState.style.display = 'none';

      bagList.innerHTML = '';
      var subtotal = 0, count = 0;
      cart.forEach(function(item){
        subtotal += item.price * item.qty;
        count += item.qty;
        var row = document.createElement('div');
        row.className = 'bag-item reveal in-view';
        row.innerHTML =
          '<div class="app-icon-wrap">'+(ICONS[item.icon] || ICONS.crm)+'</div>' +
          '<div>' +
            '<div class="meta">'+item.cat+'</div>' +
            '<h3>'+item.name+'</h3>' +
            '<div class="qty-control">' +
              '<button type="button" data-dec aria-label="Decrease quantity">&minus;</button>' +
              '<span>'+item.qty+'</span>' +
              '<button type="button" data-inc aria-label="Increase quantity">+</button>' +
            '</div>' +
            '<a href="#" class="remove-link" data-remove><i class="fa-solid fa-trash-can"></i> Remove</a>' +
          '</div>' +
          '<div class="product-price">$'+(item.price*item.qty).toLocaleString('en-US')+'<small>/mo</small></div>';

        row.querySelector('[data-inc]').addEventListener('click', function(){ setQty(item.id, item.qty+1); render(); });
        row.querySelector('[data-dec]').addEventListener('click', function(){ setQty(item.id, item.qty-1); render(); });
        row.querySelector('[data-remove]').addEventListener('click', function(e){ e.preventDefault(); removeFromCart(item.id); render(); });
        bagList.appendChild(row);
      });

      var tax = subtotal * 0.08;
      var total = subtotal + tax;
      if(summaryCount) summaryCount.textContent = count;
      if(summarySubtotal) summarySubtotal.textContent = '$'+subtotal.toLocaleString('en-US')+'/mo';
      var taxEl = document.querySelector('[data-summary-tax]');
      if(taxEl) taxEl.textContent = '$'+tax.toLocaleString('en-US', {maximumFractionDigits:0})+'/mo';
      if(summaryTotal) summaryTotal.textContent = '$'+total.toLocaleString('en-US', {maximumFractionDigits:0})+'/mo';
    }
    render();

    var checkoutBtn = document.querySelector('[data-checkout]');
    checkoutBtn && checkoutBtn.addEventListener('click', function(){ window.location.href = '404.html'; });
  }
})();
