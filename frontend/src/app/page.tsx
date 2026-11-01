'use client';

import { useRef, useState } from 'react';
import {
    ArrowRight,
    ArrowUpRight,
    BarChart3,
    Check,
    CircleCheck,
    Layers,
    LockKeyhole,
    Mail,
    Menu,
    MoreHorizontal,
    Play,
    Rocket,
    Send,
    ShieldCheck,
    Sparkles,
    Users,
    X,
    Zap,
} from 'lucide-react';

function Mark() {
    return (
        <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
        </span>
    );
}
function Brand() {
    return (
        <a className="brand" href="#">
            <Mark />
            Nuvriqo<span>.</span>
        </a>
    );
}
const features = [
    [Zap, 'Усі звернення поруч', 'Єдина черга замість десятка вкладок'],
    [Users, 'Команда в одному ритмі', 'Ролі, відповідальні та внутрішні нотатки'],
    [Sparkles, 'Менше рутини', 'Більше часу на справді важливе'],
    [BarChart3, 'Підтримка в цифрах', 'Зрозуміла аналітика роботи команди'],
] as const;
const values = [
    [Rocket, 'Легко почати', 'Зрозумілий простір, у якому команда швидко почуватиметься як удома.'],
    [
        ShieldCheck,
        'Усе на своїх місцях',
        'Окремі робочі простори, ролі та прозорий розподіл відповідальності.',
    ],
    [
        Layers,
        'Разом із командою',
        'Від перших звернень до щоденної підтримки злагодженою командою.',
    ],
] as const;

