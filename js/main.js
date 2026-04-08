/**
 * CleanPro - Основной JavaScript файл
 * Функционал:
 * 1. Маска телефона (+7 формат)
 * 2. Валидация форм
 * 3. Отправка заявок в Telegram
 * 4. Модальное окно
 * 5. Мобильное меню
 */

'use strict';

// ==================== КОНФИГУРАЦИЯ TELEGRAM ====================
// ⚠️ ВНИМАНИЕ: Для продакшена используйте серверную часть (PHP/Node.js)
// чтобы скрыть BOT_TOKEN. Для тестирования можно использовать напрямую.

const TELEGRAM_CONFIG = {
  // ⚠️ ВСТАВИТЬ СЮДА ВАШ BOT_TOKEN (получить у @BotFather)
  BOT_TOKEN: 'YOUR_BOT_TOKEN_HERE',
  
  // ⚠️ ВСТАВИТЬ СЮДА ВАШ CHAT_ID (получить у @userinfobot)
  CHAT_ID: 'YOUR_CHAT_ID_HERE',
  
  // API URL Telegram
  API_URL: 'https://api.telegram.org/bot'
};

// ==================== МАСКА ТЕЛЕФОНА ====================

/**
 * Класс для маски телефона в формате +7 (___) ___-__-__
 */
class PhoneMask {
  constructor(input) {
    this.input = input;
    this.init();
  }

  init() {
    this.input.addEventListener('input', (e) => this.handleInput(e));
    this.input.addEventListener('focus', (e) => this.handleFocus(e));
    this.input.addEventListener('blur', (e) => this.handleBlur(e));
    this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  handleFocus(e) {
    if (!e.target.value) {
      e.target.value = '+7 ';
    }
  }

  handleBlur(e) {
    if (e.target.value === '+7 ') {
      e.target.value = '';
    }
  }

  handleKeyDown(e) {
    // Разрешаем: Backspace, Delete, Tab, Escape, Enter, стрелки, Ctrl+A/Cmd+A
    if (
      e.key === 'Backspace' ||
      e.key === 'Delete' ||
      e.key === 'Tab' ||
      e.key === 'Escape' ||
      e.key === 'Enter' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      (e.key === 'a' && (e.ctrlKey || e.metaKey))
    ) {
      return;
    }
    
    // Блокируем ввод, если не цифра
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  }

  handleInput(e) {
    let input = e.target;
    let matrix = '+7 (___) ___-__-__';
    let defaultValue = '+7 ';
    let value = input.value.replace(/\D/g, '');
    let filledValue = '';
    
    // Если поле пустое при фокусе
    if (!value) {
      input.value = defaultValue;
      return;
    }
    
    // Если начинается с 8, заменяем на 7
    if (value[0] === '8') {
      value = '7' + value.slice(1);
    }
    
    // Если начинается с 7, продолжаем
    if (value[0] !== '7') {
      value = '7' + value;
    }
    
    // Заполняем маску
    let i = 0;
    let valueIndex = 0;
    
    while (valueIndex < value.length && i < matrix.length) {
      if (matrix[i] === '_') {
        if (valueIndex < value.length) {
          filledValue += value[valueIndex];
          valueIndex++;
        }
      } else {
        filledValue += matrix[i];
        if (valueIndex < value.length && value[valueIndex] === matrix[i]) {
          valueIndex++;
        }
      }
      i++;
    }
    
    input.value = filledValue;
    
    // Если пользователь стёр всё, оставляем только +7
    if (value.length === 1) {
      input.value = defaultValue;
    }
  }

  /**
   * Получает чистый номер телефона
   * @returns {string} Чистый номер
   */
  getCleanNumber() {
    return this.input.value.replace(/\D/g, '');
  }

  /**
   * Проверяет валидность номера
   * @returns {boolean}
   */
  isValid() {
    const clean = this.getCleanNumber();
    return clean.length === 11 && clean[0] === '7';
  }
}

// ==================== ВАЛИДАЦИЯ ФОРМ ====================

/**
 * Класс для валидации форм
 */
class FormValidator {
  constructor(form) {
    this.form = form;
    this.errors = {};
  }

  /**
   * Валидация имени
   * @param {string} name 
   * @returns {boolean}
   */
  validateName(name) {
    return name.trim().length >= 2;
  }

