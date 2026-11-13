import { useEffect, useRef } from "react";
import type { BookSpec, BookSceneHandle } from "../three/bookScene";

interface BookSceneProps {
  books: BookSpec[];
  openId: string | null;
  onSelect: (id: string) => void;
}

export function BookScene({ books, openId, onSelect }: BookSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<BookSceneHandle | null>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  const openIdRef = useRef(openId);
  openIdRef.current = openId;

  useEffect(() => {
    let disposed = false;
    let handle: BookSceneHandle | null = null;

    import("../three/bookScene").then(({ createBookScene }) => {
      const container = containerRef.current;
      if (disposed || !container) return;
      handle = createBookScene(container, books, (id) => selectRef.current(id));
      handle.setOpen(openIdRef.current);
      handleRef.current = handle;
    });

    return () => {
      disposed = true;
      handle?.dispose();
      handleRef.current = null;
    };
  }, [books]);

  useEffect(() => {
    handleRef.current?.setOpen(openId);
  }, [openId]);

  return <div className="book-scene" ref={containerRef} aria-hidden="true" />;
}
