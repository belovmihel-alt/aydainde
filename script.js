// ==========================================
// ИСПРАВЛЕННАЯ ВЕРСИЯ - Все проблемы решены
// ==========================================

// Глобальные переменные
let tg = null;
let appData = {
    words: [],
    places: [],
    recipes: [],
    dishes: []
};
let currentPage = 'welcome';
let currentEdaCategory = null;

// ==========================================
// 1. ПРАВИЛЬНАЯ ИНИЦИАЛИЗАЦИЯ TELEGRAM
// ==========================================
function initTelegramWebApp() {
    return new Promise((resolve) => {
        // Проверяем каждые 50ms, загрузился ли Telegram
        const checkTelegram = setInterval(() => {
            if (window.Telegram && window.Telegram.WebApp) {
                clearInterval(checkTelegram);
                tg = window.Telegram.WebApp;
                
                try {
                    tg.ready();
                    tg.expand();
                    tg.enableClosingConfirmation();
                    console.log('✅ Telegram WebApp initialized');
                } catch (e) {
                    console.log('⚠️ Telegram methods not available:', e);
                }
                
                resolve(true);
            }
        }, 50);
        
        // Таймаут: если за 3 секунды не загрузился - всё равно продолжаем
        setTimeout(() => {
            clearInterval(checkTelegram);
            console.log('⚠️ Telegram WebApp not found, continuing anyway');
            resolve(false);
        }, 3000);
    });
}

// ==========================================
// 2. ЗАГРУЗКА ДАННЫХ
// ==========================================
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (response.ok) {
            appData = await response.json();
            console.log('✅ Data loaded from data.json');
        } else {
            throw new Error('Failed to load data.json');
        }
    } catch (error) {
        console.log('⚠️ Using test data:', error.message);
        loadTestData();
    }
    renderWordCards();
}

// Тестовые данные
function loadTestData() {
    appData = {
        words: [
            {
                id: 1,
                word: "Абау",
                meaning: "Вау",
                images: ["images/abau.jpg"],
                explanation: "Так в Казани говорят 'ВАУ!' когда удивляются или восхищаются чем-то. Например: 'Абау, какая машина!'"
            },
            {
                id: 2,
                word: "Сковородка",
                meaning: "Место перед КФУ",
                images: ["images/skovorodka.jpg"],
                explanation: "Круглая площадь перед главным корпусом Казанского федерального университета. Место встречи всех студентов. Названа так из-за круглой формы."
            },
            {
                id: 3,
                word: "Алга",
                meaning: "Вперёд / Давай",
                images: ["images/alga.jpg"],
                explanation: "Универсальное слово-мотиватор. Используется когда нужно подбодрить: 'Алга, всё получится!' или 'Алга, пошли!'"
            },
            {
                id: 4,
                word: "Шәп",
                meaning: "Класс / Отлично",
                images: ["images/shap.jpg"],
                explanation: "Когда что-то очень нравится или всё хорошо. 'Как дела? - Шәп!' Аналог русского 'класс' или 'супер'."
            },
            {
                id: 5,
                word: "Батащ",
                meaning: "Отец / Батя",
                images: ["images/batash.jpg"],
                explanation: "Обращение к отцу или старшему мужчине. Также используется в дружеской форме между молодыми людьми."
            },
            {
                id: 6,
                word: "Җола",
                meaning: "Пойдём",
                images: ["images/jola.jpg"],
                explanation: "Приглашение куда-то пойти. 'Җола в кино!' или 'Җола покурим'. Очень популярное слово среди молодёжи."
            }
        ],
        places: [
            {
                id: 1,
                title: "Дом Татарской Кулинарии",
                description: "Лучшие традиционные татарские блюда в центре Казани",
                images: ["images/dtk.jpg"],
                address: "ул. Баумана, 31",
                features: ["Аутентичная кухня", "Красивый интерьер", "Умеренные цены"]
            },
            {
                id: 2,
                title: "Кафе Чак-чак",
                description: "Уютное место с домашней татарской едой",
                images: ["images/chakchak-cafe.jpg"],
                address: "ул. Петербургская, 9",
                features: ["Домашняя кухня", "Быстрое обслуживание", "Большие порции"]
            }
        ],
        recipes: [
            {
                id: 1,
                title: "Эчпочмак",
                description: "Классический татарский треугольник с мясом и картошкой",
                images: ["images/echpochmak.jpg"],
                ingredients: ["Мука - 500г", "Говядина - 300г", "Картофель - 3 шт", "Лук - 2 шт", "Масло - 100г"],
                steps: [
                    "Замесить тесто из муки, воды и масла",
                    "Нарезать мясо, картофель и лук мелкими кубиками",
                    "Раскатать тесто, вырезать круги",
                    "Выложить начинку, сформировать треугольники",
                    "Выпекать 40 минут при 180°C"
                ]
            }
        ],
        dishes: [
            {
                id: 1,
                title: "Бәлеш",
                description: "Круглый пирог с мясом, визитная карточка татарской кухни",
                images: ["images/balesh.jpg"],
                info: "Готовится из дрожжевого теста с начинкой из мяса (обычно утка или курица) и картофеля. Отличается от эчпочмака круглой формой и размером."
            },
            {
                id: 2,
                title: "Чак-чак",
                description: "Сладкий десерт из теста с медом",
                images: ["images/chakchak.jpg"],
                info: "Национальный татарский десерт. Готовится из небольших кусочков теста, обжаренных в масле и политых медовым сиропом. Подается на праздники."
            }
        ]
    };
}