  /**
   * Валидация телефона
   * @param {string} phone 
   * @returns {boolean}
   */
  validatePhone(phone) {
    const clean = phone.replace(/\D/g, '');
    return clean.length === 11 && clean[0] === '7';
  }

  /**
   * Валидация email (если понадобится)
   * @param {string} email 
   * @returns {boolean}
   */
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Показать ошибку
   * @param {string} fieldId 
   * @param {string} message 
   */
  showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
      errorElement.textContent = message;
    }
    
    if (inputElement) {
      inputElement.classList.add('error');
    }
    
    this.errors[fieldId] = message;
  }

  /**
   * Скрыть ошибку
   * @param {string} fieldId 
   */
  hideError(fieldId) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
      errorElement.textContent = '';
    }
    
    if (inputElement) {
      inputElement.classList.remove('error');
    }
    
    delete this.errors[fieldId];
  }

  /**
   * Скрыть все ошибки
   */
  hideAllErrors() {
    Object.keys(this.errors).forEach(fieldId => {
      this.hideError(fieldId);
    });
  }

  /**
   * Есть ли ошибки
   * @returns {boolean}
   */
  hasErrors() {
    return Object.keys(this.errors).length > 0;
  }

  /**
   * Валидация всей формы
   * @param {Object} data 
   * @returns {boolean}
   */
  validate(data) {
    this.hideAllErrors();
    let isValid = true;

    // Валидация имени
    if (data.name && !this.validateName(data.name)) {
      this.showError(data.nameId || 'name', 'Введите имя (минимум 2 символа)');
      isValid = false;
    }

    // Валидация телефона
    if (data.phone && !this.validatePhone(data.phone)) {
      this.showError(data.phoneId || 'phone', 'Введите корректный номер телефона');
      isValid = false;
    }

    // Валидация типа уборки
    if (data.service && !data.service) {
      this.showError(data.serviceId || 'service', 'Выберите тип уборки');
      isValid = false;
    }

    // Валидация согласия на обработку данных
    if (data.privacy !== undefined && !data.privacy) {
      this.showError(data.privacyId || 'privacy', 'Необходимо согласие на обработку данных');
      isValid = false;
    }

    return isValid;
  }
}

// ==================== ОТПРАВКА В TELEGRAM ====================

/**
 * Отправка сообщения в Telegram бота
 * @param {Object} formData - данные формы
 * @returns {Promise}
 */
async function sendToTelegram(formData) {
  // ⚠️ ВАЖНО: Для продакшена используйте серверную часть!
  // Хранить BOT_TOKEN в клиентском JS небезопасно.
  
  const { BOT_TOKEN, CHAT_ID, API_URL } = TELEGRAM_CONFIG;

  // Проверка конфигурации
  if (BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || CHAT_ID === 'YOUR_CHAT_ID_HERE') {
    console.warn('⚠️ Telegram не настроен. Вывод данных в консоль:');
    console.log(formData);
    
    // Для демонстрации возвращаем успешный ответ
    return { ok: true, message: 'Данные выведены в консоль (Telegram не настроен)' };
  }

  // Формируем сообщение
  const message = `
🧹 <b>Новая заявка CleanPro</b>

👤 <b>Имя:</b> ${formData.name}
📞 <b>Телефон:</b> ${formData.phone}
🏠 <b>Тип уборки:</b> ${formData.service}
📐 <b>Площадь:</b> ${formData.area ? formData.area + ' м²' : 'не указана'}
💬 <b>Комментарий:</b> ${formData.comment || 'нет'}
🕐 <b>Время заявки:</b> ${formData.timestamp}
  `.trim();

  // URL для отправки
  const url = `${API_URL}${BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      throw new Error(`Ошибка Telegram: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.ok) {
      return { ok: true, message: 'Заявка успешно отправлена!' };
    } else {
      throw new Error(data.description || 'Неизвестная ошибка');
    }
  } catch (error) {
    console.error('❌ Ошибка отправки в Telegram:', error);
    throw error;
  }
}

// ==================== МОДАЛЬНОЕ ОКНО ====================

/**
 * Класс для управления модальным окном
 */
class Modal {
  constructor(modalElement) {
    this.modal = modalElement;
    this.overlay = modalElement.querySelector('.modal__overlay');
    this.closeBtn = modalElement.querySelector('.modal__close');
    this.isOpen = false;
    
    this.init();
  }

