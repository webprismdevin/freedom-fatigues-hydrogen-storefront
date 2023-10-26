import {
  type EnhancedMenu,
  type EnhancedMenuItem,
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
import {useParams, Form, Await, useMatches} from '@remix-run/react';
import {useLocalStorage, useLocation, useWindowScroll} from 'react-use';
import {Disclosure} from '@headlessui/react';
import {Suspense, useEffect, useMemo, useState} from 'react';
import {useIsHydrated} from '~/hooks/useIsHydrated';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import {AnimatePresence, motion} from 'framer-motion';
import {urlFor} from '~/lib/sanity';
import AnnouncementBar from './AnnouncementBar';
import {Image} from '@shopify/hydrogen';
import EmailSignup, {SignUpForm} from './EmailSignup';

import whiteLogo from '../../public/branding/logo_white.png';
import blackLogo from '../../public/branding/logo_black.png';

export function Layout({
  children,
  layout,
  settings,
}: {
  children: React.ReactNode;
  layout: any;
  settings: any;
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
        <Suspense fallback={<div className="h-12"></div>}>
          <Await resolve={settings}>
            <AnnouncementBar data={announcements} />
          </Await>
        </Suspense>
        <Header title={layout?.shop.name ?? 'Hydrogen'} menu={settings?.menu} />
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

function Header({title, menu}: {title: string; menu?: any}) {
  const isHome = useIsHomePath();

  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();

  const addToCartFetchers = useCartFetchers('ADD_TO_CART');
  const location = useLocation();

  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  useEffect(() => {
    if (!isMenuOpen || !menu) return;
    closeMenu();
  }, [location]);

  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
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

function CartDrawer({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) {
  const [root] = useMatches();

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      heading="Your Cart"
      openFrom="right"
    >
      {/* <div className="grid"> */}
      <Suspense fallback={<CartLoading />}>
        <Await resolve={root.data?.cart}>
          {(cart) => <Cart layout="drawer" onClose={onClose} cart={cart} />}
        </Await>
      </Suspense>
      {/* </div> */}
    </Drawer>
  );
}

export function MenuDrawer({
  isOpen,
  onClose,
  menu,
}: {
  isOpen: boolean;
  onClose: () => void;
  menu: EnhancedMenu;
}) {
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

function MenuMobileNav({menu, onClose}: {menu: any; onClose: () => void}) {
  return (
    <nav className="grid gap-4 p-6 sm:gap-6 sm:px-12 sm:py-8">
      {/* Top level menu items */}
      {(menu || []).map((item) => (
        <div key={item._key}>
          {item.collectionLinks && (
            <Disclosure>
              <Disclosure.Button className="pb-1 font-heading text-xl">
                {item.title}
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
                  {item.collectionLinks.map((link) => (
                    <li key={link.slug}>
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
            </Disclosure>
          )}
          {item._type == 'linkInternal' && (
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
      } sticky top-0 z-40 flex h-nav w-full items-center justify-between gap-4 px-4 leading-none backdrop-blur-md md:px-8 lg:hidden`}
    >
      <div className="flex w-full items-center justify-start gap-4">
        <button
          onClick={openMenu}
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
                ? 'focus:border-contrast/20 dark:focus:border-primary/20'
                : 'focus:border-primary/20'
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
              isHome ? whiteLogo : blackLogo
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
      } sticky top-0 z-40 hidden h-nav w-full items-center justify-between gap-8 px-12 py-8 leading-none transition duration-300 lg:flex`}
    >
      <div className="flex items-center gap-12 font-heading tracking-wider">
        <Link to="/" prefetch="intent" className="shrink-0">
          <div>
            <img
              src={
                isHome ? '/branding/logo_white.png' : '/branding/logo_black.png'
              }
              alt="logo"
              height={96}
              width={96}
            />
          </div>
        </Link>
        <nav className="flex select-none items-start gap-4">
          {/* Top level menu items */}
          {(menu || []).map((item: any) => {
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
            if (item._type === 'linkInternal') {
              return (
                <Link
                  key={item._key}
                  to={item.slug}
                  target="_parent"
                  prefetch="intent"
                  className={({isActive}) =>
                    isActive
                      ? '-mb-px border-b-2 border-red-500 pb-1'
                      : 'pb-1 hover:border-b-2 hover:border-b-red-500'
                  }
                >
                  <LinkTitle text={item.title} />
                </Link>
              );
            }
          })}
        </nav>
      </div>
      <div className="flex items-center gap-1">
        <Form
          method="get"
          action={params.lang ? `/${params.lang}/search` : '/search'}
          className="flex items-center gap-2"
        >
          <Input
            className={
              isHome
                ? 'focus:border-contrast/20 dark:focus:border-primary/20'
                : 'focus:border-primary/20'
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
  return <span className="text-lg uppercase">{text}</span>;
}

function MegaMenuLink({
  menu,
  open,
  ...props
}: {
  menu: any;
  open: boolean;
  props?: any;
}) {
  return (
    <div
      {...props}
      className="flex cursor-pointer items-center tracking-wider "
    >
      <div className="hover:border-b-2 hover:border-b-red-500">
        <LinkTitle text={menu.title} />
      </div>
      <IconCaret direction={open ? 'up' : 'down'} />
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
  const [root] = useMatches();

  return (
    <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
      <Await resolve={root.data?.cart}>
        {(cart) => (
          <Badge
            dark={isHome}
            openCart={openCart}
            count={cart?.totalQuantity || 0}
          />
        )}
      </Await>
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
  const {title, text, image} = preFooter;

  return (
    <div className="flex flex-col items-center justify-center gap-1 bg-primary p-12 text-center text-contrast">
      <p className="text-2xl font-bold">{title}</p>
      <p className="text-lg font-bold">{text}</p>
      <div
        style={{
          width: 128,
        }}
      >
        <Image src={urlFor(image).url()} alt={image?.alt} sizes="128px" />
      </div>
    </div>
  );
}

const FooterLinkList = ({linkList}) => {
  return (
    <div>
      <LinkListTitle title={linkList.title} />
      <ul>
        {linkList.links.map((link) => (
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
          <LinkListTitle title={email.title} />
          <div className="my-2 leading-loose">
            {email.text && <p>{email.text}</p>}
          </div>
          <div className="flex ">
            <SignUpForm variant="dark" source={'footer'} />
          </div>
          <div className="my-4 flex gap-2">
            <a href="https://www.instagram.com/freedomfatigues/">
              <IconInstagram />
            </a>
            <a href="https://www.facebook.com/freedomfatigues">
              <IconFacebook />
            </a>
          </div>
          <img
            src={'/branding/veteran_owned-footer_badge.png'}
            alt="Veteran Owned"
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
