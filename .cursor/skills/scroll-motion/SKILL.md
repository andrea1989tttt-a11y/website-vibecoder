---
name: scroll-motion
description: Проектирует и реализует доступные scroll-анимации: reveal, SVG ribbon, marquee, горизонтальную галерею и narrative-секции без scroll-jacking.
---
# Scroll Motion: Storytelling without Scroll-jacking

## Сначала спецификация
Для каждого эффекта опиши: цель, desktop behavior, mobile behavior, reduced-motion fallback, вход/выход из сцены и способ проверки. Сначала согласуй 2–3 ключевых эффекта, не анимируй всё.

## Приоритет реализации
- Reveal: IntersectionObserver и CSS transform/opacity либо библиотека проекта. Если JS недоступен, контент видим.
- Hero ribbon: своя SVG-линия/фигура с прогрессом скролла; animating transform предпочтительнее layout reflow. Референсный бренд-символ не копировать.
- Marquee: ограниченная по длине строка, пауза на focus/hover, контент читаем при остановленной анимации.
- Horizontal portfolio (desktop): вертикальный скролл управляет translateX дорожки в рамках sticky/pinned секции. Диапазон движения рассчитать из фактической ширины track и viewport. Не блокировать колесо и touch; в конце возвращаться к обычной прокрутке.
- Horizontal portfolio (mobile): не pin! Используй обычный `overflow-x:auto` + `scroll-snap` + видимую подсказку «Листайте».
- Dark narrative: три смысловые секции появляются последовательно, но все тексты доступны в DOM и последовательном чтении.

## Guardrails
- `prefers-reduced-motion: reduce`: отключить marquee, pin/parallax и сложный scroll; оставить естественный документ и доступ к содержимому.
- Не навязывать scrollbar hijacking, не запускать непрерывную тяжелую работу в scroll handler; использовать requestAnimationFrame/observer где уместно.
- Библиотеки GSAP/ScrollTrigger/Framer Motion предлагать только после проверки стека и согласования добавления зависимостей. Если библиотека уже есть — её можно использовать.
- Поддерживать клавиатурную навигацию, видимый фокус, touch; никаких непроходимых pinned-участков.
- Не переносить чужие SVG, CSS, кадры или брендинг один-в-один.

## Проверка
Desktop 1440, tablet 768, mobile 390; обновление/быстрый скролл; возврат назад; уменьшение движения; отключение JS, если возможно; производительность, переполнение. Отчёт: эффект / проверено / риск / fallback.
