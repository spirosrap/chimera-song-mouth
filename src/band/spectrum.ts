/** A window of the prepared audio at its playback clock; no live audio routing. */
export class PreparedSpectrum {
  readonly size=2048;
  readonly bins=new Float32Array(this.size/2);
  private real=new Float64Array(this.size);
  private imaginary=new Float64Array(this.size);
  private reversed=Uint16Array.from({length:this.size},(_,i)=>{
    let r=0;for(let b=0;b<11;b++){r=(r<<1)|(i&1);i>>=1;}return r;
  });
  private window=Float64Array.from({length:this.size},(_,i)=>.5-.5*Math.cos(2*Math.PI*i/(this.size-1)));
  private scale=2/this.window.reduce((a,b)=>a+b,0);
  at(samples:Float32Array,sampleRate:number,time:number,gain=1):Float32Array{
    const start=Math.floor(Math.max(0,Number.isFinite(time)?time:0)*sampleRate)-this.size/2;
    for(let i=0;i<this.size;i++){
      this.real[this.reversed[i]]=(samples[start+i]??0)*this.window[i]*gain;
      this.imaginary[i]=0;
    }
    for(let width=2;width<=this.size;width*=2){
      const angle=-2*Math.PI/width,cr=Math.cos(angle),ci=Math.sin(angle);
      for(let base=0;base<this.size;base+=width){
        let wr=1,wi=0;
        for(let j=0;j<width/2;j++){
          const a=base+j,b=a+width/2,tr=wr*this.real[b]-wi*this.imaginary[b],ti=wr*this.imaginary[b]+wi*this.real[b];
          this.real[b]=this.real[a]-tr;this.imaginary[b]=this.imaginary[a]-ti;
          this.real[a]+=tr;this.imaginary[a]+=ti;
          const next=wr*cr-wi*ci;wi=wr*ci+wi*cr;wr=next;
        }
      }
    }
    for(let i=0;i<this.bins.length;i++)this.bins[i]=Math.hypot(this.real[i],this.imaginary[i])*this.scale;
    return this.bins;
  }
}
