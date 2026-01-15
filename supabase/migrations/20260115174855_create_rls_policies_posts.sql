-- Posts Policies
CREATE POLICY "Approved posts viewable by authenticated users"
  ON public.posts FOR SELECT
  USING (auth.role() = 'authenticated' AND moderation_status = 'approved');

CREATE POLICY "Verified users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_verified = true
    )
  );

CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = author_id);

-- Post Comments Policies
CREATE POLICY "Comments viewable on approved posts"
  ON public.post_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_comments.post_id
      AND posts.moderation_status = 'approved'
    )
  );

CREATE POLICY "Verified users can create comments"
  ON public.post_comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_verified = true
    )
  );

CREATE POLICY "Users can update own comments"
  ON public.post_comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments"
  ON public.post_comments FOR DELETE
  USING (auth.uid() = author_id);;
