"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./header.module.css";
import dropDownStyles from "../notification/DropdownNotificationCards.module.css";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const ViewNotificationCards = dynamic(
  () => import("../notification/ViewNotificationCards"),
  { ssr: false },
);

const Header: React.FC = () => {
  const navRef = useRef<HTMLDivElement | null>(null);
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastScrollYRef = useRef(0); 

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isLoading = status === "loading";
  const pathname = usePathname();

  // Scroll hide/show — lastScrollY is now a stable ref
  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      if (menuOpen) return;
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollYRef.current) < 10) return;
      setScrolled(currentScrollY > lastScrollYRef.current);
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        navRef.current &&
        !navRef.current.contains(e.target as Node) &&
        menuBtnRef.current &&
        !menuBtnRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  // };

  const closeMenu = () => setMenuOpen(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
    setScrolled(false);
    if (searchOpen) setSearchOpen(false);
  };

  // const toggleSearch = () => {
  //   setSearchOpen((prev) => !prev);
  //   if (menuOpen) setMenuOpen(false);
  // };

  const isActive = (path: string) => pathname === path;

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
      <div className={styles.headerContainer}>
        {/* Logo */}
        <div className={styles.logoSection}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/commyfy.png"
              className={styles.logoIcon}
              height={100}
              width={400}
              alt="commyfy"
              loading="eager"
            />
            <Image
              src="/commyfy_64x64.ico"
              className={styles.logoIconMobile}
              height={40}
              width={40}
              alt="commyfy"
              loading="eager"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav
          ref={navRef}
          className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}
        >
          <div className={styles.navLinks}>
            {(
              [
                { href: "/explore", label: "Home" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ] as const
            ).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${isActive(href) ? styles.navLinkActive : ""}`}
                onClick={closeMenu}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile Only Actions */}
          <div className={styles.mobileActions}>
            {isLoggedIn ? (
              <Link href="/account/profile" className={styles.mobileLink} onClick={closeMenu}>
                👤 My Account
              </Link>
            ) : (
              pathname !== "/auth" && (
                <Link href="/auth" className={styles.mobileLink} onClick={closeMenu}>
                  🔐 Sign In
                </Link>
              )
            )}
            {session?.user.role === "user" && (
              <>
                {
                  pathname === "/account/wishlist" ? (
                    <span
                      className={styles.mobileLink}
                      aria-current="page"
                      style={{
                        opacity: 0.6,
                        cursor: "default",
                      }}
                    >
                      ♡ Wishlist
                    </span>
                  ) : (
                    <Link
                      href="/account/wishlist"
                      className={styles.mobileLink}
                      onClick={closeMenu}
                    >
                      ♡ Wishlist
                    </Link>
                  )
                }
                <Link href="/account/orders"
                  style={pathname === "/account/orders" ? { pointerEvents: "none", opacity: 0.6, cursor: "not-allowed" } : {}}
                  aria-disabled={pathname === "/account/orders"}
                  className={styles.mobileLink}
                  onClick={(e) => {
                    if (pathname === "/account/orders") {
                      e.preventDefault();
                    } else {
                      closeMenu();
                    }
                  }}>
                  📦 Orders
                </Link>
              </>
            )}
            <Link href="/help" className={styles.mobileLink} onClick={closeMenu}>
              ❓ Help Center
            </Link>
          </div>
        </nav>

        {/* Actions */}
        <div className={styles.headerActions}>
          {session?.user.role === "user" ? (
            <>
              {/* <button
                className={dropDownStyles.iconButton}
                onClick={toggleSearch}
                aria-label={searchOpen ? "Close Search" : "Search"}
              >
                {searchOpen ? "✕" : "🔍"}
              </button> */}
              {
                pathname === "/account/wishlist" ? (
                  <span
                    className={dropDownStyles.iconButton}
                    style={{
                      opacity: 0.6,
                      cursor: "default",
                    }}
                    aria-current="page"
                  >
                    ♡
                  </span>
                ) : (
                  <Link
                    href="/account/wishlist"
                    className={dropDownStyles.iconButton}
                    aria-label="Wishlist"
                    title="Wishlist"
                  >
                    ♡
                  </Link>
                )
              }
              {/* <Link
                href="/account/cart"
                className={dropDownStyles.iconButton}
                aria-label="Shopping Cart"
                title="Shopping Cart"
              >
                🛒
              </Link> */}
            </>
          ) : (
            (pathname.startsWith("/admin") ||
              pathname.startsWith("/explore") ||
              pathname.startsWith("/s")) && (
              <ViewNotificationCards isLoggedIn={isLoggedIn} />
            )
          )}

          {/* User Account dropdown */}
          {!isLoading && (
            isLoggedIn ? (
              <div className={dropDownStyles.dropdownContainer}>
                <button
                  className={dropDownStyles.iconButton}
                  aria-label="Account"
                  title="Profile"
                >
                  👤
                </button>
                <div className={dropDownStyles.dropdown}>
                  <Link href="/account/profile" className={dropDownStyles.dropdownItem}>
                    My Account
                  </Link>
                  {session?.user.role === "user" && (
                    <>
                      <Link href="/account/wishlist" className={dropDownStyles.dropdownItem}>
                        Wishlist
                      </Link>
                      {/* <Link href="/account/cart" className={dropDownStyles.dropdownItem}>
                        Cart
                      </Link> */}
                    </>
                  )}
                  <Link href="/help" className={dropDownStyles.dropdownItem}>
                    ❓ Help Center
                  </Link>
                  <hr className={dropDownStyles.dropdownDivider} />
                  <button
                    className={dropDownStyles.dropdownItem}
                    onClick={() => signOut()}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              pathname !== "/auth" && (
                <Link href="/auth" className={styles.loginButton} aria-label="Login">
                  Sign In
                </Link>
              )
            )
          )}

          {/* Mobile Menu Toggle */}
          <button
            ref={menuBtnRef}
            className={styles.menuToggle}
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close Menu" : "Open Menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;