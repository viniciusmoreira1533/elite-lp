(function() {
  const WEBHOOK_URL = 'https://n8nwebhook.server2.wolframe.app/webhook/8c5838e9-f281-4d13-bec2-27c633e3f046';
  const WHATSAPP_NUMBER = '5511995499528';

  // ─── SCROLL REVEAL ───
  const revealElements = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        if (entry.target.classList.contains('stat-num')) {
          animateCounter(entry.target);
        }
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => revealObserver.observe(el));

  // ─── HEADER EFFECT ───
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ─── COUNTER ANIMATION ───
  function animateCounter(el) {
    if (el.dataset.animated) return;
    el.dataset.animated = "true";
    const target = parseFloat(el.innerText.replace(/[^0-9.]/g, ''));
    const isPercent = el.innerText.includes('%');
    const isPlus = el.innerText.includes('+');
    let current = 0;
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      current = progress * target;
      
      let displayValue = Math.floor(current);
      if (isPlus) displayValue = '+' + displayValue;
      if (isPercent) displayValue = displayValue + '%';
      
      el.innerText = displayValue;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.innerText = (isPlus ? '+' : '') + target + (isPercent ? '%' : '');
      }
    }
    requestAnimationFrame(update);
  }

  // ─── MODAL LOGIC ───
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTriggers = document.querySelectorAll('[data-modal-open]');
  const modalClose = document.getElementById('modalClose');

  modalTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // ─── FAQ ACCORDION ───
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-content').style.maxHeight = null;
      });
      if (!isActive) {
        item.classList.add('active');
        const content = item.querySelector('.faq-content');
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });

  // ─── FORM VALIDATION & SUBMISSION ───
  const form = document.getElementById('leadForm');
  const submitBtn = document.getElementById('submitBtn');
  const phoneInput = document.getElementById('leadPhone');

  const formatPhone = (val) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return '(' + digits.slice(0,2) + ') ' + digits.slice(2);
    return '(' + digits.slice(0,2) + ') ' + digits.slice(2,7) + '-' + digits.slice(7,11);
  };

  phoneInput.addEventListener('input', (e) => {
    e.target.value = formatPhone(e.target.value);
  });

  const validateForm = (data) => {
    const errors = {};
    if (data.nome.trim().split(/\s+/).length < 2) {
      errors.nomeGroup = true;
    }
    if (data.whatsapp.replace(/\D/g, '').length < 11) {
      errors.phoneGroup = true;
    }
    return errors;
  };

  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('leadName').value;
    const whatsapp = document.getElementById('leadPhone').value;
    
    document.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));
    
    const errors = validateForm({ nome, whatsapp });
    if (Object.keys(errors).length > 0) {
      Object.keys(errors).forEach(id => document.getElementById(id).classList.add('error'));
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = 'Processando...';

    const payload = {
      nome: nome,
      whatsapp: whatsapp,
      origem: 'LP Elite Redesign',
      timestamp: new Date().toISOString()
    };

    try {
      // Webhook (fire and forget)
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.error('Webhook error:', err));

      // WhatsApp Redirect
      const message = `Olá! Meu nome é ${nome.trim()} e quero um orçamento personalizado de proteção patrimonial para meu imóvel.`;
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      
      setTimeout(() => {
        window.location.href = waUrl;
      }, 500);

    } catch (err) {
      console.error('Critical error:', err);
      alert('Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.');
      submitBtn.disabled = false;
      submitBtn.innerText = 'Falar com um especialista';
    }
  });

})();