  init() {
    // Закрытие по клику на overlay
    this.overlay.addEventListener('click', () => this.close());
    
    // Закрытие по кнопке
    this.closeBtn.addEventListener('click', () => this.close());
    
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Закрытие по клику вне контента
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });
  }

  open() {
    this.isOpen = true;
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Фокус на первый input
    const firstInput = this.modal.querySelector('input');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }

  close() {
    this.isOpen = false;
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// ==================== МОБИЛЬНОЕ МЕНЮ ====================

/**
 * Класс для мобильного меню
 */
class MobileMenu {
  constructor(burger, nav) {
    this.burger = burger;
    this.nav = nav;
    this.isOpen = false;
    
    this.init();
  }

  init() {
    this.burger.addEventListener('click', () => this.toggle());
    
    // Закрытие при клике на ссылку
    const links = this.nav.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isOpen) {
          this.close();
        }
      });
    });

    // Закрытие при клике вне меню
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.nav.contains(e.target) && !this.burger.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.burger.classList.add('active');
    this.burger.setAttribute('aria-expanded', 'true');
    this.nav.style.display = 'block';
    
    // Анимация появления
    setTimeout(() => {
      this.nav.style.opacity = '1';
      this.nav.style.transform = 'translateY(0)';
    }, 10);
  }

  close() {
    this.isOpen = false;
    this.burger.classList.remove('active');
    this.burger.setAttribute('aria-expanded', 'false');
    this.nav.style.opacity = '0';
    this.nav.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      this.nav.style.display = 'none';
    }, 300);
  }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

/**
 * Инициализация всех компонентов после загрузки DOM
 */
