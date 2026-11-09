import type { Phrase, Segment, Syllable } from "../wasm/types.ts";

/** Modern Greek text front end. Uses existing airway phonemes, with no English vowel reduction.
 * Orthographic rules checked against eSpeak NG's dictsource/el_rules; this implementation is independent.
 * Dialectal pronunciations, loanwords and optional sung hiatus can still need manual adjustment.
 */
export const hasGreek = (text:string):boolean => /\p{Script=Greek}/u.test(text);
type Phone = {ipa:string;text:string;stress:number;vowel:boolean};
const vowels:Record<string,string>={α:"a",ε:"e",η:"i",ι:"i",ο:"o",υ:"i",ω:"o"};
const consonants:Record<string,string>={β:"v",γ:"ɣ",δ:"ð",ζ:"z",θ:"θ",κ:"k",λ:"l",μ:"m",ν:"n",ξ:"ks",π:"p",ρ:"ɾ",σ:"s",ς:"s",τ:"t",φ:"f",χ:"x",ψ:"ps"};
const pairs:Record<string,string>={αι:"e",ει:"i",οι:"i",υι:"i",ου:"u",μπ:"b",ντ:"d",γκ:"g",γγ:"ŋg",γχ:"ŋx",τσ:"ts",τζ:"dz"};
const onsetClusters=new Set(["pɾ","pl","tɾ","dɾ","kɾ","kl","ɣɾ","ɣl","fɾ","fl","vɾ","vl","θɾ","ðɾ","xɾ","xl","sp","st","sk","sf","sθ","sm","sn","sl","stɾ","spɾ","skɾ","skl","sfɾ","zv","zm","zn","zɣ","zð","pj","bj","tj","dj","ðj","θj","fj","vj","sj","zj","ɾj","mj"]);
const bare=(s:string)=>s.normalize("NFD").replace(/\p{M}/gu,"");
const accented=(s:string)=>/[\u0300\u0301\u0342]/u.test(s.normalize("NFD"));
const diaeresis=(s:string)=>s.normalize("NFD").includes("\u0308");

