import React, {
  useCallback,
  useEffect,
  type AnchorHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent
} from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      click: React.DetailedHTMLProps<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
      > & {
        to: string;
      };
    }
  }
}

export interface ClickProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  prefetch?: boolean;
  replace?: boolean;
  activeClassName?: string;
  children: React.ReactNode;
}

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

function isExternalTo(to: string): boolean {
  return (
    to.startsWith("http://") ||
    to.startsWith("https://") ||
    to.startsWith("//") ||
    to.startsWith("mailto:") ||
    to.startsWith("tel:")
  );
}

function getCurrentPathname(): string {
  if (typeof window === "undefined") {
    return "/";
  }

  return window.location.pathname;
}

function getPathnameFromTo(to: string): string {
  if (typeof window === "undefined") {
    return to.split(/[?#]/)[0] || "/";
  }

  try {
    return new URL(to, window.location.origin).pathname;
  } catch {
    return to.split(/[?#]/)[0] || "/";
  }
}

function navigate(to: string, shouldReplace: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  const navigationState = {
    source: "rakta-click",
    to
  };

  if (shouldReplace) {
    window.history.replaceState(navigationState, "", to);
  } else {
    window.history.pushState(navigationState, "", to);
  }

  // Dispatch a custom navigation event so the router can react
  window.dispatchEvent(
    new PopStateEvent("popstate", {
      state: navigationState
    })
  );
}

function openExternalTo(to: string, target: string): void {
  if (typeof window === "undefined") {
    return;
  }

  if (target === "_blank") {
    window.open(to, "_blank", "noopener,noreferrer");
    return;
  }

  window.location.assign(to);
}

function prefetchPage(to: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const targetUrl = new URL(to, window.location.origin).href;
  const existingLinks = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="prefetch"]')
  );

  const alreadyPrefetched = existingLinks.some((link) => link.href === targetUrl);

  if (alreadyPrefetched) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = targetUrl;
  link.as = "document";

  document.head.appendChild(link);
}

export function Click({
  to,
  prefetch = false,
  replace = false,
  activeClassName,
  className,
  children,
  onClick,
  onKeyDown,
  style,
  target,
  rel,
  ...rest
}: ClickProps): React.ReactElement {
  const isExternal = isExternalTo(to);
  const isActive = !isExternal && getCurrentPathname() === getPathnameFromTo(to);

  const resolvedClassName =
    [className, isActive && activeClassName].filter(Boolean).join(" ") ||
    undefined;

  useEffect(() => {
    if (!prefetch || isExternal) {
      return;
    }

    prefetchPage(to);
  }, [prefetch, isExternal, to]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);

      // Let the browser handle modified clicks and default prevented events
      if (
        event.defaultPrevented ||
        isModifiedEvent(event)
      ) {
        return;
      }

      if (isExternal) {
        event.preventDefault();
        openExternalTo(to, target ?? "_blank");
        return;
      }

      if (target === "_blank") {
        return;
      }

      event.preventDefault();
      navigate(to, replace);
    },
    [isExternal, onClick, replace, target, to]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLAnchorElement>) => {
      onKeyDown?.(event);

      // Let the browser handle default prevented events and non-enter keys
      if (
        event.defaultPrevented ||
        event.key !== "Enter"
      ) {
        return;
      }

      if (isExternal) {
        event.preventDefault();
        openExternalTo(to, target ?? "_blank");
        return;
      }

      if (target === "_blank") {
        return;
      }

      event.preventDefault();
      navigate(to, replace);
    },
    [isExternal, onKeyDown, replace, target, to]
  );

  if (isExternal) {
    return (
      <click
        {...rest}
        to={to}
        className={resolvedClassName}
        style={style}
        target={target ?? "_blank"}
        rel={rel ?? "noopener noreferrer"}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {children}
      </click>
    );
  }

  return (
    <click
      {...rest}
      to={to}
      className={resolvedClassName}
      style={style}
      target={target}
      rel={rel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </click>
  );
}

export default Click;