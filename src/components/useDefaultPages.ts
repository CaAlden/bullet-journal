import { IPage, PageType, PageCodec } from "../io/page";
import { useTrackedValue } from "../io/useTrackedValue";
import { pipe } from "fp-ts/lib/pipeable";
import { fold } from "fp-ts/lib/Option";
import { useStorage } from "../io/db";
import { identity } from "fp-ts/lib/function";

const NOTES_KEY = '__default_notes';
const NOTE_DEFAULT: IPage = {
  id: NOTES_KEY,
  start: new Date(0),
  // Largest representable date
  end: new Date(8640000000000000),
  type: PageType.Notes,
  tasks: [] as string[],
  name: 'Notes',
};

export const useDefaultPages = () => {
  const notes = useTrackedValue({ id: NOTES_KEY, type: PageCodec });
  const storage = useStorage();
  const notePage = pipe(
    notes,
    fold(
      () => {
        storage.serialize(NOTE_DEFAULT, PageCodec)();
        return NOTE_DEFAULT;
      },
      identity,
    )
  );

  return [notePage];
}
