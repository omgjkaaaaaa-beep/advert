(function(root){
 function createMobility(world){
 const width=world.size*5,step=5,cache=new Map();
 const vertical=x=>[7,8,18,32,44,52].includes(x),horizontal=y=>[4,12,28,36,44,52].includes(y);
 const crossingX=x=>[2,10,20,34,46,54].includes(x),crossingY=y=>[2,6,14,30,38,46,54].includes(y);
 function legal(x,y,reckless=false){if(x<0||y<0||x>=width||y>=width)return false;const cx=Math.floor(x/5),cy=Math.floor(y/5),c=world.cells[cy*world.size+cx];if(c.place)return false;if(!c.road||reckless)return true;const sx=x%5,sy=y%5,v=vertical(cx),h=horizontal(cy);if(v&&h)return(sx===0||sx===4)&&(sy===0||sy===4);if(v)return sx===0||sx===4||crossingY(cy)&&sy===2;return sy===0||sy===4||crossingX(cx)&&sx===2;}
 function isCrosswalk(p){const cx=Math.floor(p.x/25),cy=Math.floor(p.y/25);return vertical(cx)&&!horizontal(cy)&&crossingY(cy)||horizontal(cy)&&!vertical(cx)&&crossingX(cx);}
 function onRoad(p){return !!world.cells[Math.floor(p.y/25)*world.size+Math.floor(p.x/25)]?.road;}
 function snap(p,reckless=false){const x=Math.max(0,Math.min(width-1,Math.floor(p.x/step))),y=Math.max(0,Math.min(width-1,Math.floor(p.y/step)));const q=[[x,y]],seen=new Set([y*width+x]);for(let i=0;i<q.length;i++){const [a,b]=q[i];if(legal(a,b,reckless))return{x:a*step+2.5,y:b*step+2.5};for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const c=a+dx,d=b+dy,k=d*width+c;if(c>=0&&d>=0&&c<width&&d<width&&!seen.has(k)){seen.add(k);q.push([c,d]);}}}throw Error('No sidewalk');}
 function route(from,to,reckless=false){const a=snap(from,reckless),b=snap({x:to.door[0]*25+12,y:to.door[1]*25+12},reckless);const start=Math.floor(a.y/step)*width+Math.floor(a.x/step),end=Math.floor(b.y/step)*width+Math.floor(b.x/step),cacheKey=start+':'+end+':'+reckless;if(cache.has(cacheKey))return cache.get(cacheKey).map(p=>({...p}));
 const tx=end%width,ty=Math.floor(end/width),parents=new Map([[start,null]]),cost=new Map([[start,0]]),heap=[];
 function push(id,score){let i=heap.length;heap.push({id,score});while(i>0){const p=(i-1)>>1;if(heap[p].score<=score)break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}}
 function pop(){const result=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;while(true){let j=i,l=i*2+1,r=l+1;if(l<heap.length&&heap[l].score<heap[j].score)j=l;if(r<heap.length&&heap[r].score<heap[j].score)j=r;if(j===i)break;[heap[i],heap[j]]=[heap[j],heap[i]];i=j;}}return result.id;}
 push(start,0);const closed=new Set();while(heap.length){const k=pop();if(closed.has(k))continue;closed.add(k);if(k===end)break;const x=k%width,y=Math.floor(k/width);for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,n=ny*width+nx;if(!legal(nx,ny,reckless))continue;const next=cost.get(k)+1;if(next<(cost.get(n)??Infinity)){cost.set(n,next);parents.set(n,k);push(n,next+Math.abs(nx-tx)+Math.abs(ny-ty));}}}
 if(!parents.has(end))return[];const result=[];let k=end;while(k!==null){result.push({x:k%width*step+2.5,y:Math.floor(k/width)*step+2.5});k=parents.get(k);}result.reverse();if(cache.size>240)cache.clear();cache.set(cacheKey,result);return result.map(p=>({...p}));
 }
 return{route,snap,legal,isCrosswalk,onRoad,vertical,horizontal,crossingX,crossingY};
 }
 if(typeof module!=='undefined')module.exports={createMobility};else root.createCityMobility=createMobility;
})(typeof globalThis!=='undefined'?globalThis:this);
