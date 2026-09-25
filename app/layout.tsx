import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { LanguageProvider } from '@/components/providers/language-provider'
import { ScreenReaderProvider } from '@/components/providers/screen-reader-provider'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: {
    template: '%s | GramSeva AI',
    default: 'GramSeva AI – Government Scheme Discovery Platform',
  },
  description:
    'GramSeva AI helps rural residents discover, check eligibility for, and apply to government schemes using AI-powered recommendations.',
  keywords: ['government schemes', 'rural india', 'gram seva', 'welfare schemes', 'eligibility checker', 'AI'],
  authors: [{ name: 'GramSeva AI' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://gramseva.ai',
    siteName: 'GramSeva AI',
    title: 'GramSeva AI – Government Scheme Discovery Platform',
    description: 'AI-powered platform to discover and apply for government schemes in rural India.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="gov-watermark">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LanguageProvider>
            <ScreenReaderProvider>
              <AuthProvider>
                {children}
                <Toaster
                  position="bottom-right"
                  richColors
                  closeButton
                  toastOptions={{
                    style: {
                      borderRadius: '12px',
                    },
                  }}
                />
              </AuthProvider>
            </ScreenReaderProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