// ==========================================
// 3. ОТРИСОВКА КАРТОЧЕК
// ==========================================
function renderWordCards() {
    const container = document.getElementById('wordCards');
    if (!container) return;
    
    container.innerHTML = '';
    
    appData.words.forEach(word => {
        const card = document.createElement('div');
        card.className = 'word-card';
        card.onclick = () => showWordDetail(word.id);
        
        card.innerHTML = `
            <button class="card-menu-btn" onclick="event.stopPropagation();">⋯</button>
            <img src="${word.images[0]}" alt="${word.word}" class="word-card-image" 
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22120%22%3E%3Crect fill=%22%233a3a3a%22 width=%22200%22 height=%22120%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 fill=%22%23666%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${word.word}%3C/text%3E%3C/svg%3E'">
            <div class="word-card-content">
                <div class="word-card-title">${word.word}</div>
                <div class="word-card-subtitle">${word.meaning}</div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ==========================================
// 4. ДЕТАЛЬНАЯ СТРАНИЦА СЛОВА
// ==========================================
function showWordDetail(wordId) {
    const word = appData.words.find(w => w.id === wordId);
    if (!word) return;
    
    document.getElementById('slovarikPage').classList.remove('active');
    document.getElementById('wordDetailPage').classList.add('active');
    
    // Слайдер изображений
    const sliderContainer = document.getElementById('wordSlider');
    const sliderImages = word.images.map(img => 
        `<img src="${img}" alt="${word.word}" class="slider-image" 
              onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%25%22 height=%22250%22%3E%3Crect fill=%22%232d2d2d%22 width=%22100%25%22 height=%22250%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 fill=%22%23666%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${word.word}%3C/text%3E%3C/svg%3E'">`
    ).join('');
    
    sliderContainer.innerHTML = `
        <div class="slider-images">${sliderImages}</div>
        ${word.images.length > 1 ? '<div class="slider-dots">' + word.images.map((_, i) => 
            `<div class="slider-dot ${i === 0 ? 'active' : ''}"></div>`
        ).join('') + '</div>' : ''}
    `;
    
    // Контент
    document.getElementById('detailWord').textContent = word.word;
    document.getElementById('detailMeaning').textContent = word.meaning;
    document.getElementById('detailExplanation').innerHTML = `<p>${word.explanation}</p>`;
    
    window.scrollTo(0, 0);
}

function goBack() {
    document.getElementById('wordDetailPage').classList.remove('active');
    document.getElementById('slovarikPage').classList.add('active');
}

// ==========================================
// 5. РАЗДЕЛ ЕДА
// ==========================================
function showEdaCategory(category) {
    currentEdaCategory = category;
    const container = document.getElementById('edaContent');
    container.innerHTML = '';
    
    let items = [];
    if (category === 'places') items = appData.places;
    else if (category === 'recipes') items = appData.recipes;
    else if (category === 'dishes') items = appData.dishes;
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'eda-card';
        card.onclick = () => showEdaDetail(item.id, category);
        
        card.innerHTML = `
            <img src="${item.images[0]}" alt="${item.title}" class="eda-card-image"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%25%22 height=%22150%22%3E%3Crect fill=%22%233a3a3a%22 width=%22100%25%22 height=%22150%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 fill=%22%23666%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${item.title}%3C/text%3E%3C/svg%3E'">
            <div class="eda-card-content">
                <div class="eda-card-title">${item.title}</div>
                <div class="eda-card-description">${item.description}</div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function showEdaDetail(itemId, category) {
    let item;
    if (category === 'places') item = appData.places.find(p => p.id === itemId);
    else if (category === 'recipes') item = appData.recipes.find(r => r.id === itemId);
    else if (category === 'dishes') item = appData.dishes.find(d => d.id === itemId);
    
    if (!item) return;
    
    document.getElementById('edaPage').classList.remove('active');
    document.getElementById('edaDetailPage').classList.add('active');
    
    const sliderContainer = document.getElementById('edaSlider');
    const sliderImages = item.images.map(img => 
        `<img src="${img}" alt="${item.title}" class="slider-image"
              onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%25%22 height=%22250%22%3E%3Crect fill=%22%232d2d2d%22 width=%22100%25%22 height=%22250%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 fill=%22%23666%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${item.title}%3C/text%3E%3C/svg%3E'">`
    ).join('');
    
    sliderContainer.innerHTML = `<div class="slider-images">${sliderImages}</div>`;
    
    document.getElementById('edaDetailTitle').textContent = item.title;
    document.getElementById('edaDetailDescription').textContent = item.description;
    
    let extraHTML = '';
    if (category === 'places' && item.features) {
        extraHTML = '<h3>Особенности:</h3><ul>' + 
            item.features.map(f => `<li>${f}</li>`).join('') + 
            '</ul>';
        if (item.address) {
            extraHTML += `<h3>Адрес:</h3><p>${item.address}</p>`;
        }
    } else if (category === 'recipes') {
        if (item.ingredients) {
            extraHTML += '<h3>Ингредиенты:</h3><ul>' + 
                item.ingredients.map(i => `<li>${i}</li>`).join('') + 
                '</ul>';
        }
        if (item.steps) {
            extraHTML += '<h3>Приготовление:</h3><ul>' + 
                item.steps.map((s, i) => `<li>${i + 1}. ${s}</li>`).join('') + 
                '</ul>';
        }
    } else if (category === 'dishes' && item.info) {
        extraHTML = `<p>${item.info}</p>`;
    }
    
    document.getElementById('edaDetailExtra').innerHTML = extraHTML;
    window.scrollTo(0, 0);
}

