import { SpellingWord } from '../types';

export interface PresetList {
  id: string;
  title: string;
  description: string;
  badge: string;
  words: SpellingWord[];
}

export const PRESET_WORD_LISTS: PresetList[] = [
  {
    id: 'starter',
    title: 'Warmup & Essentials',
    description: 'Everyday words that catch people off guard.',
    badge: 'Popular',
    words: [
      { id: 'w1', word: 'friend', hint: 'Someone you like and know well' },
      { id: 'w2', word: 'because', hint: 'For the reason that' },
      { id: 'w3', word: 'beautiful', hint: 'Pleasing to the senses or to the eye' },
      { id: 'w4', word: 'rhythm', hint: 'A regular, repeated pattern of movement or sound' },
      { id: 'w5', word: 'guarantee', hint: 'A formal promise that certain conditions will be fulfilled' },
    ],
  },
  {
    id: 'homophones',
    title: 'Tricky Silent Letters',
    description: 'Words with silent letters and unusual phonetic spellings.',
    badge: 'Tricky',
    words: [
      { id: 'h1', word: 'subtle', hint: 'So delicate or precise as to be difficult to analyze' },
      { id: 'h2', word: 'autumn', hint: 'The season between summer and winter' },
      { id: 'h3', word: 'doubt', hint: 'A feeling of uncertainty or lack of conviction' },
      { id: 'h4', word: 'island', hint: 'A piece of land surrounded by water' },
      { id: 'h5', word: 'Wednesday', hint: 'The day of the week before Thursday' },
      { id: 'h6', word: 'knight', hint: 'A man granted an honorary title of knighthood' },
    ],
  },
  {
    id: 'bee-champions',
    title: 'Spelling Bee Classics',
    description: 'Classic championship competition words.',
    badge: 'Advanced',
    words: [
      { id: 'c1', word: 'hierarchy', hint: 'A system in which members are ranked according to status' },
      { id: 'c2', word: 'questionnaire', hint: 'A set of printed questions with a choice of answers' },
      { id: 'c3', word: 'rendezvous', hint: 'A meeting at an agreed time and place' },
      { id: 'c4', word: 'mischievous', hint: 'Causing or showing a fondness for causing trouble playfully' },
      { id: 'c5', word: 'accommodation', hint: 'A room or building in which someone may live or stay' },
      { id: 'c6', word: 'bureaucracy', hint: 'A system of government with many complicated rules' },
    ],
  },
  {
    id: 'nature-science',
    title: 'Science & Animal Kingdom',
    description: 'Fascinating scientific and biological words.',
    badge: 'Science',
    words: [
      { id: 'n1', word: 'metamorphosis', hint: 'The process of transformation from immature to adult form' },
      { id: 'n2', word: 'photosynthesis', hint: 'Process used by plants to convert light energy into chemical energy' },
      { id: 'n3', word: 'camouflage', hint: 'The disguising of military personnel, equipment, or animals' },
      { id: 'n4', word: 'ecosystem', hint: 'A biological community of interacting organisms and their physical environment' },
      { id: 'n5', word: 'temperature', hint: 'The degree of heat present in an object or fluid' },
    ],
  },
  {
    id: 'double-letters',
    title: 'Double Letter Traps',
    description: 'Words that test whether single or double consonants are needed.',
    badge: 'Challenge',
    words: [
      { id: 'd1', word: 'embarrass', hint: 'Cause someone to feel awkward, self-conscious, or ashamed' },
      { id: 'd2', word: 'recommend', hint: 'Put forward someone or something as being suitable' },
      { id: 'd3', word: 'occurrence', hint: 'An incident or event that happens' },
      { id: 'd4', word: 'committee', hint: 'A group of people appointed for a specific function' },
      { id: 'd5', word: 'parallel', hint: 'Side by side and having the same distance continuously' },
    ],
  },
];
