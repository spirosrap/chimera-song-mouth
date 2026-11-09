export const MOVIE_SCENES = [
  {id:'a-few-good-men',title:'A Few Good Men',eyebrow:'PHYSICAL VOICES · A CINEMATIC COURTROOM',description:'The courtroom confrontation, reconstructed with CHIMERA’s physical voices and animated wireframe characters.',credit:'A stylized reconstruction of the supplied A Few Good Men clip (1992), written by Aaron Sorkin and directed by Rob Reiner. The courtroom, uniforms, gestures and camera framing are built around the working mouth models.',readyVideo:'for-x.mp4'},
  {id:'princess-bride',title:'The Princess Bride',eyebrow:'PHYSICAL VOICES · THE CLIFFS OF INSANITY',description:'Inconceivable! The complete rope-climbing scene, with three physical voices, a giant, a masked pursuer and a rather precarious cliff.',credit:'A stylized reconstruction of the supplied The Princess Bride clip (1987), written by William Goldman and directed by Rob Reiner. The cliffs, ocean, rope climb and fantasy costumes are built around three working mouth models.',readyVideo:undefined},
] as const;
export type MovieSceneId=typeof MOVIE_SCENES[number]['id'];
export const movieScene=(id:string|null)=>MOVIE_SCENES.find(s=>s.id===id);
