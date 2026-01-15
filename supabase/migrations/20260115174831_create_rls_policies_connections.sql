-- Connections Policies
CREATE POLICY "Users can view own connections"
  ON public.connections FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send connection requests"
  ON public.connections FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Receivers can update connection status"
  ON public.connections FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Messages Policies
CREATE POLICY "Users can view messages in accepted connections"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.connections
      WHERE connections.id = messages.connection_id
      AND connections.status = 'accepted'
      AND (connections.requester_id = auth.uid() OR connections.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in accepted connections"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.connections
      WHERE connections.id = messages.connection_id
      AND connections.status = 'accepted'
      AND (connections.requester_id = auth.uid() OR connections.receiver_id = auth.uid())
    )
  );;
