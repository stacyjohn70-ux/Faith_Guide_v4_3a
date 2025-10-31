import React from "react";

interface Verse {
  number: number;
  text: string;
  jesus?: boolean;
}

export const VerseRenderer: React.FC<{
  verse: Verse;
  redLetterEnabled: boolean;
}> = ({ verse, redLetterEnabled }) => {
  // fallback: detect quotes in Gospels (very rough)
  const shouldRed =
    redLetterEnabled &&
    (verse.jesus ||
      verse.text.trim().startsWith("“") ||
      verse.text.trim().startsWith('"'));

  return (
    <p className="my-1">
      <sup className="font-bold opacity-90 mr-1">{verse.number}</sup>
      <span className={shouldRed ? "red-letter" : ""}>{verse.text}</span>
    </p>
  );
};