export default function Home() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [notice, setNotice] = useState('');
    const dialog = useRef<HTMLDialogElement>(null);
    function comingSoon() {
        setNotice(
            'Ми готуємо ваш майбутній робочий простір. Реєстрація та вхід стануть доступними після запуску.',
        );
        dialog.current?.showModal();
    }
    return (
        <div className="landing">
            <a className="skip-link" href="#main">
                Перейти до вмісту
            </a>
            <header className="site-header">
                <div className="header-inner container">
                    <Brand />
                    <nav
                        className={menuOpen ? 'navigation is-open' : 'navigation'}
                        aria-label="Головна навігація"
                    >
                        {[
                            ['Можливості', 'features'],
                            ['Інтеграції', 'integrations'],
                            ['Тарифи', 'pricing'],
                            ['Про продукт', 'about'],
                        ].map(([label, id]) => (
                            <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>
                                {label}
                            </a>
                        ))}
                    </nav>
                    <div className="header-actions">
                        <span className="language" aria-label="Мова сайту: українська">
                            UA
                        </span>
                        <button className="login" onClick={comingSoon}>
                            Увійти <ArrowUpRight size={15} aria-hidden="true" />
                        </button>
                        <button className="button primary header-cta" onClick={comingSoon}>
                            Створити акаунт
                        </button>
                        <button
                            className="menu-toggle"
                            aria-label={menuOpen ? 'Закрити меню' : 'Відкрити меню'}
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {menuOpen ? (
                                <X size={20} aria-hidden="true" />
                            ) : (
                                <Menu size={20} aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </header>
            <main id="main">
                <section className="hero container">
                    <div className="hero-copy">
                        <span className="eyebrow">
                            <i /> МЕНШЕ ХАОСУ. БІЛЬШЕ ТУРБОТИ.
                        </span>
                        <h1>
                            Ваша підтримка.
                            <br />
                            <span>На новому рівні.</span>
                        </h1>
                        <p className="hero-description">
                            Кожне звернення — початок гарної розмови. Об’єднайте канали, команду та
                            клієнтів в одному зручному просторі.
                        </p>
                        <div className="hero-actions">
                            <button className="button primary" onClick={comingSoon}>
                                Спробувати безкоштовно <ArrowRight size={18} aria-hidden="true" />
                            </button>
                            <a className="button secondary" href="#product-preview">
                                <Play size={18} aria-hidden="true" /> Зазирнути всередину
                            </a>
                        </div>
                        <div className="benefits">
                            <span>
                                <Check size={13} aria-hidden="true" /> Без банківської картки
                            </span>
                            <span>
                                <Check size={13} aria-hidden="true" /> До 3 учасників безкоштовно
                            </span>
                        </div>
                    </div>
                    <div className="preview-wrap" id="product-preview">
                        <div
                            className="preview-window"
                            role="img"
                            aria-label="Місце для майбутнього зображення інтерфейсу Nuvriqo"
                        >
                            <div className="window-toolbar">
                                <div className="window-dots">
                                    <i />
                                    <i />
                                    <i />
                                </div>
                                <span>nuvriqo / workspace</span>
                                <LockKeyhole size={13} aria-hidden="true" />
                            </div>
                            <div className="preview-placeholder">
                                <div className="preview-symbol">
                                    <Mark />
                                </div>
                                <span>Тут починається спокійна підтримка</span>
                                <small>Місце для зображення інтерфейсу</small>
                            </div>
                            <div className="preview-bottom">
                                <span>
                                    <CircleCheck size={11} aria-hidden="true" /> Усе під контролем
                                </span>
                                <span>Nuvriqo workspace</span>
                            </div>
                        </div>
                        <div className="floating-note">
                            <span className="note-icon">
                                <Check size={13} aria-hidden="true" />
                            </span>
                            <div>
                                Ближче до клієнтів<small>Без зайвих перемикань</small>
                            </div>
                            <span className="note-spark">
                                <Sparkles size={21} aria-hidden="true" />
                            </span>
                        </div>
                        <p className="preview-footnote">ОДИН ПРОСТІР. УСЯ ВАША КОМАНДА.</p>
                    </div>
                </section>
                <section
                    className="features-strip container"
                    id="features"
                    aria-label="Можливості платформи"
                >
                    {features.map(([Icon, title, description]) => (
                        <article className="feature" key={title}>
                            <span className="feature-icon" aria-hidden="true">
                                <Icon size={24} aria-hidden="true" />
                            </span>
                            <div>
                                <h2>{title}</h2>
                                <p>{description}</p>
                            </div>
                        </article>
                    ))}
                </section>
                <section className="about-section" id="about">
                    <div className="about-grid container">
                        <div className="section-intro">
                            <span className="kicker">СТВОРЕНО ДЛЯ ЛЮДЕЙ</span>
                            <h2>
                                Хороший сервіс.
                                <br />
                                <span>Без зайвої складності.</span>
                            </h2>
                            <p>
                                Поки ви піклуєтеся про клієнтів, Nuvriqo допомагає тримати роботу в
                                порядку.
                            </p>
                        </div>
                        <div className="value-grid">
                            {values.map(([Icon, title, description], index) => (
                                <article className="value-card" key={title}>
                                    <div className="value-top">
                                        <span aria-hidden="true">
                                            <Icon size={24} aria-hidden="true" />
                                        </span>
                                        <small>0{index + 1}</small>
                                    </div>
                                    <h3>{title}</h3>
                                    <p>{description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
                <section className="integrations container" id="integrations">
                    <div>
                        <span className="kicker">ЗАЛИШАЙТЕСЯ НА ЗВ’ЯЗКУ</span>
                        <h2>Там, де ваші клієнти.</h2>
                        <p>Улюблені канали — в єдиному робочому просторі.</p>
                    </div>
                    <div className="integration-list">
                        <span className="integration-pill">
                            <span className="telegram" aria-hidden="true">
                                <Send size={15} aria-hidden="true" />
                            </span>
                            Telegram<small>Перший канал</small>
                        </span>
                        <span className="integration-pill upcoming">
                            <Mail size={20} aria-hidden="true" />
                            Email<small>Згодом</small>
                        </span>
                        <span className="integration-pill upcoming">
                            <MoreHorizontal size={20} aria-hidden="true" />
                            Більше інтеграцій
                            <small>Згодом</small>
                        </span>
                    </div>
                </section>
                <section className="pricing-section container" id="pricing">
                    <div>
                        <span className="kicker">МАЛЕНЬКА КОМАНДА. ВЕЛИКІ МОЖЛИВОСТІ.</span>
                        <h2>Почніть із простого.</h2>
                        <p>
                            Безкоштовний старт для команди до 3 учасників.
                            <br />
                            Деталі інших тарифів з’являться перед запуском.
                        </p>
                    </div>
                    <button className="button primary" onClick={comingSoon}>
                        Створити свій простір <ArrowRight size={18} aria-hidden="true" />
                    </button>
                </section>
            </main>
            <footer className="site-footer container">
                <Brand />
                <span>Більше турботи в кожній відповіді.</span>
                <small>© 2026 Nuvriqo</small>
            </footer>
            <dialog
                ref={dialog}
                className="notice-dialog"
                onClick={(event) => {
                    if (event.target === event.currentTarget) dialog.current?.close();
                }}
            >
                <span className="dialog-icon" aria-hidden="true">
                    <Sparkles size={32} aria-hidden="true" />
                </span>
                <h2>Скоро в Nuvriqo</h2>
                <p>{notice}</p>
                <button className="button primary" onClick={() => dialog.current?.close()}>
                    Зрозуміло <Check size={13} aria-hidden="true" />
                </button>
            </dialog>
        </div>
    );
}
