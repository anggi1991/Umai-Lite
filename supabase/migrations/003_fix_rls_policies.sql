-- Migration 003: Fix RLS policies to allow INSERT/UPDATE operations
-- Run after 001_init.sql and 002_add_profile_trigger.sql

-- PROFILES
DROP POLICY IF EXISTS "users_can_manage_own_profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- CHILDREN
DROP POLICY IF EXISTS "users_can_manage_own_children" ON children;
DROP POLICY IF EXISTS "children_select" ON children;
DROP POLICY IF EXISTS "children_insert" ON children;
DROP POLICY IF EXISTS "children_update" ON children;
DROP POLICY IF EXISTS "children_delete" ON children;
CREATE POLICY "children_select" ON children FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "children_insert" ON children FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "children_update" ON children FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "children_delete" ON children FOR DELETE USING (user_id = auth.uid());

-- ACTIVITIES
DROP POLICY IF EXISTS "users_can_manage_own_activities" ON activities;
DROP POLICY IF EXISTS "activities_select" ON activities;
DROP POLICY IF EXISTS "activities_insert" ON activities;
DROP POLICY IF EXISTS "activities_update" ON activities;
DROP POLICY IF EXISTS "activities_delete" ON activities;
CREATE POLICY "activities_select" ON activities FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "activities_insert" ON activities FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "activities_update" ON activities FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "activities_delete" ON activities FOR DELETE USING (user_id = auth.uid());

-- REMINDERS
DROP POLICY IF EXISTS "users_can_manage_own_reminders" ON reminders;
DROP POLICY IF EXISTS "reminders_select" ON reminders;
DROP POLICY IF EXISTS "reminders_insert" ON reminders;
DROP POLICY IF EXISTS "reminders_update" ON reminders;
DROP POLICY IF EXISTS "reminders_delete" ON reminders;
CREATE POLICY "reminders_select" ON reminders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "reminders_insert" ON reminders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "reminders_update" ON reminders FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "reminders_delete" ON reminders FOR DELETE USING (user_id = auth.uid());

-- DAILY TIPS
DROP POLICY IF EXISTS "users_can_manage_own_tips" ON daily_tips;
DROP POLICY IF EXISTS "daily_tips_select" ON daily_tips;
DROP POLICY IF EXISTS "daily_tips_insert" ON daily_tips;
DROP POLICY IF EXISTS "daily_tips_update" ON daily_tips;
DROP POLICY IF EXISTS "daily_tips_delete" ON daily_tips;
CREATE POLICY "daily_tips_select" ON daily_tips FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "daily_tips_insert" ON daily_tips FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "daily_tips_update" ON daily_tips FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "daily_tips_delete" ON daily_tips FOR DELETE USING (user_id = auth.uid());

-- CHAT SESSIONS
DROP POLICY IF EXISTS "users_can_manage_own_chat_sessions" ON chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_select" ON chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_insert" ON chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_update" ON chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_delete" ON chat_sessions;
CREATE POLICY "chat_sessions_select" ON chat_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "chat_sessions_insert" ON chat_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "chat_sessions_update" ON chat_sessions FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "chat_sessions_delete" ON chat_sessions FOR DELETE USING (user_id = auth.uid());

-- MESSAGES
DROP POLICY IF EXISTS "users_can_manage_own_messages" ON messages;
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "messages_update" ON messages;
DROP POLICY IF EXISTS "messages_delete" ON messages;
CREATE POLICY "messages_select" ON messages FOR SELECT USING (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid()));
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid()));
CREATE POLICY "messages_update" ON messages FOR UPDATE USING (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())) WITH CHECK (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid()));
CREATE POLICY "messages_delete" ON messages FOR DELETE USING (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid()));

-- MEDIA
DROP POLICY IF EXISTS "users_can_manage_own_media" ON media;
DROP POLICY IF EXISTS "media_select" ON media;
DROP POLICY IF EXISTS "media_insert" ON media;
DROP POLICY IF EXISTS "media_update" ON media;
DROP POLICY IF EXISTS "media_delete" ON media;
CREATE POLICY "media_select" ON media FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "media_insert" ON media FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "media_update" ON media FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "media_delete" ON media FOR DELETE USING (user_id = auth.uid());

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "users_can_manage_own_subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_select" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_update" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_delete" ON subscriptions;
CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "subscriptions_insert" ON subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "subscriptions_update" ON subscriptions FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "subscriptions_delete" ON subscriptions FOR DELETE USING (user_id = auth.uid());

-- NOTIFICATION LOGS
DROP POLICY IF EXISTS "users_can_view_own_notifications" ON notification_logs;
DROP POLICY IF EXISTS "notification_logs_select" ON notification_logs;
DROP POLICY IF EXISTS "notification_logs_insert" ON notification_logs;
CREATE POLICY "notification_logs_select" ON notification_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notification_logs_insert" ON notification_logs FOR INSERT WITH CHECK (user_id = auth.uid());

-- AUDIT LOGS
DROP POLICY IF EXISTS "users_can_view_own_audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT WITH CHECK (user_id = auth.uid());

-- NOTE: For tables that should not be user-editable (e.g., audit logs), skip UPDATE/DELETE policies deliberately.
