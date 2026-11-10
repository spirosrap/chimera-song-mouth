import {test,expect} from 'bun:test';
import {PreparedSpectrum} from '../src/band/spectrum.ts';

test('prepared harmonics locate a known audio frequency and respond to channel level',()=>{
 const fft=new PreparedSpectrum(),rate=48000,bin=32,frequency=bin*rate/fft.size;
 const samples=Float32Array.from({length:rate},(_,i)=>.7*Math.sin(2*Math.PI*frequency*i/rate));
 const full=Array.from(fft.at(samples,rate,.5));
 expect(full.indexOf(Math.max(...full))).toBe(bin);expect(full[bin]).toBeCloseTo(.7,3);
 const half=fft.at(samples,rate,.5,.5);expect(half[bin]).toBeCloseTo(full[bin]/2,5);
 expect(fft.at(samples,rate,.5,0).every(x=>x===0)).toBe(true);
});

test('seeking uses the audio clock without retaining a spectrum from another position',()=>{
 const fft=new PreparedSpectrum(),rate=48000;
 const samples=Float32Array.from({length:rate},(_,i)=>i<rate/2?Math.sin(2*Math.PI*375*i/rate):0);
 const before=Array.from(fft.at(samples,rate,.25));
 expect(fft.at(samples,rate,.75).every(x=>x===0)).toBe(true);
 expect(Array.from(fft.at(samples,rate,.25))).toEqual(before);
 expect(fft.at(samples,rate,3).every(x=>x===0)).toBe(true);
 expect(fft.at(new Float32Array(),rate,0).every(x=>Number.isFinite(x)&&x===0)).toBe(true);
});
