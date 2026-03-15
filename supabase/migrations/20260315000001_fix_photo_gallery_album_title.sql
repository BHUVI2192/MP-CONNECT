-- Ensure album creation payload matches live schema cache for photo_gallery_albums.
ALTER TABLE public.photo_gallery_albums
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';

-- Backfill title from legacy column names when present.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'photo_gallery_albums'
      AND column_name = 'album_name'
  ) THEN
    EXECUTE '
      UPDATE public.photo_gallery_albums
      SET title = COALESCE(NULLIF(title, ''''), album_name)
      WHERE COALESCE(title, '''') = ''''
    ';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'photo_gallery_albums'
      AND column_name = 'name'
  ) THEN
    EXECUTE '
      UPDATE public.photo_gallery_albums
      SET title = COALESCE(NULLIF(title, ''''), name)
      WHERE COALESCE(title, '''') = ''''
    ';
  END IF;
END $$;