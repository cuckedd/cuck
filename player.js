/** REJECT'S WORLD — PLAYLIST CONTROLLER (no third-party libraries). */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const audio=$('audio'), play=$('play'), back=$('back'), next=$('next');
  const upload=$('file'), addSongs=$('addSongs'), seek=$('seek');
  const toggle=$('playlistToggle'), panel=$('playlistPanel');
  const list=$('playlistList'), empty=$('playlistEmpty');
  const status=$('trackStatus'), songName=$('track'), songArtist=$('trackArtist');
  const cover=$('trackCover'), shuffleBtn=$('shuffle'), repeatBtn=$('repeat');
  const clock=$('clock'), duration=$('duration'), count=$('playlistCount');
  const summary=$('playlistSummary');
  const raw=Array.isArray(window.REJECT_PLAYLIST) ? window.REJECT_PLAYLIST : [];
  let serial=0;
  let tracks=raw.filter(t => t && typeof t.src==='string' && t.src.trim())
    .map(t => ({
      key:++serial, title:String(t.title || t.src.split('/').pop()).trim(),
      artist:String(t.artist || 'Unknown artist'), src:t.src,
      cover:typeof t.cover==='string'?t.cover:'', temporary:false
    }));
  let currentKey=null, shuffle=false, repeat='off';
  const current=() => tracks.find(t=>t.key===currentKey) || null;
  const fmt=s => Number.isFinite(s) ? `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}` : '0:00';
  const showStatus=s => { status.textContent=s; };

  function updateNowPlaying() {
    const t=current();
    songName.textContent=t?.title || 'no song selected';
    songArtist.textContent=t?.artist || 'add music to begin';
    cover.replaceChildren();
    if(t?.cover) {
      const img=document.createElement('img');
      img.alt='';
      img.src=t.cover;
      img.onerror=()=>{cover.textContent='♪';};
      cover.append(img);
    } else { cover.textContent='♪'; }
    clock.textContent=fmt(audio.currentTime);
    duration.textContent=fmt(audio.duration);
  }
  function renderList() {
    list.replaceChildren();
    count.textContent=tracks.length;
    summary.textContent=tracks.length+' song'+(tracks.length===1?'':'s');
    empty.hidden=tracks.length>0;
    tracks.forEach((t,i)=>{
      const li=document.createElement('li');
      li.className='playlist-item'+(t.key===currentKey?' is-current':'');
      const choose=document.createElement('button');
      choose.type='button'; choose.className='playlist-select';
      choose.title='Play '+t.title;
      const number=document.createElement('span'); number.className='playlist-number';
      number.textContent=t.key===currentKey && !audio.paused?'♫':String(i+1).padStart(2,'0');
      const detail=document.createElement('span'); detail.className='playlist-detail';
      const name=document.createElement('div'); name.className='playlist-title'; name.textContent=t.title;
      const artist=document.createElement('div'); artist.className='playlist-author'; artist.textContent=t.artist;
      detail.append(name,artist); choose.append(number,detail);
      choose.addEventListener('click',()=>{selectTrack(t.key,true);});
      li.append(choose);
      const control=(label,title,handler,disabled=false)=>{
        const b=document.createElement('button'); b.type='button'; b.className='playlist-action';
        b.textContent=label; b.title=title; b.setAttribute('aria-label',title);b.disabled=disabled;
        b.addEventListener('click',handler);li.append(b);
      };
      control('↑','Move '+t.title+' up',()=>move(i,-1),i===0);
      control('↓','Move '+t.title+' down',()=>move(i,1),i===tracks.length-1);
      control('×','Remove '+t.title,()=>removeTrack(t.key));
      list.append(li);
    });
  }
  function selectTrack(key,shouldPlay=false) {
    const t=tracks.find(t=>t.key===key);
    if(!t)return;
    const wasSame=key===currentKey;
    currentKey=key;
    if(!wasSame || !audio.src) {
      audio.pause();
      audio.src=t.src;
      audio.load();
      seek.value=0;
      showStatus('READY TO PLAY');
    }
    updateNowPlaying(); renderList();
    if(shouldPlay)startPlaying();
  }
  function startPlaying() {
    if(!tracks.length) {
      showStatus('ADD SONGS FIRST');
      setOpen(true);
      return;
    }
    if(!current())selectTrack(tracks[0].key,false);
    // IMPORTANT: this call happens synchronously during the SKIP INTRO click.
    // Delaying it with a timer can cause browsers to reject playback.
    const p=audio.play();
    if(p && p.catch) p.catch(()=>showStatus('CLICK ▶ TO PLAY / CHECK AUDIO FILE'));
  }
  function step(direction,automatic=false) {
    if(!tracks.length)return;
    const i=tracks.findIndex(t=>t.key===currentKey);
    let nextIndex;
    if(shuffle && tracks.length>1 && direction>0) {
      nextIndex=Math.floor(Math.random()*(tracks.length-1));
      if(nextIndex>=i && i>=0)nextIndex++;
    } else nextIndex=i+direction;
    if(nextIndex<0)nextIndex=tracks.length-1;
    if(nextIndex>=tracks.length) {
      if(automatic && repeat==='off') {audio.pause();audio.currentTime=0;showStatus('PLAYLIST FINISHED');return;}
      nextIndex=0;
    }
    selectTrack(tracks[nextIndex].key,true);
  }
  function move(i,direction) {
    const j=i+direction;
    if(j<0 || j>=tracks.length)return;
    [tracks[i],tracks[j]]=[tracks[j],tracks[i]];
    renderList();
  }
  function removeTrack(key) {
    const idx=tracks.findIndex(t=>t.key===key);
    if(idx<0)return;
    const [removed]=tracks.splice(idx,1);
    if(removed.temporary)URL.revokeObjectURL(removed.src);
    if(key===currentKey) {
      audio.pause();audio.removeAttribute('src');audio.load();
      currentKey=null;
      if(tracks.length)selectTrack(tracks[Math.min(idx,tracks.length-1)].key,false);
      else {updateNowPlaying();showStatus('PLAYLIST EMPTY');}
    }
    renderList();
  }
  function setOpen(open) {
    panel.hidden=!open;
    toggle.setAttribute('aria-expanded',String(open));
  }
  // Ensure a pre-configured track is loaded before the intro ends.
  if(tracks.length)selectTrack(tracks[0].key,false);
  else {updateNowPlaying(); renderList();}

  window.startHomepagePlaylist=()=>startPlaying();
  $('playlistClose').addEventListener('click',()=>setOpen(false));
  toggle.addEventListener('click',()=>setOpen(panel.hidden));
  addSongs.addEventListener('click',()=>upload.click());
  upload.addEventListener('change',()=>{
    const files=[...(upload.files||[])].filter(f=>f.type.startsWith('audio/')||/\.(mp3|m4a|ogg|wav|flac|webm)$/i.test(f.name));
    const hadTracks=tracks.length>0;
    for(const f of files)tracks.push({key:++serial,title:f.name.replace(/\.[^.]+$/,''),artist:'LOCAL UPLOAD',src:URL.createObjectURL(f),cover:'',temporary:true});
    upload.value='';
    if(!hadTracks && tracks.length)selectTrack(tracks[0].key,false);
    renderList();setOpen(true);
    if(files.length && !hadTracks)startPlaying();
  });
  play.addEventListener('click',()=>{
    if(!tracks.length){upload.click();return;}
    if(audio.paused)startPlaying();else audio.pause();
  });
  back.addEventListener('click',()=>{
    if(audio.currentTime>3){audio.currentTime=0;return;}
    step(-1);
  });
  next.addEventListener('click',()=>step(1));
  shuffleBtn.addEventListener('click',()=>{
    shuffle=!shuffle;shuffleBtn.classList.toggle('active',shuffle);
    shuffleBtn.setAttribute('aria-pressed',String(shuffle));
  });
  repeatBtn.addEventListener('click',()=>{
    repeat=repeat==='off'?'all':repeat==='all'?'one':'off';
    repeatBtn.classList.toggle('active',repeat!=='off');
    repeatBtn.textContent=repeat==='one'?'↻₁':'↻';
    repeatBtn.title='Repeat '+repeat;
    repeatBtn.setAttribute('aria-label','Repeat '+repeat);
  });
  audio.addEventListener('play',()=>{play.textContent='Ⅱ';play.setAttribute('aria-label','Pause');showStatus('NOW PLAYING');renderList();});
  audio.addEventListener('pause',()=>{play.textContent='▶';play.setAttribute('aria-label','Play');if(!audio.ended && current())showStatus('PAUSED');renderList();});
  audio.addEventListener('loadedmetadata',()=>{duration.textContent=fmt(audio.duration);});
  audio.addEventListener('timeupdate',()=>{
    seek.value=audio.duration?Math.min(100,100*audio.currentTime/audio.duration):0;
    clock.textContent=fmt(audio.currentTime);
    duration.textContent=fmt(audio.duration);
  });
  audio.addEventListener('error',()=>{if(current())showStatus('AUDIO FILE NOT FOUND / UNSUPPORTED');});
  audio.addEventListener('ended',()=>{
    if(repeat==='one') {audio.currentTime=0;startPlaying();}
    else step(1,true);
  });
  seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration) && audio.duration>0)audio.currentTime=audio.duration*Number(seek.value)/100;});
  $('clearLocal').addEventListener('click',()=>{
    for(const t of [...tracks])if(t.temporary)removeTrack(t.key);
    showStatus(tracks.length?'READY TO PLAY':'PLAYLIST EMPTY');
  });
  window.addEventListener('beforeunload',()=>{
    for(const t of tracks)if(t.temporary)URL.revokeObjectURL(t.src);
  });
})();
