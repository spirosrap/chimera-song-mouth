/** Hosts may transparently decompress .gz assets. Recognize the bytes, preserving every frame. */
export async function unpackTelemetry(data:ArrayBuffer):Promise<ArrayBuffer>{
 const magic=new Uint8Array(data,0,Math.min(2,data.byteLength));
 return magic[0]===0x1f&&magic[1]===0x8b
  ?new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
  :data;
}
