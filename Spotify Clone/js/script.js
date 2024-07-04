let currSong = new Audio();
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/Music/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    //Show all songs in the playlist
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li><img class="invert" src="./img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                            </div>
                            <img class="playNow invert" src="./img/PlayPause.svg" alt="">
                        </li>
                        <hr>`
    }
    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        })
    })
    return songs;
}
const playMusic = (track, pause = false) => {
    currSong.src = `/Music/${currFolder}/` + track;
    if (!pause) {
        currSong.play();
        play.src = "./img/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/Music/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let index = 2; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/Music")) {
            let folder = (e.href.split("/").slice(-2)[1]);
            //Get the metadata fo the folder
            let a = await fetch(`http://127.0.0.1:5500/Music/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="./Music/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    //Load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]);
            document.title = (e.dataset.folder).replaceAll("%20", " ") + " | Spotify";
        })
    })
}

async function main() {
    //Get the list of all songs
    await getSongs("Chill");
    playMusic(songs[0], true);

    //display all the albums in the page
    displayAlbums();

    //Attach an event listener to play ,next and previous
    play.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play();
            play.src = "./img/pause.svg";
        }
        else {
            currSong.pause();
            play.src = "./img/play.svg";
        }
    })
    //Listen for time update event
    currSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currSong.currentTime)}/${secondsToMinutesSeconds(currSong.duration)}`;
        document.querySelector(".circle").style.left = (currSong.currentTime / currSong.duration) * 100 + "%";
    })
    //Add an event listener to seekbar
    document.querySelector(".seekBar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currSong.currentTime = ((currSong.duration) * percent) / 100;
    })
    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    //Add an event Listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-150%";
    })
    //Add an event listener to previous and next buttons
    previous.addEventListener("click", () => {
        currSong.pause();
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    })
    next.addEventListener("click", () => {
        currSong.pause();
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
        console.log(index)
        console.log(currSong)
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    })
    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currSong.volume = parseInt(e.target.value) / 100;
    })
    //Add an event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currSong.volume = .50;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50;
        }
    })

}
main()