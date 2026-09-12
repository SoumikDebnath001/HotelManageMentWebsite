import { useEffect, useRef, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";

/* =========================================================
   PANEL LAYOUT
   Shared shell for the Super Admin, Hotel Admin and Manager panels.
   - lg+: fixed sidebar on the left, content scrolls beside it
   - below lg: sticky top bar with a menu button (right) that opens a sidebar drawer
========================================================= */

const NavList = ({ navItems, pathname, onNavigate }) => (
  <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-4 lg:space-y-2 lg:py-6">
    {navItems.map((item) => {
      const isActive = pathname.startsWith(item.path);
      const Icon = item.icon;

      return (
        <Link
          key={item.name}
          to={item.path}
          onClick={onNavigate}
          aria-current={isActive ? "page" : undefined}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
            isActive
              ? "border-amber-500/30 bg-amber-500/20 text-amber-400"
              : "border-transparent text-stone-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Icon className={`h-5 w-5 ${isActive ? "text-amber-400" : "text-stone-500"}`} />
          {item.name}
        </Link>
      );
    })}
  </nav>
);

const LogoutButton = ({ onLogout }) => (
  <div className="border-t border-white/10 p-4">
    <button
      onClick={onLogout}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-semibold text-red-300 transition-all hover:bg-red-500/20"
    >
      <FiLogOut className="h-4 w-4" />
      Logout
    </button>
  </div>
);

const Brand = ({ roleLabel }) => (
  <div>
    <h2 className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text font-serif text-2xl font-bold text-transparent">
      ComfyStay
    </h2>
    <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-stone-400">{roleLabel}</p>
  </div>
);

/*
  Copies each table's column headers onto its cells as data-label.
  On phones, index.css turns rows into labelled cards using those labels,
  so every panel table stays readable without per-page changes.
*/
const labelTableCells = (root) => {
  root.querySelectorAll("table").forEach((table) => {
    const headers = [...table.querySelectorAll("thead th")].map((th) => th.textContent.trim());
    if (headers.length === 0) return;

    table.querySelectorAll("tbody tr").forEach((row) => {
      [...row.children].forEach((cell, index) => {
        const label = headers[index] || "";
        if (cell.getAttribute("data-label") !== label) {
          cell.setAttribute("data-label", label);
        }
      });
    });
  });
};

const PanelLayout = ({ roleLabel, navItems, onLogout }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const contentRef = useRef(null);

  // Keep table cell labels in sync as pages load and re-render their rows
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    labelTableCells(root);

    const observer = new MutationObserver(() => labelTableCells(root));
    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const activeItem = navItems.find((item) => location.pathname.startsWith(item.path));

  // Escape closes the drawer; lock page scroll while it is open
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-stone-950 text-white selection:bg-amber-500 selection:text-white lg:flex lg:h-screen lg:overflow-hidden">
      {/* ===================================================
          DESKTOP SIDEBAR
      =================================================== */}

      <aside className="relative hidden w-64 flex-shrink-0 flex-col border-r border-white/10 bg-black/40 backdrop-blur-md lg:flex">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-[100px]" />

        <div className="relative z-10 p-6">
          <Brand roleLabel={roleLabel} />
        </div>

        <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
          <NavList navItems={navItems} pathname={location.pathname} />
          <LogoutButton onLogout={handleLogout} />
        </div>
      </aside>

      {/* ===================================================
          PHONE / TABLET TOP BAR
      =================================================== */}

      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-white/10 bg-stone-950/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">{roleLabel}</p>
          <p className="truncate font-serif text-lg font-bold leading-tight text-white">{activeItem?.name || "ComfyStay"}</p>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open panel menu"
          aria-expanded={menuOpen}
          aria-controls="panel-menu"
          className="shrink-0 rounded-full border border-white/15 bg-black/40 p-2.5 text-white transition-all hover:border-amber-400/50 hover:bg-black/80"
        >
          <FiMenu className="h-5 w-5" />
        </button>
      </header>

      {/* ===================================================
          PHONE / TABLET DRAWER
      =================================================== */}

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              id="panel-menu"
              role="dialog"
              aria-modal="true"
              aria-label={`${roleLabel} navigation`}
              className="fixed inset-y-0 right-0 z-50 flex h-full w-[82%] max-w-xs flex-col border-l border-white/15 bg-stone-950/80 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <Brand roleLabel={roleLabel} />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close panel menu"
                  className="rounded-full border border-white/15 bg-white/5 p-2 text-white hover:bg-white/10 hover:text-amber-400"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <NavList navItems={navItems} pathname={location.pathname} onNavigate={() => setMenuOpen(false)} />
              <LogoutButton onLogout={handleLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <main className="relative min-w-0 flex-1 lg:overflow-y-auto">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-purple-600/10 blur-[150px]" />

        <div ref={contentRef} className="panel-content relative p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PanelLayout;
