class MusicPlayer {
    constructor() {
        this.playBtn = e('#id-play-button')
        this.playNextBtn = e('#id-next-button')
        this.playPrevBtn = e('#id-prev-button')
        this.controlPanel = e('#control-panel')
        this.infoBar = e('#info')
        this.infoArtist = e('.artist')
        this.infoName = e('.name')
        this.albumCover = e('.album-art')
        this.nowPlaying = e('#id-nowPlaying')
        this.progressBar = e('.progress-bar')
        this.progressBarInner = e('.inner')
        this.progressBarDot = e('.dot')
        this.progressBarHover = e('.hover')
        this.progressBarTag = e('.current-time-tag')
        this.progressTimer = null
        this.tracks = es('.track')
        this.bindEvents()
    }

    bindEvents() {
        this.play = this.play.bind(this)
        this.playBtn.addEventListener('click', this.play)

        this.playNext = this.playNext.bind(this)
        this.playNextBtn.addEventListener('click', this.playNext)

        this.playPrev = this.playPrev.bind(this)
        this.playPrevBtn.addEventListener('click', this.playPrev)

        this.nowPlaying.addEventListener('ended', this.playNext)

        this.bindEventProgressBar()
    }

    play() {
        let controlPanel = this.controlPanel
        let infoBar = this.infoBar
        let audio = this.nowPlaying
        if (audio.paused) {
            audio.play()
            controlPanel.classList.add('active')
            infoBar.classList.add('active')
            this.updateProgressBar()
            this.updateInfo()
        } else {
            audio.pause()
            controlPanel.classList.remove('active')
            infoBar.classList.remove('active')
            this.pauseProgressBar()
        }
    }

    playNext() {
        let audio = this.nowPlaying
        let tracks = this.getTracksPaths()
        let index = Number(audio.dataset.active)
        index = (index + 1) % tracks.length
        audio.dataset.active = String(index)

        audio.src = tracks[index]
        audio.addEventListener('canplay', audio.play)
        // this.updateProgressBar()
        this.updateInfo()
        this.updateNowPlaying()
    }

    playPrev() {
        let audio = this.nowPlaying
        let tracks = this.getTracksPaths()
        let index = Number(audio.dataset.active)
        if (index === 0) {
            index = tracks.length - 1
        } else {
            index -= 1
        }

        audio.dataset.active = String(index)
        audio.src = tracks[index]
        audio.addEventListener('canplay', audio.play)
        // this.updateProgressBar()
        this.updateInfo()
        this.updateNowPlaying()
    }

    updateProgressBar() {
        let inner = this.progressBar.querySelector('.inner')
        this.progressTimer = setInterval(() => {
            let audio = this.nowPlaying
            let duration = audio.duration
            let currentTime = audio.currentTime
            let ratio = (currentTime / duration * 100) + '%'
            // log(currentTime, duration, ratio)
            inner.style.width = ratio
        }, 1000)
    }

    pauseProgressBar() {
        clearInterval(this.progressTimer)
    }

    bindEventProgressBar() {
        // let duration = this.nowPlaying.duration
        let inner = this.progressBarInner
        let outer = this.progressBar
        let dot = this.progressBarDot
        let hover = this.progressBarHover
        let tag = this.progressBarTag
        let max = outer.offsetWidth
        let moving = false
        let offset = 0

        // 拖动进度条
        dot.addEventListener('mousedown', (event) => {
            offset = event.clientX - dot.offsetLeft
            moving = true
        })

        document.addEventListener('mouseup', () => {
            moving = false
        })

        document.addEventListener('mousemove', (event) => {
            if (moving) {
                // 离浏览器左侧窗口当前距离减去父元素距离浏览器左侧窗口距离就是
                // dot 移动的距离
                let x = event.clientX - offset
                // dot 距离有一个范围, 即 0 < x < max
                if (x > max) {
                    x = max
                }
                if (x < 0) {
                    x = 0
                }
                let duration = this.nowPlaying.duration
                let width = (x / max) * 100
                inner.style.width = String(width) + '%'
                this.nowPlaying.currentTime = duration * (width / 100)

                tag.innerText = this.formatTime(duration * (width / 100))
                tag.style.display = 'block'
                tag.style.left = String(x - 20) + 'px'
            }
        })

        // 点击进度条
        outer.addEventListener('click', (event) => {
            let duration = this.nowPlaying.duration
            let x = event.clientX - outer.getBoundingClientRect().left
            let width = (x / max) * 100
            inner.style.width = String(width) + '%'
            this.nowPlaying.currentTime = Math.floor(duration * (width / 100))
        })

        outer.addEventListener('mousemove', (event) => {
            let duration = this.nowPlaying.duration
            let x = event.clientX - outer.getBoundingClientRect().left
            let width = (x / max) * 100
            hover.style.width = String(width) + '%'

            tag.innerText = this.formatTime(duration * (width / 100))
            tag.style.display = 'block'
            tag.style.left = String(x - 20) + 'px'
        })

        outer.addEventListener('mouseout', () => {
            hover.style.width = '0'
            tag.style.display = 'none'
        })
    }

    formatTime(time) {
        let minutes = Math.floor(time / 60)
        let seconds = Math.floor(time - minutes * 60)
        minutes = minutes >= 10 ? minutes : '0' + minutes
        seconds = seconds >= 10 ? seconds : '0' + seconds
        return minutes + ':' + seconds
    }

    updateInfo() {
        let audio = this.nowPlaying
        let index = audio.dataset.active
        let tracks = this.tracks
        let track = tracks[index]
        let artist = track.dataset.artist
        let name = track.dataset.name
        let cover = track.dataset.cover

        // log('updateInfo', audio, artist, name, cover)

        this.infoArtist.innerText = artist
        this.infoName.innerText = name
        this.albumCover.style.backgroundImage = `url(${cover})`
    }

    getTracksPaths() {
        let ts = this.tracks
        let res = []
        ts.forEach((t) => {
            res.push(t.dataset.path)
        })
        return res
    }

    getDuration() {
        let audio = this.nowPlaying
        let duration = 0
        audio.addEventListener('canplay', () => {
            duration = audio.duration
        })
        return duration
    }

    updateNowPlaying() {
        this.nowPlaying = e('#id-nowPlaying')
    }
}