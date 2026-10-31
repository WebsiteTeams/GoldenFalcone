"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart/context";

const MotionLink = motion.create(Link);

/** Floating shortcut to the cart on spice pages. It steps aside while the footer is on screen. */
export function FloatingCart() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting));
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const show = pathname.startsWith("/spices") && !footerVisible;

  return (
    <AnimatePresence>
      {show ? (
        <MotionLink
          key="floating-cart"
          href="/cart"
          aria-label={`Shopping cart${itemCount > 0 ? `, ${itemCount} item${itemCount !== 1 ? "s" : ""}` : ""}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 right-4 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-gold bg-forest text-ivory shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-colors hover:bg-emerald sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
        >
          <ShoppingCart aria-hidden className="h-5 w-5" />
          {itemCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-forest">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          ) : null}
        </MotionLink>
      ) : null}
    </AnimatePresence>
  );
}
