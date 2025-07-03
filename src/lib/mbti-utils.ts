
export type MbtiDimensionAnswer = 'A' | 'B' | undefined; // Allow undefined for unanswered
export type MbtiDimensionAnswers = [
  MbtiDimensionAnswer, MbtiDimensionAnswer, MbtiDimensionAnswer, MbtiDimensionAnswer,
  MbtiDimensionAnswer, MbtiDimensionAnswer, MbtiDimensionAnswer
];

export interface MbtiQuestionnaireAnswers {
  eiAnswers: MbtiDimensionAnswers; 
  snAnswers: MbtiDimensionAnswers; 
  tfAnswers: MbtiDimensionAnswers; 
  jpAnswers: MbtiDimensionAnswers; 
}

export interface MbtiResult {
  ei: { scoreE: number; scoreI: number; tendency: 'E' | 'I' | 'Unknown'; typeChar: 'E' | 'I' | 'X' };
  sn: { scoreS: number; scoreN: number; tendency: 'S' | 'N' | 'Unknown'; typeChar: 'S' | 'N' | 'X' };
  tf: { scoreT: number; scoreF: number; tendency: 'T' | 'F' | 'Unknown'; typeChar: 'T' | 'F' | 'X' };
  jp: { scoreJ: number; scoreP: number; tendency: 'J' | 'P' | 'Unknown'; typeChar: 'J' | 'P' | 'X' };
  type: string; // e.g., "ISTJ", or "IXTJ" if SN is unknown
  isComplete: boolean;
}

/**
 * Checks if all 28 MBTI questions have been answered.
 * @param answers The user's answers to the MBTI questionnaire.
 * @returns True if all answers are provided, false otherwise.
 */
export function areMbtiAnswersComplete(answers: MbtiQuestionnaireAnswers | undefined): answers is Required<MbtiQuestionnaireAnswers> {
  if (!answers) return false;
  const allDimensions = [answers.eiAnswers, answers.snAnswers, answers.tfAnswers, answers.jpAnswers];
  for (const dimAnswers of allDimensions) {
    if (!dimAnswers || dimAnswers.length !== 7 || dimAnswers.some(ans => ans === undefined)) {
      return false;
    }
  }
  return true;
}


/**
 * Calculates the MBTI type based on the 28-question forced-choice questionnaire.
 * Assumes 'A' maps to the first letter of the dichotomy (E, S, T, J)
 * and 'B' maps to the second letter (I, N, F, P).
 *
 * @param answers The user's answers to the 28 questions.
 * @returns The calculated MBTI result including scores and the 4-letter type. Returns null if not all answers are provided.
 */
export function calculateMbtiType(answers: MbtiQuestionnaireAnswers): MbtiResult | null {
  if (!areMbtiAnswersComplete(answers)) {
    return null; // Or handle partial calculation if desired, but for now, require all.
  }

  const calculateDimension = (
    dimAnswers: MbtiDimensionAnswers, // Now guaranteed to be fully answered
    charA: 'E' | 'S' | 'T' | 'J',
    charB: 'I' | 'N' | 'F' | 'P'
  ) => {
    let scoreA = 0;
    let scoreB = 0;

    dimAnswers.forEach(answer => {
      if (answer === 'A') {
        scoreA++;
      } else if (answer === 'B') { // Ensure 'B' before incrementing scoreB
        scoreB++;
      }
    });
    
    const tendency = scoreA >= 4 ? charA : charB;
    
    return { scoreA, scoreB, tendency, typeChar: tendency };
  };

  const eiResult = calculateDimension(answers.eiAnswers as MbtiDimensionAnswers, 'E', 'I');
  const snResult = calculateDimension(answers.snAnswers as MbtiDimensionAnswers, 'S', 'N');
  const tfResult = calculateDimension(answers.tfAnswers as MbtiDimensionAnswers, 'T', 'F');
  const jpResult = calculateDimension(answers.jpAnswers as MbtiDimensionAnswers, 'J', 'P');

  const mbtiType = `${eiResult.typeChar}${snResult.typeChar}${tfResult.typeChar}${jpResult.typeChar}`;

  return {
    ei: { 
      scoreE: eiResult.scoreA, 
      scoreI: eiResult.scoreB, 
      tendency: (eiResult.tendency === 'E' || eiResult.tendency === 'I') ? eiResult.tendency : 'Unknown' as 'E' | 'I' | 'Unknown',
      typeChar: (eiResult.typeChar === 'E' || eiResult.typeChar === 'I') ? eiResult.typeChar : 'X' as 'E' | 'I' | 'X'
    },
    sn: { 
      scoreS: snResult.scoreA, 
      scoreN: snResult.scoreB, 
      tendency: (snResult.tendency === 'S' || snResult.tendency === 'N') ? snResult.tendency : 'Unknown' as 'S' | 'N' | 'Unknown',
      typeChar: (snResult.typeChar === 'S' || snResult.typeChar === 'N') ? snResult.typeChar : 'X' as 'S' | 'N' | 'X'
    },
    tf: { 
      scoreT: tfResult.scoreA, 
      scoreF: tfResult.scoreB, 
      tendency: (tfResult.tendency === 'T' || tfResult.tendency === 'F') ? tfResult.tendency : 'Unknown' as 'T' | 'F' | 'Unknown',
      typeChar: (tfResult.typeChar === 'T' || tfResult.typeChar === 'F') ? tfResult.typeChar : 'X' as 'T' | 'F' | 'X'
    },
    jp: { 
      scoreJ: jpResult.scoreA, 
      scoreP: jpResult.scoreB, 
      tendency: (jpResult.tendency === 'J' || jpResult.tendency === 'P') ? jpResult.tendency : 'Unknown' as 'J' | 'P' | 'Unknown',
      typeChar: (jpResult.typeChar === 'J' || jpResult.typeChar === 'P') ? jpResult.typeChar : 'X' as 'J' | 'P' | 'X'
    },
    type: mbtiType,
    isComplete: true,
  };
}

    