function phones(word:string):Phone[]{
  const chars=Array.from(word.toLowerCase().normalize("NFC")),out:Phone[]=[];
  for(let i=0;i<chars.length;i++){
    const a=bare(chars[i]),b=bare(chars[i+1]??""),pair=a+b;
    if(!vowels[a]&&!consonants[a])continue;
    const paired=!!chars[i+1]&&!diaeresis(chars[i+1])&&!accented(chars[i])&&(pairs[pair]||["αυ","ευ","ηυ"].includes(pair));
    if(paired&&["αυ","ευ","ηυ"].includes(pair)){
      out.push({ipa:vowels[a],text:chars[i],stress:accented(chars[i+1])?1:0,vowel:true});
      out.push({ipa:"θκξπστφχψ".includes(bare(chars[i+2]??""))?"f":"v",text:chars[++i],stress:0,vowel:false});
    }else if(paired){
      const ipa=pairs[pair],text=chars[i]+chars[++i];
      if(ipa==="ŋg"||ipa==="ŋx")out.push({ipa:"ŋ",text:text[0],stress:0,vowel:false},{ipa:ipa.slice(1),text:text.slice(1),stress:0,vowel:false});
      else out.push({ipa,text,stress:accented(text)?1:0,vowel:Object.values(vowels).includes(ipa)||ipa==="u"});
    }else if(vowels[a])out.push({ipa:vowels[a],text:chars[i],stress:accented(chars[i])?1:0,vowel:true});
    else{
      const ipa=consonants[a],previous=out.at(-1);
      if(previous&&!previous.vowel&&bare(previous.text).endsWith(a))previous.text+=chars[i];
      else if(ipa==="ks"||ipa==="ps")out.push({ipa:ipa[0],text:chars[i],stress:0,vowel:false},{ipa:"s",text:"",stress:0,vowel:false});
      else out.push({ipa,text:chars[i],stress:0,vowel:false});
    }
  }
  out.forEach((p,i)=>{
    const next=out[i+1];
    if(next?.vowel&&["e","i"].includes(next.ipa))p.ipa=({k:"c",g:"ɟ",ɣ:"ʝ",x:"ç"} as Record<string,string>)[p.ipa]??p.ipa;
    if(p.ipa==="s"&&next&&["v","ð","ɣ","ʝ","z","m","n","ɲ","l","ʎ","ɾ","b","d","g","ɟ"].includes(next.ipa))p.ipa="z";
  });
  // Unstressed i before a vowel often becomes a palatal glide (παιδιά, χέρια, νιώθω).
  for(let i=1;i<out.length-1;i++){
    const p=out[i],prev=out[i-1],next=out[i+1];
    if(p.ipa!=="i"||p.stress||diaeresis(p.text)||prev.vowel||!next.vowel||bare(word.toLowerCase())==="αυριο")continue;
    const pal=({n:"ɲ",l:"ʎ",k:"c",g:"ɟ",ɣ:"ʝ",x:"ç",c:"c",ɟ:"ɟ",ʝ:"ʝ",ç:"ç"} as Record<string,string>)[prev.ipa];
    if(pal){prev.ipa=pal;prev.text+=p.text;out.splice(i--,1);}
    else{p.ipa="j";p.vowel=false;}
  }
  return out;
}
const segment=(p:Phone):Segment=>({ipa:p.ipa,...(p.stress?{stress:p.stress}:{})});
export function greekWord(word:string):Segment[]{
  const out=phones(word).map(segment);if(out.length)out[out.length-1].wordEnd=true;return out;
}
export function greekPhrases(text:string,english:(word:string)=>Segment[]=()=>[]):Phrase[]{
  return text.split(/[.!?;\u037e\n]+/u).map(part=>{
    const words=part.match(/[\p{Script=Greek}\p{M}]+|[a-zA-Z]+(?:['’][a-zA-Z]+)*/gu)??[];
    return {segments:words.flatMap(w=>hasGreek(w)?greekWord(w):english(w)),words,intonation:"statement" as const,pause:.3};
  }).filter(p=>p.segments.length);
}
export function greekSyllables(text:string,english:(word:string)=>Syllable[]=()=>[]):Syllable[]{
  const out:Syllable[]=[];
  let pending:Phone[]=[];
  for(const match of text.matchAll(/[\p{Script=Greek}\p{M}]+|[a-zA-Z]+(?:['’][a-zA-Z]+)*|[\n,.!?;\u037e]+|[~-]/gu)){
    const word=match[0];
    if(/^[\n,.!?;\u037e]/u.test(word)){if(out.length){out[out.length-1].coda.push(...pending.map(segment));out[out.length-1].phraseEnd=true;}pending=[];continue;}
    if(word==="~"||word==="-"){if(out.length)out.push({...out[out.length-1],text:"~",onset:[],coda:[],melisma:true,phraseEnd:false});continue;}
    if(!hasGreek(word)){out.push(...english(word));continue;}
    const p=[...pending,...phones(word)],nuclei=p.flatMap((v,i)=>v.vowel?[i]:[]);let start=0;
    if(!nuclei.length){pending=p;continue;}pending=[];
    nuclei.forEach((n,k)=>{
      const next=nuclei[k+1];let end=p.length;
      if(next!==undefined){
        const cluster=p.slice(n+1,next);let onset=cluster.length?1:0;
        for(let count=2;count<=cluster.length;count++)if(onsetClusters.has(cluster.slice(-count).map(v=>v.ipa).join("")))onset=count;
        end=next-onset;
        // The consonantal υ of αυ/ευ belongs to that spelling pair, even before ρ/λ.
        if(end<p.length&&!p[end].vowel&&bare(p[end].text)==="υ")end++;
      }
      out.push({text:p.slice(start,end).map(v=>v.text).join(""),onset:p.slice(start,n).map(segment),nucleus:segment(p[n]),coda:p.slice(n+1,end).map(segment),wordEnd:k===nuclei.length-1,phraseEnd:false});start=end;
    });
  }
  if(pending.length&&out.length)out[out.length-1].coda.push(...pending.map(segment));
  return out;
}
