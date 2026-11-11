import {planDialoguePart,type DialogueLine,type DialoguePerformance} from './dialogue.ts';
import type {ContactPerson} from './contact.ts';
export type ContactLine=DialogueLine<ContactPerson>;
export type ContactPerformance=DialoguePerformance<ContactPerson>;
/** Keep Contact's prepared physical score unchanged while sharing its word-timing planner. */
export const planContactPart=(score:ContactPerformance,id:ContactPerson)=>planDialoguePart(score,id);
