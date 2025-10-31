import React, { useEffect, useState } from "react";

import { useSettings } from "../context/SettingsContext";
import { VerseRenderer } from "./VerseRenderer";

interface Verse {
  number: number;
  text: string;
  jesus?: boolean;
}

interface Chapter {
  book: string;
  chapter: number;
  verses: Verse[];
}

export const BibleReader: React.FC<{ book: string; chapter: number }> = ({ book, chapter }) => {
  const { settings } = useSettings();
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    import(`../data/bibles/${settings.translation.toLowerCase()}.json`)
      .then((mod) => {
        const bible = mod.default;
        const found = bible.find(
          (c: Chapter) =>
            c.book.toLowerCase() === book.toLowerCase() && c.chapter === chapter
        );
        if (active) {
          setChapterData(found);
	console.log("Loaded chapter data:", found);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error loading Bible translation:", err);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [book, chapter, settings.translation]);

  if (loading) return <div className="p-4">Loading {settings.translation}...</div>;
  if (!chapterData) return <div className="p-4 text-red-600">Chapter not found.</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-3">
        {chapterData.book} {chapterData.chapter} ({settings.translation})
      </h2>
      <div className="leading-relaxed">
        {chapterData.verses.map((v) => (
          <VerseRenderer
            key={v.number}
            verse={v}
            redLetterEnabled={settings.redLetterEnabled}
          />
        ))}
      </div>
    </div>
  );
};
