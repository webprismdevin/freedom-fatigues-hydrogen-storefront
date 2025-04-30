import {
  useIsHomePath,
} from '~/lib/utils';
import {
  Drawer,
  useDrawer,
  Text,
  Input,
  IconAccount,
  IconBag,
  IconSearch,
  Heading,
  IconMenu,
  IconCaret,
  Section,
  CountrySelector,
  Cart,
  CartLoading,
  Link,
} from '~/components';
import {useParams, Form, Await, useMatches, useFetcher} from 'react-router-dom';
import {useLocalStorage, useLocation, useWindowScroll} from 'react-use';
import {Disclosure} from '@headlessui/react';
import {Suspense, useEffect, useMemo, useState, useRef} from 'react';
import {useIsHydrated} from '~/hooks/useIsHydrated';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import {useDrawerCart} from '~/hooks/useDrawerCart';
import {AnimatePresence, motion} from 'framer-motion';
import {urlFor} from '~/lib/sanity';
import AnnouncementBar from './AnnouncementBar';
import {Image} from '@shopify/hydrogen';
import EmailSignup, {SignUpForm} from './EmailSignup';
import type {Cart as CartType} from '@shopify/hydrogen/storefront-api-types';
import {useCart} from '~/hooks/useCart';
import { CartEmpty } from './Cart';
type RootData = {
  cart: Promise<CartType>;
  settings: any;
  selectedLocale: any;
  shop: any;
  analytics: {
    shopifySalesChannel: string;
    shopId: string;
  };
};

export function Layout({
  children,
  layout,
  settings,
  optimisticData,
}: {
  children: React.ReactNode;
  layout: any;
  settings: any;
  optimisticData?: any;
}) {
  const {announcements} = settings;

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        {/* <Suspense fallback={<div className="h-12"></div>}>
          <Await resolve={settings}> */}
            <AnnouncementBar data={announcements} />
          {/* </Await>
        </Suspense> */}
        <Header title={layout?.shop.name ?? 'Hydrogen'} menu={settings?.menu} optimisticData={optimisticData} />
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      <Suspense fallback={null}>
        <Await resolve={settings}>
          <GodFamilyCountry preFooter={settings.footer.preFooter} />
        </Await>
      </Suspense>
      <Suspense fallback={null}>
        <Await resolve={settings}>
          <Footer footer={settings.footer} text={'test text'} />
        </Await>
      </Suspense>
      {/* <EmailSignup /> */}
    </>
  );
}

function Header({title, menu, optimisticData}: {title: string; menu?: any; optimisticData?: any}) {
  const isHome = useIsHomePath();
  const fetcher = useFetcher<{cart: CartType}>();

  // Create separate named hooks for cart and menu with unique identifiers
  const cartDrawer = useDrawer();
  const menuDrawer = useDrawer();

  const isCartOpen = cartDrawer.isOpen;
  const openCart = cartDrawer.openDrawer;
  const closeCart = cartDrawer.closeDrawer;

  const isMenuOpen = menuDrawer.isOpen;
  const openMenu = () => {
    console.log('Opening menu drawer from Header');
    menuDrawer.openDrawer();
  };
  const closeMenu = menuDrawer.closeDrawer;

  // Use the drawer cart hook to handle cart additions
  useDrawerCart({
    isOpen: isCartOpen,
    openDrawer: openCart,
  });

  const location = useLocation();
  const prevLocationRef = useRef(location);

  useEffect(() => {
    console.log('Menu state:', isMenuOpen);
  }, [isMenuOpen]);

  useEffect(() => {
    // Only close if the location has actually changed and the menu is open
    if (!isMenuOpen || !menu) return;
    if (prevLocationRef.current !== location) {
      closeMenu();
      prevLocationRef.current = location;
    }
  }, [location, isMenuOpen, menu, closeMenu]);

  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} optimisticData={optimisticData} />
      {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )}
      <DesktopHeader
        isHome={isHome}
        title={title}
        menu={menu}
        openCart={openCart}
      />
      <MobileHeader
        isHome={isHome}
        title={title}
        openCart={openCart}
        openMenu={openMenu}
      />
    </>
  );
}

