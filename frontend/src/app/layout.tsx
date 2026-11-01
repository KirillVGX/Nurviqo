import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Nuvriqo — підтримка на новому рівні',
    description:
        'Єдиний простір для звернень, команди та клієнтів. Helpdesk без зайвої складності.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html lang="uk" className="h-full antialiased">
            <body className="flex min-h-full flex-col">{children}</body>
        </html>
    );
}
