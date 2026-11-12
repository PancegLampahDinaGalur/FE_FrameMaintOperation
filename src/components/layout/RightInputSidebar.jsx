import React from "react";

export function RightInputSidebar({
  isOpen,
  onClose,
  eyebrow,
  title,
  subtitle,
  headerActions,
  children,
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="sidebar-backdrop is-visible" onClick={onClose} />
      <aside className="right-input-sidebar is-open">
        <button type="button" className="sidebar-close-btn" onClick={onClose} aria-label="Tutup">
          ✕
        </button>
        <div className="sidebar-content">
          <div className="sidebar-header-row">
            <div>
              {eyebrow && <p className="sidebar-kicker">{eyebrow}</p>}
              <h3>{title}</h3>
            </div>
            {headerActions}
          </div>
          {subtitle && <p className="sidebar-subtitle">{subtitle}</p>}
          {children}
        </div>
      </aside>
    </>
  );
}