function CartDrawer({isOpen, onClose, optimisticData}: {isOpen: boolean; onClose: () => void; optimisticData?: any}) {
  const {cart, isLoading} = useCart();
  
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      heading="Your Cart"
      openFrom="right"
    >
      <Suspense fallback={<CartEmpty hidden={false} layout="drawer" onClose={onClose} cart={optimisticData?.cart} />}>
        {cart ? (
          <Cart layout="drawer" onClose={onClose} cart={cart} />
        ) : (
          <CartEmpty hidden={false} layout="drawer" onClose={onClose} cart={optimisticData?.cart} />
        )}
      </Suspense>
    </Drawer>
  );
}

type SanityMenuItem = {
  _key: string;
  _type: string;
  title: string;
  collectionLinks?: Array<{
    _key: string;
    slug: string;
    title: string;
    target?: string;
  }>;
  megaMenuTitle?: {
    to: string;
    title: string;
  };
  slug?: string;
  target?: string;
};

export function MenuDrawer({
  isOpen,
  onClose,
  menu,
}: {
  isOpen: boolean;
  onClose: () => void;
  menu: SanityMenuItem[];
}) {
  console.log('MenuDrawer isOpen:', isOpen);
  
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      openFrom="left"
      heading="Freedom Fatigues"
    >
      <div className="grid">
        <MenuMobileNav menu={menu} onClose={onClose} />
      </div>
    </Drawer>
  );
}

type LinkListItem = {
  title: string;
  to: string;
};

type LinkList = {
  title: string;
  links: LinkListItem[];
};

