import {BASE_PATH} from "../../base.ts";

/** Hosted in a subfolder of a larger site, the app offers a way back to that site's front page. */
export function HomeLink(){
  if(BASE_PATH==="/")return null;
  return <a className="home-link" href="/" aria-label={`Back to ${location.host}`}>← {location.host}</a>;
}
