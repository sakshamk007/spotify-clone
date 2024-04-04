console.log("Javascript")

let currentSong = new Audio()

let songs
let currentfolder;

async function getSongs(folder) {
    currentfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    let songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`songs/${folder}/`)[1])
        }
    }

    let songUl = document.querySelector(".songs").getElementsByTagName("ul")[0]
    songUl.innerHTML=""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
        <div class="song">
            <img src="assets/music.svg" alt="" class="h-25">
            <div class="songDetails">
                ${song.replaceAll("%20", " ")}
            </div>
            <div class="playbtn">
                <img src="assets/play.svg" alt="" class="h-25 invert">
            </div>
        </div>
    </li>`
    }

    Array.from(document.querySelector(".songs").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".songDetails").innerHTML.trim())
        })
    });

    return songs
}

async function getAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML=response
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    let cardContainer = document.querySelector(".cardContainer")
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")){
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <img src="/songs/${folder}/cover.jpg" alt="img">
            <img src="assets/play-button.svg" alt="" class="play-btn">
            <h3>${response.title}</h3>
            <h5>${response.description}</h5>
        </div>`
        }      
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item =>{
            songs = await getSongs(`${item.currentTarget.dataset.folder}`)
            playMusic(songs[0].replaceAll("%20", " "))
        })
    });
}

function secToMin(sec) {
    if (isNaN(sec) || sec < 0) {
        return "00:00";
    }
    const min = Math.floor(sec / 60);
    const secLeft = Math.floor(sec % 60);
    const newMin = String(min).padStart(2, '0');
    const newSec = String(secLeft).padStart(2, '0');
    return `${newMin}:${newSec}`;
}

const playMusic = (track, justLoaded) => {
    currentSong.src = `/songs/${currentfolder}/` + track
    if (justLoaded==true){
        currentSong.pause() 
        play.src = "/assets/play.svg"
    }
    else{
        currentSong.play() 
        play.src = "/assets/pause.svg"
    }    
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function main() {
    // songs = await getSongs("album1")
    // playMusic(songs[0], true)

    await getAlbums()    

    play.addEventListener("click", () => {
        if (currentSong.paused){
            currentSong.play()
            play.src = "assets/pause.svg" 
        }
        else{
            currentSong.pause()
            play.src = "assets/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML=`${secToMin(currentSong.currentTime)}/${secToMin(currentSong.duration)}`
        document.querySelector(".pointer").style.left=currentSong.currentTime/currentSong.duration * 100 + "%"
    })

    document.querySelector(".slider").addEventListener("click", e => {
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100
        document.querySelector(".pointer").style.left=percent+"%"
        currentSong.currentTime=((currentSong.duration)*percent)/100
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left= "0"
    })

    document.querySelector(".cancelbtn").addEventListener("click", () => {
        document.querySelector(".left").style.left= "-100%"
    })

    previous.addEventListener("click", ()=>{
        let index = songs.indexOf(currentSong.src.split(`songs/${currentfolder}/`)[1])
        if (index > 0){
            playMusic(songs[index-1].replaceAll("%20", " "))
        }
    })
    next.addEventListener("click", ()=>{
        let index = songs.indexOf(currentSong.src.split(`songs/${currentfolder}/`)[1])
        if (index < songs.length-1){
            playMusic(songs[index+1].replaceAll("%20", " "))
        }
    })

    volslider.addEventListener("change", (e)=>{
        currentSong.volume=parseInt(e.target.value)/100
        if (currentSong.volume>0){
            volume.src = volume.src.replace("mute.svg", "volume.svg")
        }
        else{
            volume.src = volume.src.replace("volume.svg", "mute.svg")
        }
    })

    volume.addEventListener("click", (e)=>{
        if (e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume=0
            volslider.value=0
        }
        else{
            e.target.src=e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume=0.1
            volslider.value=10
        }
    })
}

main()