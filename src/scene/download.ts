declare const __CHIMERA_EXTERNAL_MOVIE__:string;

/** Keep ordinary builds local; only the limited hosted build uses the release copy. */
export function sceneVideoUrl(base:string,file:string,external=typeof __CHIMERA_EXTERNAL_MOVIE__==='undefined'?'':__CHIMERA_EXTERNAL_MOVIE__):string{
  return base==='/scenes/a-few-good-men/'&&file==='for-x.mp4'&&external?external:base+file;
}
