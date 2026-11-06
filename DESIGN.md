# DESIGN.md — дизайн-система PROKOSHA

> Утверждено для внедрения. Референс mkvision.studio — только принципы, без копирования графики, текстов и бренд-элементов.

## Направление
Editorial Motion / авторский digital-portfolio. Крупная типографика, асимметрия, крупная галерея проектов, светлые/тёмные секции, фирменная розово-фуксиевая палитра.

## Цвета
- `--color-brand`: #D72D90 (крупные акценты, кнопки, ribbon)
- `--color-brand-text`: #B01F72 (мелкий текст на светлом — WCAG AA)
- `--color-brand-soft`: #F7C6E3
- `--color-bg`: #FCFAFC
- `--color-ink`: #211521
- `--color-ink-soft`: #6B5A66
- `--color-surface`: #FFFFFF
- `--color-dark`: #211521
- `--color-on-dark`: #FFFFFF
- `--color-line`: rgba(33, 21, 33, 0.12)

## Типографика
- Sans: Onest → Arial, system-ui, sans-serif
- Display accent: Prata → Georgia, serif (кириллица есть; italic нет)
- Italic accent: Cormorant Garamond italic → Georgia, serif
- H1: `clamp(3.5rem, 8vw, 9rem)`; H2: `clamp(2.2rem, 5vw, 5.7rem)`; body: 1–1.125rem
- На 390px заголовки не выходят за viewport

## Композиция
- Max width 1440px; поля `clamp(20px, 4vw, 72px)`
- Hero → кейсы → narrative → … → FAQ → CTA
- Асимметрия адаптивная; порядок чтения в DOM сохранён

## Motion (согласовано)
1. Собственная фуксиевая SVG ribbon на hero (мягкая реакция на скролл)
2. Desktop: вертикальный скролл → горизонтальный translateX витрины без scroll-jacking; mobile: swipe + scroll-snap + «Листайте»
3. Тёмная narrative: «Сайты» → «AI-инструменты» → «Автоматизации» последовательно; все тексты в DOM
4. Опционально: 1–2 спокойных reveal текста + один marquee
5. `prefers-reduced-motion`: без pin/parallax/marquee; контент доступен

## Защищено
Контент портфолио/форм/ссылок/SEO/стек HTML+CSS+JS без новых библиотек и без публикации без подтверждения.
