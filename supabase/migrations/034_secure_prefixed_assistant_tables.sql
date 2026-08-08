/**
 * Assistant persistence security
 *
 * Adds the missing ownership relationship and protects assistant rows through
 * Supabase Auth. Service-role repository calls still apply ownership filters
 * explicitly; these policies protect direct anon/authenticated database access.
 */

ALTER TABLE "sm_documents"
  ADD CONSTRAINT "sm_documents_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "sm_users"("id") ON DELETE CASCADE;

ALTER TABLE "sm_users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sm_chats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sm_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sm_documents" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sm_users_select_own"
  ON "sm_users" FOR SELECT
  USING ("auth_user_id" = auth.uid());

CREATE POLICY "sm_users_insert_own"
  ON "sm_users" FOR INSERT
  WITH CHECK ("auth_user_id" = auth.uid());

CREATE POLICY "sm_users_update_own"
  ON "sm_users" FOR UPDATE
  USING ("auth_user_id" = auth.uid())
  WITH CHECK ("auth_user_id" = auth.uid());

CREATE POLICY "sm_chats_select_own"
  ON "sm_chats" FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM "sm_users"
      WHERE "sm_users"."id" = "sm_chats"."userId"
        AND "sm_users"."auth_user_id" = auth.uid()
    )
  );

CREATE POLICY "sm_chats_insert_own"
  ON "sm_chats" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "sm_users"
      WHERE "sm_users"."id" = "sm_chats"."userId"
        AND "sm_users"."auth_user_id" = auth.uid()
    )
  );

CREATE POLICY "sm_chats_update_own"
  ON "sm_chats" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM "sm_users"
      WHERE "sm_users"."id" = "sm_chats"."userId"
        AND "sm_users"."auth_user_id" = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "sm_users"
      WHERE "sm_users"."id" = "sm_chats"."userId"
        AND "sm_users"."auth_user_id" = auth.uid()
    )
  );

CREATE POLICY "sm_chats_delete_own"
  ON "sm_chats" FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM "sm_users"
      WHERE "sm_users"."id" = "sm_chats"."userId"
        AND "sm_users"."auth_user_id" = auth.uid()
    )
  );

CREATE POLICY "sm_messages_select_own"
  ON "sm_messages" FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM "sm_chats"
      JOIN "sm_users" ON "sm_users"."id" = "sm_chats"."userId"
      WHERE "sm_chats"."id" = "sm_messages"."chatId"
        AND "sm_users"."auth_user_id" = auth.uid()
    )
  );

CREATE POLICY "sm_messages_insert_own"
  ON "sm_messages" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "sm_chats"
      JOIN "sm_users" ON "sm_users"."id" = "sm_chats"."userId"
      WHERE "sm_chats"."id" = "sm_messages"."chatId"
        AND "sm_users"."auth_user_id" = auth.uid()
    )
  );

CREATE POLICY "sm_documents_select_own"
  ON "sm_documents" FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM "sm_users"
      WHERE "sm_users"."id" = "sm_documents"."userId"
        AND "sm_users"."auth_user_id" = auth.uid()
    )
  );

CREATE POLICY "sm_documents_insert_own"
  ON "sm_documents" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "sm_users"
      WHERE "sm_users"."id" = "sm_documents"."userId"
        AND "sm_users"."auth_user_id" = auth.uid()
    )
  );

CREATE POLICY "sm_documents_update_own"
  ON "sm_documents" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM "sm_users"
      WHERE "sm_users"."id" = "sm_documents"."userId"
        AND "sm_users"."auth_user_id" = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "sm_users"
      WHERE "sm_users"."id" = "sm_documents"."userId"
        AND "sm_users"."auth_user_id" = auth.uid()
    )
  );

CREATE POLICY "sm_documents_delete_own"
  ON "sm_documents" FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM "sm_users"
      WHERE "sm_users"."id" = "sm_documents"."userId"
        AND "sm_users"."auth_user_id" = auth.uid()
    )
  );