function MenuMobileNav({menu, onClose}: {menu: SanityMenuItem[]; onClose: () => void}) {
  return (
    <nav className="grid gap-4 p-6 sm:gap-6 sm:px-12 sm:py-8 max-h-screen overflow-y-auto">
      {/* Top level menu items */}
      {(menu || []).map((item: SanityMenuItem) => (
        <div key={item._key}>
          {item.collectionLinks && (
            <Disclosure>
              {({open}) => (
                <>
                  <Disclosure.Button className="pb-1 font-heading text-xl flex w-full items-center justify-between">
                    <span>{item.title}</span>
                    <span
                      className={`transform transition-transform ${
                        open ? 'rotate-180' : ''
                      }`}
                    >
                      <svg 
                        width="24" 
                        height="24" 
                        strokeWidth="1.5" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg" 
                        color="#000000"
                      >
                        <path 
                          d="M6 9L12 15L18 9" 
                          stroke="#000000" 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </Disclosure.Button>
                  {/* sublevel menus */}
                  <Disclosure.Panel>
                    <ul className="grid gap-4 p-6 sm:gap-6 sm:px-12 sm:py-8">
                      {item.megaMenuTitle && (
                        <li className="font-bold">
                          <Link to={item.megaMenuTitle.to}>
                            {item.megaMenuTitle.title}
                          </Link>
                        </li>
                      )}
                      {item.collectionLinks?.map((link) => (
                        <li key={link._key}>
                          <Link
                            to={link.slug}
                            target={link.target}
                            onClick={onClose}
                            className={({isActive}) =>
                              isActive ? '-mb-px pb-1' : 'pb-1'
                            }
                          >
                            <Text as="span" size="copy">
                              {link.title}
                            </Text>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          )}
          {item._type == 'linkInternal' && item.slug && (
            <span className="block font-heading text-xl">
              <Link
                to={item.slug}
                target={item.target}
                onClick={onClose}
                className={({isActive}) =>
                  isActive ? '-mb-px border-b pb-1' : 'pb-1'
                }
              >
                {item.title}
              </Link>
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

function MobileHeader({
  title,
  isHome,
  openCart,
  openMenu,
}: {
  title: string;
  isHome: boolean;
  openCart: () => void;
  openMenu: () => void;
}) {
  // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);

  const params = useParams();

  return (
    <header
      role="banner"
      className={`${
        isHome
          ? 'bg-primary/90 text-contrast shadow-darkHeader'
          : 'bg-contrast/90 text-primary'
      } sticky top-12 z-40 flex h-nav w-full items-center justify-between gap-4 px-4 leading-none backdrop-blur-md md:px-8 lg:hidden`}
    >
      <div className="flex w-full items-center justify-start gap-4">
        <button
          onClick={() => {
            console.log('Menu button clicked');
            openMenu();
          }}
          className="relative flex h-8 w-8 items-center justify-center"
        >
          <IconMenu />
        </button>
        <Form
          method="get"
          action={params.lang ? `/${params.lang}/search` : '/search'}
          className="items-center gap-2 sm:flex"
        >
          <button
            type="submit"
            className="relative flex h-8 w-8 items-center justify-center"
          >
            <IconSearch />
          </button>
          <Input
            className={
              isHome
                ? 'focus:border-contrast/20 dark:focus:border-primary/20 border-b border-contrast/20'
                : 'focus:border-primary/20 border-b border-primary/20'
            }
            type="search"
            variant="minisearch"
            placeholder="Search"
            name="q"
          />
        </Form>
      </div>

      <Link
        className="flex h-full w-full flex-grow items-center justify-center self-stretch overflow-hidden leading-[3rem] md:leading-[4rem]"
        to="/"
      >
        <div>
          <img
            src={
              isHome
                ? '/branding/original_logo_white.svg'
                : '/branding/original_logo_black.svg'
            }
            alt="logo"
            height={84}
            width={84}
          />
        </div>
      </Link>

      <div className="flex w-full items-center justify-end gap-4">
        <Link
          to="/account"
          className="relative flex h-8 w-8 items-center justify-center"
        >
          <IconAccount />
        </Link>
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

type MegaMenuType = {
  open: boolean;
  menu: {
    _key: string;
    collectionLinks: [any];
    megaMenuFeatures: [any];
    title: string;
  } | null;
};

function DesktopHeader({
  isHome,
  menu,
  openCart,
}: {
  isHome: boolean;
  openCart: () => void;
  menu?: any;
  title: string;
}) {
  const params = useParams();
  const {y} = useWindowScroll();
  const location = useLocation();

  const [megaMenu, setMegaMenu] = useState<MegaMenuType>({
    open: false,
    menu: null,
  });

  const handleMegaMenu = (menu: any) => {
    if (menu._key === megaMenu.menu?._key) {
      setMegaMenu({open: !megaMenu.open, menu});
    } else {
      setMegaMenu({open: true, menu});
    }
  };

  useEffect(() => {
    if (megaMenu.open) {
      setMegaMenu({open: false, menu: null});
    }
  }, [location]);

  return (
    <header
      onMouseLeave={() => setMegaMenu({open: false, menu: null})}
      role="banner"
      className={`${
        isHome
          ? 'bg-primary/95 text-contrast shadow-darkHeader'
          : 'bg-contrast/95 text-primary'
      } ${
        !isHome && y > 50 && ' shadow-lightHeader'
      } sticky top-12 z-40 hidden h-nav w-full items-center justify-between gap-8 px-12 py-8 leading-none transition duration-300 lg:flex`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-6 font-heading tracking-wider">
        <Link to="/" prefetch="intent" className="shrink-0">
          <div>
            <img
              src={
                isHome
                  ? '/branding/original_logo_white.svg'
                  : '/branding/original_logo_black.svg'
              }
              alt="logo"
              height={96}
              width={96}
            />
          </div>
        </Link>
        <nav className="min-w-0 flex-1">
          <div className="flex select-none items-start gap-x-4 overflow-x-auto pb-1 hiddenScroll">
            {/* Top level menu items */}
            {(menu || []).map((item: SanityMenuItem) => {
              if (item._type === 'collectionGroup') {
                return (
                  <MegaMenuLink
                    menu={item}
                    key={item._key}
                    open={item._key === megaMenu.menu?._key && megaMenu.open}
                    onClick={() => handleMegaMenu(item)}
                  />
                );
              }
              if (item._type === 'linkInternal' && item.slug) {
                return (
                  <Link
                    key={item._key}
                    to={item.slug}
                    target="_parent"
                    prefetch="intent"
                    className={({isActive}) =>
                      isActive
                        ? '-mb-px border-b-2 border-red-500 whitespace-nowrap'
                        : 'hover:border-b-2 hover:border-b-red-500 whitespace-nowrap'
                    }
                  >
                    <LinkTitle text={item.title} />
                  </Link>
                );
              }
              return null;
            })}
          </div>
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Form
          method="get"
          action={params.lang ? `/${params.lang}/search` : '/search'}
          className="flex items-center gap-2"
        >
          <Input
            className={
              isHome
                ? 'focus:border-contrast/20 dark:focus:border-primary/20 border-b border-contrast/20'
                : 'focus:border-primary/20 border-b border-primary/20'
            }
            type="search"
            variant="minisearch"
            placeholder="Search"
            name="q"
          />
          <button
            type="submit"
            className="relative flex h-8 w-8 items-center justify-center focus:ring-primary/5"
          >
            <IconSearch />
          </button>
        </Form>
        <Link
          to="/account"
          className="relative flex h-8 w-8 items-center justify-center focus:ring-primary/5"
        >
          <IconAccount />
        </Link>
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
      <MegaMenu menu={megaMenu.menu} open={megaMenu.open} isHome={isHome} />
    </header>
  );
}

function LinkTitle({text}: {text: string}) {
  return <span className="text-lg uppercase whitespace-nowrap">
    {text === 'FREEDOM' ? 'FREEDOM PARTNERS' : text}
  </span>;
}

function MegaMenuLink({
  menu,
  open,
  onClick,
}: {
  menu: any;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center whitespace-nowrap tracking-wider"
    >
      <div className="hover:border-b-2 hover:border-b-red-500">
        <span className="text-lg uppercase">{menu.title}</span>
      </div>
      <div className="grid place-content-center">
        <IconCaret direction={open ? 'up' : 'down'} />
      </div>
    </div>
  );
}

function MegaMenu({
  menu,
  isHome,
  open,
}: {
  menu: any;
  isHome: boolean;
  open: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          exit={{opacity: 0, y: 20}}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
          }}
          className={`z-100 flex items-center justify-between gap-8 px-12 py-4 ${
            isHome
              ? 'bg-primary/95 text-contrast'
              : 'bg-contrast/95 text-primary'
          }`}
        >
          <div className="text-lg">
            {menu.megaMenuTitle?.to ? (
              <Link
                to={menu.megaMenuTitle.to}
                className="font-bold hover:border-b-2 hover:border-b-red-500"
              >
                {menu.megaMenuTitle.title}
              </Link>
            ) : (
              <div className="font-bold">{menu.megaMenuTitle.title}</div>
            )}
            <ul>
              {menu.collectionLinks.map((link: any) => (
                <li key={link._key} className="my-4">
                  <Link
                    to={link.slug}
                    target="_parent"
                    prefetch="intent"
                    className={({isActive}) =>
                      isActive
                        ? '-mb-px border-b-2 border-FF-red pb-1'
                        : 'pb-1 hover:border-b-2 hover:border-b-red-500'
                    }
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-8 self-stretch">
            {menu.megaMenuFeatures &&
              menu.megaMenuFeatures.map((feature: any) => (
                <Link
                  to={feature.link.slug}
                  key={feature._key}
                  className={({isActive}) => (isActive ? 'text-primary' : '')}
                >
                  <div
                    className={`relative grid place-items-center ${
                      menu.megaMenuFeatures?.length === 1 && 'col-span-2'
                    }`}
                  >
                    <img
                      className="h-full"
                      src={urlFor(feature.image)
                        .height(164)
                        .width(192)
                        .quality(100)
                        .url()}
                      alt=""
                    />
                    <div className="text-bold text-shadow absolute font-heading text-2xl text-white">
                      {feature.title}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CartCount({
  isHome,
  openCart,
}: {
  isHome: boolean;
  openCart: () => void;
}) {
  const {cart} = useCart();

  return (
    <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
      <Badge
        dark={isHome}
        openCart={openCart}
        count={cart?.totalQuantity || 0}
      />
    </Suspense>
  );
}

function Badge({
  openCart,
  dark,
  count,
}: {
  count: number;
  dark: boolean;
  openCart: () => void;
}) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => (
      <>
        <IconBag />
        <div
          className={`${
            dark
              ? 'bg-contrast text-primary dark:bg-primary dark:text-contrast'
              : 'bg-primary text-contrast'
          } absolute bottom-1 right-1 flex h-3 w-auto min-w-[0.75rem] items-center justify-center rounded-full px-[0.125rem] pb-px text-center text-[0.625rem] font-medium leading-none subpixel-antialiased`}
        >
          <span>{count || 0}</span>
        </div>
      </>
    ),
    [count, dark],
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      className="relative flex h-8 w-8 items-center justify-center focus:ring-primary/5"
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link
      to="/cart"
      className="relative flex h-8 w-8 items-center justify-center focus:ring-primary/5"
    >
      {BadgeCounter}
    </Link>
  );
}

export function GodFamilyCountry({preFooter}: {preFooter: any}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 bg-primary p-12 text-center text-contrast">
      <p className="text-4xl font-bold">God, Family, Country.</p>
      <p className="text-2xl font-bold">In that order.</p>
      {/* <div
        style={{
          width: 128,
        }}
      >
        <img src="/branding/original_logo_white.svg" alt="Freedom Fatigues" width={128} height={128} />
      </div> */}
    </div>
  );
}

const FooterLinkList = ({linkList}: {linkList: LinkList}) => {
  return (
    <div>
      <LinkListTitle title={linkList.title} />
      <ul>
        {linkList.links.map((link: LinkListItem) => (
          <li key={link.title} className={'my-2'}>
            <Link to={link.to}>{link.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Footer = ({text, footer}: any) => {
  const {links, email} = footer;
  const sectionCount = links.length + 1;
  const outlineStyle = 'outline outline-1 outline-[#ffffff66]';

  return (
    <div className="bg-primary text-contrast">
      <div className={`grid w-screen grid-cols-1 lg:grid-cols-${sectionCount}`}>
        <div className={`p-12 ${outlineStyle}`}>
          {/* <LinkListTitle title={email.title} /> */}
          {/* <div className="my-2 leading-loose">
            {email.text && <p>{email.text}</p>}
          </div> */}
          {/* <div className="flex ">
            <SignUpForm variant="dark" source={'footer'} />
          </div> */}
          <div className="my-4 flex gap-2">
            <a href="https://www.instagram.com/freedomfatigues/">
              <IconInstagram />
            </a>
            <a href="https://www.facebook.com/freedomfatigues">
              <IconFacebook />
            </a>
          </div>
          <img
            src={
              'https://cdn.shopify.com/s/files/1/0056/6342/4630/files/veteran_owned-footer_badge.png?v=1698351211'
            }
            alt="Service-disabled Veteran Owned Small Business"
          />
        </div>
        {links.map((submenu: any) => (
          <div key={submenu._key} className={`p-12 ${outlineStyle}`}>
            {submenu._type === 'linkGroup' && (
              <FooterLinkList
                linkList={{title: submenu.title, links: submenu.links}}
              />
            )}
            {submenu._type === 'collectionGroup' && (
              <FooterLinkList
                linkList={{
                  title: submenu.title,
                  links: submenu.collectionLinks,
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="p-4 text-center">
        Freedom Fatigues © {new Date().getFullYear()}
      </div>
    </div>
  );
};

const LinkListTitle = ({title}: {title: string}) => {
  return <div className="text-xl font-bold">{title}</div>;
};

const IconInstagram = () => {
  return (
    <svg
      width="24px"
      height="24px"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="white"
    >
      <path
        d="M12 16a4 4 0 100-8 4 4 0 000 8z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M3 16V8a5 5 0 015-5h8a5 5 0 015 5v8a5 5 0 01-5 5H8a5 5 0 01-5-5z"
        stroke="white"
        strokeWidth="1.5"
      ></path>
      <path
        d="M17.5 6.51l.01-.011"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};

const IconFacebook = () => {
  return (
    <svg
      width="24px"
      height="24px"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="#ffffff"
    >
      <path
        d="M17 2h-3a5 5 0 00-5 5v3H6v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};