function goBackToEda() {
    document.getElementById('edaDetailPage').classList.remove('active');
    document.getElementById('edaPage').classList.add('active');
}

// ==========================================
// 6. ПОИСК
// ==========================================
function searchWords() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = appData.words.filter(word => 
        word.word.toLowerCase().includes(query) || 
        word.meaning.toLowerCase().includes(query)
    );
    
    const container = document.getElementById('wordCards');
    container.innerHTML = '';
    
    filtered.forEach(word => {
        const card = document.createElement('div');
        card.className = 'word-card';
        card.onclick = () => showWordDetail(word.id);
        
        card.innerHTML = `
            <button class="card-menu-btn" onclick="event.stopPropagation();">⋯</button>
            <img src="${word.images[0]}" alt="${word.word}" class="word-card-image"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22120%22%3E%3Crect fill=%22%233a3a3a%22 width=%22200%22 height=%22120%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 fill=%22%23666%22 text-anchor=%22middle%22 dy=%22.3em%22%3E${word.word}%3C/text%3E%3C/svg%3E'">
            <div class="word-card-content">
                <div class="word-card-title">${word.word}</div>
                <div class="word-card-subtitle">${word.meaning}</div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ==========================================
// 7. НАВИГАЦИЯ (SIDEBAR + ГЛАВНАЯ)
// ==========================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

function openMainMenu() {
    toggleSidebar();
}

function navigateTo(section) {
    toggleSidebar();
    
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    const headerTitle = document.querySelector('.header-title h1');
    const headerSubtitle = document.querySelector('.header-subtitle');
    const searchBar = document.getElementById('searchBar');
    
    switch(section) {
        case 'slovarik':
            headerTitle.textContent = 'Словарик';
            headerSubtitle.textContent = 'Так говорят в Казани!';
            searchBar.style.display = 'block';
            document.getElementById('slovarikPage').classList.add('active');
            break;
        case 'places':
            headerTitle.textContent = 'Куда сходить';
            headerSubtitle.textContent = 'Красивые места для прогулок';
            searchBar.style.display = 'none';
            document.getElementById('placesPage').classList.add('active');
            break;
        case 'museums':
            headerTitle.textContent = 'Музеи Казани';
            headerSubtitle.textContent = 'Культурное просвещение';
            searchBar.style.display = 'none';
            document.getElementById('museumsPage').classList.add('active');
            break;
        case 'eda':
            headerTitle.textContent = 'Еда';
            headerSubtitle.textContent = 'Где и что поесть';
            searchBar.style.display = 'none';
            document.getElementById('edaPage').classList.add('active');
            currentEdaCategory = null;
            document.getElementById('edaContent').innerHTML = '';
            break;
        case 'legends':
            headerTitle.textContent = 'Легенды и сказки';
            headerSubtitle.textContent = 'Погружаемся в мифы Татарстана';
            searchBar.style.display = 'none';
            document.getElementById('legendsPage').classList.add('active');
            break;
    }
    
    window.scrollTo(0, 0);
}

function showAddWord() {
    alert('Функция добавления слов в разработке');
}

// ==========================================
// 8. ГЛАВНАЯ ИНИЦИАЛИЗАЦИЯ
// ==========================================
async function initApp() {
    console.log('🚀 Initializing app...');
    
    // 1. Ждём загрузку Telegram
    await initTelegramWebApp();
    
    // 2. Загружаем данные
    await loadData();
    
    console.log('✅ App ready!');
}

// Запуск когда DOM готов
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM уже загружен
    initApp();
}
