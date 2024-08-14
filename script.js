const camel = document.getElementById('camel');

let clickCount = 0;
let animationFrame = 0;
let isRunning = false;
let isRunningFast = false;
let speedMultiplier = 1;
let animationInterval;

const walkFrames = 91;
const runFrames = 37;
const walkDuration = 1120; // 1.12 секунды
const runDuration = 500; // 0.5 секунды

// Форматирование номера кадра
function formatFrameNumber(frameNumber) {
    return frameNumber.toString().padStart(4, '0');
}

// Функция для плавного перехода
function transitionToFrameType(targetFrameType, duration, callback) {
    clearInterval(animationInterval);

    const frameCount = targetFrameType === 'walk' ? walkFrames : runFrames;
    const frameDuration = duration / frameCount;

    animationInterval = setInterval(() => {
        animationFrame = (animationFrame + 1) % frameCount;
        const formattedFrameNumber = formatFrameNumber(animationFrame);
        camel.style.backgroundImage = `url('textures/${targetFrameType}/camel_${targetFrameType}_${formattedFrameNumber}.png')`;

        if (animationFrame === frameCount - 1 && callback) {
            clearInterval(animationInterval);
            callback();
        }
    }, frameDuration);
}

// Обработчик кликов
document.addEventListener('click', (event) => {
    clickCount++;
    
    const clickCounter = document.createElement('div');
    clickCounter.className = 'click-counter';
    clickCounter.textContent = `+1`;
    document.body.appendChild(clickCounter);
    clickCounter.style.left = `${event.clientX - 10}px`; // Центрирование позиции
    clickCounter.style.top = `${event.clientY - 20}px`; // Центрирование позиции

    // Запуск анимации для счетчика кликов
    clickCounter.classList.add('animate');

    setTimeout(() => {
        clickCounter.remove();
    }, 1000); // Удалить счетчик через 1 сек

    if (!isRunning) {
        isRunning = true;
        transitionToFrameType('walk', walkDuration / speedMultiplier);
    }

    if (clickCount % 2 === 0 && speedMultiplier < 2 && !isRunningFast) { // Увеличение скорости каждые 2 клика до x2
        speedMultiplier += 0.2; // Более плавное увеличение скорости
        transitionToFrameType('walk', walkDuration / speedMultiplier);
    }

    if (speedMultiplier >= 2 && !isRunningFast) { // Переход на run анимацию после достижения максимальной скорости
        isRunningFast = true;
        transitionToFrameType('run', runDuration);
    }

    lastClickTime = Date.now();
});

// Замедление и остановка анимации при отсутствии кликов
let lastClickTime = 0;

function slowDownAnimation() {
    const now = Date.now();
    if (now - lastClickTime > 1000 && isRunningFast) { // Переход от run к ускоренной walk
        isRunningFast = false;
        transitionToFrameType('walk', walkDuration / speedMultiplier);
    }

    if (now - lastClickTime > 2000) { // Переход от ускоренной walk к стандартной walk и остановка
        if (speedMultiplier > 1) {
            speedMultiplier -= 0.2; // Более плавное уменьшение скорости
            transitionToFrameType('walk', walkDuration / speedMultiplier, () => {
                if (speedMultiplier <= 1) {
                    transitionToFrameType('walk', walkDuration, () => {
                        clearInterval(animationInterval);
                        isRunning = false;
                    });
                }
            });
        } else if (isRunning) {
            transitionToFrameType('walk', walkDuration, () => {
                clearInterval(animationInterval);
                isRunning = false;
            });
        }
    }
    requestAnimationFrame(slowDownAnimation);
}

slowDownAnimation();
