DELETE FROM quiz_questions;
DELETE FROM quiz_subtopics;
DELETE FROM quiz_topics;

DELETE FROM quiz_questions_quiz_subtopic_lnk;
DELETE FROM quiz_questions_quiz_topic_lnk;
DELETE FROM quiz_subtopics_quiz_topic_lnk;

DELETE FROM sqlite_sequence WHERE name='quiz_questions';
DELETE FROM sqlite_sequence WHERE name='quiz_subtopics';
DELETE FROM sqlite_sequence WHERE name='quiz_topics';
