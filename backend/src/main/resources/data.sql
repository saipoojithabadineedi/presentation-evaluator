INSERT INTO users (id, name, email, password, avatar_url, tier, practice_hours, total_evaluations, average_score, average_cadence, filler_word_rate)
VALUES ('usr-101', 'User', 'user@example.com', 'password123', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', 'Top 5% speaker tier', 14.5, 8, 92, 135, 1.2);

INSERT INTO evaluations (id, user_id, presentation_id, title, date, formatted_date, duration, duration_seconds, file_type, file_size, overall_score, score_tier, average_cadence, cadence_status, filler_word_rate, filler_word_count, summary)
VALUES ('eval-101', 'usr-101', 'pres-101', 'Quarterly_Strategy_Keynote_2025.mp4', '2025-05-14', 'May 14, 2025', '4 min 30 sec', 270, 'video', '48.2 MB', 92, 'Top 5% speaker tier', 135, 'Optimal Cadence (130-150 WPM)', 1.2, 5, 'High-impact presentation rehearsal. Speech rate remained steady at 135 WPM with excellent tone clarity and minimal filler words.');

INSERT INTO evaluation_metrics (evaluation_id, delivery, content, visuals, pacing, clarity, engagement)
VALUES ('eval-101', 94, 90, 88, 96, 92, 90);

INSERT INTO transcript_segments (id, evaluation_id, start_time, seconds, speaker, text, wpm, tone)
VALUES ('seg-101', 'eval-101', '00:00', 0, 'Presenter', 'Thank you everyone for joining today''s strategy presentation.', 130, 'Enthusiastic');

INSERT INTO transcript_segments (id, evaluation_id, start_time, seconds, speaker, text, wpm, tone)
VALUES ('seg-102', 'eval-101', '00:30', 30, 'Presenter', 'We are addressing our core growth objectives for the upcoming quarter.', 138, 'Confident');
