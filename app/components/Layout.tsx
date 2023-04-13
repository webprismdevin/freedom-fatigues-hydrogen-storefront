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
import {useWindowScroll} from 'react-use';
import {Disclosure} from '@headlessui/react';
import {Suspense, useEffect, useMemo} from 'react';
import {useIsHydrated} from '~/hooks/useIsHydrated';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import type {LayoutData} from '../root';
import {AnimatePresence, useCycle, motion} from 'framer-motion';
import {urlFor} from '~/lib/sanity';

export function Layout({
  children,
  layout,
  settings,
}: {
  children: React.ReactNode;
  layout: LayoutData;
  settings: any;
}) {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        <Header title={layout?.shop.name ?? 'Hydrogen'} menu={settings?.menu} />
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      <GodFamilyCountry />
      <Footer menu={layout?.footerMenu} />
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

  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

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
    <Drawer open={isOpen} onClose={onClose} heading="Cart" openFrom="right">
      <div className="grid">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={root.data?.cart}>
            {(cart) => <Cart layout="drawer" onClose={onClose} cart={cart} />}
          </Await>
        </Suspense>
      </div>
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
              <Disclosure.Button className="pb-1 font-heading">
                {item.title}
              </Disclosure.Button>
              <Disclosure.Panel>
                <ul className="grid gap-4 p-6 sm:gap-6 sm:px-12 sm:py-8">
                  {item.collectionLinks.map((link) => (
                    <li key={link.slug}>
                      <Link
                        to={link.slug}
                        target={link.target}
                        onClick={onClose}
                        className={({isActive}) =>
                          isActive ? '-mb-px border-b pb-1' : 'pb-1'
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
            <span className="block font-heading">
              <Link
                to={item.slug}
                target={item.target}
                onClick={onClose}
                className={({isActive}) =>
                  isActive ? '-mb-px border-b pb-1' : 'pb-1'
                }
              >
                <Text as="span" size="copy">
                  {item.title}
                </Text>
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
          ? 'bg-primary/80 text-contrast shadow-darkHeader dark:bg-contrast/60 dark:text-primary'
          : 'bg-contrast/80 text-primary'
      } sticky top-0 z-40 flex h-nav w-full items-center justify-between gap-4 px-4 leading-none backdrop-blur-lg md:px-8 lg:hidden`}
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
              isHome ? '/branding/logo_white.png' : '/branding/logo_black.png'
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

function DesktopHeader({
  isHome,
  menu,
  openCart,
  title,
}: {
  isHome: boolean;
  openCart: () => void;
  menu?: any;
  title: string;
}) {
  const params = useParams();
  const {y} = useWindowScroll();

  return (
    <header
      role="banner"
      style={{position: 'relative'}}
      className={`${
        isHome
          ? 'bg-primary text-contrast shadow-darkHeader'
          : 'bg-contrast/80 text-primary'
      } ${
        !isHome && y > 50 && ' shadow-lightHeader'
      } sticky top-0 z-40 hidden h-nav w-full items-center justify-between gap-8 px-12 py-8 leading-none backdrop-blur-lg transition duration-300 lg:flex`}
    >
      <div className="flex items-center gap-12 font-heading">
        <Link to="/" prefetch="intent">
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
        <nav className="flex gap-4">
          {/* Top level menu items */}
          {(menu || []).map((item: any) => {
            return (
              <div key={item._key}>
                {item.collectionLinks && <MegaMenu item={item} />}
                {item._type === 'linkInternal' && (
                  <Link
                    key={item._key}
                    to={item.slug}
                    target="_parent"
                    prefetch="intent"
                    className={({isActive}) =>
                      isActive ? '-mb-px border-b pb-1' : 'pb-1'
                    }
                  >
                    <LinkTitle text={item.title} />
                  </Link>
                )}
              </div>
            );
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
    </header>
  );
}

function LinkTitle({text}: {text: string}) {
  return <span className="font-bold uppercase">{text}</span>;
}

function MegaMenu({item}: {item: any}) {
  const [open, cycleOpen] = useCycle(0, 1);
  return (
    <div>
      <div onMouseEnter={() => cycleOpen()}>
        <LinkTitle text={item.title} />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            onMouseLeave={() => cycleOpen()}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 20}}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              color: 'black',
            }}
            className="flex items-center justify-between gap-8 px-12 py-8"
          >
            <ul>
              {item.collectionLinks.map((link: any) => (
                <li key={link._key} className="my-2">
                  <Link
                    to={link.slug}
                    target="_parent"
                    prefetch="intent"
                    className={({isActive}) =>
                      isActive ? '-mb-px border-b pb-1' : 'pb-1'
                    }
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex justify-center gap-8">
              {item.megaMenuFeatures &&
                item.megaMenuFeatures.map((feature: any) => (
                  <div
                    key={feature._key}
                    className="relative grid place-items-center"
                  >
                    <img
                      src={urlFor(feature.image)
                        .height(128)
                        .width(128)
                        .quality(100)
                        .url()}
                      alt=""
                    />
                    <div className="absolute">{feature.title}</div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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

function FooterOld({menu}: {menu?: EnhancedMenu}) {
  const isHome = useIsHomePath();
  const itemsCount = menu
    ? menu?.items?.length + 1 > 4
      ? 4
      : menu?.items?.length + 1
    : [];

  return (
    <Section
      divider={isHome ? 'none' : 'top'}
      as="footer"
      role="contentinfo"
      className={`grid min-h-[25rem] w-full grid-flow-row grid-cols-1 items-start gap-6 px-6 py-8 md:grid-cols-2 md:gap-8 md:px-8 lg:gap-12 lg:px-12 lg:grid-cols-${itemsCount}
        overflow-hidden bg-primary text-contrast dark:bg-contrast dark:text-primary`}
    >
      <FooterMenuOld menu={menu} />
      <CountrySelector />
      <div
        className={`self-end pt-8 opacity-50 md:col-span-2 lg:col-span-${itemsCount}`}
      >
        &copy; {new Date().getFullYear()} / Shopify, Inc. Hydrogen is an MIT
        Licensed Open Source project.
      </div>
    </Section>
  );
}

const FooterLink = ({item}: {item: EnhancedMenuItem}) => {
  if (item.to.startsWith('http')) {
    return (
      <a href={item.to} target={item.target} rel="noopener noreferrer">
        {item.title}
      </a>
    );
  }

  return (
    <Link to={item.to} target={item.target} prefetch="intent">
      {item.title}
    </Link>
  );
};

function FooterMenuOld({menu}: {menu?: EnhancedMenu}) {
  const styles = {
    section: 'grid gap-4',
    nav: 'grid gap-2 pb-6',
  };

  return (
    <>
      {(menu?.items || []).map((item: EnhancedMenuItem) => (
        <section key={item.id} className={styles.section}>
          <Disclosure>
            {({open}) => (
              <>
                <Disclosure.Button className="text-left md:cursor-default">
                  <Heading className="flex justify-between" size="lead" as="h3">
                    {item.title}
                    {item?.items?.length > 0 && (
                      <span className="md:hidden">
                        <IconCaret direction={open ? 'up' : 'down'} />
                      </span>
                    )}
                  </Heading>
                </Disclosure.Button>
                {item?.items?.length > 0 ? (
                  <div
                    className={`${
                      open ? `h-fit max-h-48` : `max-h-0 md:max-h-fit`
                    } overflow-hidden transition-all duration-300`}
                  >
                    <Suspense data-comment="This suspense fixes a hydration bug in Disclosure.Panel with static prop">
                      <Disclosure.Panel static>
                        <nav className={styles.nav}>
                          {item.items.map((subItem) => (
                            <FooterLink key={subItem.id} item={subItem} />
                          ))}
                        </nav>
                      </Disclosure.Panel>
                    </Suspense>
                  </div>
                ) : null}
              </>
            )}
          </Disclosure>
        </section>
      ))}
    </>
  );
}

const dummy_links = {
  title: 'Shop',
  links: [
    {
      title: 'All Products',
      to: '/collections/all',
    },
    {
      title: 'New Arrivals',
      to: '/collections/new-arrivals',
    },
    {
      title: 'Best Sellers',
      to: '/collections/best-sellers',
    },
    {
      title: 'Gift Cards',
      to: '/collections/gift-cards',
    },
  ],
};

export function GodFamilyCountry() {
  return (
    <div className="flex flex-col items-center justify-center gap-1 bg-primary p-12 text-center text-contrast">
      <p className="text-2xl font-bold">God, Family, Country.</p>
      <p className="text-lg font-bold">In that order.</p>
      <div
        style={{
          width: 128,
        }}
      >
        <img src={'/branding/logo_white.png'} alt="logo" />
      </div>
    </div>
  );
}

const Footer = ({menu}) => {
  // const sectionCount = 1 + (menu?.items?.length || 3);
  const sectionCount = 4;

  const outlineStyle = 'outline outline-1 outline-[#ffffff66]';

  return (
    <div className="bg-primary text-contrast">
      <div className={`grid w-screen grid-cols-1 lg:grid-cols-${sectionCount}`}>
        <div className={`p-12 ${outlineStyle}`}>
          <LinkListTitle title={'Email'} />
          <div className="my-2 leading-loose">
            Laboris incididunt laborum cillum ut ex aute commodo duis veniam
            anim elit sunt quis nulla ea.
          </div>
          <div className="flex border-b-2 border-[#ffffff66]">
            <input
              className="flex-1 bg-transparent"
              placeholder="Enter your email"
            />
            <button type="submit">Submit</button>
          </div>
          <div className="my-4 flex gap-2">
            <IconInstagram />
            <IconFacebook />
          </div>
          <img
            src={'/branding/veteran_owned-footer_badge.png'}
            alt="Veteran Owned"
          />
        </div>
        <div className={`p-12 ${outlineStyle}`}>
          <FooterLinkList linkList={dummy_links} />
        </div>
        <div className={`p-12 ${outlineStyle}`}>
          {' '}
          <FooterLinkList linkList={dummy_links} />
        </div>
        <div className={`p-12 ${outlineStyle}`}>
          {' '}
          <FooterLinkList linkList={dummy_links} />
        </div>
      </div>
      <div className="p-4 text-center">
        Freedom Fatigues © {new Date().getFullYear()}
      </div>
    </div>
  );
};

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