document.addEventListener('DOMContentLoaded', () => {
  
  // ---- Мобильное меню ----
  const burger = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  
  if (burger && nav) {
    // Устанавливаем начальные стили для анимации
    nav.style.display = 'none';
    nav.style.opacity = '0';
    nav.style.transform = 'translateY(-10px)';
    nav.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    new MobileMenu(burger, nav);
  }

  // ---- Модальное окно ----
  const modalElement = document.getElementById('callbackModal');
  const callbackBtn = document.getElementById('callbackBtn');
  let modal;
  
  if (modalElement) {
    modal = new Modal(modalElement);
    
    // Открытие модалки по кнопке "Заказать звонок"
    if (callbackBtn) {
      callbackBtn.addEventListener('click', () => {
        modal.open();
      });
    }
  }

  // ---- Маска телефона для основной формы ----
  const phoneInput = document.getElementById('phone');
  let phoneMask;
  
  if (phoneInput) {
    phoneMask = new PhoneMask(phoneInput);
  }

  // ---- Маска телефона для модальной формы ----
  const callbackPhoneInput = document.getElementById('callbackPhone');
  let callbackPhoneMask;
  
  if (callbackPhoneInput) {
    callbackPhoneMask = new PhoneMask(callbackPhoneInput);
  }

  // ---- Валидация и отправка основной формы ----
  const leadForm = document.getElementById('leadForm');
  
  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const validator = new FormValidator(leadForm);
      
      // Собираем данные
      const formData = {
        nameId: 'name',
        phoneId: 'phone',
        serviceId: 'service',
        privacyId: 'privacy',
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        service: document.getElementById('service').value,
        area: document.getElementById('area').value,
        comment: document.getElementById('comment').value,
        privacy: document.getElementById('privacy').checked,
        timestamp: new Date().toLocaleString('ru-RU')
      };

      // Валидация
      const isValid = validator.validate({
        name: formData.name,
        phone: formData.phone,
        service: formData.service,
        privacy: formData.privacy,
        nameId: formData.nameId,
        phoneId: formData.phoneId,
        serviceId: formData.serviceId,
        privacyId: formData.privacyId
      });

      if (!isValid) {
        // Показываем сообщение об ошибке
        showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
        return;
      }

      // Блокируем кнопку отправки
      const submitBtn = leadForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Отправка...';
      submitBtn.disabled = true;

      try {
        // Отправка в Telegram
        const result = await sendToTelegram(formData);
        
        if (result.ok) {
          showNotification('✅ Заявка успешно отправлена! Мы перезвоним в течение 15 минут.', 'success');
          leadForm.reset();
          
          // Закрываем модалку если она открыта
          if (modal && modal.isOpen) {
            modal.close();
          }
        }
      } catch (error) {
        console.error('Ошибка отправки:', error);
        showNotification(
          '❌ Ошибка отправки. Пожалуйста, позвоните нам: +7 (999) 000-00-00',
          'error'
        );
      } finally {
        // Разблокируем кнопку
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // ---- Валидация и отправка модальной формы ----
  const callbackForm = document.getElementById('callbackForm');
  
  if (callbackForm) {
    callbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const validator = new FormValidator(callbackForm);
      
      // Собираем данные
      const formData = {
        nameId: 'callbackName',
        phoneId: 'callbackPhone',
        name: document.getElementById('callbackName').value,
        phone: document.getElementById('callbackPhone').value,
        service: 'Заказ обратного звонка',
        area: '',
        comment: '',
        timestamp: new Date().toLocaleString('ru-RU')
      };

      // Валидация
      const isValid = validator.validate({
        name: formData.name,
        phone: formData.phone,
        nameId: formData.nameId,
        phoneId: formData.phoneId
      });

      if (!isValid) {
        showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
        return;
      }

      // Блокируем кнопку
      const submitBtn = callbackForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Отправка...';
      submitBtn.disabled = true;

      try {
        const result = await sendToTelegram(formData);
        
        if (result.ok) {
          showNotification('✅ Заявка отправлена! Мы перезвоним вам в ближайшее время.', 'success');
          callbackForm.reset();
          
          // Закрываем модалку
          if (modal && modal.isOpen) {
            modal.close();
          }
        }
      } catch (error) {
        console.error('Ошибка отправки:', error);
        showNotification(
          '❌ Ошибка отправки. Пожалуйста, позвоните нам: +7 (999) 000-00-00',
          'error'
        );
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // ---- Плавный скролл для якорных ссылок ----
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

});

// ==================== УВЕДОМЛЕНИЯ ====================

/**
 * Показать уведомление пользователю
 * @param {string} message - текст уведомления
 * @param {string} type - тип: 'success' или 'error'
 */
function showNotification(message, type = 'success') {
  // Создаём элемент уведомления
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.textContent = message;
  
  // Стили (если ещё не добавлены)
  if (!document.getElementById('notificationStyles')) {
    const style = document.createElement('style');
    style.id = 'notificationStyles';
    style.textContent = `
      .notification {
        position: fixed;
        top: 80px;
        right: 20px;
        max-width: 400px;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 2000;
        animation: slideIn 0.3s ease;
        font-size: 0.9375rem;
        line-height: 1.5;
      }
      
      .notification--success {
        background-color: #4CAF50;
        color: #FFFFFF;
      }
      
      .notification--error {
        background-color: #F44336;
        color: #FFFFFF;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @media (max-width: 768px) {
        .notification {
          top: auto;
          bottom: 20px;
          right: 16px;
          left: 16px;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Добавляем на страницу
  document.body.appendChild(notification);
  
  // Удаляем через 5 секунд
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

// ==================== КАЛЬКУЛЯТОР (БОНУС) ====================

/**
 * Простой калькулятор стоимости уборки
 * Можно вызвать из консоли: calculateCost(area, type)
 * 
 * @param {number} area - площадь в м²
 * @param {string} type - тип уборки
 * @returns {Object} - расчёт стоимости
 */
function calculateCost(area, type) {
  const prices = {
    'Поддерживающая уборка': { base: 2500, perMeter: 50 },
    'Генеральная уборка': { base: 5000, perMeter: 100 },
    'Уборка после ремонта': { base: 7000, perMeter: 150 },
    'Химчистка мебели': { base: 3000, perMeter: 80 }
  };

  if (!prices[type]) {
    console.error('❌ Неизвестный тип уборки. Доступные:', Object.keys(prices));
    return null;
  }

  const price = prices[type];
  const total = price.base + (price.perMeter * (area || 0));

  const result = {
    type: type,
    area: area || 0,
    basePrice: price.base,
    perMeter: price.perMeter,
    total: total
  };

  console.log('📊 Расчёт стоимости:');
  console.log(`Тип: ${result.type}`);
  console.log(`Площадь: ${result.area} м²`);
  console.log(`Базовая цена: ${result.basePrice} ₽`);
  console.log(`Цена за м²: ${result.perMeter} ₽`);
  console.log(`Итого: ${result.total} ₽`);

  return result;
}

// Делаем функцию доступной глобально
window.calculateCost = calculateCost;

// ==================== ЭКСПОРТ ДЛЯ ТЕСТИРОВАНИЯ ====================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PhoneMask, FormValidator, sendToTelegram, Modal, MobileMenu };
}
