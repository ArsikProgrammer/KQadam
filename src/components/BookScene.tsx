import { useEffect, useRef } from "react";
import { createBookScene, type BookSpec, type BookSceneHandle } from "../three/bookScene";

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handle = createBookScene(container, books, (id) => selectRef.current(id));
    handleRef.current = handle;
    return () => {
      handle.dispose();
      handleRef.current = null;
    };
  }, [books]);

  useEffect(() => {
    handleRef.current?.setOpen(openId);
  }, [openId]);

  return <div className="book-scene" ref={containerRef} aria-hidden="true" />;
}
