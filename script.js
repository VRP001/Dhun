let currentSong = new Audio();
let songs ;
let currfolder ; 

function formatTime(seconds) {
    seconds = Math.floor(seconds); // Ensure it's an integer (remove milliseconds)
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currfolder = folder ;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1])); // Properly decode filename
        }
    }
     //all songs of the playlist
     let songUL = document.querySelector(".songlist ul")
     songUL.innerHTML = "" 
     for (const song of songs) {
         songUL.innerHTML += `<li> 
             <img class="invert" src="img/music.svg" alt="">
             <div class="info">
                 <div>${song}</div>
                 <div>Various</div>
             </div>
             <div class="playnow">
                 <span>Play Now</span>
                 <img class="invert" src="img/play.svg" alt="">
             </div>
         </li>`;
     }
 
     // Add event listener to each song item
     document.querySelectorAll(".songlist li").forEach(e => {
         e.addEventListener("click", () => {
             let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
             playMusic(songName);
         });
     });
}

const playMusic = (track, pause = false) => {
    let songURL = `http://127.0.0.1:3000/${currfolder}/` + encodeURIComponent(track);
    console.log("Playing:", songURL); // Debugging: Check if URL is correct
    currentSong.src = songURL;

    if (!pause) {
        currentSong.play()
            .then(() => play.src = "img/pause.svg") // Play successfully
            .catch(err => console.error("Playback error:", err)); // Handle errors
    }

    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response; 
    let anchors = div.getElementsByTagName("a")   
   let cardcontainer = document.querySelector(".cardcontainer")
   // cardContainer.innerHTML = "" ; 
    
    let array = Array.from(anchors)
    for(let index = 0 ; index < array.length ; index++)
    {        
        const e = array[index];

        if(e.href.includes("/songs")){
            let folder  = e.href.split("/").slice(-2)[0]

            //getting metadata for folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json()
            
           cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card ">
                    <div class="play display:flex;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" >
                            <circle cx="16" cy="16" r="15" fill="#00FF00"/>
                            <polygon points="12,9 12,23 22,16" fill="black"/>
                        </svg>
                                                                 
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h4>${response.title}</h4>
                    <p>${response.description}</p>
                </div>`                   
        }
    }
     //event for cards
     Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click" , async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            item.dataset.folder
        })
    })
}

async function main() {
    await getSongs("songs/")
    playMusic(songs[0] , true)

    //display all albums
    displayAlbums()

    play.addEventListener("click" ,()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    currentSong.addEventListener("timeupdate" , () =>{
        document.querySelector(".songtime").innerHTML = 
        `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}` 
        document.querySelector(".circle").style.left = 
        (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //event listener for seekbar
    document.querySelector(".seekbar").addEventListener("click" , e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime =  ((currentSong.duration) * percent ) / 100; 
    })

    //event listemer for hamburger
    document.querySelector(".ham").addEventListener("click" , ()=>{
        document.querySelector(".left").style.left = "0"
    })

    //event listener for cross
    document.querySelector(".cross").addEventListener("click" , ()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    //event listeners for previous and next 
    previous.addEventListener("click", () => {    
        let fileName = decodeURIComponent(currentSong.src.split("/").pop()) // Extract filename correctly
        let index = songs.indexOf(fileName); // Find index of current song
        
        if (index > 0) {
            let prevSong = songs[index - 1] // Get the previous song
            playMusic(prevSong)// Play the previous song
        } else {
            console.log("No previous song available");
        }
    });
    

    next.addEventListener("click", () => {  
    
        let fileName = decodeURIComponent(currentSong.src.split("/").pop()); // Extract filename correctly  
        let index = songs.indexOf(fileName); // Find index of current song  
    
    
        if (index !== -1 && index < songs.length - 1) {
            let nextSong = songs[index + 1]; // Get the next song  
            playMusic(nextSong); // Play the next song  
        } else {
            console.log("No next song available");  
        }
    });
    
    //event for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change" ,(e)=>{
        currentSong.volume = parseInt(e.target.value) / 100
    })
    
    //event listener for mute
    document.querySelector(".volume >img").addEventListener("click" , e=>{
        if(e.target.src.includes("volume.svg")){
           e.target.src = e.target.src.replace("volume.svg" , "mute.svg")
            currentSong.volume = 0 ;
            document.querySelector(".range").getElementsByTagName("input")[0].value =0;
        }
        else{
            e.target.src =  e.target.src.replace("mute.svg" , "volume.svg")           
            currentSong.volume = .10 ;
            document.querySelector(".range").getElementsByTagName("input")[0].value =10 ;
        }
    })
   
}

main();
