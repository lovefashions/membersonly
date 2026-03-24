import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useCart } from '@/hooks/useCart.jsx';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import ShoppingCartComponent from '@/components/ShoppingCart.jsx';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { cartItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, hash) => {
    if (isHome) {
      e.preventDefault();
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/${hash}`);
    }
    setMobileMenuOpen(false);
  };

  const NavLinks = ({ mobile = false }) => (
    <div className={`flex ${mobile ? 'flex-col space-y-6' : 'items-center space-x-8'}`}>
      <a 
        href="#home" 
        onClick={(e) => handleNavClick(e, '#home')}
        className="text-sm font-medium tracking-wide text-foreground/80 hover:text-primary transition-colors"
      >
        Home
      </a>
      <a 
        href="#about" 
        onClick={(e) => handleNavClick(e, '#about')}
        className="text-sm font-medium tracking-wide text-foreground/80 hover:text-primary transition-colors"
      >
        About
      </a>
      <a 
        href="#membership" 
        onClick={(e) => handleNavClick(e, '#membership')}
        className="text-sm font-medium tracking-wide text-foreground/80 hover:text-primary transition-colors"
      >
        Membership
      </a>
      <a 
        href="#faq" 
        onClick={(e) => handleNavClick(e, '#faq')}
        className="text-sm font-medium tracking-wide text-foreground/80 hover:text-primary transition-colors"
      >
        FAQ
      </a>
      <Link 
        to="/products" 
        onClick={() => setMobileMenuOpen(false)}
        className="text-sm font-medium tracking-wide text-foreground/80 hover:text-primary transition-colors"
      >
        Shop
      </Link>
      
      {currentUser ? (
        <>
          <Link 
            to="/dashboard" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium tracking-wide text-foreground/80 hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <button 
            onClick={() => { logout(); setMobileMenuOpen(false); }}
            className={`text-sm font-medium tracking-wide text-foreground/80 hover:text-destructive transition-colors ${mobile ? 'text-left' : ''}`}
          >
            Logout
          </button>
        </>
      ) : (
        <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
          <Button variant="outline" className="rounded-full px-6 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto">
            Sign In
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-background/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 z-50">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Apple Jucy
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center">
            <NavLinks />
          </nav>

          <div className="flex items-center gap-4 z-50">
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative p-2 text-foreground/80 hover:text-primary transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                  {cartCount}
                </span>
              )}
            </button>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-primary">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background border-l-border pt-16">
                <NavLinks mobile />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <ShoppingCartComponent isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </>
  );
};

export default Header;