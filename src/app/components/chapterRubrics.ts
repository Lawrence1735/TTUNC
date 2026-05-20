export interface Rubric {
  title: string;
  objective: string;
  criteria: Array<{ key: string; label: string }>;
}

export function getChapterRubric(talentGroup: string, chapterNum: number): Rubric | null {
  // Universal criteria for all chapters
  const universalCriteria = [
    { key: 'understanding', label: 'Demonstrates understanding of the material' },
    { key: 'attentiveness', label: 'Shows attentiveness and active listening' },
    { key: 'technical', label: 'Executes technical aspects correctly' },
    { key: 'preparation', label: 'Arrives prepared with necessary materials' },
    { key: 'mastery', label: 'Exhibits mastery of assigned tasks/routines' },
    { key: 'cleanliness', label: 'Helps maintain cleanliness and orderliness' },
  ];

  const chapterTitles: Record<number, string> = {
    1: 'Introduction to Basics',
    2: 'Posture and Breath Control',
    3: 'Tone Production',
    4: 'Rhythm and Tempo',
    5: 'Musical Expression',
    6: 'Ensemble Coordination',
    7: 'Advanced Technique',
    8: 'Performance Preparation',
    9: 'Interpretation and Phrasing',
    10: 'Sight Reading and Improvisation',
    11: 'Solo Performance Fundamentals',
    12: 'Collaborative Performance',
    13: 'Music Theory Application',
    14: 'Sectional Coordination',
    15: 'Dynamic Control and Balance',
    16: 'Stage Presence and Confidence',
    17: 'Advanced Ensemble Skills',
    18: 'Special Performance Techniques',
    19: 'Leadership and Mentoring',
    20: 'Professional Development',
    21: 'Repertoire Expansion',
    22: 'Technical Mastery Review',
    23: 'Advanced Performance Analysis',
    24: 'Music History and Context',
    25: 'Composition and Arrangement',
    26: 'Teaching and Communication',
    27: 'Career Pathways and Opportunities',
    28: 'Personal Artistry Development',
    29: 'Final Technical Assessment',
  };

  const chapterObjectives: Record<number, string> = {
    1: 'Foundational knowledge and readiness',
    2: 'Physical foundation for sound production',
    3: 'Quality tone development',
    4: 'Rhythmic accuracy and consistency',
    5: 'Expressive performance skills',
    6: 'Group coordination and timing',
    7: 'Advanced technical proficiency',
    8: 'Ready for performance situations',
    9: 'Musical nuance and interpretation',
    10: 'Flexibility and improvisation skills',
    11: 'Individual performance capability',
    12: 'Partnership and ensemble work',
    13: 'Applied music theory knowledge',
    14: 'Section-level coordination',
    15: 'Balance and dynamic awareness',
    16: 'Confident stage presence',
    17: 'Complex ensemble techniques',
    18: 'Specialized performance techniques',
    19: 'Mentor and guide others',
    20: 'Professional standards mastery',
    21: 'Broad musical knowledge',
    22: 'Technical excellence confirmation',
    23: 'Advanced analytical skills',
    24: 'Historical and cultural awareness',
    25: 'Creative musicianship',
    26: 'Teaching and communication skills',
    27: 'Career awareness and planning',
    28: 'Personal artistic expression',
    29: 'Final readiness assessment',
  };

  if (chapterNum < 1 || chapterNum > 29) {
    return null;
  }

  return {
    title: chapterTitles[chapterNum] || `Chapter ${chapterNum}`,
    objective: chapterObjectives[chapterNum] || 'Chapter training objective',
    criteria: universalCriteria,
  };
}
