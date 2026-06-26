"use client";

import { useState, useEffect, useCallback } from "react";
import ModalShell from "@/components/modals/ModalShell";
import {
  AboutModalContent,
  CancellationModalContent,
  PrivacyModalContent,
  ServicesModalContent,
  TeamModalContent,
  VisitModalContent,
} from "@/components/modals/ModalContents";
import {
  getModalMeta,
  parseModalHash,
  type ModalId,
} from "@/lib/modals";
import { MASTERS } from "@/data/content";
import { useUiShell } from "@/components/UiShellProvider";

function renderContent(id: ModalId) {
  switch (id) {
    case "menu":
      return <ServicesModalContent />;
    case "team":
      return <TeamModalContent />;
    case "about":
      return <AboutModalContent />;
    case "visit":
      return <VisitModalContent />;
    case "privacy":
      return <PrivacyModalContent />;
    case "cancellation":
      return <CancellationModalContent />;
  }
}

function resolveMeta(id: ModalId) {
  const meta = getModalMeta(id);
  if (id === "team") {
    return { ...meta, subtitle: `${MASTERS.length} Stylists` };
  }
  return meta;
}

export default function ModalHost() {
  const { setModalOpen } = useUiShell();
  const [active, setActive] = useState<ModalId | null>(null);

  const syncFromHash = useCallback(() => {
    setActive(parseModalHash(window.location.hash));
  }, []);

  useEffect(() => {
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [syncFromHash]);

  useEffect(() => {
    setModalOpen(!!active);
  }, [active, setModalOpen]);

  const close = useCallback(() => {
    const { pathname, search } = window.location;
    window.history.replaceState(null, "", `${pathname}${search}`);
    setActive(null);
  }, []);

  if (!active) return null;

  const meta = resolveMeta(active);

  return (
    <ModalShell meta={meta} isOpen={!!active} onClose={close}>
      {renderContent(active)}
    </ModalShell>
  );
}
