// ==========================================
// ФИНАЛЬНАЯ ВЕРСИЯ - работает с твоим data.json
// ==========================================

let tg = null;
let appData = {
    words: [],
    restaurants: [],
    recipes: [],
    dishes: []
};

// ==========================================
// 1. ИНИЦИАЛИЗАЦИЯ TELEGRAM
// ==========================================
function initTelegramWebApp() {
    return new Promise((resolve) => {
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
        
        setTimeout(() => {
            clearInterval(checkTelegram);
            console.log('⚠️ Telegram WebApp not found');
            resolve(false);
        }, 3000);
    });
}

// ==========================================
// 2. ЗАГРУЗКА ДАННЫХ
// ==========================================
async function loadData() {
    console.log('📦 Loading data...');
    
    try {
        const response = await fetch('data.json');
        if (response.ok) {
            const data = await response.json();
            appData = data;
            console.log('✅ Data loaded:', appData);
        } else {
            throw new Error('data.json not found');
        }
    } catch (error) {
        console.error('❌ Failed to load data.json:', error);
        alert('Ошибка загрузки данных! Проверь что data.json в той же папке что и index.html');
    }
    
    if (!appData.words || appData.words.length === 0) {
        console.error('❌ No words in data!');
        alert('В data.json нет слов!');
    }
    
    renderWordCards();
}

