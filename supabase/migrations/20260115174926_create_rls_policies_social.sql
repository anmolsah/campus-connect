-- Post Likes Policies
CREATE POLICY "Likes are viewable"
  ON public.post_likes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Verified users can like posts"
  ON public.post_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_verified = true
    )
  );

CREATE POLICY "Users can remove own likes"
  ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Saved Posts Policies
CREATE POLICY "Users can view own saved posts"
  ON public.saved_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts"
  ON public.saved_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts"
  ON public.saved_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Content Reports Policies
CREATE POLICY "Users can view own reports"
  ON public.content_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Verified users can create reports"
  ON public.content_reports FOR INSERT
  WITH CHECK (
    auth.uid() = reporter_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_verified = true
    )
  );

-- User Violations Policies
CREATE POLICY "Users can view own violations"
  ON public.user_violations FOR SELECT
  USING (auth.uid() = user_id);;
