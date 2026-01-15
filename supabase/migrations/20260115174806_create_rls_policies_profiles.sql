-- Profiles Policies
CREATE POLICY "Verified profiles viewable by authenticated users"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated' AND is_verified = true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Interests Policies
CREATE POLICY "Interests viewable for verified users"
  ON public.user_interests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = user_interests.user_id
      AND profiles.is_verified = true
    )
  );

CREATE POLICY "Users can manage own interests"
  ON public.user_interests FOR ALL
  USING (auth.uid() = user_id);;
