import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthModal from '@/components/modals/AuthModal';
import CartDrawer from '@/components/modals/CartDrawer';
import SearchModal from '@/components/modals/SearchModal';
import WishlistDrawer from '@/components/modals/WishlistDrawer';
import ChatProvider from '@/components/chat/ChatProvider';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />

      <AuthModal />
      <CartDrawer />
      <SearchModal />
      <WishlistDrawer />

      <ChatProvider />
    </div>
  );
}