// ==========================================
// 3. ОТРИСОВКА КАРТОЧЕК
// ==========================================
function renderWordCards() {
    console.log('🎨 Rendering cards...');
    
    const container = document.getElementById('wordCards');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!appData.words || appData.words.length === 0) {
        container.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">Нет данных</p>';
        return;
    }
    
    appData.words.forEach(word => {
        const card = document.createElement('div');
        card.className = 'word-card';
        card.onclick = () => showWordDetail(word.id);
        
        // Используем images[0] из data.json
        const imageUrl = word.images && word.images[0] ? word.images[0] : 'https://via.placeholder.com/400x400/3a3a3a/ffffff?text=' + encodeURIComponent(word.tatar);
        
        card.innerHTML = `
            <button class="card-menu-btn" onclick="event.stopPropagation();">⋯</button>
            <img src="${imageUrl}" alt="${word.tatar}" class="word-card-image">
            <div class="word-card-content">
                <div class="word-card-title">${word.tatar}</div>
                <div class="word-card-subtitle">${word.russian}</div>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    console.log('✅ Rendered', appData.words.length, 'cards');
}

// ==========================================
// 4. ДЕТАЛЬНАЯ СТРАНИЦА СЛОВА
// ==========================================
function showWordDetail(wordId) {
    const word = appData.words.find(w => w.id === wordId);
    if (!word) return;
    
    document.getElementById('slovarikPage').classList.remove('active');
    document.getElementById('wordDetailPage').classList.add('active');
    
    // Слайдер
    const sliderContainer = document.getElementById('wordSlider');
    const images = word.images || ['https://via.placeholder.com/400x250/3a3a3a/ffffff?text=' + encodeURIComponent(word.tatar)];
    
    const sliderImages = images.map(img => 
        `<img src="${img}" alt="${word.tatar}" class="slider-image">`
    ).join('');
    
    sliderContainer.innerHTML = `
        <div class="slider-images">${sliderImages}</div>
        ${images.length > 1 ? '<div class="slider-dots">' + images.map((_, i) => 
            `<div class="slider-dot ${i === 0 ? 'active' : ''}"></div>`
        ).join('') + '</div>' : ''}
    `;
    
    // Контент
    document.getElementById('detailWord').textContent = word.tatar;
    document.getElementById('detailMeaning').textContent = word.russian;
    
    let explanationHTML = `<p>${word.explanation}</p>`;
    if (word.examples && word.examples.length > 0) {
        explanationHTML += '<h3 style="color: #FF6B35; margin-top: 20px;">Примеры:</h3><ul>';
        word.examples.forEach(example => {
            explanationHTML += `<li>${example}</li>`;
        });
        explanationHTML += '</ul>';
    }
    
    document.getElementById('detailExplanation').innerHTML = explanationHTML;
    
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
    const container = document.getElementById('edaContent');
    container.innerHTML = '';
    
    let items = [];
    if (category === 'places') items = appData.restaurants || [];
    else if (category === 'recipes') items = appData.recipes || [];
    else if (category === 'dishes') items = appData.dishes || [];
    
    if (items.length === 0) {
        container.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">Пока нет данных в этой категории</p>';
        return;
    }
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'eda-card';
        card.onclick = () => showEdaDetail(item.id, category);
        
        const imageUrl = 'https://via.placeholder.com/400x150/3a3a3a/ffffff?text=' + encodeURIComponent(item.name);
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${item.name}" class="eda-card-image">
            <div class="eda-card-content">
                <div class="eda-card-title">${item.name}</div>
                <div class="eda-card-description">${item.description}</div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function showEdaDetail(itemId, category) {
    let item;
    if (category === 'places') item = appData.restaurants.find(r => r.id === itemId);
    else if (category === 'recipes') item = appData.recipes.find(r => r.id === itemId);
    else if (category === 'dishes') item = appData.dishes.find(d => d.id === itemId);
    
    if (!item) return;
    
    document.getElementById('edaPage').classList.remove('active');
    document.getElementById('edaDetailPage').classList.add('active');
    
    const imageUrl = 'https://via.placeholder.com/400x250/3a3a3a/ffffff?text=' + encodeURIComponent(item.name);
    document.getElementById('edaSlider').innerHTML = `<div class="slider-images"><img src="${imageUrl}" class="slider-image"></div>`;
    
    document.getElementById('edaDetailTitle').textContent = item.name;
    document.getElementById('edaDetailDescription').textContent = item.description;
    
    let extraHTML = '';
    
    if (category === 'places') {
        if (item.address) extraHTML += `<h3>Адрес:</h3><p>${item.address}</p>`;
        if (item.price) extraHTML += `<h3>Цены:</h3><p>${item.price}</p>`;
        if (item.recommendation) extraHTML += `<h3>Рекомендуем попробовать:</h3><p>${item.recommendation}</p>`;
    } else if (category === 'recipes') {
        if (item.difficulty) extraHTML += `<h3>Сложность:</h3><p>${item.difficulty}</p>`;
        if (item.ingredients) {
            extraHTML += '<h3>Ингредиенты:</h3><ul>';
            item.ingredients.forEach(ing => {
                extraHTML += `<li>${ing}</li>`;
            });
            extraHTML += '</ul>';
        }
        if (item.steps) {
            extraHTML += '<h3>Приготовление:</h3><ul>';
            item.steps.forEach((step, i) => {
                extraHTML += `<li>${i + 1}. ${step}</li>`;
            });
            extraHTML += '</ul>';
        }
    } else if (category === 'dishes') {
        if (item.ingredients) extraHTML += `<h3>Ингредиенты:</h3><p>${item.ingredients}</p>`;
        if (item.history) extraHTML += `<h3>История:</h3><p>${item.history}</p>`;
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
        word.tatar.toLowerCase().includes(query) || 
        word.russian.toLowerCase().includes(query) ||
        (word.explanation && word.explanation.toLowerCase().includes(query))
    );
    
    const container = document.getElementById('wordCards');
    container.innerHTML = '';
    
    if (filtered.length === 0) {
        container.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">Ничего не найдено</p>';
        return;
    }
    
    filtered.forEach(word => {
        const card = document.createElement('div');
        card.className = 'word-card';
        card.onclick = () => showWordDetail(word.id);
        
        const imageUrl = word.images && word.images[0] ? word.images[0] : 'https://via.placeholder.com/400x400/3a3a3a/ffffff?text=' + encodeURIComponent(word.tatar);
        
        card.innerHTML = `
            <button class="card-menu-btn" onclick="event.stopPropagation();">⋯</button>
            <img src="${imageUrl}" alt="${word.tatar}" class="word-card-image">
            <div class="word-card-content">
                <div class="word-card-title">${word.tatar}</div>
                <div class="word-card-subtitle">${word.russian}</div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ==========================================
// 7. НАВИГАЦИЯ
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

// ==========================================
// 8. ИНИЦИАЛИЗАЦИЯ
// ==========================================
async function initApp() {
    console.log('🚀 Initializing app...');
    
    await initTelegramWebApp();
    await loadData();
    
    console.log('✅ App ready!');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
